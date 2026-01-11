import Feather from "@expo/vector-icons/Feather";
import Octicons from "@expo/vector-icons/Octicons";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { IconoPresionable } from "./iconoPresionable";

export default function Cabecera() {
    const iconSize: number = 24;

    const onPress = (): void => {};
    const onPressProductos = (): void => {
        // Esto me tiene que redirigir a la página de productos
        router.push("/(main)/(navigation)/(ventas)/productos");
    };

    return (
        <View className="h-24 w-full flex-row items-center border-b-2 border-gray-200 bg-white px-4">
            <View className="flex-1 flex-row items-center">
                <View className="aspect-square h-16 items-center justify-center rounded-2xl bg-primaryPressed">
                    <Text className="text-3xl font-semibold text-white">N</Text>
                </View>
                <View className="ml-3">
                    <Text className="text-lg font-semibold">NegocIA</Text>
                    <Text className="text-base">Tienda 1</Text>
                </View>
            </View>

            <View className="flex-1 flex-row items-center justify-end">
                <IconoPresionable onPress={onPress}>
                    <Feather name="user" size={iconSize} color="black" />
                </IconoPresionable>

                <IconoPresionable onPress={onPress}>
                    <Feather
                        name="message-square"
                        size={iconSize}
                        color="black"   
                    />
                </IconoPresionable>

                <IconoPresionable onPress={onPressProductos}>
                    <Feather name="box" size={iconSize} color="black" />
                </IconoPresionable>

                <IconoPresionable onPress={onPress}>
                    <Octicons name="gear" size={iconSize} color="black" />
                </IconoPresionable>
            </View>
        </View>
    );
}
