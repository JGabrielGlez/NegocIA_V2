import * as logger from "firebase-functions/logger";

// TODO: Descomentar cuando se implemente callGemini
// import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Servicio para interactuar con la API de Gemini
 */

// TODO: Descomentar cuando se implemente callGemini
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Llamar a Gemini API con un prompt
 * @param prompt - Texto del prompt a enviar a Gemini
 * @returns Respuesta del modelo
 */
export async function callGemini(prompt: string): Promise<string> {
    try {
        // TODO: Implementar lógica de llamada a Gemini
        throw new Error("callGemini no implementado aún");
    } catch (error) {
        logger.error("geminiService.callGemini falló", {
            service: "geminiService",
            functionName: "callGemini",
            error: error instanceof Error ? error.message : String(error),
            promptLength: prompt?.length || 0,
            structuredData: true,
        });
        throw error;
    }
}
