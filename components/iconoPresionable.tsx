import React, { useState } from "react";
import { Pressable, View } from "react-native";

// Definimos qué puede recibir nuestro componente
interface IconButtonProps {
    onPress: () => void;
    children: React.ReactNode; // Aquí recibirá el icono que tú quieras
    size?: number; // Tamaño opcional, por defecto 40
}

export const IconoPresionable = ({
    onPress,
    children,
    size = 40,
}: IconButtonProps) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
        <Pressable
            onPress={onPress}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}>
            <View
                style={{
                    overflow: "hidden",
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: isPressed ? "#dbdbdb" : "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                {children}
            </View>
        </Pressable>
    );
};
