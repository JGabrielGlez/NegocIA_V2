import { Pressable, Text, View } from "react-native";

type props = {
    onPress: () => void,
    disabled?: boolean,
    texto: string
}

export function Boton({ onPress, disabled = false, texto }: props) {
    return (
        <Pressable
            className="w-full"
            onPress={onPress}
            disabled={disabled}>
            {({ pressed }) => (
                <View 
                    className='rounded-3xl justify-center items-center h-16'
                    style={{
                        backgroundColor: pressed ? '#15803D' : '#16A34A',
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                    }}>
                    <Text className="text-lg font-semibold text-white">
                        {texto}
                    </Text>
                </View>
            )}
        </Pressable>
    )
}