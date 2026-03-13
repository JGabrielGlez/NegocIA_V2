import { databaseService } from "@/firebase/databaseService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Router } from "expo-router";
import {
    getAuth,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signOut,
    User,
} from "firebase/auth";
import { Alert } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
    isLoading?: boolean;
    usuario: User | null;
    isPremium: boolean;
    plan: "PRO" | "GRATIS";
    mensajeError: Record<string, string>;

    // Funciones

    // Este es para setear cualquier dato de la interfaz, sin necesidad de crear una funcion para cada propiedad
    setAuthData: (data: Partial<AuthState>) => void;
    setIsLoading: (loading: boolean) => void;
    setIsPremium: (isPro: boolean) => void;
    setPlan: (plan: "PRO" | "GRATIS") => void;
    iniciarSesion: (
        correo: string,
        password: string,
        router: Router,
    ) => Promise<void>;
    cerrarSesion: (router: Router) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            mensajeError: {
                "auth/too-many-requests":
                    "Se ha bloqueado la cuenta temporalmente por inicios de sesión fallidos, intente más tarde",
                "auth/invalid-email": "El correo no es válido.",
                "auth/invalid-credential":
                    "Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.",
                "auth/user-not-found":
                    "No existe una cuenta con ese correo. Revisa el email o crea una cuenta nueva.",
                "auth/wrong-password":
                    "La contraseña es incorrecta. Intenta de nuevo.",
                "auth/network-request-failed":
                    "No se pudo conectar con el servidor. Verifica tu internet, que el emulador/backend esté activo, e intenta de nuevo.",
                "auth/timeout":
                    "La solicitud tardó demasiado. Revisa tu conexión e intenta nuevamente.",
                "auth/internal-error":
                    "Ocurrió un error interno de autenticación. Intenta nuevamente en unos minutos.",
                "auth/app-deleted":
                    "La app de autenticación no está configurada correctamente en este dispositivo.",
                "auth/operation-not-allowed":
                    "Este método de autenticación no está habilitado en Firebase.",
                "auth/missing-email": "Debes ingresar un correo electrónico.",
                "auth/missing-password": "Debes ingresar una contraseña.",
                "auth/user-token-expired":
                    "Tu sesión expiró. Inicia sesión nuevamente.",
                "auth/invalid-api-key":
                    "La configuración de Firebase no es válida (API Key).",
                "auth/unauthorized-domain":
                    "Este dominio no está autorizado para autenticación.",
                "auth/user-disabled":
                    "Esta cuenta está deshabilitada. Contacta a soporte.",
            },

            usuario: null,

            isLoading: false,

            isPremium: false,

            plan: "GRATIS",

            setIsLoading: (loading) => {
                get().setAuthData({ isLoading: loading });
            },

            setIsPremium: (isPro) => {
                get().setAuthData({ isPremium: isPro });
            },

            setPlan: (plan) => {
                get().setAuthData({ plan });
            },

            setAuthData: (datos) => set(datos),

            iniciarSesion: async (correo, password, router) => {
                if (get().isLoading) return;
                get().setIsLoading(true);

                // Validación antes de llamar a Firebase
                if (correo === "" || password === "") {
                    Alert.alert(
                        "Error",
                        "Por favor, rellena todos los campos.",
                        [
                            {
                                text: "Aceptar",
                                onPress: () => {
                                    get().setIsLoading(false);
                                },
                            },
                        ],
                    );

                    return;
                }
                // Una vez pasa, significa que hay algo escrito en ambos lados
                // por lo que se prosigue a usar la auth y a bloquear el estado del boton
                const auth = getAuth();

                // Aquí se empieza con la validación de todos los errores y con las funciones asíncronas
                try {
                    const correoLimpio = correo.trim();
                    const userCredential = await signInWithEmailAndPassword(
                        auth,
                        correoLimpio,
                        password,
                    );

                    const user = userCredential.user;
                    // Se actualiza la info del usuario, esto es para verificar el estado del correo que esté validado
                    await user.reload();
                    set({
                        usuario: userCredential.user,
                        isPremium: false,
                        plan: "GRATIS",
                    }); // Reset al login

                    if (!user.emailVerified) {
                        await signOut(auth);
                        get().setAuthData({ usuario: null });

                        Alert.alert(
                            "Acción necesaria",
                            "Es necesario verificar la dirección de correo electrónico",
                            [
                                {
                                    text: "Aceptar",
                                    onPress: () => {
                                        get().setIsLoading(false);
                                    },
                                },
                                {
                                    text: "Reenviar correo",
                                    onPress: async () => {
                                        try {
                                            await sendEmailVerification(user);
                                        } catch (error: any) {
                                            console.log(error.message);
                                        } finally {
                                            get().setIsLoading(false);
                                        }
                                    },
                                },
                            ],
                        );

                        return;
                    }

                    try {
                        const usuarioFirestore =
                            await databaseService.getUsuario(user.uid);

                        if (!usuarioFirestore) {
                            await databaseService.crearUsuario(
                                user.uid,
                                user.email ?? correo,
                            );
                            console.log(
                                "✅ Usuario creado en Firestore tras verificación:",
                                user.uid,
                            );
                        }

                        const aiUsage = await databaseService.getAIUsageDoc(
                            user.uid,
                        );
                        if (!aiUsage) {
                            await databaseService.crearAIUsageDoc(user.uid);
                            console.log(
                                "✅ Documento AI usage creado tras verificación:",
                                user.uid,
                            );
                        }
                    } catch (firestoreError: any) {
                        console.error(
                            "⚠️ Error sincronizando usuario verificado en Firestore:",
                            firestoreError,
                        );
                    }

                    get().setIsLoading(false);
                    // La navegación se maneja automáticamente en _layout.tsx
                } catch (error: any) {
                    const mensaje =
                        get().mensajeError[error.code] ||
                        "Error inesperado " + error.code;
                    Alert.alert("Error al iniciar sesión", mensaje, [
                        {
                            text: "Aceptar",
                            onPress: () => {
                                get().setIsLoading(false);
                            },
                        },
                    ]);
                }
            },

            cerrarSesion: async (router: Router) => {
                console.log("Cerrando sesión");
                const auth = getAuth();
                try {
                    // 1. Cerrar sesión de RevenueCat
                    try {
                        const { logOutRevenueCat } =
                            await import("@/services/revenueCat");
                        await logOutRevenueCat();
                    } catch (rcError) {
                        console.error(
                            "Error al cerrar sesión de RevenueCat:",
                            rcError,
                        );
                    }

                    // 2. Limpiar el store local
                    const { useStore } = await import("./useStore");
                    useStore.getState().limpiarStore();

                    // 2b. Resetear el AI store
                    const { useAIStore } = await import("./useAIStore");
                    useAIStore.getState().resetAI();

                    // 3. Resetear el estado de auth en Zustand
                    get().setAuthData({
                        usuario: null,
                        isPremium: false,
                        plan: "GRATIS",
                    });

                    // 4. Finalmente cerrar sesión en Firebase (esto dispara onAuthStateChanged)
                    await signOut(auth);

                    // 5. Navegar al login
                    router.replace("/(auth)/iniciar-sesion");
                } catch (error: any) {
                    console.log("Error al cerrar sesión:", error.code);
                }
            },
        }),
        {
            name: "sesion-storage",
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);
