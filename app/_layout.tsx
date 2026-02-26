import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
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
    }, [usuario, segments, router]);

    return <Stack screenOptions={{ headerShown: false }} />;
}
