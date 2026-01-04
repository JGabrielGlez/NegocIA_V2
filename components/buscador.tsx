import { View, TextInput } from "react-native";
import Fontisto from '@expo/vector-icons/Fontisto';

type props = {
    placeholder?: string;
    filtrar?: boolean;
};

export default function Buscador({ placeholder, filtrar = false }: props) {
    const Icono = ()=>{ 
    return(
    <View>
        <Fontisto name="zoom" size={28} color="gray" />
    </View>)
    };


    return (
    <View className="bg-white absolute flex-1 border-4 border-gray-400 rounded-lg w-3/4 pl-2 h-12 flex-row">
        <View className="m-auto flex-1"><Icono/></View>
        <View className="flex-4">
            <TextInput placeholder='asdfasf'></TextInput>
        </View>
    </View>
    )
    
}
