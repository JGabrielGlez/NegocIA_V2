// components/Divider.tsx
import { Text, View } from "react-native";

type DividerProps = {
    text?: string;
};

export default function Divisor({ text = "o" }: DividerProps) {
    return (
        <View className="my-4 flex-row items-center">
            <View className="h-px flex-1 bg-gray-300" />
            <Text className="mx-4 text-xl text-gray-400">{text}</Text>
            <View className="h-px flex-1 bg-gray-300" />
        </View>
    );
}
