import Feather from "@expo/vector-icons/Feather";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { IconoPresionable } from "./iconoPresionable";

type props = {
    placeholder?: string;
    filtrar?: boolean;
    onSearch?: (texto: string) => void;
};

export default function Buscador({
    placeholder,
    filtrar = false,
    onSearch,
}: props) {
    const [textoBusqueda, setTextoBusqueda] = useState("");

    const IconoLupa = () => {
        return (
            <View>
                <Fontisto name="zoom" size={24} color="gray" />
            </View>
        );
    };

    const IconoFiltro = () => {
        return (
            <View>
                <Feather name="filter" size={24} color="gray" />
            </View>
        );
    };

    const manejarCambioTexto = (texto: string) => {
        setTextoBusqueda(texto);
        if (onSearch) {
            onSearch(texto);
        }
    };

    const limpiarBusqueda = () => {
        setTextoBusqueda("");
        if (onSearch) {
            onSearch("");
        }
    };

    return (
        <View className="h-24 w-full flex-row items-center justify-center border-b-2 border-t-2 border-gray-200 bg-white pl-4 pr-4">
            <View className="ml-4 flex-row items-start justify-center rounded-3xl border-2 border-gray-400 bg-white pl-2">
                <View className="m-auto">
                    <IconoLupa />
                </View>
                <View className="ml-2 mr-4 w-3/4">
                    <TextInput
                        placeholder={placeholder}
                        value={textoBusqueda}
                        onChangeText={manejarCambioTexto}
                    />
                </View>
            </View>

            {filtrar && (
                <View className="ml-4 mr-4">
                    <IconoPresionable onPress={limpiarBusqueda}>
                        <IconoFiltro />
                    </IconoPresionable>
                </View>
            )}
        </View>
    );
}
