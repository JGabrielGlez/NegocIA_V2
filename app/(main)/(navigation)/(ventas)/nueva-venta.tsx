import Buscador from "@/components/buscador";
import CabeceraNavegacion from "@/components/cabeceraNavegacion";
import TarjetaInfo from "@/components/tarjetaInfo";
import { estilos } from "@/constantes/estilos";
import { useStore } from "@/store/useStore";
import { Plus } from "lucide-react-native";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// TODO  a la parte donde dice x productos, agregarle un modal o alguna ventana que me despliegue los productos seleccionados, ocupo pulir más el como se van a mostrar

export default function nuevaVenta() {
    // En este punto ya tengo todos los productos cargados en memoria, solo falta mostrarlos
    const productosDeStore = useStore((state) => state.productos);

    return (
        <SafeAreaView className="flex-1">
            <CabeceraNavegacion nombrePagina="Nueva Venta" />
            <Buscador filtrar={true} placeholder="Buscar producto" />

            <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingBottom:80 }}
                style={{ flex: 1 }}>
                {/* Tengo que crear cada tarjeta, que recibirán un 
            titulo, icono y las estadisticas quedarán pendientes */}
                <View className="flex-1 flex-row flex-wrap justify-evenly">
                    {productosDeStore.map((item) => (
                        <View style={{ width: "40%", aspectRatio:1 }}>
                            <TarjetaInfo
                                adaptable={true}
                                key={item.id}
                                esVenta={true}
                                titulo={item.nombre}
                                cuerpo={"$" + item.precio.toString()}>
                                {
                                    <TouchableOpacity
                                        className="h-16 w-16 items-center justify-center rounded-full bg-primary"
                                        style={estilos.sombraNormal}
                                        onPress={() => {
                                            // En este debo agregar lo de agregar prod al carrito
                                        }}>
                                        <Plus size={28} color="white" />
                                    </TouchableOpacity>
                                }
                            </TarjetaInfo>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
