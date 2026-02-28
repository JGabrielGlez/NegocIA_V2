import Buscador from "@/components/buscador";
import { Boton } from "@/components/Button";
import CabeceraNavegacion from "@/components/cabeceraNavegacion";
import CampoTexto from "@/components/campoTexto";
import TarjetaInfo from "@/components/tarjetaInfo";
import { estilos } from "@/constantes/estilos";
import { useStore } from "@/store/useStore";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// FIXME quitarle el safeAreaview y dejarle mejor un padding, que al ponerle elmonto, se cambia muy mal

// TODO  a la parte donde dice x productos, agregarle un modal o alguna ventana que me despliegue los productos seleccionados, ocupo pulir más el como se van a mostrar

// TODO si no hay productos registrados, no es posible crear nueva venta, mandar ese mensaje al usuario y redirigir a la de productos
export default function nuevaVenta() {
    // En este punto ya tengo todos los productos cargados en memoria, solo falta mostrarlos
    const productosDeStore = useStore((state) => state.productos);
    const storeGeneral = useStore((state) => state);
    const agregarVenta = useStore((state) => state.agregarVenta);
    const cantidadDeProductosStore = useStore((state) =>
        state.cantidadProductos(),
    );

    const valoresStore = (): void => {
        // Usamos JSON.stringify para que en la consola se vea el contenido
        // y no solo "[object Object]"
        console.log(
            "Este es el carrito:",
            JSON.stringify(storeGeneral.carrito, null, 2),
        );
        console.log(
            "Estas son las ventas:",
            JSON.stringify(storeGeneral.ventas, null, 2),
        );
    };

    const ventas = useStore((state) => state.ventas);

    useEffect(() => {
        console.log("El arreglo de ventas cambió:", ventas);
    }, [ventas]); // Se dispara cada vez que el arreglo 'ventas' se actualiza

    const vaciarCarritoStore = useStore((state) => state.vaciarCarrito);
    const totalAPagarStore = useStore((state) => state.obtenerTotalCarrito());
    const agregarAlCarrito = useStore((state) => state.agregarAlCarrito);
    const eliminarDelCarrito = useStore((state) => state.eliminarDelCarrito);
    const eliminarItemCompleto = useStore(
        (state) => state.eliminarItemCompleto,
    );
    const carrito = useStore((state) => state.carrito);

    // Estado para el modal del carrito
    const [modalCarritoVisible, setModalCarritoVisible] = useState(false);
    // Estado para el modal de confirmación de venta
    const [modalConfirmarVisible, setModalConfirmarVisible] = useState(false);

    // Función helper para obtener la cantidad de un producto en el carrito
    const obtenerCantidadEnCarrito = (idProducto: string): number => {
        const item = carrito.find((item) => item.producto.id === idProducto);
        return item ? item.cantidad : 0;
    };

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

    const keyboardVerticalOffset = Platform.OS === "ios" ? 80 : 0;
    const keyboardBehavior = Platform.OS === "ios" ? "padding" : undefined;
    const keyboardEnabled = Platform.OS === "ios";

    // Función para confirmar eliminación de item completo
    const confirmarEliminarItem = (
        idProducto: string,
        nombreProducto: string,
    ) => {
        Alert.alert(
            "Eliminar producto",
            `¿Eliminar "${nombreProducto}" del carrito?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => eliminarItemCompleto(idProducto),
                },
            ],
        );
    };

    //------------ Constantes para la venta-------------------

    // El método de cada boton de agregar debe hacer lo siguiente:
    // --Crear un ItemVenta (interface), si el producto no existe dentro de todos los itemsVenta, agregarlo, del contrario, aumentarle 1 a su cantidad; obviamente el subtotal es cantidad por precio del producto

    return (
        <SafeAreaView className="flex-1">
            <CabeceraNavegacion nombrePagina="Nueva Venta" />
            <Buscador filtrar={true} placeholder="Buscar producto" />
            <KeyboardAvoidingView
                behavior={keyboardBehavior}
                keyboardVerticalOffset={keyboardVerticalOffset}
                enabled={keyboardEnabled}
                style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
                    style={{ flex: 1 }}>
                    {/* Tengo que crear cada tarjeta, que recibirán un 
            titulo, icono y las estadisticas quedarán pendientes */}
                    <View className="flex-1 flex-row flex-wrap justify-evenly">
                        {productosDeStore.map((item) => {
                            const cantidadEnCarrito = obtenerCantidadEnCarrito(
                                item.id || "",
                            );

                            return (
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
                                        {/* Badge circular rojo en esquina superior derecha */}
                                        {cantidadEnCarrito > 0 && (
                                            <View
                                                className="absolute -right-1 -top-20 h-8 w-8 items-center justify-center rounded-full bg-red-500"
                                                style={estilos.sombraNormal}>
                                                <Text className="text-sm font-bold text-white">
                                                    {cantidadEnCarrito}
                                                </Text>
                                            </View>
                                        )}

                                        {/* Botones + y - */}
                                        <View className="absolute bottom-12 flex-row items-center gap-2">
                                            {/* Botón [-] - solo visible si hay items en carrito */}
                                            {cantidadEnCarrito > 0 && (
                                                <TouchableOpacity
                                                    className="h-10 w-10 items-center justify-center rounded-full bg-gray-500"
                                                    style={estilos.sombraNormal}
                                                    onPress={() => {
                                                        eliminarDelCarrito(
                                                            item.id || "",
                                                        );
                                                    }}>
                                                    <Minus
                                                        size={24}
                                                        color="white"
                                                    />
                                                </TouchableOpacity>
                                            )}

                                            {/* Botón [+] - siempre visible */}
                                            <TouchableOpacity
                                                className="h-10 w-10 items-center justify-center rounded-full bg-primary"
                                                style={estilos.sombraNormal}
                                                onPress={() => {
                                                    agregarAlCarrito(
                                                        item.id || "",
                                                    );
                                                }}>
                                                <Plus size={24} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    </TarjetaInfo>
                                </View>
                            );
                        })}
                    </View>

                    {/* Este será el recuadro para dar el cambio y poner el boton de completar la venta
                TODO más delante, agregar que a cada tarjeta, se vayan ordenando en seleccionadas y no seleccionadas, las que estén seleccionadas pasan a primeros lugares y en una esquina aparecerá un número indicando la cantidad de ese producto que se seleccionó; eso será lo único que pondré para no hacer otra ventana, aunque tengo que ver la forma de quitar un producto */}
                    {/* TODO  El precio estará en medio de los dos botones, el de menos aparecerá una vez presionado el de más, y cada producto se irá ordenando, cada que se detecte un click en un producto distinto, para evitar problemas de que se quieren agregar 3 del mismo producto y este se mueva de lugar */}

                    {/* Por ahora solo haré lo que es el diseño básico, de solo agregar */}
                </ScrollView>

                {/* Botón flotante para abrir modal de confirmación */}
                {carrito.length > 0 && (
                    <View className="bg-white p-4">
                        <Boton
                            onPress={() => setModalConfirmarVisible(true)}
                            texto={`Confirmar venta (${cantidadDeProductosStore} productos)`}
                        />
                    </View>
                )}
            </KeyboardAvoidingView>

            {/* Botón flotante de carrito */}
            {carrito.length > 0 && (
                <TouchableOpacity
                    className="absolute top-16 right-6 h-16 w-16 items-center justify-center rounded-full bg-primary"
                    style={estilos.sombraNormal}
                    onPress={() => setModalCarritoVisible(true)}>
                    <ShoppingCart size={28} color="white" />
                    {/* Badge con cantidad de items */}
                    <View className="absolute -right-2 -top-2 h-8 w-8 items-center justify-center rounded-full bg-red-500">
                        <Text className="text-sm font-bold text-white">
                            {cantidadDeProductosStore}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}

            {/* Modal del Carrito (Bottom Sheet) */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalCarritoVisible}
                onRequestClose={() => setModalCarritoVisible(false)}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="h-4/5 rounded-t-3xl bg-white">
                        {/* Header del Modal */}
                        <View className="flex-row items-center justify-between border-b border-gray-200 p-4">
                            <Text className="text-2xl font-bold">
                                Mi Carrito
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModalCarritoVisible(false)}>
                                <X size={28} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Contenido del Modal */}
                        {carrito.length === 0 ? (
                            // Estado vacío
                            <View className="flex-1 items-center justify-center px-6">
                                <ShoppingCart size={64} color="#ccc" />
                                <Text className="mt-4 text-center text-xl font-semibold text-gray-500">
                                    Tu carrito está vacío
                                </Text>
                                <Text className="mt-2 text-center text-base text-gray-400">
                                    Agrega productos para comenzar una venta
                                </Text>
                            </View>
                        ) : (
                            // Lista de items
                            <>
                                <FlatList
                                    data={carrito}
                                    keyExtractor={(item, index) =>
                                        `${item.producto.id}-${index}`
                                    }
                                    contentContainerStyle={{ padding: 16 }}
                                    ItemSeparatorComponent={() => (
                                        <View className="h-3" />
                                    )}
                                    renderItem={({ item }) => (
                                        <View
                                            className="flex-row items-center justify-between rounded-2xl bg-gray-50 p-4"
                                            style={estilos.sombraNormal}>
                                            {/* Info del producto */}
                                            <View className="flex-1">
                                                <Text className="text-lg font-semibold">
                                                    {item.producto.nombre}
                                                </Text>
                                                <Text className="text-base text-gray-600">
                                                    $
                                                    {item.producto.precio.toFixed(
                                                        2,
                                                    )}{" "}
                                                    x {item.cantidad}
                                                </Text>
                                            </View>

                                            {/* Subtotal y botón eliminar */}
                                            <View className="items-end">
                                                <Text className="mb-2 text-lg font-bold text-primary">
                                                    ${item.subtotal.toFixed(2)}
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        confirmarEliminarItem(
                                                            item.producto.id ||
                                                                "",
                                                            item.producto
                                                                .nombre,
                                                        )
                                                    }
                                                    className="rounded-lg bg-red-500 p-2">
                                                    <Trash2
                                                        size={20}
                                                        color="white"
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                />

                                {/* Footer con Total y Botón */}
                                <View className="border-t border-gray-200 p-4">
                                    <View className="mb-4 flex-row items-center justify-between">
                                        <Text className="text-xl font-semibold text-gray-700">
                                            Total:
                                        </Text>
                                        <Text className="text-2xl font-bold text-primary">
                                            ${totalAPagarStore.toFixed(2)}
                                        </Text>
                                    </View>
                                    <Boton
                                        onPress={() => {
                                            setModalCarritoVisible(false);
                                            // Scroll hacia abajo para ver el campo de monto
                                        }}
                                        texto="Completar Venta"
                                    />
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Modal de Confirmación de Venta */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalConfirmarVisible}
                onRequestClose={() => setModalConfirmarVisible(false)}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="rounded-t-3xl bg-white p-6">
                        {/* Header del Modal */}
                        <View className="mb-6 flex-row items-center justify-between">
                            <Text className="text-2xl font-bold">
                                Confirmar Venta
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModalConfirmarVisible(false)}>
                                <X size={28} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Contenido del Modal */}
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ flexGrow: 1 }}>
                            {/* Cantidad de productos */}
                            <View className="mb-4 flex-row justify-between">
                                <Text className="text-lg font-normal text-gray-600">
                                    Cantidad de productos:
                                </Text>
                                <Text className="text-lg font-semibold text-gray-900">
                                    {cantidadDeProductosStore}
                                </Text>
                            </View>

                            {/* Subtotal */}
                            <View className="mb-6 flex-row justify-between border-b border-gray-200 pb-4">
                                <Text className="text-lg font-normal text-gray-600">
                                    Subtotal:
                                </Text>
                                <Text className="text-lg font-semibold text-gray-900">
                                    ${totalAPagarStore.toFixed(2)}
                                </Text>
                            </View>

                            {/* Monto Recibido */}
                            <View className="mb-6">
                                <CampoTexto
                                    esNumero={true}
                                    etiqueta="Monto recibido"
                                    valueCampo={montoRecibido}
                                    onChangeText={(texto) =>
                                        setMontoRecibido(texto)
                                    }
                                    sugerencia=""
                                />
                            </View>

                            {/* Cambio */}
                            <View className="mb-8 flex-row justify-between rounded-lg bg-blue-50 p-4">
                                <Text className="text-lg font-semibold text-gray-700">
                                    Cambio:
                                </Text>
                                <Text
                                    className={`text-2xl font-bold ${
                                        cambioActualizado >= 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }`}>
                                    ${cambioActualizado.toFixed(2)}
                                </Text>
                            </View>
                        </ScrollView>

                        {/* Botones */}
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => {
                                    setModalConfirmarVisible(false);
                                    vaciarCarritoStore();
                                    setMontoRecibido("");
                                }}
                                className="flex-1 items-center justify-center rounded-lg border-2 border-gray-300 py-4">
                                <Text className="text-lg font-semibold text-gray-700">
                                    Cancelar
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    if (
                                        montoNumerico >= totalAPagarStore &&
                                        totalAPagarStore > 0
                                    ) {
                                        agregarVenta();
                                        vaciarCarritoStore();
                                        setMontoRecibido("");
                                        setModalConfirmarVisible(false);
                                        Alert.alert(
                                            "Éxito",
                                            "Venta registrada correctamente",
                                        );
                                    } else {
                                        Alert.alert(
                                            "Error",
                                            "El monto recibido debe ser mayor o igual al total a pagar",
                                        );
                                    }
                                }}
                                disabled={
                                    montoNumerico < totalAPagarStore ||
                                    totalAPagarStore === 0
                                }
                                className={`flex-1 items-center justify-center rounded-lg py-4 ${
                                    montoNumerico >= totalAPagarStore &&
                                    totalAPagarStore > 0
                                        ? "bg-primary"
                                        : "bg-gray-300"
                                }`}>
                                <Text className="text-lg font-semibold text-white">
                                    Confirmar Venta
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
