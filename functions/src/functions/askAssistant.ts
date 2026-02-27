import {onCall, HttpsError, CallableRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {AIRequest} from "../types/AIRequest";
import {AIResponse} from "../types/AIResponse";
import {getUserData} from "../services/firestoreService";
import {checkIfCanQuery, incrementQueryCount} from "../utils/limitsManager";
import {buildBusinessContext} from "../utils/contextBuilder";
import {callGemini} from "../services/geminiService";

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

    // PASO 2: Verificar que el plan sea PRO
    const userData = await getUserData(userId);
    if (!userData) {
      logger.warn(`Usuario no encontrado en Firestore: ${userId}`);
      throw new HttpsError(
        "not-found",
        "No se encontraron los datos del usuario"
      );
    }

    if (userData.plan !== "PRO") {
      logger.warn(`Intento de acceso a IA sin PRO del usuario: ${userId} (plan: ${userData.plan})`);
      throw new HttpsError(
        "permission-denied",
        "El asistente IA solo está disponible para usuarios PRO. Actualiza tu plan."
      );
    }

    // PASO 3: Verificar límites mensuales
    const canQuery = await checkIfCanQuery(userId, userData.plan);
    if (!canQuery) {
      logger.warn(`Usuario ${userId} ha excedido el límite de consultas`);
      throw new HttpsError(
        "resource-exhausted",
        `Has alcanzado el límite de consultas de IA para este mes. El límite se restablecerá el ${userData.nextResetDate?.toDate().toLocaleDateString("es-MX") || "próximo ciclo"}.`
      );
    }

    // PASO 4: Construir contexto de negocio (productos, ventas, métricas)
    logger.info(`Construyendo contexto de negocio para usuario: ${userId}`);
    const businessContext = await buildBusinessContext(userId);

    // PASO 5: Llamar a Gemini con el contexto + pregunta del usuario
    const {question} = request.data;
    const prompt = `${businessContext}\n\nPregunta del usuario: ${question}`;
    logger.info(`Llamando a Gemini para usuario: ${userId}`);
    const answer = await callGemini(prompt);

    // PASO 6: Incrementar contador de uso
    await incrementQueryCount(userId);
    logger.info(`Consulta IA completada para usuario: ${userId}`);

    return {
      answer,
      tokensUsed: 0, // TODO: Obtener el conteo real de tokens desde Gemini
    };
  }
);
