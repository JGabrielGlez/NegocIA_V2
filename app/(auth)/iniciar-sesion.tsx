import { Boton } from "@/components/Button";
import Divisor from "@/components/divisor";
import Login from "@/components/loginForm";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    View,
} from "react-native";

export default function iniciarSesion() {
    const router = useRouter();

    const onPress = (): void => {
        router.replace("/dashboard");
    };

    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");

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
