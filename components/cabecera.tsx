import Feather from "@expo/vector-icons/Feather";
import Octicons from "@expo/vector-icons/Octicons";
import { Pressable, Text, View } from "react-native";

export default function Cabecera() {
    const iconSize: number = 24;

    const MessageIcon = () => {
        return (
            <Pressable>
                <Feather name="message-square" size={iconSize} color="black" />
            </Pressable>
        );
    };

    const UserIcon = () => {
        return (
            <Pressable>
                <Feather name="user" size={iconSize} color="black" />
            </Pressable>
        );
    };

    const SettingsIcon = () => {
        return (
            <Pressable>
                <Octicons name="gear" size={iconSize} color="black" />
            </Pressable>
        );
    };
    return (
        <View className="h-24 w-full flex-row items-center border-b-2 border-gray-200 bg-white px-4">
            {/* Lado Izquierdo: Logo y Texto */}
            <View className="flex-1 flex-row items-center">
                {/* Quitamos flex-1 de aquí para que el cuadrado mande sobre su tamaño */}
                <View className="aspect-square h-16 items-center justify-center rounded-2xl bg-primaryPressed">
                    <Text className="text-3xl font-semibold text-white">N</Text>
                </View>

                <View className="ml-3">
                    <Text className="text-lg font-semibold">NegocIA</Text>
                    <Text className="text-base">Tienda 1</Text>
                </View>
            </View>

            {/* Lado Derecho: Espacio para iconos o perfil */}
            <View className="flex-1 flex-row items-center justify-end gap-3">
                {/* Aquí puedes poner un icono o botón de perfil */}
                <UserIcon />
                <MessageIcon />
                <SettingsIcon />
            </View>
        </View>
    );
}
