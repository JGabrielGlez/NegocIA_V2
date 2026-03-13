import { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type props = {
    onPress: () => void,
    disabled?: boolean,
    isLoading?: boolean,
    texto: string,
    colorDeFondo?:boolean,
    Icono?:ReactNode
}

export function Boton({ onPress, disabled = false, isLoading = false, texto, colorDeFondo=false, Icono=undefined }: props) {
    const deshabilitado = disabled || isLoading;
    return (
        <Pressable
            className="w-full"
            onPress={onPress}
            disabled={deshabilitado}>

            {({ pressed }) => (
                    <View 
                    className='rounded-3xl justify-center items-center h-16'
                    style={{
                        ...(colorDeFondo &&{
                            borderWidth:1,
                            borderColor:'#D1D5DB',
                        }),
                        backgroundColor: pressed ? (colorDeFondo?'#F3F4F6':'#15803D'): (colorDeFondo?'#fff': '#16A34A'),
                        opacity: deshabilitado && !pressed ? 0.6 : 1,
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                    }}>
                   <View className="flex-1 flex-row justify-center items-center">
                     {Icono ? (<View className="w-14 aspect-square ml-4"><Text>fasdfsdfgsdfg</Text></View>) : null}
                     {isLoading ? (
                        <ActivityIndicator size="small" color={colorDeFondo ? '#16A34A' : '#ffffff'} />
                     ) : (
                        <Text className={`text-lg flex-[4] font-semibold ${Icono?'text-left' : 'text-center'} ${!colorDeFondo ? 'text-white':'text-black'}`}>
                            {texto}
                        </Text>
                     )}
                   </View>
                </View>
            )}
        </Pressable>
    )
}