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
                    "No hay conexión a internet. Verifica tu red e intenta de nuevo.",
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
                    const userCredential = await signInWithEmailAndPassword(
                        auth,
                        correo,
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
                    get().setIsLoading(false);
                    // Si pasa hasta aquí es porque está todo bien
                    router.replace("/dashboard");
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
                const auth = getAuth();
                try {
                    await signOut(auth); //cierra sesión en el servidor
                    get().setAuthData({
                        usuario: null,
                        isPremium: false,
                        plan: "GRATIS",
                    }); //cierra sesión localmente y resetea
                    router.replace("/(auth)/iniciar-sesion");
                } catch (error: any) {
                    console.log(error.code);
                }
            },
        }),
        {
            name: "sesion-storage",
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);
