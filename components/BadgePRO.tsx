import { useAuthStore } from "@/store/useAuthStore";
import { Text, View } from "react-native";

/**
 * Badge visual que muestra "PRO" solo si el usuario tiene plan PRO
 */
export default function BadgePRO() {
    const plan = useAuthStore((state) => state.plan);

    // Si no es PRO, no renderizar nada
    if (plan !== "PRO") {
        return null;
    }

    return (
        <View className="ml-2 rounded-full bg-yellow-400 px-3 py-1">
            <Text className="text-xs font-bold text-gray-900">PRO</Text>
        </View>
    );
}
