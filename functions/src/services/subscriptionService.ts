import * as logger from "firebase-functions/logger";
import admin from "../config/firebaseAdmin";

type SubscriptionPlan = "PRO" | "GRATIS";

const ACTIVE_STATUSES = new Set([
    "active",
    "trialing",
    "initial_purchase",
    "renewal",
]);

function resolvePlanFromStatus(status: string): SubscriptionPlan {
    return ACTIVE_STATUSES.has(status.toLowerCase()) ? "PRO" : "GRATIS";
}

function parseExpiresAt(
    expiresAt: Date | string | null,
): admin.firestore.Timestamp | null {
    if (!expiresAt) {
        return null;
    }

    if (expiresAt instanceof Date) {
        return admin.firestore.Timestamp.fromDate(expiresAt);
    }

    const parsedDate = new Date(expiresAt);
    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    return admin.firestore.Timestamp.fromDate(parsedDate);
}

export async function updateSubscriptionStatus(
    userId: string,
    status: string,
    expiresAt: Date | string | null,
): Promise<void> {
    try {
        const db = admin.firestore();
        const userRef = db.collection("usuarios").doc(userId);
        const plan = resolvePlanFromStatus(status);
        const subscriptionExpiresAt = parseExpiresAt(expiresAt);

        await userRef.set(
            {
                subscriptionStatus: status,
                subscriptionExpiresAt,
                plan,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        logger.info("subscriptionService.updateSubscriptionStatus success", {
            service: "subscriptionService",
            functionName: "updateSubscriptionStatus",
            userId,
            status,
            plan,
            hasExpiresAt: Boolean(subscriptionExpiresAt),
            structuredData: true,
        });
    } catch (error) {
        logger.error("subscriptionService.updateSubscriptionStatus falló", {
            service: "subscriptionService",
            functionName: "updateSubscriptionStatus",
            userId,
            status,
            error: error instanceof Error ? error.message : String(error),
            structuredData: true,
        });
        throw error;
    }
}

export async function revokeSubscription(userId: string): Promise<void> {
    try {
        const db = admin.firestore();
        const userRef = db.collection("usuarios").doc(userId);

        await userRef.set(
            {
                plan: "GRATIS",
                subscriptionStatus: "expired",
                subscriptionExpiresAt: null,
                updatedAt: new Date(),
            },
            { merge: true },
        );

        logger.info("subscriptionService.revokeSubscription success", {
            service: "subscriptionService",
            functionName: "revokeSubscription",
            userId,
            plan: "GRATIS",
            subscriptionStatus: "expired",
            structuredData: true,
        });
    } catch (error) {
        logger.error("subscriptionService.revokeSubscription falló", {
            service: "subscriptionService",
            functionName: "revokeSubscription",
            userId,
            error: error instanceof Error ? error.message : String(error),
            structuredData: true,
        });
        throw error;
    }
}
