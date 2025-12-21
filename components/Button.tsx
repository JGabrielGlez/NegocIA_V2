import { Pressable, Text, View } from "react-native";

type props = {
    onPress: () => void,
    disabled?: boolean,
    texto: string,
    colorDeFondo?:boolean
}

export function Boton({ onPress, disabled = false, texto, colorDeFondo=false }: props) {
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
                    <Text className={`text-lg font-semibold ${!colorDeFondo ? 'text-white':'text-black'}`}>
                        {texto}
                    </Text>
                </View>
            )}
        </Pressable>
    )
}