import * as logger from "firebase-functions/logger";
import admin from "../config/firebaseAdmin";
import { PLAN_LIMITS } from "../constants/aiLimits";

const CYCLE_DAYS = 30;
const CYCLE_MS = CYCLE_DAYS * 24 * 60 * 60 * 1000;

function addDays(baseDate: Date, days: number): Date {
    return new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
}

function toDateOrNull(value: unknown): Date | null {
    if (!value) {
        return null;
    }

    if (value instanceof Date) {
        return value;
    }

    if (
        typeof value === "object" &&
        value !== null &&
        "toDate" in value &&
        typeof (value as { toDate?: unknown }).toDate === "function"
    ) {
        return (value as { toDate: () => Date }).toDate();
    }

    const parsed = new Date(String(value));
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed;
}

function calculateNextResetDate(cycleAnchorDate: Date, now: Date): Date {
    const firstReset = addDays(cycleAnchorDate, CYCLE_DAYS);

    if (now < firstReset) {
        return firstReset;
    }

    const elapsedMs = now.getTime() - firstReset.getTime();
    const fullCyclesElapsed = Math.floor(elapsedMs / CYCLE_MS);
    return new Date(firstReset.getTime() + (fullCyclesElapsed + 1) * CYCLE_MS);
}

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

        const nextResetDate = toDateOrNull(usageData.nextResetDate);
        const cycleAnchorDate = toDateOrNull(usageData.cycleAnchorDate);
        const now = new Date();

        let inferredCycleAnchorDate = cycleAnchorDate;
        if (!inferredCycleAnchorDate && nextResetDate) {
            inferredCycleAnchorDate = addDays(nextResetDate, -CYCLE_DAYS);
        }

        if (!inferredCycleAnchorDate) {
            return;
        }

        const resolvedNextResetDate =
            nextResetDate ||
            calculateNextResetDate(inferredCycleAnchorDate, now);

        // Si ya llegó/pasó la fecha de reset, recalcular y resetear el contador
        if (now >= resolvedNextResetDate) {
            const newNextResetDate = calculateNextResetDate(
                inferredCycleAnchorDate,
                now,
            );

            // Actualizar el documento en Firestore
            await usageDocRef.update({
                queriesUsedThisMonth: 0,
                nextResetDate: newNextResetDate,
                cycleAnchorDate: inferredCycleAnchorDate,
            });
        } else if (!cycleAnchorDate || !nextResetDate) {
            await usageDocRef.update({
                cycleAnchorDate: inferredCycleAnchorDate,
                nextResetDate: resolvedNextResetDate,
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

        const nextResetDate = toDateOrNull(usageData.nextResetDate);
        const cycleAnchorDate = toDateOrNull(usageData.cycleAnchorDate);
        const now = new Date();

        const fallbackNextResetDate =
            cycleAnchorDate && !nextResetDate
                ? calculateNextResetDate(cycleAnchorDate, now)
                : nextResetDate;

        // Si ya pasó la fecha de reset, resetear el contador
        if (fallbackNextResetDate && now >= fallbackNextResetDate) {
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

        await resetCounterIfNeeded(userId);

        const refreshedUsageDoc = await usageDocRef.get();
        const refreshedUsageData = refreshedUsageDoc.data() || usageData;

        // Obtener límite según el plan
        const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || 0;
        const queriesUsed = refreshedUsageData.queriesUsedThisMonth || 0;
        const queriesRemaining = Math.max(0, limit - queriesUsed);
        const now = new Date();
        const cycleAnchorDate = toDateOrNull(
            refreshedUsageData.cycleAnchorDate,
        );
        const nextResetDate =
            toDateOrNull(refreshedUsageData.nextResetDate) ||
            (cycleAnchorDate
                ? calculateNextResetDate(cycleAnchorDate, now)
                : addDays(now, CYCLE_DAYS));

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
