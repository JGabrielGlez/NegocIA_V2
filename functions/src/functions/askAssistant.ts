import * as logger from "firebase-functions/logger";
import {
    CallableRequest,
    HttpsError,
    onCall,
} from "firebase-functions/v2/https";
import { getSystemPrompt } from "../config/systemPrompt";
import { getUserData } from "../services/firestoreService";
import { callGemini } from "../services/geminiService";
import { AIRequest } from "../types/AIRequest";
import { AIResponse } from "../types/AIResponse";
import { buildBusinessContext } from "../utils/contextBuilder";
import {
    checkIfCanQuery,
    getQueriesRemaining,
    incrementQueryCount,
} from "../utils/limitsManager";

/**
 * Cloud Function askAssistant
 * Responde preguntas sobre el negocio del usuario usando Gemini
 */
export const askAssistant = onCall<AIRequest>(
    async (request: CallableRequest<AIRequest>): Promise<AIResponse> => {
        const getErrorMessage = (error: unknown): string => {
            if (error instanceof Error) {
                return error.message;
            }
            return String(error);
        };

        // PASO 1: Validar que el usuario esté autenticado
        if (!request.auth) {
            logger.warn("Intento de acceso sin autenticación a askAssistant");
            throw new HttpsError(
                "unauthenticated",
                "El usuario debe estar autenticado para usar el asistente IA",
            );
        }

        const userId = request.auth.uid;
        const { question } = request.data;

        logger.info("askAssistant: request recibida", {
            userId,
            questionLength: question?.length || 0,
            structuredData: true,
        });

        // PASO 2: Verificar que el plan sea PRO
        let userData;
        try {
            userData = await getUserData(userId);
        } catch (error) {
            logger.error("askAssistant: fallo al obtener datos de usuario", {
                userId,
                step: "verificar-plan/getUserData",
                error: getErrorMessage(error),
                structuredData: true,
            });
            throw new HttpsError(
                "internal",
                "No fue posible consultar los datos del usuario para validar el plan",
            );
        }

        if (!userData) {
            logger.warn(`Usuario no encontrado en Firestore: ${userId}`);
            throw new HttpsError(
                "not-found",
                "No se encontraron los datos del usuario",
            );
        }

        logger.info("askAssistant: plan verificado", {
            userId,
            plan: userData.plan,
            structuredData: true,
        });

        // PASO 3: Verificar límites mensuales
        let canQuery = false;
        try {
            const usage = await getQueriesRemaining(userId, userData.plan);
            logger.info("askAssistant: limites consultados", {
                userId,
                queriesRemaining: usage.queriesRemaining,
                structuredData: true,
            });
            canQuery = await checkIfCanQuery(userId, userData.plan);
        } catch (error) {
            logger.error("askAssistant: fallo al verificar límites", {
                userId,
                step: "verificar-limites",
                error: getErrorMessage(error),
                structuredData: true,
            });
            throw new HttpsError(
                "internal",
                "No fue posible validar los límites de consultas de IA",
            );
        }

        if (!canQuery) {
            logger.warn(`Usuario ${userId} ha excedido el límite de consultas`);
            throw new HttpsError(
                "resource-exhausted",
                `Has alcanzado el límite de consultas de IA para este mes. El límite se restablecerá el ${userData.nextResetDate?.toDate().toLocaleDateString("es-MX") || "próximo ciclo"}.`,
            );
        }

        // PASO 4: Construir contexto de negocio (productos, ventas, métricas)
        let businessContext = "";
        try {
            logger.info(
                `Construyendo contexto de negocio para usuario: ${userId}`,
            );
            businessContext = await buildBusinessContext(userId);
        } catch (error) {
            logger.error(
                "askAssistant: fallo al construir contexto de negocio",
                {
                    userId,
                    step: "construir-contexto",
                    error: getErrorMessage(error),
                    structuredData: true,
                },
            );
            throw new HttpsError(
                "internal",
                "No fue posible construir el contexto del negocio para responder",
            );
        }

        // PASO 5: Llamar a Gemini con system prompt + contexto + pregunta del usuario
        const nombreNegocio =
            userData.negocio || userData.nombre || "tu negocio";
        const systemPrompt = getSystemPrompt(nombreNegocio);
        const MAX_BUSINESS_CONTEXT_CHARS = 24000;
        const safeBusinessContext =
            businessContext.length > MAX_BUSINESS_CONTEXT_CHARS
                ? `${businessContext.slice(0, MAX_BUSINESS_CONTEXT_CHARS)}\n\n[Contexto recortado automáticamente para procesar la consulta]`
                : businessContext;
        const prompt = `${systemPrompt}\n\n${safeBusinessContext}\n\n=== PREGUNTA DEL USUARIO ===\n${question}`;
        let answer = "";
        try {
            logger.info("askAssistant: iniciando llamada a Gemini", {
                userId,
                businessContextLength: businessContext.length,
                safeBusinessContextLength: safeBusinessContext.length,
                structuredData: true,
            });
            answer = await callGemini(prompt);
        } catch (error) {
            const geminiError = getErrorMessage(error);
            logger.error("askAssistant: fallo en llamada a Gemini", {
                userId,
                step: "llamar-gemini",
                error: geminiError,
                structuredData: true,
            });

            if (geminiError.includes("GEMINI_API_KEY")) {
                throw new HttpsError(
                    "internal",
                    "La configuración del servicio de IA está incompleta (GEMINI_API_KEY).",
                );
            }

            throw new HttpsError(
                "internal",
                "El servicio de IA no pudo procesar la consulta en este momento",
            );
        }

        // PASO 6: Incrementar contador de uso
        try {
            await incrementQueryCount(userId);
        } catch (error) {
            logger.error("askAssistant: fallo al actualizar contador de uso", {
                userId,
                step: "incrementar-contador",
                error: getErrorMessage(error),
                structuredData: true,
            });
            throw new HttpsError(
                "internal",
                "No fue posible registrar el uso de la consulta de IA",
            );
        }

        const tokensUsed = 0;
        logger.info("askAssistant: respuesta lista", {
            userId,
            tokensUsed,
            structuredData: true,
        });

        return {
            answer,
            tokensUsed, // TODO: Obtener el conteo real de tokens desde Gemini
        };
    },
);
