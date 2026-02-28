import Buscador from "@/components/buscador";
import { Boton } from "@/components/Button";
import CabeceraNavegacion from "@/components/cabeceraNavegacion";
import CampoTexto from "@/components/campoTexto";
import ItemProducto from "@/components/itemProducto";
import BotonMasFlotante from "@/components/masFlotante";
import { databaseService } from "@/firebase/databaseService";
import { Producto } from "@/store/types";
import { useAuthStore } from "@/store/useAuthStore";
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
    const [busqueda, setBusqueda] = useState("");

    // Aquí va la logica de la store
    // Traer todos los productos de esta
    // Por defecto viene vacía
    const productosDeStore = useStore((state) => state.productos);
    const agregarProducto = useStore((state) => state.agregarProducto);
    const eliminarProducto = useStore((state) => state.eliminarProducto);
    const servicios = databaseService;
    // Esto es para insertar el id del usuario dentro de cada producto
    const usuario = useAuthStore((state) => state.usuario);

    // Filtrar productos basándose en el texto de búsqueda
    const productosFiltrados = productosDeStore.filter((producto) =>
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase()),
    );

    // Método para el botón de guardar
    const manejarGuardado = async () => {
        // 1. Validaciones iniciales
        if (!usuario) {
            alert("Sesión no válida");
            return;
        }

        if (nombreProducto.trim() === "" || precioProducto === "") {
            alert("Rellena todos los campos");
            return;
        }

        const precioProductoParsed = parseFloat(precioProducto);
        if (isNaN(precioProductoParsed)) {
            alert("El precio debe ser un número válido");
            return;
        }

        // 2. Iniciamos el proceso con seguridad
        try {
            // Podrías poner un setIsLoading(true) aquí

            const nuevoProducto: Producto = {
                nombre: nombreProducto.trim(),
                precio: precioProductoParsed,
                usuarioId: usuario.uid,
            };

            // 3. Llamada al servicio (AQUÍ se obtiene el ID)
            // en esta parte se agrega a firestore
            const idGenerado = await servicios.addProducto(nuevoProducto);

            // 4. Guardamos en Zustand
            // TIP: Es mejor pasar el ID generado para que tu ScrollView tenga su KEY única
            agregarProducto({
                ...nuevoProducto, // Trae nombre, precio y uid
                id: idGenerado, // Le agregamos el ID de Firebase
            });

            // 5. Solo si todo lo anterior salió BIEN, limpiamos los campos
            setPrecioProducto("");
            setNombreProducto("");
        } catch (error) {
            // Si Firebase falla, el código salta aquí y NO se limpian los campos
            // permitiendo al usuario intentar de nuevo sin borrar lo que escribió.
            console.error("Error al guardar:", error);
            alert("No se pudo guardar el producto. Revisa tu conexión.");
        } finally {
            // Podrías poner un setIsLoading(false) aquí
        }
    };

    const manejarEliminarProducto = async (id: string) => {
        try {
            // Debo eliminar de firestore

            eliminarProducto(id);
        } catch (error: any) {}
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
            <Buscador
                filtrar={true}
                placeholder="Buscar productos..."
                onSearch={setBusqueda}
            />

            <ScrollView className="bg-white">
                {productosFiltrados.map((item) => (
                    <ItemProducto
                        nombre={item.nombre}
                        precio={item.precio}
                        key={item.id}
                        funcionEliminar={() => {
                            // Como siempre traigo productos validados, dice con el ! que nunca será undefined ese atributo; ts al ver que en la definición lo puse como opcional se da cuenta que puede ser undefined
                            manejarEliminarProducto(item.id!);
                        }}
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
