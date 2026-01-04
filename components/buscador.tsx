import { View, TextInput, Pressable } from "react-native";
import Fontisto from "@expo/vector-icons/Fontisto";
import Feather from "@expo/vector-icons/Feather";

type props = {
    placeholder?: string;
    filtrar?: boolean;
};

export default function Buscador({ placeholder, filtrar = false }: props) {
    const IconoLupa = () => {
        return (
            <View>
                <Fontisto name="zoom" size={28} color="gray" />
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
        <View className="h-0 flex-1 flex-row items-center justify-center border-b-2 border-t-2 border-gray-200 bg-white pl-4 pr-4">
            <View className="m-0 flex-[6] flex-row items-start justify-center rounded-3xl border-2 border-gray-400 bg-white pl-2">
                <View className="m-auto flex-1">
                    <IconoLupa />
                </View>
                <View className="flex-[4] items-start justify-center">
                    <TextInput placeholder={placeholder}></TextInput>
                </View>
            </View>
            {/* TODO agregar el método para lo que es lo que hace al presionar, de momento quedará únicamente como adorno.*/}
            
            {filtrar && (
                <Pressable className="ml-4 h-1/2 flex-[1] items-center justify-center">
                    <View className="flex-1 justify-center">
                        <IconoFiltro />
                    </View>
                </Pressable>
            )}
        </View>
    );
}
