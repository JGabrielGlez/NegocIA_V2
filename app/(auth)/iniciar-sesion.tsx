import { Boton } from "@/components/Button";
import Divisor from "@/components/divisor";
import Login from "@/components/loginForm";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    View,
} from "react-native";

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

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

    const onPress = (): void => {
        const auth = getAuth();

        signInWithEmailAndPassword(auth, correo, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                user.reload();
                // ...
                // FIXME esto es una forma de que algún atacante adivine qué correos están registrados, por lo que debo pensar si dejar este mensaje o no.
                if (!user.emailVerified) {
                    Alert.alert(
                        "Acción necesaria",
                        "Es necesario verificar la dirección de correo electrónico",
                        [
                            {
                                text: "Aceptar",
                            },
                        ],
                    );
                    return;
                }
                console.log(user);
                router.replace("/dashboard");
            })
            .catch((error: any) => {
                let mensaje = mensajeError[error.code];
                console.log(error.code);

                if (correo === "" || password === "")
                    mensaje = "Rellenar todos los campos";

                Alert.alert("Error al inciar sesión", mensaje, [
                    {
                        text: "Aceptar",
                    },
                ]);
            });
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

                        <Boton onPress={onPress} texto="Iniciar Sesión" />
                        <Divisor />
                        <Boton
                            onPress={onPress}
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
