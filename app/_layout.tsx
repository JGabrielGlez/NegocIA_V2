import {
    checkSubscriptionStatus,
    initializeRevenueCat,
    syncSubscriptionWithBackend,
} from "@/services/revenueCat";
import { useAuthStore } from "@/store/useAuthStore";
import {
    Stack,
    useRootNavigationState,
    useRouter,
    useSegments,
} from "expo-router";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import "./global.css";

export default function RootLayout() {
    const router = useRouter();
    const segments = useSegments();
    const rootNavigationState = useRootNavigationState();
    const usuario = useAuthStore((state) => state.usuario);
    const hasNavigated = useRef(false);

    useEffect(() => {
        if (!rootNavigationState?.key) {
            return;
        }

        // Evitar múltiples intentos de navegación
        if (hasNavigated.current) {
            return;
        }

        // Si estamos en la pantalla de presentación (índice), no hacer nada
        if (segments.length === 0 || segments[0] === undefined) {
            return;
        }

        const enAuth = segments[0] === "(auth)";

        if (!usuario && !enAuth) {
            hasNavigated.current = true;
            router.replace("/(auth)/iniciar-sesion");
            return;
        }

        if (usuario && enAuth) {
            hasNavigated.current = true;
            router.replace("/dashboard");
        }

        // Inicializar RevenueCat si hay usuario autenticado
        if (usuario?.uid) {
            initializeRevenueCat(usuario.uid)
                .then(async () => {
                    // Después de inicializar RevenueCat, verificar estado de suscripción
                    const { isPro } = await checkSubscriptionStatus();
                    useAuthStore.getState().setIsPremium(isPro);
                    useAuthStore.getState().setPlan(isPro ? "PRO" : "GRATIS");
                })
                .catch((error) => {
                    console.error(
                        "Error al inicializar RevenueCat en _layout:",
                        error,
                    );
                });
        }
    }, [usuario, segments, router, rootNavigationState?.key]);

    // Segundo useEffect: Sincronizar suscripción cuando la app vuelve al foreground
    useEffect(() => {
        if (!usuario?.uid) {
            return;
        }

        const subscription = AppState.addEventListener("change", (state) => {
            if (state === "active") {
                console.log(
                    "[AppState] App en foreground, sincronizando suscripción...",
                );
                syncSubscriptionWithBackend(usuario.uid)
                    .then(() => {
                        console.log(
                            "[AppState] Sincronización de suscripción completada.",
                        );
                    })
                    .catch((error) => {
                        console.error(
                            "[AppState] Error sincronizando suscripción:",
                            error,
                        );
                    });
            }
        });

        return () => {
            subscription.remove();
        };
    }, [usuario?.uid]);

    return <Stack screenOptions={{ headerShown: false }} />;
}
