import { Alert, ScrollView, Text, View } from "react-native";
import { databaseService } from "../firebase/databaseService";
import { useAIStore } from "../store/useAIStore";
import { useAuthStore } from "../store/useAuthStore";
import { Boton } from "./Button";

/**
 * Panel de herramientas de desarrollo para simular estados de suscripción.
 *
 * ⚠️ SOLO SE RENDERIZA EN MODO DESARROLLO (__DEV__ === true)
 *
 * Funcionalidades:
 * - Simular cambio a plan PRO
 * - Simular cambio a plan GRATIS
 * - Agotar consultas de IA
 * - Resetear consultas de IA al límite del plan actual
 *
 * Muestra en tiempo real:
 * - Plan actual (PRO / GRATIS)
 * - Consultas IA restantes
 *
 * @returns {null} Si no está en modo desarrollo
 * @returns {JSX.Element} Panel de desarrollo si está en modo desarrollo
 */
export function DevToolsPanel() {
    // No renderizar en producción
    if (!__DEV__) {
        return null;
    }

    const { usuario, isPremium, plan, setIsPremium, setPlan } = useAuthStore();
    const { queriesRemaining, setQueriesRemaining } = useAIStore();

    const uid = usuario?.uid;

    if (!uid) {
        return null;
    }

    const queryLimit = plan === "PRO" ? 30 : 3;

    // Simular PRO
    const handleSimulatePRO = async () => {
        try {
            setIsPremium(true);
            setPlan("PRO");
            setQueriesRemaining(30); // Reset a límite PRO
            await databaseService.updateUsuario(uid, { plan: "PRO" });
            Alert.alert("✅ Éxito", "Simulado plan PRO con 30 consultas IA");
        } catch (error) {
            Alert.alert("❌ Error", "No se pudo simular PRO");
            console.error(error);
        }
    };

    // Simular GRATIS
    const handleSimulateGRATIS = async () => {
        try {
            setIsPremium(false);
            setPlan("GRATIS");
            setQueriesRemaining(3); // Reset a límite GRATIS
            await databaseService.updateUsuario(uid, { plan: "GRATIS" });
            Alert.alert("✅ Éxito", "Simulado plan GRATIS con 3 consultas IA");
        } catch (error) {
            Alert.alert("❌ Error", "No se pudo simular GRATIS");
            console.error(error);
        }
    };

    // Agotar consultas
    const handleExhaustQueries = () => {
        setQueriesRemaining(0);
        Alert.alert("✅ Éxito", "Consultas de IA agotadas (0 restantes)");
    };

    // Resetear consultas
    const handleResetQueries = () => {
        const newLimit = plan === "PRO" ? 30 : 3;
        setQueriesRemaining(newLimit);
        Alert.alert(
            "✅ Éxito",
            `Consultas reseteadas a ${newLimit} (límite de plan ${plan})`,
        );
    };

    return (
        <View
            style={{
                marginTop: 20,
                padding: 12,
                borderWidth: 3,
                borderColor: "#ff0000",
                backgroundColor: "#fffacd",
                borderRadius: 8,
                marginHorizontal: 16,
                marginBottom: 20,
            }}>
            {/* Título */}
            <Text
                style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: "#ff0000",
                    marginBottom: 10,
                }}>
                🛠️ MODO DESARROLLO (DevTools)
            </Text>

            {/* Estado actual */}
            <View
                style={{
                    backgroundColor: "#fff",
                    padding: 10,
                    borderRadius: 6,
                    marginBottom: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: "#ff0000",
                }}>
                <Text style={{ fontSize: 12, color: "#333", marginBottom: 4 }}>
                    <Text style={{ fontWeight: "bold" }}>Plan actual:</Text>{" "}
                    {isPremium ? "✅ PRO" : "❌ GRATIS"}
                </Text>
                <Text style={{ fontSize: 12, color: "#333" }}>
                    <Text style={{ fontWeight: "bold" }}>
                        Consultas IA restantes:
                    </Text>{" "}
                    {queriesRemaining} / {queryLimit}
                </Text>
            </View>

            {/* Botones en scroll horizontal para que quepan */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 10 }}>
                {/* Simular PRO */}
                <View style={{ marginRight: 8 }}>
                    <Boton texto="Simular PRO" onPress={handleSimulatePRO} />
                </View>

                {/* Simular GRATIS */}
                <View style={{ marginRight: 8 }}>
                    <Boton
                        texto="Simular GRATIS"
                        onPress={handleSimulateGRATIS}
                    />
                </View>

                {/* Agotar consultas */}
                <View style={{ marginRight: 8 }}>
                    <Boton
                        texto="Agotar Consultas"
                        onPress={handleExhaustQueries}
                    />
                </View>

                {/* Resetear consultas */}
                <View>
                    <Boton
                        texto="Resetear Consultas"
                        onPress={handleResetQueries}
                    />
                </View>
            </ScrollView>

            {/* Advertencia visual */}
            <Text
                style={{
                    fontSize: 10,
                    color: "#666",
                    fontStyle: "italic",
                    marginTop: 8,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: "#ff0000",
                }}>
                ⚠️ Panel de desarrollo. Solo visible en modo dev (__DEV__ ===
                true). No incluir en producción.
            </Text>
        </View>
    );
}
