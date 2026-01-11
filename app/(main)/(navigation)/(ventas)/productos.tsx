import Buscador from "@/components/buscador";
import CabeceraNavegacion from "@/components/cabeceraNavegacion";
import CampoTexto from "@/components/campoTexto";
import ItemProducto from "@/components/itemProducto";
import BotonMasFlotante from "@/components/masFlotante";
import { useState } from "react";
import { Modal, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// TODO En las categorías poner x cantidad de íconos, agregando una librería de iconos para que puedan configurar sus iconos, o bueno, hacer que la IA al momento de crear las categorías, decida qué icono poner en base a su nombre.

// También agregar el modal productos, para agregarlos
export default function productos() {
    // Esto es para controlar lo que es el estado de la ventana modal
    const [modalVisible, setModalVisible] = useState(true);
    const [nombreProducto, setNombreProducto] = useState("");
    const [precioProducto, setprecioProducto] = useState("");

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

    return (
        <SafeAreaView className="flex-1">
            <CabeceraNavegacion nombrePagina="Productos" />
            <Buscador filtrar={true} placeholder="Buscar productos..." />

            <ScrollView className="bg-white">
                <ItemProducto nombre="Coca bien fría" precio={23} />
                <ItemProducto nombre="Coca bien fría" precio={23} />
                <ItemProducto nombre="Coca bien fría" precio={23} />
                <ItemProducto nombre="Coca bien fría" precio={23} />
                <ItemProducto nombre="Coca bien fría" precio={23} />
                <ItemProducto nombre="Coca bien fría" precio={23} />
                <ItemProducto nombre="Coca bien fría" precio={2323} />
            </ScrollView>

            <BotonMasFlotante
                accion={() => {
                    setModalVisible(true);
                }}
            />

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => {
                    setModalVisible(false);
                }}>
                {/* Aquí va todo lo que es el diseño de la ventana modal */}
                <View className="h-full w-full flex-1 flex-col justify-end bg-black/30">
                    {/* Este es para todos los inputs */}
                    <View className="h-1/2 justify-between rounded-2xl bg-white p-4">
                        <Text className="font-bold text-2xl p-4">Agregar Producto</Text>
                        <CampoTexto
                            sugerencia="Ej. Coca Cola 2L"
                            etiqueta="Nombre del producto"
                            valueCampo={nombreProducto}
                        />
                        <CampoTexto
                            sugerencia="0.00"
                            esNumero={true}
                            etiqueta="Precio"
                            valueCampo={precioProducto}
                            onChangeText={() => {
                                limpiarPrecio;
                            }}
                        />
                    </View>
                    {/* Este es para la botonera */}
                    <View></View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
