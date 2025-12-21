import { Link } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Boton } from "../../components/Button";
import Login from "../../components/loginForm";


export default function iniciarSesion() {

    const onPress = () => {

    }

    return (
        <SafeAreaView
            className="flex-1 items-center bg-slate-200">
            <View
                className="flex-1 justify-center items-center">
                <Text className="text-white font-extrabold text-9xl w-32 text-center bg-primaryPressed rounded-3xl shadow-around mb-6 mt-0">
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
           
            </Login>
            
             
        </SafeAreaView>
    )
}