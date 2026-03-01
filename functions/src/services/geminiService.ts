import * as logger from "firebase-functions/logger";
import * as fs from "fs";
import * as https from "https";
import * as path from "path";
import {
    getBottomProductos,
    getMetricasResumen,
    getTopProductos,
    getVentasPorRango,
} from "./firestoreService";

/**
 * Servicio para interactuar con la API de Gemini con Function Calling
 */

const MODEL_NAME = "gemini-2.5-flash";
const MAX_FUNCTION_CALL_ITERATIONS = 3;

/**
 * Definición de tools disponibles para Gemini
 */
const GEMINI_TOOLS = [
    {
        functionDeclarations: [
            {
                name: "getMetricasResumen",
                description:
                    "Obtiene las métricas precalculadas del negocio: ventas de hoy, semana, mes, ticket promedio, top productos, bottom productos, días sin ventas.",
                parameters: {
                    type: "OBJECT",
                    properties: {},
                    required: [],
                },
            },
            {
                name: "getVentasPorRango",
                description:
                    "Obtiene todas las ventas del negocio en un rango de fechas específico. Útil para análisis detallado de periodos personalizados.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        fechaInicio: {
                            type: "STRING",
                            description:
                                "Fecha de inicio en formato ISO 8601 (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss.sssZ)",
                        },
                        fechaFin: {
                            type: "STRING",
                            description:
                                "Fecha de fin en formato ISO 8601 (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss.sssZ)",
                        },
                    },
                    required: ["fechaInicio", "fechaFin"],
                },
            },
            {
                name: "getTopProductos",
                description:
                    "Obtiene los productos más vendidos o menos vendidos en un rango de fechas, ordenados por unidades vendidas.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        fechaInicio: {
                            type: "STRING",
                            description:
                                "Fecha de inicio en formato ISO 8601 (YYYY-MM-DD)",
                        },
                        fechaFin: {
                            type: "STRING",
                            description:
                                "Fecha de fin en formato ISO 8601 (YYYY-MM-DD)",
                        },
                        limite: {
                            type: "NUMBER",
                            description:
                                "Número de productos a retornar (por defecto 10)",
                        },
                        orden: {
                            type: "STRING",
                            description:
                                'Orden de los productos: "desc" para más vendidos (defecto), "asc" para menos vendidos',
                            enum: ["asc", "desc"],
                        },
                    },
                    required: ["fechaInicio", "fechaFin"],
                },
            },
        ],
    },
];

function getGeminiApiKey(): string {
    const keyFromEnv = process.env.GEMINI_API_KEY?.trim();
    if (keyFromEnv) {
        return keyFromEnv;
    }

    try {
        const envPath = path.resolve(process.cwd(), ".env");
        if (!fs.existsSync(envPath)) {
            return "";
        }

        const envContent = fs.readFileSync(envPath, "utf8");
        const keyLine = envContent
            .split(/\r?\n/)
            .find((line) => line.trim().startsWith("GEMINI_API_KEY="));

        if (!keyLine) {
            return "";
        }

        return keyLine
            .replace("GEMINI_API_KEY=", "")
            .trim()
            .replace(/^['\"]|['\"]$/g, "");
    } catch {
        return "";
    }
}

function extractTextFromGeminiResponse(response: unknown): string {
    const parsed = response as {
        candidates?: Array<{
            content?: {
                parts?: Array<{ text?: string }>;
            };
        }>;
    };

    const parts = parsed.candidates?.[0]?.content?.parts ?? [];
    const text = parts
        .map((part) => part.text ?? "")
        .join("")
        .trim();

    return text;
}

function extractFunctionCallFromGeminiResponse(response: unknown): {
    name: string;
    args: Record<string, any>;
} | null {
    const parsed = response as {
        candidates?: Array<{
            content?: {
                parts?: Array<{
                    functionCall?: {
                        name: string;
                        args: Record<string, any>;
                    };
                }>;
            };
        }>;
    };

    const parts = parsed.candidates?.[0]?.content?.parts ?? [];
    const functionCallPart = parts.find((part) => part.functionCall);

    if (!functionCallPart?.functionCall) {
        return null;
    }

    return {
        name: functionCallPart.functionCall.name,
        args: functionCallPart.functionCall.args || {},
    };
}

async function executeFunctionCall(
    functionName: string,
    args: Record<string, any>,
    userId: string,
): Promise<any> {
    logger.info("geminiService: ejecutando function call", {
        functionName,
        args,
        userId,
        structuredData: true,
    });

    switch (functionName) {
        case "getMetricasResumen":
            return await getMetricasResumen(userId);

        case "getVentasPorRango": {
            const fechaInicio = new Date(args.fechaInicio);
            const fechaFin = new Date(args.fechaFin);
            return await getVentasPorRango(userId, fechaInicio, fechaFin);
        }

        case "getTopProductos": {
            const fechaInicio = new Date(args.fechaInicio);
            const fechaFin = new Date(args.fechaFin);
            const limite = args.limite || 10;
            const orden = args.orden || "desc";

            if (orden === "asc") {
                return await getBottomProductos(
                    userId,
                    fechaInicio,
                    fechaFin,
                    limite,
                );
            } else {
                return await getTopProductos(
                    userId,
                    fechaInicio,
                    fechaFin,
                    limite,
                );
            }
        }

        default:
            throw new Error(`Función desconocida: ${functionName}`);
    }
}

function postGeminiGenerateContent(
    requestBody: any,
    apiKey: string,
): Promise<any> {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(requestBody);

        const request = https.request(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(body),
                },
            },
            (response) => {
                let responseBody = "";

                response.on("data", (chunk) => {
                    responseBody += chunk;
                });

                response.on("end", () => {
                    try {
                        const parsedBody = responseBody
                            ? JSON.parse(responseBody)
                            : {};

                        if ((response.statusCode || 500) >= 400) {
                            const apiError =
                                parsedBody?.error?.message ||
                                `Gemini devolvió estado ${response.statusCode}`;
                            reject(new Error(apiError));
                            return;
                        }

                        resolve(parsedBody);
                    } catch (error) {
                        reject(
                            new Error(
                                `No se pudo interpretar la respuesta de Gemini: ${
                                    error instanceof Error
                                        ? error.message
                                        : String(error)
                                }`,
                            ),
                        );
                    }
                });
            },
        );

        request.on("error", (error) => {
            reject(
                new Error(`Error de red al llamar Gemini: ${error.message}`),
            );
        });

        request.write(body);
        request.end();
    });
}

/**
 * Llamar a Gemini API con function calling support
 * @param prompt - Texto del prompt del usuario
 * @param systemPrompt - System prompt opcional
 * @param userId - ID del usuario para ejecutar function calls
 * @param tools - Tools disponibles para function calling (usa GEMINI_TOOLS por defecto)
 * @returns Respuesta final del modelo
 */
export async function callGemini(
    prompt: string,
    systemPrompt?: string,
    userId?: string,
    tools?: any[],
): Promise<string> {
    try {
        const apiKey = getGeminiApiKey();

        if (!apiKey) {
            logger.error("geminiService.callGemini: API_KEY no configurada");
            throw new Error(
                "GEMINI_API_KEY no está configurada en variables de entorno",
            );
        }

        logger.info("geminiService.callGemini: iniciando llamada", {
            model: MODEL_NAME,
            promptLength: prompt?.length || 0,
            hasSystemPrompt: Boolean(systemPrompt),
            hasTools: Boolean(tools),
            structuredData: true,
        });

        const contents: any[] = [];

        if (systemPrompt) {
            contents.push({
                role: "user",
                parts: [{ text: systemPrompt }],
            });
            contents.push({
                role: "model",
                parts: [{ text: "Entendido. Estoy listo para ayudar." }],
            });
        }

        contents.push({
            role: "user",
            parts: [{ text: prompt }],
        });

        const requestBody: any = {
            contents,
        };

        if (tools && tools.length > 0) {
            requestBody.tools = tools;
        }

        let iteration = 0;
        let finalText = "";

        while (iteration < MAX_FUNCTION_CALL_ITERATIONS) {
            iteration++;

            logger.info("geminiService.callGemini: iteración", {
                iteration,
                contentsCount: requestBody.contents.length,
                structuredData: true,
            });

            const response = await postGeminiGenerateContent(
                requestBody,
                apiKey,
            );

            const functionCall =
                extractFunctionCallFromGeminiResponse(response);

            if (functionCall && userId) {
                logger.info(
                    "geminiService.callGemini: function call detectado",
                    {
                        functionName: functionCall.name,
                        iteration,
                        structuredData: true,
                    },
                );

                let functionResult: any;
                try {
                    functionResult = await executeFunctionCall(
                        functionCall.name,
                        functionCall.args,
                        userId,
                    );
                } catch (error) {
                    functionResult = {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    };
                    logger.error(
                        "geminiService.callGemini: error en function call",
                        {
                            functionName: functionCall.name,
                            error: functionResult.error,
                            structuredData: true,
                        },
                    );
                }

                requestBody.contents.push({
                    role: "model",
                    parts: [
                        {
                            functionCall: {
                                name: functionCall.name,
                                args: functionCall.args,
                            },
                        },
                    ],
                });

                requestBody.contents.push({
                    role: "user",
                    parts: [
                        {
                            functionResponse: {
                                name: functionCall.name,
                                response: {
                                    content: functionResult,
                                },
                            },
                        },
                    ],
                });

                continue;
            }

            const text = extractTextFromGeminiResponse(response);

            if (!text) {
                throw new Error("Gemini no devolvió texto en la respuesta");
            }

            finalText = text;
            break;
        }

        if (!finalText) {
            throw new Error(
                `Gemini no devolvió respuesta después de ${MAX_FUNCTION_CALL_ITERATIONS} iteraciones`,
            );
        }

        logger.info("geminiService.callGemini: respuesta exitosa", {
            model: MODEL_NAME,
            responseLength: finalText.length,
            iterations: iteration,
            structuredData: true,
        });

        return finalText;
    } catch (error) {
        logger.error("geminiService.callGemini falló", {
            service: "geminiService",
            functionName: "callGemini",
            error: error instanceof Error ? error.message : String(error),
            promptLength: prompt?.length || 0,
            model: MODEL_NAME,
            structuredData: true,
        });
        throw error;
    }
}

/**
 * Obtener las tools disponibles para function calling
 */
export function getGeminiTools(): any[] {
    return GEMINI_TOOLS;
}
