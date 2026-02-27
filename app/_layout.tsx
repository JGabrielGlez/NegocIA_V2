import {
    checkSubscriptionStatus,
    initializeRevenueCat,
} from "@/services/revenueCat";
import { useAuthStore } from "@/store/useAuthStore";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import "./global.css";

export default function RootLayout() {
    const router = useRouter();
    const segments = useSegments();
    const usuario = useAuthStore((state) => state.usuario);

    useEffect(() => {
        const enAuth = segments[0] === "(auth)";

        if (!usuario && !enAuth) {
            router.replace("/(auth)/iniciar-sesion");
            return;
        }

        if (usuario && enAuth) {
            router.replace("/dashboard");
        }

        // Inicializar RevenueCat si hay usuario autenticado
        if (usuario?.uid) {
            initializeRevenueCat(usuario.uid)
                .then(async () => {
                    // Después de inicializar RevenueCat, verificar estado de suscripción
                    const { isPro } = await checkSubscriptionStatus();
                    useAuthStore.getState().setIsPremium(isPro);
                })
                .catch((error) => {
                    console.error(
                        "Error al inicializar RevenueCat en _layout:",
                        error,
                    );
                });
        }
    }, [usuario, segments, router]);

    return <Stack screenOptions={{ headerShown: false }} />;
}
