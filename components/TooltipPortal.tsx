import { useTooltip } from "@/context/TooltipContext";
import { useEffect, useRef } from "react";
import { Animated, Text, View, useWindowDimensions } from "react-native";

export default function TooltipPortal() {
    const { tooltip, ocultarTooltip } = useTooltip();
    const opacidad = useRef(new Animated.Value(0)).current;
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { width } = useWindowDimensions();

    useEffect(() => {
        if (tooltip.visibleProductoId) {
            Animated.timing(opacidad, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            // Auto-ocultar después de 2.5 segundos
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                Animated.timing(opacidad, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => ocultarTooltip());
            }, 2500);
        } else {
            Animated.timing(opacidad, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        }
    }, [tooltip.visibleProductoId]);

    if (!tooltip.visibleProductoId) {
        return null;
    }

    return (
        <Animated.View
            style={{
                opacity: opacidad,
                position: "absolute",
                top: 180,
                left: width / 2 - 90, // Centrado (asumiendo 150px de ancho = 75px de cada lado)
                width: 180,
                zIndex: 999,
                pointerEvents: "none",
            }}
            pointerEvents="none">
            <View className="rounded-lg bg-gray-600 px-3 py-2 shadow-lg">
                <Text className="text-center text-xs font-semibold text-white">
                    {tooltip.nombre}
                </Text>
            </View>
        </Animated.View>
    );
}
