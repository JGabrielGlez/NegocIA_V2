import { Boton } from "@/components/Button";
import Divisor from "@/components/divisor";
import Login from "@/components/loginForm";
import { Link, useRouter } from "expo-router";
import {
    getAuth,
    sendEmailVerification,
    signInWithEmailAndPassword,
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

export default function iniciarSesion() {
    const router = useRouter();
    const mensajeError: Record<string, string> = {
        "auth/too-many-requests":
            "Se ha bloqueado la cuenta temporalmente por inicios de sesión fallidos, intente más tarde",
        "auth/invalid-email": "El correo no es válido.",
        "auth/invalid-credential": "Correo o contraseña inválidos",
    };

    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const funcionBoton = async (): Promise<void> => {
        if (isLoading) return;

        setIsLoading(true);

        // Validación antes de llamar a Firebase
        if (correo === "" || password === "") {
            Alert.alert("Error", "Por favor, rellena todos los campos.", [
                {
                    text: "Aceptar",
                    onPress: () => {
                        setIsLoading(false);
                    },
                },
            ]);

            return;
        }
        // Una vez pasa, significa que hay algo escrito en ambos lados
        // por lo que se prosigue a usar la auth y a bloquear el estado del boton
        const auth = getAuth();
        setIsLoading(true);

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

            if (!user.emailVerified) {
                Alert.alert(
                    "Acción necesaria",
                    "Es necesario verificar la dirección de correo electrónico",
                    [
                        { text: "Aceptar" },
                        {
                            text: "Reenviar correo",
                            onPress: () => sendEmailVerification(user),
                        },
                    ],
                );
                setIsLoading(false);
                return;
            }
            setIsLoading(false);
            // Si pasa hasta aquí es porque está todo bien
            router.replace("/dashboard");
        } catch (error: any) {
            const mensaje =
                mensajeError[error.code] || "Error inesperado " + error.code;
            Alert.alert("Error al iniciar sesión", mensaje, [
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
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1, paddingTop: 20, paddingBottom: 20 }}>
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
                        setCorreo={setCorreo}
                        setPassword={setPassword}>
                        <Link
                            className="mb-4 text-right text-blue-700"
                            href={"/"}>
                            ¿Olvidaste tu contraseña?
                        </Link>

                        <Boton
                            onPress={funcionBoton}
                            texto="Iniciar Sesión"
                            disabled={isLoading}
                        />
                        <Divisor />
                        <Boton
                            onPress={() => {
                                // TODO autenticación conn Google
                            }}
                            colorDeFondo={true}
                            texto="Continuar con Google"
                        />
                        <Link
                            className="text-right text-blue-700"
                            href={"/(auth)/crear-cuenta"}>
                            Crear cuenta
                        </Link>
                    </Login>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
