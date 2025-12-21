import { Text, TextInput, View } from 'react-native';

// La idea es que tenga un text y un input text
type props = {
    etiqueta?: string,
    sugerencia: string,
    onChangeText?:(texto:string)=>void,
    valueCampo?:string,
    esContrasena?:boolean
}

export default function CampoTexto({ etiqueta, sugerencia,onChangeText,valueCampo,esContrasena=false }: props) {
    return (
        <View>
            {etiqueta!==undefined &&
            <Text className="text-lg font-normal text-gray-400">{etiqueta}</Text>
            }
            <TextInput
                onChangeText={onChangeText}
                value={valueCampo}
                className="rounded-2xl border-gray-200 border-2 mb-3"
                placeholder={sugerencia}
                secureTextEntry={esContrasena} />
        </View>
    );
}