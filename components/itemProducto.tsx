// Este componente será cada item individual que se estará mostrando en la pantalla de productos
// Los elementos que debe de tener será un ícono a la izquierda, su nombre y su precio, y hasta la derecha botones para editar y eliminar
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { IconoPresionable } from "./iconoPresionable";

type props = {
    id: string;
    nombre: string;
    precio: number;
    tooltipVisible: boolean;
    onTooltipToggle: (id: string) => void;
    funcionEditar?: () => void;
    funcionEliminar?: () => void;
};

export default function ItemProducto({
    id,
    nombre,
    precio,
    tooltipVisible,
    onTooltipToggle,
    funcionEditar,
    funcionEliminar,
}: props) {
    const opacidadTooltip = useRef(new Animated.Value(0)).current;
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Animar cuando cambia tooltipVisible
    useEffect(() => {
        if (tooltipVisible) {
            Animated.timing(opacidadTooltip, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            // Auto-ocultar después de 2.5 segundos
            timeoutRef.current = setTimeout(() => {
                onTooltipToggle("");
            }, 2500);
        } else {
            Animated.timing(opacidadTooltip, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        }
    }, [tooltipVisible]);
    const IconoCaja = () => {
        return (
            <View className="justify-center rounded-xl bg-gray-300 p-3">
                <Feather name="box" size={40} color="gray" />
            </View>
        );
    };

    const IconoEditar = () => {
        return (
            <View className="h-full w-full items-center justify-center rounded-xl">
                <MaterialCommunityIcons
                    name="pencil-outline"
                    size={26}
                    color="gray"
                />
            </View>
        );
    };

    const IconoBorrar = () => {
        return (
            <View className="h-full w-full items-center justify-center rounded-xl">
                <Ionicons name="trash-outline" size={26} color="gray" />
            </View>
        );
    };

    const mostrarTooltip_func = () => {
        onTooltipToggle(id);
    };

    // Limpiar timeout cuando el componente se desmonta
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <View className="h-24 w-full">
            <View className="ml-4 mr-4 h-8 flex-1 flex-row border-t-2 border-gray-200">
                {/* Esta va a ser la de la caja */}
                <View className="flex-[2] items-center overflow-hidden">
                    <View className="m-auto items-center justify-center">
                        <IconoCaja />
                    </View>
                </View>

                {/* Esta va a ser la de los textos */}
                <Pressable
                    onPress={mostrarTooltip_func}
                    className="ml-2 flex-[6] justify-center">
                    <Text
                        numberOfLines={1}
                        className="mb-2 text-wrap text-xl font-black">
                        {nombre}
                    </Text>
                    <Text
                        numberOfLines={1}
                        className="text-base font-black text-primary">
                        ${precio}
                    </Text>

                    {/* Tooltip */}
                    {tooltipVisible && (
                        <Animated.View
                            style={{ opacity: opacidadTooltip }}
                            className="absolute bottom-24 left-0 right-0 mx-2 rounded-lg bg-gray-600 px-3 py-2 shadow-lg">
                            <Text className="text-center text-xs font-semibold text-white">
                                {nombre}
                            </Text>
                        </Animated.View>
                    )}
                </Pressable>

                {/* Esta va a ser la de los iconos */}
                <View className="flex-[3] flex-row items-center">
                    <View className="m-auto aspect-square flex-1 items-center justify-center">
                        <IconoPresionable
                            onPress={() => {
                                // Esto quiero decir que se ejecute la función si existe, no me funcionaba antes porque no puse los paréntesis, que hacen que la función se ejecute
                                funcionEditar?.();
                            }}>
                            <IconoEditar />
                        </IconoPresionable>
                    </View>
                    <View className="aspect-square flex-1">
                        <IconoPresionable
                            onPress={() => {
                                funcionEliminar?.();
                            }}>
                            <IconoBorrar />
                        </IconoPresionable>
                    </View>
                </View>
            </View>
        </View>
    );
}
