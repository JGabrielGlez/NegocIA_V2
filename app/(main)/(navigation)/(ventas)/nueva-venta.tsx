import Buscador from "@/components/buscador";
import CabeceraNavegacion from "@/components/cabeceraNavegacion";
import TarjetaInfo from "@/components/tarjetaInfo";
import { estilos } from "@/constantes/estilos";
import { useStore } from "@/store/useStore";
import { Plus } from "lucide-react-native";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// TODO  a la parte donde dice x productos, agregarle un modal o alguna ventana que me despliegue los productos seleccionados, ocupo pulir más el como se van a mostrar

export default function nuevaVenta() {
    // En este punto ya tengo todos los productos cargados en memoria, solo falta mostrarlos
    const productosDeStore = useStore((state) => state.productos);

    return (
        <SafeAreaView className="flex-1">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}>
                <CabeceraNavegacion nombrePagina="Nueva Venta" />
                <Buscador placeholder="Buscar producto..." filtrar={true} />
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View className="flex-row flex-wrap justify-evenly">
                        {productosDeStore.map((item) => (
                            <TarjetaInfo
                                esVenta={true}
                                titulo={item.nombre}
                                cuerpo={"$" + item.precio.toString()}>
                                {
                                    <TouchableOpacity
                                        className="h-16 w-16 items-center justify-center rounded-full bg-primary"
                                        style={estilos.sombraNormal}
                                        // Este debe de abrir la ventana modal para añadir los productos
                                        onPress={() => {
                                            // En este debo agregar lo de nueva venta
                                        }}>
                                        <Plus size={28} color="white" />
                                    </TouchableOpacity>
                                }
                            </TarjetaInfo>
                        ))}
                    </View>
                    {/* En esta parte debo de poner la parte del cambio de la venta, lo que guarda los datos de la propia venta en */}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
