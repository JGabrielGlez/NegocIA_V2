import { Alert } from "react-native";
import Purchases, { PurchasesOfferings } from "react-native-purchases";
import { databaseService } from "../firebase/databaseService";
import { useAuthStore } from "../store/useAuthStore";

let revenueCatConfigured = false;
let revenueCatLinkedUserId: string | null = null;

async function ensureRevenueCatConfigured(): Promise<boolean> {
    if (revenueCatConfigured) {
        return true;
    }

    const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;

    if (!apiKey) {
        console.error(
            "REVENUECAT: API Key no configurada en variables de entorno",
        );
        return false;
    }

    Purchases.configure({ apiKey });
    revenueCatConfigured = true;
    console.log("RevenueCat configurado correctamente");
    return true;
}

/**
 * Inicializa RevenueCat con el SDK de react-native-purchases.
 *
 * Debe ser llamada UNA SOLA VEZ al iniciar la app, idealmente en el layout raíz
 * (app/_layout.tsx) dentro de un useEffect. Vincula el usuario de Firebase Auth
 * con RevenueCat para que el sistema de suscripciones pueda identificarlo.
 *
 * @async
 * @param {string} userId - UID del usuario autenticado en Firebase Auth
 * @returns {Promise<void>} Resuelve cuando RevenueCat está configurado. Lanza error si hay problema.
 *
 * @example
 * // En app/_layout.tsx
 * useEffect(() => {
 *   if (user?.uid) {
 *     await initializeRevenueCat(user.uid);
 *   }
 * }, [user?.uid]);
 *
 * @throws {Error} Si EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID no está configurada
 */
export async function initializeRevenueCat(userId: string): Promise<void> {
    try {
        const isConfigured = await ensureRevenueCatConfigured();
        if (!isConfigured) {
            return;
        }

        if (revenueCatLinkedUserId === userId) {
            return;
        }

        await Purchases.logIn(userId);
        revenueCatLinkedUserId = userId;

        console.log("RevenueCat vinculado correctamente para:", userId);
    } catch (error) {
        console.error("Error al inicializar RevenueCat:", error);
        throw error;
    }
}

/**
 * Cierra la sesión de RevenueCat y desvincula el usuario actual.
 *
 * Debe ser llamada al cerrar sesión en Firebase Auth para limpiar el estado
 * de RevenueCat y permitir que un nuevo usuario se vincule correctamente.
 *
 * @async
 * @returns {Promise<void>} Resuelve cuando se cierra la sesión exitosamente
 *
 * @example
 * await logOutRevenueCat();
 * console.log('Sesión de RevenueCat cerrada');
 */
export async function logOutRevenueCat(): Promise<void> {
    try {
        const isConfigured = await ensureRevenueCatConfigured();
        if (!isConfigured) {
            return;
        }

        await Purchases.logOut();
        revenueCatLinkedUserId = null;
        console.log("✅ RevenueCat: Sesión cerrada correctamente");
    } catch (error) {
        console.error("❌ Error al cerrar sesión de RevenueCat:", error);
    }
}

/**
 * Obtiene los offerings (paquetes de suscripción disponibles) configurados en RevenueCat.
 *
 * Un "offering" es un conjunto de paquetes (packages) que RevenueCat presenta al usuario.
 * En el dashboard de RevenueCat debes haber creado un offering "pro_monthly" que contiene
 * el paquete $299 MXN/mes para Android.
 *
 * @async
 * @returns {Promise<PurchasesOfferings | null>} Objeto con offerings disponibles, o null si hay error
 *
 * @example
 * const offerings = await getOfferings();
 * if (offerings?.current) {
 *   const proPackage = offerings.current.getPackage('pro_monthly');
 *   console.log(`Precio: ${proPackage?.product?.priceString}`);
 * }
 *
 * @note Retorna null de forma segura si no hay offerings o hay error (no lanza excepción)
 * @see https://docs.revenuecat.com/docs/displaying-products
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
 * Verifica el estado actual de suscripción del usuario consultando RevenueCat.
 *
 * Consulta el entitlement "pro" para determinar si el usuario tiene suscripción activa.
 * Si hay algún error, retorna { isPro: false, expiresAt: null } de forma segura
 * (no lanza excepción).
 *
 * @async
 * @returns {Promise<{isPro: boolean, expiresAt: Date | null}>} Estado de suscripción:
 *   - isPro: true si tiene entitlement "pro" activo
 *   - expiresAt: Fecha de expiración de la suscripción (null si es gratuita o sin fecha)
 *
 * @example
 * const { isPro, expiresAt } = await checkSubscriptionStatus();
 * if (isPro) {
 *   console.log(`Premium hasta: ${expiresAt?.toLocaleDateString('es-MX')}`);
 * } else {
 *   console.log('Usuario está en plan Gratuito');
 * }
 *
 * @note En caso de error, retorna plan GRATIS (más seguro que asumir PRO)
 * @see https://docs.revenuecat.com/docs/entitlements
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

/**
 * Sincroniza el estado de suscripción entre RevenueCat, el store Zustand y Firestore.
 *
 * Compara el estado de suscripción en RevenueCat con el almacenado localmente en el store.
 * Si hay discrepancia:
 * 1. Actualiza Firestore con el estado correcto (isPro)
 * 2. Actualiza el store local para que la UI refleje el cambio inmediatamente
 *
 * Esta función debe ser llamada:
 * - Al iniciar la app (después de autenticarse)
 * - Después de una compra exitosa
 * - Ocasionalmente como verificación de integridad (ej: cada 1 hora)
 *
 * @async
 * @param {string} userId - UID del usuario en Firebase Auth
 * @returns {Promise<void>} Resuelve cuando la sincronización es completa
 *
 * @example
 * // Después de que el usuario se autentica
 * const { user } = useAuthStore();
 * if (user?.uid) {
 *   await syncSubscriptionWithBackend(user.uid);
 * }
 *
 * @throws {Error} Si hay problema al actualizar Firestore
 * @see checkSubscriptionStatus Para consultar solo (sin sincronizar)
 */
export async function syncSubscriptionWithBackend(
    userId: string,
): Promise<void> {
    try {
        // Paso 1: Obtener estado actual de suscripción desde RevenueCat
        const { isPro, expiresAt } = await checkSubscriptionStatus();
        const currentStoreIsPremium = useAuthStore.getState().isPremium;

        console.log("[syncSubscriptionWithBackend] Comparando estados:", {
            revenueCatIsPro: isPro,
            storeIsPremium: currentStoreIsPremium,
        });

        // Paso 2: Si hay discrepancia, sincronizar
        if (isPro !== currentStoreIsPremium) {
            console.warn(
                `[syncSubscriptionWithBackend] Discrepancia detectada. RevenueCat: ${isPro}, Store: ${currentStoreIsPremium}`,
            );

            const plan = isPro ? "PRO" : "GRATIS";

            // Actualizar Firestore
            try {
                await databaseService.updateUsuario(userId, { plan });
                console.log(
                    `[syncSubscriptionWithBackend] Firestore actualizado a plan: ${plan}`,
                );
            } catch (dbError) {
                console.error(
                    "[syncSubscriptionWithBackend] Error actualizando Firestore:",
                    dbError,
                );
                throw dbError;
            }

            // Actualizar store local
            useAuthStore.getState().setIsPremium(isPro);
            useAuthStore.getState().setPlan(plan);
            console.log(
                `[syncSubscriptionWithBackend] Store actualizado. isPremium: ${isPro}, plan: ${plan}`,
            );
        } else {
            console.log(
                "[syncSubscriptionWithBackend] Estados sincronizados. No hay cambios.",
            );
        }
    } catch (error) {
        console.error("[syncSubscriptionWithBackend] Error:", error);
        throw error;
    }
}

/**
 * Realiza la compra de un paquete de suscripción a través de Google Play Billing.
 *
 * Maneja robustamente varios tipos de errores:
 * - Cancelación del usuario: Retorna false sin mostrar alerta
 * - Error de red/offline: Muestra alerta de conexión
 * - Error de Google Play: Muestra alerta genérica de compra
 *
 * Después de la compra, verifica que el entitlement "pro" esté activo en RevenueCat.
 *
 * @async
 * @param {any} packageToOffer - Paquete de RevenueCat a comprar (obtenido de getOfferings)
 * @returns {Promise<boolean>} true si compra exitosa y PRO está activo, false si falló o fue cancelada
 *
 * @example
 * const offerings = await getOfferings();
 * if (offerings?.current?.monthly) {
 *   const success = await purchasePackage(offerings.current.monthly);
 *   if (success) {
 *     console.log('¡Bienvenido al plan PRO!');
 *   }
 * }
 *
 * @note No lanza excepciones; siempre maneja errores internamente
 * @see getOfferings Para obtener la lista de paquetes disponibles
 * @see https://docs.revenuecat.com/docs/making-purchases
 */
export async function purchasePackage(packageToOffer: any): Promise<boolean> {
    try {
        console.log("[purchasePackage] Iniciando compra de paquete...");

        await Purchases.purchasePackage(packageToOffer);

        // Después de compra exitosa, verificar si entitlement PRO está activo
        const customerInfo = await Purchases.getCustomerInfo();
        if (customerInfo.entitlements.active["pro"]) {
            console.log(
                "[purchasePackage] ✅ Compra exitosa. Entitlement PRO activado.",
            );
            return true;
        } else {
            console.warn(
                "[purchasePackage] Compra registrada pero entitlement PRO no activo.",
            );
            return false;
        }
    } catch (error: any) {
        // Capturar cancelación del usuario (no mostrar error)
        if (
            error.code === "PurchaseCancelledError" ||
            error.userCancelled === true ||
            error.message?.includes("cancelled")
        ) {
            console.log("[purchasePackage] Usuario canceló la compra.");
            return false;
        }

        // Capturar errores de red
        if (
            error.code === "NetworkError" ||
            error.message?.includes("network") ||
            error.message?.includes("offline") ||
            error instanceof TypeError
        ) {
            console.error("[purchasePackage] Error de red:", error);
            Alert.alert(
                "Sin conexión",
                "No hay conexión a internet. Verifica tu red e intenta de nuevo.",
                [{ text: "Aceptar", onPress: () => {} }],
            );
            return false;
        }

        // Error de Google Play Billing u otro error de compra
        console.error("[purchasePackage] Error al realizar compra:", error);
        Alert.alert(
            "No se pudo completar la compra",
            "No se pudo procesar tu pago. Verifica tu método de pago e intenta de nuevo.",
            [{ text: "Aceptar", onPress: () => {} }],
        );
        return false;
    }
}
