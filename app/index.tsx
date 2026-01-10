import { Boton } from "@/components/Button";
import { useRouter } from "expo-router";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Index() {
    const router = useRouter();
    const redireccionar = (): void => {
        router.replace("/(auth)/iniciar-sesion");
    };

    return (
        <SafeAreaView className="flex-1 items-center justify-center p-4">
            <View className="flex-1 items-center justify-center">
                <Text className="mb-6 mt-0 w-32 rounded-3xl bg-primaryPressed text-center text-9xl font-extrabold text-white">
                    N
                </Text>
                <Text className="mb-6 whitespace-pre text-center text-6xl font-extrabold">
                    Habla,{"\n"}
                    Vende, Crece
                </Text>
                <Text className="mb-6 whitespace-pre text-center text-xl font-normal text-gray-400">
                    Configura tu punto de venta en minutos.{"\n"}
                    La IA lo hace por ti, tú solo vendes.
                </Text>
                <View
                    style={{ height: 280 }}
                    className="mb-6 items-center justify-center overflow-hidden">
                    <Image
                        source={require("../assets/images/presentacion.png")}
                        className="items-center justify-center"
                        resizeMode="contain"
                    />
                </View>
            </View>
            <Boton onPress={redireccionar} texto="Empezar" />
        </SafeAreaView>
    );
   
}
