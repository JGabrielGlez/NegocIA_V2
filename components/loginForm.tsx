import { ReactNode, useState } from "react";
import { Text, View } from "react-native";
import { estilos } from '../constantes/estilos';
import CampoTexto from "./campoTexto";


type props = {
    children?: ReactNode
}

export default function Login({ children }: props) {

    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("")

    return (

        <View
            className="bg-white p-7 rounded-xl flex-[2] w-11/12 gap-3 mb-6 overflow-hidden"
            style={estilos.sombraNormal}
        >
            <Text
                className="font-bold text-3xl text-center mb-3">Iniciar Sesión</Text>
            <CampoTexto
                sugerencia="tu@correo.com"
                etiqueta="Correo"
                valueCampo={correo}
                onChangeText={setCorreo} />
            <CampoTexto
                sugerencia="******"
                etiqueta="Contraseña"
                valueCampo={password}
                onChangeText={setPassword}
                esContrasena={true} />

            {children}
        </View>
    );
}