import { ReactNode } from "react";
import { Text, View } from "react-native";
import { estilos } from "../constantes/estilos";

type props = {
    children: ReactNode;
    titulo: string;
    cuerpo: string;
    estadisticas?: string;
};

export default function TarjetaInfo({
    children,
    titulo,
    cuerpo,
    estadisticas,
}: props) {
    return (
        <View
            className="mb-2 mt-2 aspect-square h-1/4 rounded-3xl bg-white p-2"
            style={estilos.sombraNormal}>
            {/* Este es la cabecera del recuadro */}
            <View className="flex-2 m-2 h-1/3 flex-row">
                <View className="flex-1 flex-row">
                    <Text className="whitespace-wrap text-lg font-semibold text-red-800">
                        {titulo}
                    </Text>
                </View>
                <View className="aspect-square items-center justify-center rounded-full bg-primary/30">
                    {children}
                </View>
            </View>

            {/* Este será el cuerpo del recuadro */}
            <View className="m-2 flex-1">
                <Text className="text-center text-2xl font-bold">{cuerpo}</Text>
            </View>

            {/* Este será el pie del recuadro, que quedará pendiente */}
            {estadisticas !== undefined && (
                <View>
                    <Text className="text-center font-semibold text-red-700">
                        {estadisticas}
                    </Text>
                </View>
            )}
        </View>
    );
}
