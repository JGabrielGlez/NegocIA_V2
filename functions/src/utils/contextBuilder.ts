import * as logger from "firebase-functions/logger";

/**
 * Utilidad para construir el contexto de negocio
 */

/**
 * Construir contexto de negocio del usuario para el asistente IA
 * @param userId - UID del usuario
 * @returns Contexto formateado con productos, ventas y métricas
 */
export async function buildBusinessContext(userId: string): Promise<string> {
    try {
        return [
            "=== DATOS REALES DEL NEGOCIO ===",
            "Usuario:",
            `- userId: ${userId}`,
            "",
            "Productos:",
            "- (Pendiente integrar lectura real desde Firestore)",
            "",
            "Ventas:",
            "- (Pendiente integrar lectura real desde Firestore)",
        ].join("\n");
    } catch (error) {
        logger.error("contextBuilder.buildBusinessContext falló", {
            service: "contextBuilder",
            functionName: "buildBusinessContext",
            userId,
            error: error instanceof Error ? error.message : String(error),
            structuredData: true,
        });
        throw error;
    }
}
