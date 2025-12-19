import { Pressable, Text , View} from "react-native";

type props = {
    onPress: () => void,
    disabled?: boolean,
    texto:string
}

export function Boton({onPress, disabled = false, texto }: props) {
    return (
        <View>
            <Pressable
            className=
            "rounded-xl justify-center items-center w-full h-16 bg-slate-950"
            onPress={onPress}
            disabled={disabled}>
            <Text
                className="text-5xl font-semibold"
            >
                {texto}
            </Text>
        </Pressable>
        </View>
    )
}