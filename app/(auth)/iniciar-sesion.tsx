import { Link, useRouter } from "expo-router";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Boton } from "../../components/Button";
import Divisor from "../../components/divisor";
import Login from "../../components/loginForm";

export default function iniciarSesion() {
    const router = useRouter();

    const onPress = (): void => {
        router.replace("/dashboard");
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
                        <Login>
                            <Link
                                className="mb-8 text-right text-blue-700"
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
                        </Login>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
