import { Boton } from "@/components/Button";
import Login from "@/components/loginForm";
import { useRootNavigationState, useRouter } from "expo-router";
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signOut,
} from "firebase/auth";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../firebase/firebaseConfig.js";

// FIXME quitar todos los espacios tanto al inicio como al final de lo que es el correo, para evitar confusiones con los usuarios, ya que al pegar un correo, se le agrega un espacio al final, cosa que la app marca como correo inválido

export default function crearCuenta() {
    const mensajeError: Record<string, string> = {
        "auth/invalid-email": "El correo no es válido.",
        "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
        "auth/email-already-in-use": "Este correo ya está registrado.",
        "auth/too-many-requests":
            "Se ha bloqueado la cuenta temporalmente por actividad sospechosa, intente más tarde",
        "auth/user-not-found": "Esta cuenta no existe",
        "auth/network-request-failed":
            "No se pudo conectar con el servidor. Verifica tu internet, que el emulador/backend esté activo, e intenta de nuevo.",
        "auth/timeout":
            "La solicitud tardó demasiado. Revisa tu conexión e intenta nuevamente.",
        "auth/internal-error":
            "Ocurrió un error interno de autenticación. Intenta nuevamente en unos minutos.",
        "auth/app-deleted":
            "La app de autenticación no está configurada correctamente en este dispositivo.",
        "auth/operation-not-allowed":
            "El registro con correo/contraseña no está habilitado en Firebase.",
        "auth/missing-email": "Debes ingresar un correo electrónico.",
        "auth/missing-password": "Debes ingresar una contraseña.",
        "auth/invalid-api-key":
            "La configuración de Firebase no es válida (API Key).",
        "auth/unauthorized-domain":
            "Este dominio no está autorizado para autenticación.",
    };

    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const rootNavigationState = useRootNavigationState();

    const manejarSetCorreo = (texto: string) => {
        setCorreo(texto.trim());
        console.log(correo);
        console.log(password);
    };

    function cuentaRegistradaExitosamente() {
        Alert.alert(
            "Ya casi eres parte de NegocIA",
            "Revisa tu bandeja de entrada del correo (posiblemente caiga en la bandeja de SPAM) que ingresaste para verificar tu cuenta.",
            [
                {
                    text: "Aceptar",
                    onPress: () => {
                        setIsLoading(false);
                        // Guard: solo navegar si la navegación raíz está lista
                        if (rootNavigationState?.key) {
                            router.replace("/(auth)/iniciar-sesion");
                        }
                    },
                },
            ],
            { cancelable: false },
        );
    }

    const signUp = async (email: string, password: string) => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email.trim(),
                password,
            );

            const user = userCredential.user;
            //obtengo el usuario para enviarle el correo, como antes estaba vacío, no envíaba correo pq no habia a dónde enviarlo
            await sendEmailVerification(user);

            await signOut(auth);

            // Redirigir a lo que es el inicio de sesión
            cuentaRegistradaExitosamente();
        } catch (error: any) {
            let errorCapturado = error.code;
            let mensaje = "";
            if (correo === "" || password === "")
                mensaje = "Rellenar todos los campos";
            else {
                mensaje =
                    mensajeError[errorCapturado] ||
                    "Error desconocido " + errorCapturado;
            }

            Alert.alert("Atención", mensaje, [
                {
                    text: "Aceptar",
                    onPress: () => {
                        setIsLoading(false);
                    },
                },
            ]);
        }
    };

    return (
        // TODO quitaré el crear cuenta y más delante lo haré mediante una cuenta de google, añadiendo también lo que es mediante cuenta de icloud o gameCenter; por lo que debo omitir el manejo de errores ya que es trabajo extra que no debo de hacer si implementaré eso.
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View className="w-full flex-1 items-center">
                        <View className="flex-1 items-center justify-center">
                            <Text className="shad justow-around mb-6 mt-0 w-32 rounded-3xl bg-primaryPressed text-center text-9xl font-extrabold text-white">
                                N
                            </Text>
                            <Text className="mb-4 text-center text-xl font-normal text-gray-400">
                                La inteligencia de tu negocio
                            </Text>
                        </View>
                        <Login
                            correo={correo}
                            password={password}
                            setCorreo={manejarSetCorreo}
                            setPassword={setPassword}
                            crearCuenta={true}>
                            <Boton
                                disabled={isLoading}
                                isLoading={isLoading}
                                onPress={() => {
                                    signUp(correo, password);
                                }}
                                texto="Crear cuenta"
                            />
                        </Login>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
