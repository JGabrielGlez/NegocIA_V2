import { ReactNode, useState } from "react";
import { Text, View } from "react-native";
import { estilos } from "../constantes/estilos";
import CampoTexto from "./campoTexto";

type props = {
    children?: ReactNode;
};

export default function Login({ children }: props) {
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");

    return (
        <View
            className="mb-6 w-11/12 flex-[2] gap-3 overflow-hidden rounded-xl bg-white p-7"
            style={estilos.sombraNormal}>
            <Text className="mb-3 text-center text-3xl font-bold">
                Iniciar Sesión
            </Text>
            <CampoTexto
                sugerencia="tu@correo.com"
                etiqueta="Correo"
                valueCampo={correo}
                onChangeText={setCorreo}
            />
            <CampoTexto
                sugerencia="******"
                etiqueta="Contraseña"
                valueCampo={password}
                onChangeText={setPassword}
                esContrasena={true}
            />

            {children}
        </View>
    );
}
