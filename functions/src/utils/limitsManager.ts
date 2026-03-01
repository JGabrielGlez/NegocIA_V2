import * as logger from "firebase-functions/logger";
import admin from "../config/firebaseAdmin";
import { PLAN_LIMITS } from "../constants/aiLimits";

/**
 * Utilidad para gestionar límites de uso de IA
 */

/**
 * Resetear contador si ya pasó la fecha de reset
 * @param userId - UID del usuario
 */
async function resetCounterIfNeeded(userId: string): Promise<void> {
    try {
        const db = admin.firestore();
        const usageDocRef = db
            .collection("usuarios")
            .doc(userId)
            .collection("ai_usage")
            .doc("analytics");

        const usageDoc = await usageDocRef.get();

        if (!usageDoc.exists) {
            return;
        }

        const usageData = usageDoc.data();
        if (!usageData) {
            return;
        }

        const nextResetDate = usageData.nextResetDate?.toDate();
        const now = new Date();

        // Si ya pasó la fecha de reset, resetear el contador
        if (nextResetDate && now > nextResetDate) {
            // Calcular nuevo nextResetDate = nextResetDate anterior + 30 días
            const newNextResetDate = new Date(nextResetDate);
            newNextResetDate.setDate(newNextResetDate.getDate() + 30);

            // Actualizar el documento en Firestore
            await usageDocRef.update({
                queriesUsedThisMonth: 0,
                nextResetDate: newNextResetDate,
            });
        }
    } catch (error) {
        logger.error("limitsManager.resetCounterIfNeeded falló", {
            service: "limitsManager",
            functionName: "resetCounterIfNeeded",
            userId,
            error: error instanceof Error ? error.message : String(error),
            structuredData: true,
        });
        throw error;
    }
}

/**
 * Verificar si el usuario puede hacer una consulta
 * @param userId - UID del usuario
 * @param plan - Plan del usuario ("GRATIS" | "PRO")
 * @returns true si puede hacer consulta, false si ha alcanzado el límite
 */
export async function checkIfCanQuery(
    userId: string,
    plan: string,
): Promise<boolean> {
    try {
        const db = admin.firestore();
        const usageDocRef = db
            .collection("usuarios")
            .doc(userId)
            .collection("ai_usage")
            .doc("analytics");

        const usageDoc = await usageDocRef.get();

        if (!usageDoc.exists) {
            // Si no existe el documento, no puede hacer consultas
            return false;
        }

        const usageData = usageDoc.data();
        if (!usageData) {
            return false;
        }

        const nextResetDate = usageData.nextResetDate?.toDate();
        const now = new Date();

        // Si ya pasó la fecha de reset, resetear el contador
        if (nextResetDate && now > nextResetDate) {
            await resetCounterIfNeeded(userId);
            // Después del reset, el usuario puede hacer consultas
            return true;
        }

        // Obtener límite según el plan
        const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || 0;
        const queriesUsed = usageData.queriesUsedThisMonth || 0;

        // Verificar si aún tiene consultas disponibles
        return queriesUsed < limit;
    } catch (error) {
        logger.error("limitsManager.checkIfCanQuery falló", {
            service: "limitsManager",
            functionName: "checkIfCanQuery",
            userId,
            plan,
            error: error instanceof Error ? error.message : String(error),
            structuredData: true,
        });
        throw error;
    }
}

/**
 * Incrementar el contador de consultas del usuario
 * @param userId - UID del usuario
 */
export async function incrementQueryCount(userId: string): Promise<void> {
    try {
        const db = admin.firestore();
        const usageDocRef = db
            .collection("usuarios")
            .doc(userId)
            .collection("ai_usage")
            .doc("analytics");

        const usageDoc = await usageDocRef.get();

        if (!usageDoc.exists) {
            return;
        }

        const usageData = usageDoc.data();
        if (!usageData) {
            return;
        }

        // Sumar 1 a queriesUsedThisMonth y a totalQueriesAllTime
        const newQueriesUsedThisMonth =
            (usageData.queriesUsedThisMonth || 0) + 1;
        const newTotalQueriesAllTime = (usageData.totalQueriesAllTime || 0) + 1;

        // Actualizar el documento en Firestore
        await usageDocRef.update({
            queriesUsedThisMonth: newQueriesUsedThisMonth,
            totalQueriesAllTime: newTotalQueriesAllTime,
            lastQueryAt: new Date(),
        });
    } catch (error) {
        logger.error("limitsManager.incrementQueryCount falló", {
            service: "limitsManager",
            functionName: "incrementQueryCount",
            userId,
            error: error instanceof Error ? error.message : String(error),
            structuredData: true,
        });
        throw error;
    }
}

/**
 * Obtener cantidad de consultas restantes en el ciclo actual
 * @param userId - UID del usuario
 * @param plan - Plan del usuario ("GRATIS" | "PRO")
 * @returns Objeto con queriesRemaining y nextResetDate
 */
export async function getQueriesRemaining(
    userId: string,
    plan: string,
): Promise<{ queriesRemaining: number; nextResetDate: Date }> {
    try {
        const db = admin.firestore();
        const usageDocRef = db
            .collection("usuarios")
            .doc(userId)
            .collection("ai_usage")
            .doc("analytics");

        const usageDoc = await usageDocRef.get();

        if (!usageDoc.exists) {
            return {
                queriesRemaining: 0,
                nextResetDate: new Date(),
            };
        }

        const usageData = usageDoc.data();
        if (!usageData) {
            return {
                queriesRemaining: 0,
                nextResetDate: new Date(),
            };
        }

        // Obtener límite según el plan
        const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || 0;
        const queriesUsed = usageData.queriesUsedThisMonth || 0;
        const queriesRemaining = Math.max(0, limit - queriesUsed);
        const nextResetDate = usageData.nextResetDate?.toDate() || new Date();

        return {
            queriesRemaining,
            nextResetDate,
        };
    } catch (error) {
        logger.error("limitsManager.getQueriesRemaining falló", {
            service: "limitsManager",
            functionName: "getQueriesRemaining",
            userId,
            plan,
            error: error instanceof Error ? error.message : String(error),
            structuredData: true,
        });
        throw error;
    }
}
