import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type props = {
    onPress: () => void,
    disabled?: boolean,
    texto: string,
    colorDeFondo?:boolean,
    Icono?:ReactNode
}

export function Boton({ onPress, disabled = false, texto, colorDeFondo=false, Icono=undefined }: props) {
    return (
        <Pressable
            className="w-full"
            onPress={onPress}
            disabled={disabled}>

            {({ pressed }) => (
                    <View 
                    className='rounded-3xl justify-center items-center h-16'
                    style={{
                        ...(colorDeFondo &&{
                            borderWidth:1,
                            borderColor:'#D1D5DB',
                        }),
                        backgroundColor: pressed ? (colorDeFondo?'#F3F4F6':'#15803D'): (colorDeFondo?'#fff': '#16A34A'),
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                    }}>
                   <View className="flex-1 flex-row justify-center items-center">
                     {Icono && (<View className="w-14 aspect-square ml-4"><Text>fasdfsdfgsdfg</Text></View>)}
                    <Text className={`text-lg flex-[4] font-semibold ${Icono?'text-left' : 'text-center'} ${!colorDeFondo ? 'text-white':'text-black'}`}>
                        {texto}
                    </Text>
                   </View>
                </View>
            )}
        </Pressable>
    )
}