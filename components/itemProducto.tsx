// Este componente será cada item individual que se estará mostrando en la pantalla de productos
// Los elementos que debe de tener será un ícono a la izquierda, su nombre y su precio, y hasta la derecha botones para editar y eliminar
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { View, Text } from "react-native";

type props = {
    nombre: string;
    precio: number;
};

export default function ItemProducto({ nombre, precio }: props) {
    const IconoCaja = () => {
        return (
            <View className="justify-center rounded-xl p-3 bg-gray-300">
                <Feather name="box" size={40} color="gray" />
            </View>
        );
    };

    const IconoEditar = () => {
        return (
            <View  className="rounded-xl w-full h-full justify-center items-center">
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
            <View className="rounded-xl w-full h-full justify-center items-center">
                <Ionicons name="trash-outline" size={26} color="gray" />
            </View>
        );
    };

    return (
        <View className="flex-1 flex-row h-8 border-t-2 border-gray-200 ml-4 mr-4">
            {/* Esta va a ser la de la caja */}
            <View className="flex-[2] items-center overflow-hidden ">
                <View className="m-auto items-center justify-center">
                    <IconoCaja/>
                </View>
            </View>

            {/* Esta va a ser la de los textos */}
            <View className="flex-[6]  justify-center ml-2">
                <Text numberOfLines={1} className="font-black text-xl mb-2 text-wrap">Cocona bien helada</Text>
                <Text numberOfLines={1} className="text-primary font-black text-base">$34.33</Text>
            </View>

            {/* Esta va a ser la de los iconos */}
            <View className="flex-[3]  flex-row items-center">
                <View className="flex-1  aspect-square m-auto items-center justify-center">
                    <IconoEditar/>
                </View>
                <View className="flex-1  aspect-square">
                    <IconoBorrar/>
                </View>
            </View>
        </View>
    );
}
