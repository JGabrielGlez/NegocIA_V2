import Buscador from "@/components/buscador";
import { Boton } from "@/components/Button";
import CabeceraNavegacion from "@/components/cabeceraNavegacion";
import CampoTexto from "@/components/campoTexto";
import ItemProducto from "@/components/itemProducto";
import BotonMasFlotante from "@/components/masFlotante";
import TooltipPortal from "@/components/TooltipPortal";
import { TooltipProvider } from "@/context/TooltipContext";
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
    const [modalEdicionVisible, setModalEdicionVisible] = useState(false);
    const [nombreProducto, setNombreProducto] = useState("");
    const [precioProducto, setPrecioProducto] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [productoEnEdicion, setProductoEnEdicion] = useState<Producto | null>(
        null,
    );
    const [nombreDuplicado, setNombreDuplicado] = useState(false);

    // Aquí va la logica de la store
    // Traer todos los productos de esta
    // Por defecto viene vacía
    const productosDeStore = useStore((state) => state.productos);
    const agregarProducto = useStore((state) => state.agregarProducto);
    const eliminarProducto = useStore((state) => state.eliminarProducto);
    const actualizarProducto = useStore((state) => state.actualizarProducto);
    const servicios = databaseService;
    // Esto es para insertar el id del usuario dentro de cada producto
    const usuario = useAuthStore((state) => state.usuario);
    const plan = useAuthStore((state) => state.plan);

    // Filtrar productos basándose en el texto de búsqueda
    const productosFiltrados = productosDeStore.filter((producto) =>
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase()),
    );

    // Función para verificar si un nombre es duplicado
    const verificarDuplicado = (nombre: string, idExcluir?: string) => {
        const nombreNormalizado = nombre.trim().toLowerCase();
        return productosDeStore.some(
            (producto) =>
                producto.nombre.toLowerCase() === nombreNormalizado &&
                (idExcluir ? producto.id !== idExcluir : true),
        );
    };

    // Función para normalizar espacios múltiples
    const normalizarEspacios = (texto: string) => {
        // Reemplaza múltiples espacios consecutivos con un solo espacio
        return texto.replace(/\s+/g, " ");
    };

    // Manejar cambio de nombre con validación de duplicado
    const manejarCambioNombre = (texto: string) => {
        const textoNormalizado = normalizarEspacios(texto).trim();
        setNombreProducto(textoNormalizado);
        if (textoNormalizado === "") {
            setNombreDuplicado(false);
        } else {
            // Al agregar: verificar contra todos
            // Al editar: verificar contra todos excepto el producto actual
            const esDuplicado = verificarDuplicado(
                textoNormalizado,
                productoEnEdicion?.id,
            );
            setNombreDuplicado(esDuplicado);
        }
    };

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

        if (nombreDuplicado) {
            alert("Este producto ya existe");
            return;
        }

        const precioProductoParsed = parseFloat(precioProducto);
        if (isNaN(precioProductoParsed)) {
            alert("El precio debe ser un número válido");
            return;
        }

        // Validar límite de 30 productos para plan GRATIS
        if (plan === "GRATIS" && productosDeStore.length >= 30) {
            alert(
                "Límite alcanzado ⚠️\n\nHas llegado al máximo de 30 productos en el plan gratuito.\n\nUpgradea a PRO para productos ilimitados.",
            );
            return;
        }

        // 2. Iniciamos el proceso con seguridad
        try {
            // Podrías poner un setIsLoading(true) aquí

            // Generar ID único para el producto (será usado tanto localmente como en Firestore)
            const productoId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const nuevoProducto: Producto = {
                id: productoId, // Incluir ID generado
                nombre: nombreProducto.trim(),
                precio: precioProductoParsed,
                usuarioId: usuario.uid,
            };

            // 3. Agregar el producto al store (que sincroniza automáticamente con Firestore)
            agregarProducto(nuevoProducto);

            // 4. Solo si todo lo anterior salió BIEN, limpiamos los campos
            setModalVisible(false);
            setPrecioProducto("");
            setNombreProducto("");
            setNombreDuplicado(false);
        } catch (error) {
            // Si el store falla, el código salta aquí y NO se limpian los campos
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

    const manejarAbrirEdicion = (producto: Producto) => {
        setProductoEnEdicion(producto);
        setNombreProducto(producto.nombre);
        setPrecioProducto(producto.precio.toString());
        setNombreDuplicado(false);
        setModalEdicionVisible(true);
    };

    const manejarGuardarEdicion = async () => {
        if (!productoEnEdicion?.id) {
            alert("Error: no se encontró el ID del producto");
            return;
        }

        if (nombreProducto.trim() === "" || precioProducto === "") {
            alert("Rellena todos los campos");
            return;
        }

        if (nombreDuplicado) {
            alert("Este producto ya existe");
            return;
        }

        const precioProductoParsed = parseFloat(precioProducto);
        if (isNaN(precioProductoParsed)) {
            alert("El precio debe ser un número válido");
            return;
        }

        try {
            actualizarProducto(productoEnEdicion.id, {
                nombre: nombreProducto.trim(),
                precio: precioProductoParsed,
            });

            setModalEdicionVisible(false);
            setProductoEnEdicion(null);
            setNombreProducto("");
            setPrecioProducto("");
            setNombreDuplicado(false);
        } catch (error) {
            console.error("Error al guardar edición:", error);
            alert("No se pudo guardar los cambios. Revisa tu conexión.");
        }
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
        <TooltipProvider>
            <SafeAreaView className="flex-1">
                <TooltipPortal />
                <CabeceraNavegacion nombrePagina="Productos" />
                <Buscador
                    filtrar={true}
                    placeholder="Buscar productos..."
                    onSearch={setBusqueda}
                />

                <ScrollView className="bg-white">
                    {productosFiltrados.map((item) => (
                        <ItemProducto
                            id={item.id!}
                            nombre={item.nombre}
                            precio={item.precio}
                            key={item.id}
                            funcionEditar={() => {
                                manejarAbrirEdicion(item);
                            }}
                            funcionEliminar={() => {
                                // Como siempre traigo productos validados, dice con el ! que nunca será undefined ese atributo; ts al ver que en la definición lo puse como opcional se da cuenta que puede ser undefined
                                manejarEliminarProducto(item.id!);
                            }}
                        />
                    ))}
                </ScrollView>

                <BotonMasFlotante
                    accion={() => setModalVisible(true)}
                    disabled={plan === "GRATIS" && productosDeStore.length >= 30}
                />

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

                                {/* Mostrar límite de productos para plan GRATIS */}
                                {plan === "GRATIS" && (
                                    <View
                                        className={`mb-4 rounded-lg px-4 py-3 ${
                                            productosDeStore.length >= 30
                                                ? "bg-red-50"
                                                : "bg-blue-50"
                                        }`}>
                                        <Text
                                            className={`text-sm font-semibold ${
                                                productosDeStore.length >= 30
                                                    ? "text-red-700"
                                                    : "text-blue-700"
                                            }`}>
                                            {productosDeStore.length}/30 productos
                                        </Text>
                                        {productosDeStore.length >= 30 && (
                                            <Text className="mt-1 text-xs text-red-600">
                                                Límite alcanzado. Upgradeá a PRO para productos
                                                ilimitados.
                                            </Text>
                                        )}
                                    </View>
                                )}

                                <View className="mb-8 gap-y-4">
                                    <View>
                                        <CampoTexto
                                            sugerencia="Ej. Coca Cola 2L"
                                            etiqueta="Nombre del producto"
                                            valueCampo={nombreProducto}
                                            onChangeText={manejarCambioNombre}
                                        />
                                        <View className="h-6">
                                            {nombreDuplicado && (
                                                <Text className="pl-2 text-sm font-semibold text-red-500">
                                                    Este producto ya existe
                                                </Text>
                                            )}
                                        </View>
                                    </View>
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
                                            onPress={() => {
                                                setModalVisible(false);
                                                setNombreProducto("");
                                                setPrecioProducto("");
                                                setNombreDuplicado(false);
                                            }}
                                            texto="Cancelar"
                                            colorDeFondo={true}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Boton
                                            onPress={manejarGuardado}
                                            texto="Guardar"
                                            disabled={
                                                plan === "GRATIS" &&
                                                productosDeStore.length >= 30
                                            }
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                {/* Modal de Edición */}
                <Modal
                    visible={modalEdicionVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setModalEdicionVisible(false)}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        className="flex-1">
                        <View className="flex-1 justify-end bg-black/40">
                            <View className="rounded-t-3xl bg-white p-6 shadow-xl">
                                <View className="mb-6 h-1.5 w-12 self-center rounded-full bg-gray-300" />

                                <Text className="mb-6 text-2xl font-bold text-gray-800">
                                    Editar Producto
                                </Text>

                                <View className="mb-8 gap-y-4">
                                    <View>
                                        <CampoTexto
                                            sugerencia="Ej. Coca Cola 2L"
                                            etiqueta="Nombre del producto"
                                            valueCampo={nombreProducto}
                                            onChangeText={manejarCambioNombre}
                                        />
                                        <View className="h-6">
                                            {nombreDuplicado && (
                                                <Text className="pl-2 text-sm font-semibold text-red-500">
                                                    Este producto ya existe
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                    <CampoTexto
                                        prefijo="$"
                                        sugerencia="0.00"
                                        esNumero={true}
                                        etiqueta="Precio"
                                        valueCampo={precioProducto}
                                        onChangeText={manejarPrecio}
                                    />
                                </View>

                                <View className="flex-row gap-x-3">
                                    <View className="flex-1">
                                        <Boton
                                            onPress={() => {
                                                setModalEdicionVisible(false);
                                                setProductoEnEdicion(null);
                                                setNombreProducto("");
                                                setPrecioProducto("");
                                                setNombreDuplicado(false);
                                            }}
                                            texto="Cancelar"
                                            colorDeFondo={true}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Boton
                                            onPress={manejarGuardarEdicion}
                                            texto="Guardar"
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </SafeAreaView>
        </TooltipProvider>
    );
}
