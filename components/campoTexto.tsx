import { Text, TextInput, View } from "react-native";

// La idea es que tenga un text y un input text
type props = {
    etiqueta?: string;
    sugerencia: string;
    onChangeText?: (texto: string) => void;
    valueCampo?: string;
    esContrasena?: boolean;
    esNumero?: boolean;
    prefijo?: string;
};

export default function CampoTexto({
    etiqueta,
    sugerencia,
    onChangeText,
    valueCampo,
    esContrasena = false,
    esNumero = false,
    prefijo = "",
}: props) {
    return (
        <View>
            {etiqueta !== undefined && (
                <Text className="pl-2 text-lg font-normal text-gray-600">
                    {etiqueta}
                </Text>
            )}
            <View className="flex-row">
                {prefijo && (
                    <Text className="m-auto mr-2 pl-2 text-lg font-semibold text-gray-500">
                        {prefijo}
                    </Text>
                )}
                <TextInput
                    onChangeText={onChangeText}
                    value={valueCampo}
                    className="mb-2 flex-1 rounded-2xl border-2 border-gray-200 pl-2"
                    placeholder={sugerencia}
                    secureTextEntry={esContrasena}
                    {...(esNumero && {
                        keyboardTyp: "decimal-pad",
                        inputMode: "decimal",
                    })}
                />
            </View>
        </View>
    );
}
