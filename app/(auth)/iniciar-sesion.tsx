import { Link } from "expo-router";
import { KeyboardAvoidingView, Text, View, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Boton } from "../../components/Button";
import Login from "../../components/loginForm";
import CampoTexto from "../../components/campoTexto";



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
                            <Text className="text-center font-normal text-gray-400 text-xl">
                                La inteligencia de tu negocio
                            </Text>
                        </View>
                        {/* Esta es la tarjeta donde se pondrá lo de iniciar sesion */}
                        <Login>
                            <Link
                                className="text-blue-700"
                                href={"/"}>¿Olvidaste tu contraseña?</Link>
                            <Boton
                                onPress={onPress}
                                texto="Iniciar Sesión" />
                            <CampoTexto
                                sugerencia="******"
                                etiqueta="Contraseña"

                                esContrasena={true} />

                        </Login>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}