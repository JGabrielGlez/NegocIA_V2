import Feather from "@expo/vector-icons/Feather";
import Octicons from "@expo/vector-icons/Octicons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function Cabecera() {
    const iconSize: number = 24;
    const onPress = (): void => {};

    const MessageIcon = ({ onPress }: { onPress: () => void }) => {
        const [isPressed, setIsPressed] = useState(false);

        return (
            <Pressable
                onPress={onPress}
                onPressIn={() => setIsPressed(true)}
                onPressOut={() => setIsPressed(false)}>
                <View
                    style={{
                        overflow: "hidden",
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: isPressed ? "#dbdbdb" : "transparent",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                    <Feather
                        name="message-square"
                        size={iconSize}
                        color="black"
                    />
                </View>
            </Pressable>
        );
    };

    const UserIcon = ({ onPress }: { onPress: () => void }) => {
        const [isPressed, setIsPressed] = useState(false);

        return (
            <Pressable
                onPress={onPress}
                onPressIn={() => setIsPressed(true)}
                onPressOut={() => setIsPressed(false)}>
                <View
                    style={{
                        overflow: "hidden",
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: isPressed ? "#dbdbdb" : "transparent",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                    <Feather name="user" size={iconSize} color="black" />
                </View>
            </Pressable>
        );
    };

    const SettingsIcon = ({ onPress }: { onPress: () => void }) => {
        const [isPressed, setIsPressed] = useState(false);

        return (
            <Pressable
                onPress={onPress}
                onPressIn={() => setIsPressed(true)}
                onPressOut={() => setIsPressed(false)}>
                <View
                    style={{
                        overflow: "hidden",
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: isPressed ? "#dbdbdb" : "transparent",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                    <Octicons name="gear" size={iconSize} color="black" />
                </View>
            </Pressable>
        );
    };

    const ProductsIcon = ({ onPress }: { onPress: () => void }) => {
        const [isPressed, setIsPressed] = useState(false);

        return (
            <Pressable
                className="rounded-full"
                onPress={onPress}
                onPressIn={() => setIsPressed(true)}
                onPressOut={() => setIsPressed(false)}>
                <View
                    style={{
                        overflow: "hidden",
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: isPressed ? "#dbdbdb" : "transparent",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                    <Feather name="box" size={iconSize} color="black" />
                </View>
            </Pressable>
        );
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
                <UserIcon onPress={onPress} />
                <MessageIcon onPress={onPress} />
                <ProductsIcon onPress={onPress} />
                <SettingsIcon onPress={onPress} />
            </View>
        </View>
    );
}
