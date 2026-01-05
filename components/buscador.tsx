import Feather from "@expo/vector-icons/Feather";
import Fontisto from "@expo/vector-icons/Fontisto";
import { TextInput, View } from "react-native";
import { IconoPresionable } from "./iconoPresionable";

type props = {
    placeholder?: string;
    filtrar?: boolean;
};

export default function Buscador({ placeholder, filtrar = false }: props) {
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

    return (
        <View className="h-24 w-full flex-row items-center justify-center border-b-2 border-t-2 border-gray-200 bg-white pl-4 pr-4 ">
            <View className="flex-row items-start justify-center rounded-3xl border-2 border-gray-400 bg-white pl-2 ml-4">
                <View className="m-auto">
                    <IconoLupa />
                </View>
                <View className="ml-2 mr-4 w-3/4">
                    <TextInput  placeholder={placeholder}></TextInput>
                </View>
            </View>
            {/* TODO agregar el método para lo que es lo que hace al presionar, de momento quedará únicamente como adorno.*/}

            {filtrar && (
                <View className="ml-4 mr-4">
                    <IconoPresionable onPress={() => {}}>
                        <IconoFiltro />
                    </IconoPresionable>
                </View>
            )}
        </View>
    );
}
