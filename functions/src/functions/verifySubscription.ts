import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/v2/https";
import { createHmac, timingSafeEqual } from "node:crypto";
import {
    revokeSubscription,
    updateSubscriptionStatus,
} from "../services/subscriptionService";

type RevenueCatEventType =
    | "INITIAL_PURCHASE"
    | "RENEWAL"
    | "CANCELLATION"
    | "EXPIRATION";

interface RevenueCatWebhookEvent {
    type?: string;
    app_user_id?: string;
    original_app_user_id?: string;
    expires_at_ms?: number;
    expiration_at_ms?: number;
    expires_at?: string;
    expiration_at?: string;
}

interface RevenueCatWebhookBody {
    event?: RevenueCatWebhookEvent;
}

function toBuffer(rawBody: unknown, parsedBody: unknown): Buffer {
    if (Buffer.isBuffer(rawBody)) {
        return rawBody;
    }

    if (typeof rawBody === "string") {
        return Buffer.from(rawBody, "utf8");
    }

    return Buffer.from(JSON.stringify(parsedBody ?? {}), "utf8");
}

function normalizeSignature(signature: string): string {
    return signature.startsWith("sha256=")
        ? signature.replace("sha256=", "")
        : signature;
}

function constantTimeCompare(a: string, b: string): boolean {
    const aBuffer = Buffer.from(a, "utf8");
    const bBuffer = Buffer.from(b, "utf8");

    if (aBuffer.length !== bBuffer.length) {
        return false;
    }

    return timingSafeEqual(aBuffer, bBuffer);
}

function isValidRevenueCatSignature(
    bodyBuffer: Buffer,
    providedSignatureHeader: string,
    secret: string,
): boolean {
    const providedSignature = normalizeSignature(
        providedSignatureHeader.trim(),
    );

    const digestHex = createHmac("sha256", secret)
        .update(bodyBuffer)
        .digest("hex");

    const digestBase64 = createHmac("sha256", secret)
        .update(bodyBuffer)
        .digest("base64");

    return (
        constantTimeCompare(providedSignature, digestHex) ||
        constantTimeCompare(providedSignature, digestBase64)
    );
}

function getExpiresAt(event?: RevenueCatWebhookEvent): Date | null {
    if (!event) {
        return null;
    }

    const rawMs = event.expires_at_ms ?? event.expiration_at_ms;
    if (typeof rawMs === "number") {
        return new Date(rawMs);
    }

    const rawIso = event.expires_at ?? event.expiration_at;
    if (typeof rawIso === "string") {
        const parsedDate = new Date(rawIso);
        if (!Number.isNaN(parsedDate.getTime())) {
            return parsedDate;
        }
    }

    return null;
}

export const verifySubscription = onRequest(async (request, response) => {
    const signatureHeader = request.get("X-RevenueCat-Webhook-Signature") || "";
    const secret = process.env.REVENUECAT_WEBHOOK_SECRET || "";

    if (request.method !== "POST") {
        response.status(405).json({ error: "Method not allowed" });
        return;
    }

    if (!secret) {
        logger.error("verifySubscription: webhook secret faltante", {
            functionName: "verifySubscription",
            structuredData: true,
        });
        response.status(500).json({ error: "Webhook secret not configured" });
        return;
    }

    const bodyBuffer = toBuffer(request.rawBody, request.body);
    const isValidSignature =
        Boolean(signatureHeader) &&
        isValidRevenueCatSignature(bodyBuffer, signatureHeader, secret);

    if (!isValidSignature) {
        logger.warn("verifySubscription: firma inválida", {
            functionName: "verifySubscription",
            hasSignatureHeader: Boolean(signatureHeader),
            structuredData: true,
        });
        response.status(401).json({ error: "Invalid signature" });
        return;
    }

    const payload = request.body as RevenueCatWebhookBody;
    const event = payload?.event;
    const eventType = (event?.type || "") as RevenueCatEventType;
    const userId = event?.app_user_id || event?.original_app_user_id || "";

    logger.info("verifySubscription: webhook recibido", {
        functionName: "verifySubscription",
        eventType,
        userId,
        structuredData: true,
    });

    if (!eventType || !userId) {
        logger.warn("verifySubscription: payload inválido", {
            functionName: "verifySubscription",
            eventType,
            userId,
            hasEvent: Boolean(event),
            structuredData: true,
        });
        response.status(400).json({ error: "Invalid payload" });
        return;
    }

    try {
        switch (eventType) {
            case "INITIAL_PURCHASE":
            case "RENEWAL": {
                const expiresAt = getExpiresAt(event);
                logger.info(
                    "verifySubscription: actualizando suscripción activa",
                    {
                        functionName: "verifySubscription",
                        eventType,
                        userId,
                        hasExpiresAt: Boolean(expiresAt),
                        structuredData: true,
                    },
                );
                await updateSubscriptionStatus(userId, "active", expiresAt);
                break;
            }
            case "CANCELLATION": {
                const expiresAt = getExpiresAt(event);
                logger.info("verifySubscription: marcando cancelación", {
                    functionName: "verifySubscription",
                    eventType,
                    userId,
                    hasExpiresAt: Boolean(expiresAt),
                    structuredData: true,
                });
                await updateSubscriptionStatus(userId, "canceled", expiresAt);
                break;
            }
            case "EXPIRATION":
                logger.info("verifySubscription: revocando suscripción", {
                    functionName: "verifySubscription",
                    eventType,
                    userId,
                    structuredData: true,
                });
                await revokeSubscription(userId);
                break;
            default:
                logger.info("verifySubscription: evento no soportado", {
                    functionName: "verifySubscription",
                    eventType,
                    userId,
                    structuredData: true,
                });
                response.status(200).json({ received: true, ignored: true });
                return;
        }

        logger.info("verifySubscription: webhook procesado", {
            functionName: "verifySubscription",
            eventType,
            userId,
            structuredData: true,
        });

        response.status(200).json({ received: true });
    } catch (error) {
        logger.error("verifySubscription: error procesando webhook", {
            functionName: "verifySubscription",
            eventType,
            userId,
            error: error instanceof Error ? error.message : String(error),
            structuredData: true,
        });
        response.status(500).json({ error: "Internal server error" });
    }
});
