import Buscador from "@/components/buscador";
import { Boton } from "@/components/Button";
import CabeceraNavegacion from "@/components/cabeceraNavegacion";
import CampoTexto from "@/components/campoTexto";
import ItemProducto from "@/components/itemProducto";
import BotonMasFlotante from "@/components/masFlotante";
import { useStore } from "@/store/useStore";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// TODO En las categorías poner x cantidad de íconos, agregando una librería de iconos para que puedan configurar sus iconos, o bueno, hacer que la IA al momento de crear las categorías, decida qué icono poner en base a su nombre.

// También agregar el modal productos, para agregarlos
export default function productos() {
    // Estos son para los campos de texto visuales
    const [modalVisible, setModalVisible] = useState(false);
    const [nombreProducto, setNombreProducto] = useState("");
    const [precioProducto, setPrecioProducto] = useState("");

    // Aquí va la logica de la store
    // Traer todos los productos de esta
    // Por defecto viene vacía
    const productosDeStore = useStore((state) => state.productos);
    const agregarProducto = useStore((state) => state.agregarProducto);
    const eliminarProducto = useStore((state) => state.eliminarProducto);

    // Método para el botón de guardar
    const manejarGuardado = () => {
        if (nombreProducto.trim() === "" || precioProducto === "") {
            alert("Rellena todos los campos");
            return;
        }

        // Si pasa ese ciclo significa que está todo correcto
        // Guardamos en zustand
        agregarProducto(nombreProducto, precioProducto);

        // Ahora lo que se debe de hacer es vaciar todos los campos y posteriormente, renderizar el componente con los datos del elemento creado.
        setPrecioProducto("");
        setNombreProducto("");
    };

    const manejarEliminarProducto = (id: string) => {
        eliminarProducto(id);
    };

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

    const manejarPrecio = (texto: string) => {
        const valorValidado = limpiarPrecio(texto);
        setPrecioProducto(valorValidado); // Faltaba actualizar el estado
    };

    return (
        <SafeAreaView className="flex-1">
            <CabeceraNavegacion nombrePagina="Productos" />
            <Buscador filtrar={true} placeholder="Buscar productos..." />

            <ScrollView className="bg-white">
                {productosDeStore.map((item) => (
                    <ItemProducto
                        nombre={item.nombre}
                        precio={item.precio}
                        key={item.id}
                    />
                ))}
            </ScrollView>

            <BotonMasFlotante accion={() => setModalVisible(true)} />

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}>
                {/* 1. KeyboardAvoidingView debe envolver el contenido interactivo */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1">
                    {/* 2. Contenedor que detecta clics fuera (opcional) y oscurece el fondo */}
                    <View className="flex-1 justify-end bg-black/40">
                        {/* 3. La Tarjeta Blanca */}
                        <View className="rounded-t-3xl bg-white p-6 shadow-xl">
                            {/* Indicador visual de que es un "drawer" */}
                            <View className="mb-6 h-1.5 w-12 self-center rounded-full bg-gray-300" />

                            <Text className="mb-6 text-2xl font-bold text-gray-800">
                                Agregar Producto
                            </Text>

                            <View className="mb-8 gap-y-4">
                                <CampoTexto
                                    sugerencia="Ej. Coca Cola 2L"
                                    etiqueta="Nombre del producto"
                                    valueCampo={nombreProducto}
                                    onChangeText={setNombreProducto}
                                />
                                <CampoTexto
                                    prefijo="$"
                                    sugerencia="0.00"
                                    esNumero={true}
                                    etiqueta="Precio"
                                    valueCampo={precioProducto}
                                    onChangeText={manejarPrecio} // Usamos la función de limpieza
                                />
                            </View>

                            {/* Botonera */}
                            <View className="flex-row gap-x-3">
                                <View className="flex-1">
                                    <Boton
                                        onPress={() => setModalVisible(false)}
                                        texto="Cancelar"
                                        colorDeFondo={true}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Boton
                                        onPress={manejarGuardado}
                                        texto="Guardar"
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}
