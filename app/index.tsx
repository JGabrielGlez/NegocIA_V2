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
    <SafeAreaView className="flex-1 justify-center items-center">
      <View className="flex-1 justify-center items-center">
        <Text className="text-white font-extrabold text-9xl w-32 text-center bg-primaryPressed rounded-3xl shadow-around mb-6 mt-0">
          N
        </Text>
        <Text className="mb-6 whitespace-pre text-center font-extrabold text-6xl">
          Habla,{"\n"}
          Vende, Crece
        </Text>
        <Text className="mb-6 whitespace-pre text-center font-normal text-gray-400 text-xl">
          Configura tu punto de venta en minutos.{"\n"}
          La IA lo hace por ti, tú solo vendes.
        </Text>
        <View
          style={{ height: 280 }}
          className="overflow-hidden justify-center items-center mb-6">
          <Image
            source={require('../assets/images/presentacion.png')}
            className="justify-center items-center"
            resizeMode="contain"
          />
        </View>
        <Boton onPress={redireccionar} texto="Empezar" />
      </View>
    </SafeAreaView>
  );
}