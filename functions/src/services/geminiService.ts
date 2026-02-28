import * as logger from "firebase-functions/logger";
import * as fs from "fs";
import * as https from "https";
import * as path from "path";

/**
 * Servicio para interactuar con la API de Gemini
 * Utiliza un modelo Flash vigente
 */

const MODEL_NAME = "gemini-2.5-flash";

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

function postGeminiGenerateContent(
    prompt: string,
    apiKey: string,
): Promise<string> {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            contents: [
                {
                    parts: [{ text: prompt }],
                },
            ],
        });

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

                        const text = extractTextFromGeminiResponse(parsedBody);
                        if (!text) {
                            reject(
                                new Error(
                                    "Gemini no devolvió texto en la respuesta",
                                ),
                            );
                            return;
                        }

                        resolve(text);
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
 * Llamar a Gemini API con un prompt
 * @param prompt - Texto del prompt a enviar a Gemini
 * @returns Respuesta del modelo
 */
export async function callGemini(prompt: string): Promise<string> {
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
        });

        const text = await postGeminiGenerateContent(prompt, apiKey);

        logger.info("geminiService.callGemini: respuesta exitosa", {
            model: MODEL_NAME,
            responseLength: text?.length || 0,
            structuredData: true,
        });

        return text;
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
