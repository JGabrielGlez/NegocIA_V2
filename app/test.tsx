import { doc, getDoc, updateDoc } from "firebase/firestore";
import React from "react";
import { Alert, Button, ScrollView, Text, View } from "react-native";
import { auth, db } from "../firebase/firebaseConfig";

export default function TestScreen() {
    // PRUEBA 1: Intentar leer a otro usuario (Privacidad)
    const testReadOtherUser = async () => {
        try {
            const targetUid = "KkGOzhIXs7sIaIkS2ePREb5eXOqu";
            const docRef = doc(db, "usuarios", targetUid);
            const snapshot = await getDoc(docRef);

            if (snapshot.exists()) {
                Alert.alert(
                    "⚠️ FALLO DE SEGURIDAD",
                    "Pude leer los datos de otro usuario.",
                );
                console.log("Datos filtrados:", snapshot.data());
            } else {
                Alert.alert(
                    "✅ PRUEBA SUPERADA",
                    "El documento no existe o el acceso fue denegado.",
                );
            }
        } catch (error: any) {
            if (error.code === "permission-denied") {
                Alert.alert(
                    "✅ PRUEBA SUPERADA",
                    "Firebase bloqueó el acceso correctamente.",
                );
            } else {
                console.error("Error inesperado:", error);
            }
        }
    };

    // PRUEBA 2: Intentar hackear mis propios créditos (Integridad)
    const testHackAiUsage = async () => {
        try {
            const myUid = auth.currentUser?.uid;
            if (!myUid)
                return Alert.alert(
                    "Error",
                    "Debes estar logueado en el emulador.",
                );

            const aiRef = doc(db, "usuarios", myUid, "ai_usage", "analytics");

            // Intentamos darnos 9999 consultas gratis
            await updateDoc(aiRef, { queriesRemaining: 9999 });

            Alert.alert(
                "⚠️ FALLO DE SEGURIDAD",
                "Pude modificar mis propios créditos de IA.",
            );
        } catch (error: any) {
            if (error.code === "permission-denied") {
                Alert.alert(
                    "✅ PRUEBA SUPERADA",
                    "Solo las Functions pueden editar este nodo.",
                );
            } else {
                Alert.alert("Error", error.message);
            }
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="gap-5 p-5">
                <Text className="mb-4 text-2xl font-bold">
                    🛡️ Panel de Pruebas de Seguridad
                </Text>

                <Button
                    title="Test: Leer Otro Usuario"
                    onPress={testReadOtherUser}
                    color="#ef4444"
                />

                <Button
                    title="Test: Hackear Créditos IA"
                    onPress={testHackAiUsage}
                    color="#f97316"
                />
            </View>
        </ScrollView>
    );
}
