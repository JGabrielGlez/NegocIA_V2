import { ReactNode } from "react";
import { Text, View } from "react-native";
import { estilos } from "../constantes/estilos";
import CampoTexto from "./campoTexto";

type props = {
    children?: ReactNode;
    crearCuenta?: boolean;
    setCorreo: (email: string) => void;
    correo: string;
    password: string;
    setPassword: (contra: string) => void;
};

export default function Login({
    children,
    crearCuenta = false,
    setCorreo,
    setPassword,
    correo,
    password,
}: props) {
    return (
        <View
            className="mb-6 w-11/12 flex-[2] gap-3 overflow-hidden rounded-xl bg-white p-7"
            style={estilos.sombraNormal}>
            <Text className="mb-3 text-center text-3xl font-bold">
                {crearCuenta ? "Crear cuenta" : "Iniciar sesión"}
            </Text>
            <CampoTexto
                sugerencia="tu@correo.com"
                etiqueta="Correo"
                valueCampo={correo}
                onChangeText={(texto) => setCorreo(texto.trim())}
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
