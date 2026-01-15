import Buscador from "@/components/buscador";
import { Boton } from "@/components/Button";
import CabeceraNavegacion from "@/components/cabeceraNavegacion";
import CampoTexto from "@/components/campoTexto";
import TarjetaInfo from "@/components/tarjetaInfo";
import { estilos } from "@/constantes/estilos";
import { useStore } from "@/store/useStore";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// TODO  a la parte donde dice x productos, agregarle un modal o alguna ventana que me despliegue los productos seleccionados, ocupo pulir más el como se van a mostrar

export default function nuevaVenta() {
    // En este punto ya tengo todos los productos cargados en memoria, solo falta mostrarlos
    const productosDeStore = useStore((state) => state.productos);
    const cantidadDeProductosStore = useStore((state) =>
        state.cantidadProductos(),
    );

    const [cambio, setCambio] = useState(0);

    const vaciarCarritoStore = useStore((state) => state.vaciarCarrito);
    const totalAPagarStore = useStore((state) => state.obtenerTotalCarrito());
    const agregarAlCarrito = useStore((state) => state.agregarAlCarrito);
    const carrito = useStore((state) => state.carrito);

    const [montoRecibido, setMontoRecibido] = useState("");

    // FIXME Al presionar el campo de texto, deja un padding feo por debajo, de que no regresa a su estado original
    const limpiarPrecio = (texto: string) => {
        // 1. Solo permitir números y un punto

        let limpio = texto.replace(/[^0-9.]/g, "");

        // 2. Controlar que no existan múltiples puntos

        const partes = limpio.split(".");

        if (partes.length > 2) {
            limpio = partes[0] + "." + partes.slice(1).join("");
        }

        // 3. Limitar a máximo dos decimales si existe un punto

        if (limpio.includes(".")) {
            const [entero, decimal] = limpio.split(".");

            // .slice(0, 2) corta cualquier número extra después del segundo decimal

            limpio = `${entero}.${decimal.slice(0, 2)}`;
        }

        return limpio;
    };

    const montoNumerico = parseFloat(limpiarPrecio(montoRecibido)) || 0;
    const cambioActualizado = montoNumerico - totalAPagarStore;
    //------------ Constantes para la venta-------------------

    // El método de cada boton de agregar debe hacer lo siguiente:
    // --Crear un ItemVenta (interface), si el producto no existe dentro de todos los itemsVenta, agregarlo, del contrario, aumentarle 1 a su cantidad; obviamente el subtotal es cantidad por precio del producto

    return (
        <SafeAreaView className="flex-1">
            <CabeceraNavegacion nombrePagina="Nueva Venta" />
            <Buscador filtrar={true} placeholder="Buscar producto" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
                    style={{ flex: 1 }}>
                    {/* Tengo que crear cada tarjeta, que recibirán un 
            titulo, icono y las estadisticas quedarán pendientes */}
                    <View className="flex-1 flex-row flex-wrap justify-evenly">
                        {productosDeStore.map((item) => (
                            <View
                                key={"Venta-" + item.id}
                                style={{
                                    width: "45%",
                                    height: 120,
                                    marginBottom: 10,
                                }}>
                                <TarjetaInfo
                                    adaptable={true}
                                    key={item.id}
                                    esVenta={true}
                                    titulo={item.nombre}
                                    cuerpo={"$" + item.precio.toString()}>
                                    {
                                        // TODO boton o algo para cancelar la venta por completo, creo que podría dividir la botonera para hacer eso
                                        <TouchableOpacity
                                            className="absolute bottom-12 h-14 w-14 items-center justify-center rounded-full bg-primary"
                                            style={estilos.sombraNormal}
                                            onPress={() => {
                                                // En este debo agregar lo de agregar prod al carrito
                                                {
                                                    agregarAlCarrito(item.id);
                                                }
                                            }}>
                                            <Plus size={28} color="white" />
                                        </TouchableOpacity>
                                    }
                                </TarjetaInfo>
                            </View>
                        ))}
                    </View>

                    {/* Este será el recuadro para dar el cambio y poner el boton de completar la venta
                TODO más delante, agregar que a cada tarjeta, se vayan ordenando en seleccionadas y no seleccionadas, las que estén seleccionadas pasan a primeros lugares y en una esquina aparecerá un número indicando la cantidad de ese producto que se seleccionó; eso será lo único que pondré para no hacer otra ventana, aunque tengo que ver la forma de quitar un producto */}
                    {/* TODO  El precio estará en medio de los dos botones, el de menos aparecerá una vez presionado el de más, y cada producto se irá ordenando, cada que se detecte un click en un producto distinto, para evitar problemas de que se quieren agregar 3 del mismo producto y este se mueva de lugar */}

                    {/* Por ahora solo haré lo que es el diseño básico, de solo agregar */}
                </ScrollView>

                <View className="flex-1 justify-between bg-white pl-4 pr-4 pt-4">
                    <Text className="pl-2 text-base font-normal text-gray-600">
                        {" "}
                        {cantidadDeProductosStore} productos
                    </Text>
                    <View className="flex-row justify-between">
                        <Text className="pl-2 text-lg font-normal text-gray-600">
                            Subtotal:
                        </Text>
                        <Text className="pl-2 text-lg font-normal text-gray-600">
                            ${totalAPagarStore.toFixed(2)}
                        </Text>
                    </View>
                    <CampoTexto
                        esNumero={true}
                        etiqueta="Monto recibido"
                        valueCampo={montoRecibido}
                        // Ese método debe de hacer la resta, si es menor, poner en color rojo, del contrario en verde
                        onChangeText={(texto) => setMontoRecibido(texto)}
                        sugerencia=""
                    />
                    <View className="flex-row justify-between">
                        <Text className="pl-2 text-lg font-normal text-gray-600">
                            Cambio:
                        </Text>
                        <Text className="pl-2 text-lg font-extrabold text-primary">
                            {cambioActualizado.toFixed(2)}
                        </Text>
                    </View>
                    <View className="flex-row flex-wrap justify-between">
                        <View style={{ width: "30%" }}>
                            {/* TODO   cambiar el boton de cancelar para que tenga otro color, en caso de verlo necesario.*/}
                            <Boton
                                onPress={() => {
                                    vaciarCarritoStore();
                                    setMontoRecibido("");
                                }}
                                texto="Cancelar"
                                colorDeFondo={true}
                            />
                        </View>
                        <View style={{ width: "65%" }}>
                            <Boton onPress={() => {}} texto="Confirmar venta" />
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
