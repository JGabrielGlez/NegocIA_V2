import {onCall, HttpsError, CallableRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {AIRequest} from "../types/AIRequest";
import {AIResponse} from "../types/AIResponse";

/**
 * Cloud Function askAssistant
 * Responde preguntas sobre el negocio del usuario usando Gemini
 */
export const askAssistant = onCall<AIRequest>(
  async (request: CallableRequest<AIRequest>): Promise<AIResponse> => {
    // PASO 1: Validar que el usuario esté autenticado
    if (!request.auth) {
      logger.warn("Intento de acceso sin autenticación a askAssistant");
      throw new HttpsError(
        "unauthenticated",
        "El usuario debe estar autenticado para usar el asistente IA"
      );
    }

    const userId = request.auth.uid;
    logger.info(`Solicitud IA del usuario: ${userId}`);

    // TODO: PASO 2: Verificar plan PRO
    // TODO: PASO 3: Verificar límites mensuales
    // TODO: PASO 4-6: Construir contexto, llamar Gemini, incrementar contador

    return {
      answer: "Asistente IA en construcción",
      tokensUsed: 0,
    };
  }
);
