import { Link } from "expo-router";
import { ReactNode, useState } from "react";
import { Text, View } from "react-native";
import { Boton } from "./Button";
import CampoTexto from "./campoTexto";


type props = {
    children?: ReactNode
}

export default function Login({ children }: props) {
    const onPress = () => {

    }

    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("")

    return (

        <View
            className="bg-white p-7 rounded-xl border-2 border-gray-400 flex-[2] w-4/5 shadow-around gap-3 ">
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
            <Link
                className="text-blue-700"
                href={"/"}>¿Olvidaste tu contraseña?</Link>
            <Boton
                onPress={onPress} 
                texto="Iniciar Sesión" />
            {children}
        </View>
    );
}