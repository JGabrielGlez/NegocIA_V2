import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native"
import Login from "../../components/loginForm"

export default function iniciarSesion() {
    return (
        <SafeAreaView
            className="flex-1 justify-between items-center bg-slate-200">
            <View
                className="flex-1 justify-center items-center">
                <Text className="text-white font-extrabold text-9xl w-32 text-center bg-primaryPressed rounded-3xl shadow-around mb-6 mt-0">
                    N
                </Text>
                <Text className="mb-6 text-center font-normal text-gray-400 text-xl">
                    La inteligencia de tu negocio
                </Text>
            </View>
            {/* Esta es la tarjeta donde se pondrá lo de iniciar sesion */}
            
                <Login>
                    
            </Login> 
            
        </SafeAreaView>
    )
}