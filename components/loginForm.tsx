import { Link } from "expo-router";
import { ReactNode, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { Boton } from "./Button";


type props={
    children?: ReactNode
}

export default function Login({children}:props) {
    const onPress = () => {

    }

    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("")

    return (
       
            <View
                className="bg-white p-7 rounded-xl border-2 border-gray-400 flex-[2] w-4/5 shadow-around gap-3 ">
                <Text 
                    className="font-bold text-3xl text-center mb-3">Iniciar Sesión</Text>
                <Text
                    className="text-lg font-normal text-gray-400">Correo</Text>
                <TextInput
                    onChangeText={setCorreo}
                    value={correo}
                    className="rounded-2xl border-gray-200 border-2 mb-3"
                    placeholder="tu@correo.com" />
                <Text className="text-lg font-normal text-gray-400">Contraseña</Text>
                <TextInput
                    onChangeText={setPassword}
                    value={password}
                    className="rounded-2xl border-gray-200 border-2"
                    placeholder="**********" secureTextEntry />
                <Link 
                    className="text-blue-700"
                    href={"#"}>¿Olvidaste tu contraseña?</Link>
                <Boton 
                    onPress={onPress} texto="Iniciar Sesión" />
                {children}
            </View>
    );
}