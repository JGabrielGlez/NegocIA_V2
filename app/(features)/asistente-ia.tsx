import CabeceraNavegacion from "@/components/cabeceraNavegacion";
import { databaseService } from "@/firebase/databaseService";
import { functions } from "@/firebase/firebaseConfig";
import { useAuthStore } from "@/store/useAuthStore";
import { httpsCallable } from "firebase/functions";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";

type ChatMessage = {
    id: string;
    role: "user" | "ai";
    content: string;
    timestamp: Date;
};

const PLAN_LIMITS = {
    GRATIS: 3,
    PRO: 30,
} as const;

export default function AsistenteIA() {
    const usuario = useAuthStore((state) => state.usuario);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [plan, setPlan] = useState<"GRATIS" | "PRO" | null>(null);
    const [queriesRemaining, setQueriesRemaining] = useState<number | null>(
        null,
    );
    const [nextResetDate, setNextResetDate] = useState<Date | null>(null);

    const isPro = plan === "PRO";
    const planLimit = plan ? PLAN_LIMITS[plan] : 0;

    useEffect(() => {
        const loadUserPlan = async () => {
            if (!usuario?.uid) return;

            try {
                const userData = await databaseService.getUsuario(usuario.uid);
                if (userData?.plan) {
                    setPlan(userData.plan);
                }

                const usageData = await databaseService.getAIUsageDoc(
                    usuario.uid,
                );
                if (usageData) {
                    const used = usageData.queriesUsedThisMonth || 0;
                    const limit = userData?.plan
                        ? PLAN_LIMITS[userData.plan]
                        : 0;
                    setQueriesRemaining(Math.max(0, limit - used));

                    const rawResetDate = usageData.nextResetDate;
                    const parsedResetDate = rawResetDate?.toDate
                        ? rawResetDate.toDate()
                        : rawResetDate;
                    setNextResetDate(parsedResetDate || null);
                }
            } catch (error) {
                console.log("Error al cargar plan y uso de IA", error);
            }
        };

        loadUserPlan();
    }, [usuario?.uid]);

    const remainingLabel = useMemo(() => {
        if (queriesRemaining === null || plan === null) return "Consultas: --";
        return `Consultas restantes: ${queriesRemaining}/${planLimit}`;
    }, [queriesRemaining, plan, planLimit]);

    const resetLabel = useMemo(() => {
        if (!nextResetDate) return "";
        return `Se restablece el ${nextResetDate.toLocaleDateString("es-MX")}`;
    }, [nextResetDate]);

    const sendQuestion = async () => {
        const question = inputText.trim();
        if (!question) return;

        if (!isPro) {
            Alert.alert(
                "Función PRO",
                "El asistente IA solo está disponible para usuarios PRO.",
            );
            return;
        }

        if (!usuario?.uid) {
            Alert.alert("Error", "No hay usuario autenticado");
            return;
        }

        setInputText("");
        setIsLoading(true);

        const userMessage: ChatMessage = {
            id: `${Date.now()}-user`,
            role: "user",
            content: question,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);

        try {
            const askAssistant = httpsCallable(functions, "askAssistant");
            const response = await askAssistant({
                question,
                userId: usuario.uid,
            });

            const answer = (response.data as { answer?: string })?.answer;
            const aiMessage: ChatMessage = {
                id: `${Date.now()}-ai`,
                role: "ai",
                content:
                    answer || "No pude generar una respuesta en este momento.",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);

            if (queriesRemaining !== null) {
                setQueriesRemaining(Math.max(0, queriesRemaining - 1));
            }
        } catch (error: any) {
            const message =
                error?.message ||
                "Ocurrió un error al consultar el asistente IA. Intenta de nuevo.";
            Alert.alert("Error", message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <CabeceraNavegacion nombrePagina="Asistente IA" />

            <View className="px-4 pt-4">
                <Text className="text-sm text-gray-600">{remainingLabel}</Text>
                {resetLabel ? (
                    <Text className="mt-1 text-xs text-gray-500">
                        {resetLabel}
                    </Text>
                ) : null}
            </View>

            {!isPro && plan !== null && (
                <View className="mx-4 mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <Text className="text-base font-semibold text-amber-900">
                        Asistente IA solo para PRO
                    </Text>
                    <Text className="mt-1 text-sm text-amber-800">
                        Actualiza tu plan para desbloquear consultas ilimitadas.
                    </Text>
                    <Pressable
                        className="mt-3 rounded-2xl bg-amber-500 px-4 py-2"
                        onPress={() =>
                            Alert.alert(
                                "Actualiza a PRO",
                                "Ve a la pantalla de planes para mejorar tu cuenta.",
                            )
                        }>
                        <Text className="text-center font-semibold text-white">
                            Ver planes
                        </Text>
                    </Pressable>
                </View>
            )}

            <FlatList
                className="mt-4 flex-1 px-4"
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View
                        className={`mb-3 flex ${
                            item.role === "user" ? "items-end" : "items-start"
                        }`}>
                        <View
                            className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                item.role === "user"
                                    ? "bg-green-600"
                                    : "bg-gray-100"
                            }`}>
                            <Text
                                className={`text-sm ${
                                    item.role === "user"
                                        ? "text-white"
                                        : "text-gray-900"
                                }`}>
                                {item.content}
                            </Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View className="mt-10 items-center">
                        <Text className="text-gray-500">
                            Aun no hay mensajes. Haz tu primera pregunta.
                        </Text>
                    </View>
                }
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                className="border-t border-gray-200 px-4 py-3">
                {isLoading && (
                    <View className="mb-2 flex-row items-center">
                        <ActivityIndicator size="small" color="#16A34A" />
                        <Text className="ml-2 text-sm text-gray-600">
                            Generando respuesta...
                        </Text>
                    </View>
                )}

                <View className="flex-row items-center">
                    <TextInput
                        className="flex-1 rounded-2xl border border-gray-300 px-4 py-2"
                        placeholder="Escribe tu pregunta..."
                        value={inputText}
                        onChangeText={setInputText}
                        editable={!isLoading}
                    />
                    <Pressable
                        className={`ml-2 rounded-2xl px-4 py-2 ${
                            isLoading ? "bg-gray-300" : "bg-green-600"
                        }`}
                        onPress={sendQuestion}
                        disabled={isLoading}>
                        <Text className="font-semibold text-white">Enviar</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
