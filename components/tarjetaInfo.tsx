import { ReactNode } from "react";
import { Text, View } from "react-native";
import { estilos } from "../constantes/estilos";

type props = {
    children: ReactNode;
    titulo: string;
    cuerpo: string;
    estadisticas?: string;
    esVenta?: boolean;
    adaptable?:boolean;
};

export default function TarjetaInfo({
    children,
    titulo,
    cuerpo,
    estadisticas,
    esVenta = false,
    adaptable=false,
}: props) {
    return (
        <View
            className="mb-2 mt-2 h-1/4  rounded-3xl bg-white p-2"
            
            // Si adaptable es falso, poner un height de 1/4, delc otnratio de un 100%
            style={[estilos.sombraNormal,!adaptable && {aspectRatio:1}, adaptable && {width:'100%',height:'100%'}]}>
           {/* Este es la cabecera del recuadro */}
<View style={esVenta && ({height:'50%'})} className="flex-row  items-start m-2 ">
    <View className="flex-1 mr-2 "> 
        <Text 
            numberOfLines={2} 
            ellipsizeMode="tail"
            className="text-lg font-semibold  text-red-800 leading-6"
        >
            {titulo}
        </Text>
    </View>
    
    {!esVenta && (
        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/30">
            {children}
        </View>
    )}
</View>

            {/* Este será el cuerpo del recuadro */}
            <View className="m-2 flex-1 flex-row ">
                <Text className="flex-1  text-center text-xl font-bold">
                    {cuerpo}
                </Text>
                {esVenta && (
                    <View className="aspect-square flex-1 items-center justify-center rounded-full">
                        {children}
                    </View>
                )}
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
