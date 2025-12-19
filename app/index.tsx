import { Boton } from "@/components/Button";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const redireccionar = (): void => {
    // Lo que hace es redireccionar a la de inicar sesion
  };
  return (


    // Esta será la ventana de presentación, por lo que el botón solo deberá reemplazar lo que es la pantalla por la de iniciar sesión/crear cuenta.
    <SafeAreaView
      className="flex-1 justify-center items-center">
      <View
        className="flex-1 justify-center items-center">
        {/* Esta X la reemplazaré por le logo, de momento será solo la n como tal */}
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
          style={{height:280}}
          className="border-8 overflow-hidden justify-center items-center">
          <Image
            source={require('../assets/images/presentacion.png')}
            className="justify-center items-center"
            resizeMode="stretch"
          />
        </View>
        <Boton onPress={redireccionar} texto="Empezar">
          
        </Boton>

      </View>
    </SafeAreaView>
  );
}
