import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import Purchases, { PurchasesPackage } from "react-native-purchases";

import CabeceraNavegacion from "@/components/cabeceraNavegacion";
import PlanCard from "@/components/PlanCard";
import { databaseService } from "@/firebase/databaseService";
import { getOfferings } from "@/services/revenueCat";
import { useAuthStore } from "@/store/useAuthStore";

const PLAN_FEATURES = {
    GRATIS: [
        "Hasta 30 productos",
        "Ventas ilimitadas",
        "3 consultas IA/mes",
        "Historial 1 mes",
        "1 usuario",
    ],
    PRO: [
        "Productos ilimitados",
        "Ventas ilimitadas",
        "30 consultas IA/mes",
        "Historial ilimitado",
        "Backup en la nube",
        "Sin anuncios",
    ],
};

export default function PlanesScreen() {
    const router = useRouter();
    const usuario = useAuthStore((state) => state.usuario);
    const setAuthData = useAuthStore((state) => state.setAuthData);

    const [currentPlan, setCurrentPlan] = useState<"GRATIS" | "PRO">("GRATIS");
    const [isLoading, setIsLoading] = useState(true);
    const [pricesLoading, setPricesLoading] = useState(false);
    const [prices, setPrices] = useState<{ gratis: string; pro?: string }>({
        gratis: "Consulta",
    });
    const [proPackage, setProPackage] = useState<PurchasesPackage | null>(null);

    // Cargar plan actual y offerings
    useEffect(() => {
        const loadPlanAndOfferings = async () => {
            try {
                // Obtener plan actual del usuario
                if (usuario?.uid) {
                    const userData = await databaseService.getUsuario(
                        usuario.uid,
                    );
                    if (userData?.plan) {
                        setCurrentPlan(userData.plan);
                    }
                }

                // Obtener offerings (precios) de RevenueCat
                setPricesLoading(true);
                const offerings = await getOfferings();

                if (offerings?.current) {
                    const monthlyPackage =
                        offerings.current.availablePackages[0];

                    if (monthlyPackage?.product) {
                        setPrices({
                            gratis: "FREE",
                            pro: monthlyPackage.product.priceString,
                        });
                        setProPackage(monthlyPackage);
                    }
                } else {
                    // Fallback si no hay offerings
                    setPrices({
                        gratis: "FREE",
                        pro: "$299 MXN",
                    });
                }
            } catch (error) {
                console.error("Error al cargar planes y offerings:", error);
                setPrices({
                    gratis: "FREE",
                    pro: "$299 MXN",
                });
            } finally {
                setIsLoading(false);
                setPricesLoading(false);
            }
        };

        loadPlanAndOfferings();
    }, [usuario?.uid]);

    // Manejar compra de suscripción
    const handlePurchasePRO = async () => {
        if (!usuario?.uid || !proPackage) {
            Alert.alert(
                "Error",
                "No se pudo iniciar la compra. Intenta de nuevo.",
            );
            return;
        }

        try {
            setPricesLoading(true);

            console.log("Iniciando compra del paquete:", proPackage.identifier);

            await Purchases.purchasePackage(proPackage);

            console.log("Compra exitosa");

            // Actualizar plan en Firestore
            await databaseService.updateUsuario(usuario.uid, {
                plan: "PRO",
            });

            // Actualizar store local
            setAuthData({ usuario: { ...usuario, plan: "PRO" } as any });
            setCurrentPlan("PRO");

            Alert.alert(
                "¡Éxito!",
                "Tu suscripción PRO ha sido activada. Ahora tienes acceso a todas las características premium.",
                [
                    {
                        text: "Continuar",
                        onPress: () => router.back(),
                    },
                ],
            );
        } catch (error: any) {
            console.error("Error durante la compra:", error);

            if (error.userCancelled) {
                console.log("Usuario canceló la compra");
                return;
            }

            Alert.alert(
                "Error en la compra",
                "No pudimos procesar tu compra. Por favor intenta de nuevo.\n\n" +
                    (error.message || ""),
            );
        } finally {
            setPricesLoading(false);
            // Recargar offerings después del intento
            const offerings = await getOfferings();
            if (offerings?.current?.availablePackages[0]) {
                setProPackage(offerings.current.availablePackages[0]);
            }
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text className="text-gray-600">Cargando planes...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <CabeceraNavegacion nombrePagina="Planes y Suscripción" />

            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}>
                {/* Encabezado */}
                <View className="mb-8">
                    <Text className="text-2xl font-bold text-gray-900">
                        Elige tu Plan
                    </Text>
                    <Text className="mt-2 text-gray-600">
                        Mejora tu negocio con características premium
                    </Text>
                </View>

                {/* Tarjetas de planes */}
                <View className="mb-8 flex-row gap-4">
                    {/* Plan GRATIS */}
                    <PlanCard
                        title="GRATIS"
                        price={prices.gratis}
                        features={PLAN_FEATURES.GRATIS}
                        isCurrent={currentPlan === "GRATIS"}
                    />

                    {/* Plan PRO */}
                    <PlanCard
                        title="PRO"
                        price={prices.pro || "$299 MXN"}
                        features={PLAN_FEATURES.PRO}
                        isCurrent={currentPlan === "PRO"}
                        isLoading={pricesLoading}
                        onPress={
                            currentPlan === "PRO"
                                ? undefined
                                : handlePurchasePRO
                        }
                    />
                </View>

                {/* Info adicional */}
                {currentPlan === "GRATIS" && (
                    <View className="rounded-lg bg-blue-50 p-4">
                        <Text className="font-semibold text-blue-900">
                            💡 Consejos
                        </Text>
                        <Text className="mt-2 text-sm text-blue-800">
                            • El plan GRATIS es perfecto para comenzar
                        </Text>
                        <Text className="mt-1 text-sm text-blue-800">
                            • Actualiza a PRO cuando necesites más capacidad
                        </Text>
                        <Text className="mt-1 text-sm text-blue-800">
                            • Acceso a todas las funciones del asistente IA
                        </Text>
                    </View>
                )}

                {currentPlan === "PRO" && (
                    <View className="rounded-lg bg-green-50 p-4">
                        <Text className="font-semibold text-green-900">
                            ✅ Plan Activo
                        </Text>
                        <Text className="mt-2 text-sm text-green-800">
                            Estás disfrutando de todas las características
                            premium de NegocIA.
                        </Text>
                    </View>
                )}

                {/* Espaciador */}
                <View className="h-8" />
            </ScrollView>
        </View>
    );
}
