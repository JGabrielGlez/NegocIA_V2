// Esta será la cabecera para cada página, no la general, esta solo es para regresar, poner el nombre de la página y en la derecha, un boton que cambiará según la funcionalidad de todo, tendrá altura de 24

import Feather from "@expo/vector-icons/Feather";
import { ReactNode } from "react";
import { View, Text } from "react-native";
import { IconoPresionable } from "./iconoPresionable";

type props = {
    nombrePagina: string;
    children?: ReactNode;
};

export default function CabeceraNavegacion({ nombrePagina, children }: props) {
    return (
        <View className="h-24 w-full bg-white border-gray-200">
            <View className="flex-1 flex-row items-center ml-4 mr-4">
                <View className="flex-[2]">
                    <IconoPresionable onPress={() => {}}>
                    <Feather name="arrow-left" size={36} color="black" />
                </IconoPresionable>
                </View>

                <Text className=" flex-[4] ml-4 font-semibold text-2xl text-start">{nombrePagina}</Text>
                
                <View className="flex[1]">
                    {children}
                </View>
            </View>
        </View>
    );
}
