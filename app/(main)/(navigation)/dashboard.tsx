import { Boton } from "@/components/Button";
import Cabecera from "@/components/cabecera";
import TarjetaInfo from "@/components/tarjetaInfo";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { View } from "react-native";
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

    return (
        <SafeAreaView className="flex-1">
            <Cabecera />
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
            <View className="ml-4 mr-4">
                <Boton onPress={nuevaVentaBoton} texto="Nueva Venta" />
            </View>
        </SafeAreaView>
    );
}
