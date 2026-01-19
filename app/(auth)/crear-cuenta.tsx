import { Boton } from "@/components/Button";
import Login from "@/components/loginForm";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
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

export default function crearCuenta() {
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");

    const manejarSetCorreo = (texto: string) => {
        setCorreo(texto);
        console.log(correo);
        console.log(password);
    };

    const router = useRouter();

    function cuentaRegistradaExitosamente() {
        Alert.alert(
            "Ya eres parte de NegocIA",
            "Tu cuenta se ha creado exitosamente",
            [
                {
                    text: "Continuar",
                    onPress: () => {
                        router.replace("/(auth)/iniciar-sesion");
                    },
                },
            ],
            { cancelable: false }, //evita evitar que al tocar fuera se cierre
        );
    }

    const signUp = async (email: string, password: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password,
            );
            const user = userCredential.user;
            console.log("Usuario registrado:", user);

            // Redirigir a lo que es el inicio de sesión
            cuentaRegistradaExitosamente();
        } catch (error: any) {
            const errorMessage = error.message;
            console.error("Error al registrarse:", errorMessage);
            // Maneja los errores, por ejemplo, mostrando un mensaje al usuario
        }
    };

    return (
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
                                onPress={() => {
                                    // Debe mandar toda la información de los botones que están dentro de login para mandarlos al método que manda los datos a Firebase

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
