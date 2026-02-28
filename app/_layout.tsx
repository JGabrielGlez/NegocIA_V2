import { databaseService } from "@/firebase/databaseService";
import { auth } from "@/firebase/firebaseConfig";
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
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import "./global.css";

export default function RootLayout() {
    const router = useRouter();
    const segments = useSegments();
    const rootNavigationState = useRootNavigationState();
    const usuario = useAuthStore((state) => state.usuario);
    const setAuthData = useAuthStore((state) => state.setAuthData);
    const hasNavigated = useRef(false);

    // Sincronizar estado de Firebase Auth con Zustand
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log(
                "[AuthStateChanged] Evento recibido:",
                firebaseUser
                    ? {
                          uid: firebaseUser.uid,
                          emailVerified: firebaseUser.emailVerified,
                      }
                    : "sin usuario",
            );

            if (firebaseUser && firebaseUser.emailVerified) {
                // Usuario autenticado y verificado en Firebase
                setAuthData({ usuario: firebaseUser });
                console.log(
                    "[AuthStateChanged] Usuario verificado. Cargando datos de Firestore para:",
                    firebaseUser.uid,
                );

                // Cargar productos y ventas desde Firestore
                try {
                    const { useStore } = await import("@/store/useStore");
                    const store = useStore.getState();

                    const [productos, ventas] = await Promise.all([
                        databaseService.getProductos(firebaseUser.uid),
                        databaseService.getVentas(firebaseUser.uid),
                    ]);

                    store.setProductos(productos);
                    store.setVentas(ventas);

                    console.log("✅ Datos cargados correctamente en _layout");
                } catch (error) {
                    console.error("⚠️ Error cargando datos en _layout:", error);
                }
            } else {
                // Usuario NO autenticado o no verificado
                // Limpiar el store y el estado de auth
                console.log(
                    "[AuthStateChanged] Limpiando estado local por usuario no autenticado/no verificado.",
                );
                try {
                    const { useStore } = await import("@/store/useStore");
                    useStore.getState().limpiarStore();
                } catch (error) {
                    console.error("⚠️ Error limpiando store:", error);
                }

                setAuthData({
                    usuario: null,
                    isPremium: false,
                    plan: "GRATIS",
                });
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!rootNavigationState?.key) {
            return;
        }

        // Evitar múltiples intentos de navegación
        if (hasNavigated.current) {
            return;
        }

        // Si estamos en la pantalla de presentación (índice), no hacer nada
        if (segments[0] === undefined) {
            return;
        }

        const enAuth = segments[0] === "(auth)";

        const usuarioVerificado = !!usuario?.emailVerified;

        if ((!usuario || !usuarioVerificado) && !enAuth) {
            hasNavigated.current = true;
            router.replace("/(auth)/iniciar-sesion");
            return;
        }

        if (usuario && usuarioVerificado && enAuth) {
            hasNavigated.current = true;
            router.replace("/dashboard");
        }
    }, [usuario, segments, router, rootNavigationState?.key]);

    // Efecto separado para inicializar RevenueCat cuando cambia el usuario
    useEffect(() => {
        if (!usuario?.uid || !usuario?.emailVerified) {
            console.log(
                "[RevenueCatInit] Saltado: no hay usuario verificado en store.",
                {
                    uid: usuario?.uid ?? null,
                    emailVerified: usuario?.emailVerified ?? false,
                },
            );
            return;
        }

        let isActive = true;
        console.log(
            "[RevenueCatInit] Inicializando RevenueCat para usuario:",
            usuario.uid,
        );

        initializeRevenueCat(usuario.uid)
            .then(async () => {
                if (!isActive) return;

                // Después de inicializar RevenueCat, verificar estado de suscripción
                const { isPro } = await checkSubscriptionStatus();
                if (!isActive) return;

                useAuthStore.getState().setIsPremium(isPro);
                useAuthStore.getState().setPlan(isPro ? "PRO" : "GRATIS");
                console.log("[RevenueCatInit] Plan aplicado en store:", {
                    uid: usuario.uid,
                    isPro,
                });
            })
            .catch((error) => {
                if (!isActive) return;
                console.error(
                    "Error al inicializar RevenueCat en _layout:",
                    error,
                );
            });

        return () => {
            isActive = false;
            console.log(
                "[RevenueCatInit] Cleanup del efecto de inicialización.",
            );
        };
    }, [usuario?.uid, usuario?.emailVerified]);

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
