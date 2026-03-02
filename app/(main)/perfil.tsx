import { useRouter } from "expo-router";
import { LogOut, Settings } from "lucide-react-native";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import BadgePRO from "@/components/BadgePRO";
import CabeceraNavegacion from "@/components/cabeceraNavegacion";
import { DevToolsPanel } from "@/components/DevToolsPanel";
import { databaseService } from "@/firebase/databaseService";
import { Usuario } from "@/store/types";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";

export default function PerfilScreen() {
    const router = useRouter();
    const usuario = useAuthStore((state) => state.usuario);
    const cerrarSesion = useAuthStore((state) => state.cerrarSesion);

    const [userProfile, setUserProfile] = useState<Usuario | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar datos del usuario
    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                if (usuario?.uid) {
                    const profile = await databaseService.getUsuario(
                        usuario.uid,
                    );
                    if (profile) {
                        setUserProfile(profile);
                    }
                }
            } catch (error) {
                console.error("Error al cargar perfil:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserProfile();
    }, [usuario?.uid]);

    const handleLogout = async () => {
        Alert.alert(
            "Cerrar sesión",
            "¿Estás seguro de que deseas cerrar sesión?",
            [
                {
                    text: "Cancelar",
                    onPress: () => {},
                },
                {
                    text: "Cerrar sesión",
                    onPress: async () => {
                        try {
                            await cerrarSesion(router);
                        } catch (error) {
                            Alert.alert("Error", "No se pudo cerrar sesión");
                        }
                    },
                    style: "destructive",
                },
            ],
        );
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text className="text-gray-600">Cargando perfil...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <CabeceraNavegacion nombrePagina="Mi Perfil" />

            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}>
                {/* Información del usuario */}
                <View className="mb-8 rounded-lg bg-gray-50 p-6">
                    <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-blue-600">
                        <Text className="text-2xl font-bold text-white">
                            {usuario?.email?.[0].toUpperCase() || "U"}
                        </Text>
                    </View>

                    <View className="mb-1 flex-row items-center">
                        <Text className="text-xl font-bold text-gray-900">
                            {userProfile?.nombre || "Usuario"}
                        </Text>
                        <BadgePRO />
                    </View>
                    <Text className="mb-4 text-sm text-gray-600">
                        {usuario?.email}
                    </Text>

                    {userProfile?.negocio && (
                        <View className="mt-4 rounded-lg bg-white p-4">
                            <Text className="text-xs font-semibold text-gray-500">
                                NEGOCIO
                            </Text>
                            <Text className="mt-1 text-sm font-semibold text-gray-900">
                                {userProfile.negocio}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Plan actual */}
                <View className="mb-8">
                    <Text className="mb-4 text-lg font-bold text-gray-900">
                        Plan Actual
                    </Text>

                    <View
                        className={`rounded-lg p-6 ${
                            userProfile?.plan === "PRO"
                                ? "bg-green-50"
                                : "bg-gray-50"
                        }`}>
                        <Text
                            className={`text-2xl font-bold ${
                                userProfile?.plan === "PRO"
                                    ? "text-green-900"
                                    : "text-gray-900"
                            }`}>
                            {userProfile?.plan === "PRO"
                                ? "🎁 Plan PRO"
                                : "📦 Plan GRATIS"}
                        </Text>

                        <Text
                            className={`mt-2 text-sm ${
                                userProfile?.plan === "PRO"
                                    ? "text-green-700"
                                    : "text-gray-600"
                            }`}>
                            {userProfile?.plan === "PRO"
                                ? "Disfruta de todas las características premium"
                                : "Estás usando el plan gratuito. Actualiza para obtener más capacidad."}
                        </Text>
                    </View>
                </View>

                {/* Botón de administrar suscripción */}
                <Pressable
                    onPress={() => router.push("/(features)/planes" as any)}
                    className="mb-8 flex-row items-center rounded-lg bg-blue-600 px-6 py-4">
                    <Settings size={20} color="white" className="mr-3" />
                    <View className="flex-1">
                        <Text className="font-semibold text-white">
                            Administrar Suscripción
                        </Text>
                        <Text className="text-xs text-blue-100">
                            Ver planes y opciones de compra
                        </Text>
                    </View>
                </Pressable>

                {/* Botón cerrar sesión */}
                <Pressable
                    onPress={handleLogout}
                    className="flex-row items-center rounded-lg border-2 border-red-300 bg-red-50 px-6 py-4">
                    <LogOut size={20} color="#dc2626" className="mr-3" />
                    <View className="flex-1">
                        <Text className="font-semibold text-red-600">
                            Cerrar Sesión
                        </Text>
                        <Text className="text-xs text-red-500">
                            Salir de tu cuenta
                        </Text>
                    </View>
                </Pressable>

                {/* Espaciador */}
                <View className="h-8" />

                {/* DevTools Panel (solo en desarrollo) */}
                <DevToolsPanel />
            </ScrollView>
        </View>
    );
}
