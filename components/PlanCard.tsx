import { Check } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface PlanCardProps {
    title: string;
    price?: string;
    features: string[];
    isCurrent: boolean;
    onPress?: () => void;
    isLoading?: boolean;
}

export default function PlanCard({
    title,
    price,
    features,
    isCurrent,
    onPress,
    isLoading = false,
}: PlanCardProps) {
    return (
        <View
            className={`flex-1 rounded-2xl border-2 p-6 ${
                isCurrent
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-white"
            }`}>
            {/* Título */}
            <Text className="text-xl font-bold text-gray-900">{title}</Text>

            {/* Precio */}
            {price && (
                <View className="my-3">
                    <Text className="text-3xl font-bold text-gray-900">
                        {price}
                    </Text>
                    <Text className="text-sm text-gray-500">/mes</Text>
                </View>
            )}

            {/* Badge "PLAN ACTUAL" */}
            {isCurrent && (
                <View className="mb-4 inline-flex rounded-full bg-green-100 px-3 py-1">
                    <Text className="text-xs font-semibold text-green-800">
                        PLAN ACTUAL
                    </Text>
                </View>
            )}

            {/* Features */}
            <View className="mb-6 flex-1">
                {features.map((feature, index) => (
                    <View key={index} className="mb-3 flex-row items-center">
                        <Check size={20} className="mr-3 text-green-600" />
                        <Text className="flex-1 text-sm text-gray-700">
                            {feature}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Botón */}
            <Pressable
                disabled={isCurrent || isLoading}
                onPress={onPress}
                className={`rounded-lg py-3 ${
                    isCurrent
                        ? "bg-gray-200"
                        : isLoading
                          ? "bg-blue-300"
                          : "bg-blue-600"
                }`}>
                <Text
                    className={`text-center font-semibold ${
                        isCurrent
                            ? "text-gray-600"
                            : isLoading
                              ? "text-blue-900"
                              : "text-white"
                    }`}>
                    {isCurrent
                        ? "Plan Actual"
                        : isLoading
                          ? "Procesando..."
                          : "Actualizar a PRO"}
                </Text>
            </Pressable>
        </View>
    );
}
