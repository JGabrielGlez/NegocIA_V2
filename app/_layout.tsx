import { databaseService } from "@/firebase/databaseService";
import { auth } from "@/firebase/firebaseConfig";
import {
    checkSubscriptionStatus,
    initializeRevenueCat,
    syncSubscriptionWithBackend,
} from "@/services/revenueCat";
import { useAuthStore } from "@/store/useAuthStore";
import NetInfo from "@react-native-community/netinfo";
import {
    Stack,
    useRootNavigationState,
    useRouter,
    useSegments,
} from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, StyleSheet, Text, View } from "react-native";
import "./global.css";

export default function RootLayout() {
    const router = useRouter();
    const segments = useSegments();
    const rootNavigationState = useRootNavigationState();
    const usuario = useAuthStore((state) => state.usuario);
    const setAuthData = useAuthStore((state) => state.setAuthData);
    const hasNavigated = useRef(false);
    const lastSyncTime = useRef<number | null>(null);

    // true una vez que onAuthStateChanged dispara por primera vez
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    // true una vez que los datos de Firestore (productos + ventas) terminaron de cargar
    const [isDataLoaded, setIsDataLoaded] = useState(false);

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

                    console.log(
                        "✅ Datos cargados correctamente en _layout:",
                        {
                            productosCount: productos.length,
                            ventasCount: ventas.length,
                        },
                    );

                    // Sincronizar datos pendientes después de cargar (para offline-first)
                    try {
                        console.log(
                            "🔄 Sincronizando datos pendientes después de login...",
                        );
                        await Promise.all([
                            store.sincronizarProductosLocales(),
                            store.sincronizarVentasLocales(),
                        ]);
                        console.log("✅ Sincronización de datos pendientes completada");
                    } catch (syncError) {
                        console.error(
                            "⚠️ Error al sincronizar datos pendientes:",
                            syncError,
                        );
                    }
                } catch (error) {
                    console.error("⚠️ Error cargando datos en _layout:", error);
                } finally {
                    // Datos listos (o fallaron): quitar pantalla de carga
                    setIsDataLoaded(true);
                    setIsAuthChecked(true);
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

                // Sin usuario: resetear datos y marcar auth como verificada
                setIsDataLoaded(false);
                setIsAuthChecked(true);
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

    // Listener de conexión: Sincronizar datos pendientes cuando se recupera internet
    useEffect(() => {
        if (!usuario?.uid) {
            return;
        }

        const unsubscribe = NetInfo.addEventListener((state) => {
            if (state.isConnected && state.isInternetReachable) {
                console.log(
                    "🌐 [NetInfo] Conexión recuperada, sincronizando datos pendientes...",
                );

                // Importar el store dinámicamente para evitar ciclos de dependencia
                import("@/store/useStore")
                    .then(({ useStore }) => {
                        const store = useStore.getState();
                        Promise.all([
                            store.sincronizarVentasLocales(),
                            store.sincronizarProductosLocales(),
                        ])
                            .then(() => {
                                console.log(
                                    "✅ [NetInfo] Sincronización completada correctamente",
                                );
                            })
                            .catch((error) => {
                                console.error(
                                    "⚠️ [NetInfo] Error en sincronización:",
                                    error,
                                );
                            });
                    })
                    .catch((error) => {
                        console.error(
                            "⚠️ [NetInfo] Error importando store:",
                            error,
                        );
                    });
            } else {
                console.log(
                    "📵 [NetInfo] Sin conexión a internet, modo offline activado",
                );
            }
        });

        return () => {
            unsubscribe();
        };
    }, [usuario?.uid]);

    // Segundo useEffect: Sincronizar suscripción cuando la app vuelve al foreground (con throttle de 5 minutos)
    useEffect(() => {
        if (!usuario?.uid) {
            return;
        }

        const subscription = AppState.addEventListener("change", (state) => {
            if (state === "active") {
                const now = Date.now();
                const timeSinceLastSync = lastSyncTime.current
                    ? now - lastSyncTime.current
                    : Infinity;

                const FIVE_MINUTES_MS = 5 * 60 * 1000; // 300,000 ms

                if (
                    timeSinceLastSync >= FIVE_MINUTES_MS ||
                    lastSyncTime.current === null
                ) {
                    console.log(
                        "[AppState] App en foreground, sincronizando...",
                    );

                    // Sincronizar suscripción y datos del negocio
                    Promise.all([
                        syncSubscriptionWithBackend(usuario.uid),
                        import("@/store/useStore").then(({ useStore }) => {
                            const store = useStore.getState();
                            return Promise.all([
                                store.sincronizarVentasLocales(),
                                store.sincronizarProductosLocales(),
                            ]);
                        }),
                    ])
                        .then(() => {
                            lastSyncTime.current = Date.now();
                            console.log(
                                "[AppState] Sincronización completada.",
                            );
                        })
                        .catch((error) => {
                            console.error(
                                "[AppState] Error sincronizando:",
                                error,
                            );
                            // No actualizar lastSyncTime en error para reintentar en el próximo foreground
                        });
                } else {
                    const secondsAgo = Math.round(timeSinceLastSync / 1000);
                    console.log(
                        `[AppState] ⏭️ Sincronización omitida: hace ${secondsAgo}s (< 5 min)`,
                    );
                }
            }
        });

        return () => {
            subscription.remove();
        };
    }, [usuario?.uid]);

    // Mostrar overlay SOLO en arranque en frio (sesion guardada del arranque anterior).
    // Durante un login activo, el boton ya muestra el spinner — no duplicar feedback.
    const mostrarCarga = !isAuthChecked;

    return (
        <>
            <Stack screenOptions={{ headerShown: false }} />
            {mostrarCarga ? (
                <View style={[StyleSheet.absoluteFill, estilosCarga.contenedor]}>
                    <Text style={estilosCarga.logo}>N</Text>
                    <ActivityIndicator size="large" color="#16A34A" style={estilosCarga.spinner} />
                    <Text style={estilosCarga.texto}>Iniciando...</Text>
                </View>
            ) : null}
        </>
    );
}

const estilosCarga = StyleSheet.create({
    contenedor: {
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
    },
    logo: {
        fontSize: 72,
        fontWeight: "800",
        color: "#ffffff",
        backgroundColor: "#16A34A",
        width: 120,
        textAlign: "center",
        borderRadius: 24,
        overflow: "hidden",
        marginBottom: 32,
    },
    spinner: {
        marginBottom: 16,
    },
    texto: {
        fontSize: 16,
        color: "#6B7280",
    },
});
