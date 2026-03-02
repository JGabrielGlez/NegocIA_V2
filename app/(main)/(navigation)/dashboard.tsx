import { Boton } from "@/components/Button";
import Cabecera from "@/components/cabecera";
import TarjetaInfo from "@/components/tarjetaInfo";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Iconos a usar Feather: message-... download user
// EvilIcons gear

export default function dashboard() {
    const router = useRouter();

    const Icono = () => {
        return (
            <View>
                <Feather name="dollar-sign" size={25} color="black" />
            </View>
        );
    };

    // Funcion por asignar
    const nuevaVentaBoton = () => {
        router.push("/(main)/(navigation)/(ventas)/nueva-venta");
    };

    const irAsistenteIA = () => {
        router.push("/(features)/asistente-ia");
    };

    return (
        <SafeAreaView className="flex-1">
            <Cabecera />
            <Pressable
                className="mx-4 mt-4 rounded-3xl bg-emerald-600 px-4 py-4"
                onPress={irAsistenteIA}
            >
                {({ pressed }) => (
                    <View
                        style={{
                            transform: [{ scale: pressed ? 0.98 : 1 }],
                        }}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1 mr-3">
                                <Text className="text-white text-lg font-semibold">
                                    Asistente IA
                                </Text>
                                <Text className="text-white/80 text-sm mt-1">
                                    Preguntale a tu negocio en segundos
                                </Text>
                            </View>
                            <View className="h-12 w-12 items-center justify-center rounded-full bg-white/20">
                                <Feather name="message-circle" size={26} color="white" />
                            </View>
                        </View>
                    </View>
                )}
            </Pressable>
            {/* Tengo que crear cada tarjeta, que recibirán un 
            titulo, icono y las estadisticas quedarán pendientes */}
            <View className="flex-1 flex-row flex-wrap justify-evenly">
                <TarjetaInfo
                    titulo="Ventas del día"
                    cuerpo="$23423.00"
                    estadisticas="12% más que ayer">
                    {<Icono />}
                </TarjetaInfo>

                <TarjetaInfo
                    titulo="Ventas del día"
                    cuerpo="$23423.00"
                    estadisticas="12% más que ayer">
                    {<Icono />}
                </TarjetaInfo>

                <TarjetaInfo
                    titulo="Ventas del día"
                    cuerpo="$23423.00"
                    estadisticas="12% más que ayer">
                    {<Icono />}
                </TarjetaInfo>

                <TarjetaInfo titulo="Ventas del día" cuerpo="$23423.00">
                    {<Icono />}
                </TarjetaInfo>

                <TarjetaInfo titulo="Ventas del día" cuerpo="$23423.00">
                    {<Icono />}
                </TarjetaInfo>

                <TarjetaInfo titulo="Ventas del día" cuerpo="$23423.00">
                    {<Icono />}
                </TarjetaInfo>
            </View>

            {/* Serán los botones de crear venta */}
            <View className="ml-4 mr-4 gap-3">
                <Boton onPress={nuevaVentaBoton} texto="Nueva Venta" />
            </View>
        </SafeAreaView>
    );
}
