import { Link } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Boton } from "../../components/Button";
import Divisor from "../../components/divisor";
import Login from "../../components/loginForm";



export default function iniciarSesion() {

    const onPress = () => {

    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View className="w-full flex-1 items-center">
                        <View
                            className="flex-1 justify-center items-center">
                            <Text className="text-white font-extrabold text-9xl w-32 text-center bg-primaryPressed rounded-3xl shad justow-around mb-6 mt-0">
                                N
                            </Text>
                            <Text className="text-center font-normal text-gray-400 text-xl mb-4">
                                La inteligencia de tu negocio
                            </Text>
                        </View>
                        <Login>
                            <Link
                                className="text-blue-700 text-right mb-8"
                                href={"/"}>¿Olvidaste tu contraseña?</Link>
                            <Boton
                                onPress={onPress}
                                texto="Iniciar Sesión" />
                            <Divisor/>
                            <Boton onPress={onPress} colorDeFondo={true} texto="Continuar con Google"/>
                        </Login>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}