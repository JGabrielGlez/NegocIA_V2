// components/Divider.tsx
import { Text, View } from "react-native";

type DividerProps = {
    text?: string;
}

export default function Divisor({ text = "o" }: DividerProps) {
    return (
        <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-400 text-xl">{text}</Text>
            <View className="flex-1 h-px bg-gray-300" />
        </View>
    );
}