import Purchases, { PurchasesOfferings } from "react-native-purchases";

/**
 * Inicializar RevenueCat con el userId de Firebase Auth
 * @param userId - UID del usuario autenticado
 */

export async function initializeRevenueCat(userId: string): Promise<void> {
    try {
        const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;

        if (!apiKey) {
            console.error(
                "REVENUECAT: API Key no configurada en variables de entorno",
            );
            return;
        }

        Purchases.configure({
            apiKey,
            appUserID: userId,
        });

        console.log("RevenueCat inicializado correctamente para:", userId);
    } catch (error) {
        console.error("Error al inicializar RevenueCat:", error);
        throw error;
    }
}

/**
 * Obtener offerings (productos disponibles) de RevenueCat
 * @returns Offerings disponibles o null si hay error
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
    try {
        const offerings = await Purchases.getOfferings();

        if (offerings.current) {
            console.log("Offerings cargadas:", offerings.current.identifier);
            return offerings;
        } else {
            console.warn("No hay offerings configuradas en RevenueCat");
            return null;
        }
    } catch (error) {
        console.error("Error al obtener offerings de RevenueCat:", error);
        return null;
    }
}

/**
 * Verificar estado de suscripción del usuario
 * @returns { isPro: boolean, expiresAt: Date | null }
 */
export async function checkSubscriptionStatus(): Promise<{
    isPro: boolean;
    expiresAt: Date | null;
}> {
    try {
        const customerInfo = await Purchases.getCustomerInfo();

        // Buscar "pro" en los entitlements activos
        const proEntitlement = customerInfo.entitlements.active["pro"];

        if (proEntitlement) {
            const expiresAt = proEntitlement.expirationDate
                ? new Date(proEntitlement.expirationDate)
                : null;

            console.log("✅ Usuario tiene suscripción PRO activa");
            if (expiresAt) {
                console.log(
                    `   Expira el: ${expiresAt.toLocaleDateString("es-MX")}`,
                );
            }

            return {
                isPro: true,
                expiresAt,
            };
        } else {
            console.log("Usuario está en plan GRATIS");
            return {
                isPro: false,
                expiresAt: null,
            };
        }
    } catch (error) {
        console.error("Error al verificar suscripción de RevenueCat:", error);
        // En caso de error, asumir GRATIS (más seguro)
        return {
            isPro: false,
            expiresAt: null,
        };
    }
}
