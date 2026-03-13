import CabeceraNavegacion from "@/components/cabeceraNavegacion";
import { PLAN_LIMITS } from "@/constants/aiLimits";
import { databaseService } from "@/firebase/databaseService";
import { functions } from "@/firebase/firebaseConfig";
import { AIMessage } from "@/store/types";
import { useAIStore } from "@/store/useAIStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
import { httpsCallable } from "firebase/functions";
import { Send } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Easing,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";

// DEV_SAMPLE_REMOVE: Mensajes de ejemplo para revisar el diseno
const DEV_SAMPLE_MESSAGES: AIMessage[] = [
    {
        id: "dev-user-1",
        role: "user",
        content: "Cuanto vendi hoy?",
        timestamp: new Date(),
    },
    {
        id: "dev-ai-1",
        role: "ai",
        content:
            "Hoy llevas $1,250 en ventas. Tus productos mas vendidos son cafe y pan dulce.",
        timestamp: new Date(),
    },
];

export default function AsistenteIA() {
    const router = useRouter();
    const usuario = useAuthStore((state) => state.usuario);
    const messages = useAIStore((state) => state.messages);
    const isLoading = useAIStore((state) => state.isLoading);
    const queriesRemaining = useAIStore((state) => state.queriesRemaining);
    const addMessage = useAIStore((state) => state.addMessage);
    const setIsLoading = useAIStore((state) => state.setIsLoading);
    const setQueriesRemaining = useAIStore(
        (state) => state.setQueriesRemaining,
    );
    const [inputText, setInputText] = useState("");
    const [plan, setPlan] = useState<"GRATIS" | "PRO" | null>(null);
    const [nextResetDate, setNextResetDate] = useState<Date | null>(null);

    const isPro = plan === "PRO";
    const planLimit = plan ? PLAN_LIMITS[plan] : 0;

    useEffect(() => {
        if (messages.length === 0) {
            DEV_SAMPLE_MESSAGES.forEach((message) => addMessage(message));
        }
    }, [addMessage, messages.length]);

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
        if (plan === null) return "Consultas: --";
        return `Consultas restantes: ${queriesRemaining}/${planLimit}`;
    }, [queriesRemaining, plan, planLimit]);

    const resetLabel = useMemo(() => {
        if (!nextResetDate) return "";
        return `Se restablece el ${nextResetDate.toLocaleDateString("es-MX")}`;
    }, [nextResetDate]);

    const dot1Anim = useRef(new Animated.Value(0)).current;
    const dot2Anim = useRef(new Animated.Value(0)).current;
    const dot3Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const makeDot = (anim: Animated.Value, delay: number) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 300,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 0,
                        duration: 300,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                    Animated.delay(600 - delay),
                ]),
            );

        const anim1 = makeDot(dot1Anim, 0);
        const anim2 = makeDot(dot2Anim, 200);
        const anim3 = makeDot(dot3Anim, 400);

        anim1.start();
        anim2.start();
        anim3.start();

        return () => {
            anim1.stop();
            anim2.stop();
            anim3.stop();
        };
    }, [dot1Anim, dot2Anim, dot3Anim]);

    const askAI = async (question: string): Promise<string> => {
        if (!usuario?.uid) {
            throw new Error("No hay usuario autenticado");
        }

        const askAssistant = httpsCallable(functions, "askAssistant");
        const response = await askAssistant({
            question,
            userId: usuario.uid,
        });

        const answer = (response.data as { answer?: string })?.answer;
        return answer || "No pude generar una respuesta en este momento.";
    };

    const sendQuestion = async () => {
        const question = inputText.trim();
        if (!question) return;

        // Validar si tiene consultas restantes
        if (queriesRemaining <= 0) {
            // Si no tiene consultas, navegar a planes para upgrade
            Alert.alert(
                "Consultas agotadas",
                "Ya usaste todas tus consultas disponibles este mes. Mejora a PRO para consultas ilimitadas.",
                [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Ver planes",
                        onPress: () => router.push("/(features)/planes"),
                    },
                ],
            );
            return;
        }

        if (!usuario?.uid) {
            Alert.alert("Sesión requerida", "Inicia sesión para usar el asistente de IA.");
            return;
        }

        setInputText("");
        setIsLoading(true);

        const userMessage: AIMessage = {
            id: `${Date.now()}-user`,
            role: "user",
            content: question,
            timestamp: new Date(),
        };

        addMessage(userMessage);

        try {
            const answer = await askAI(question);
            const aiMessage: AIMessage = {
                id: `${Date.now()}-ai`,
                role: "ai",
                content: answer,
                timestamp: new Date(),
            };

            addMessage(aiMessage);
            setQueriesRemaining(Math.max(0, queriesRemaining - 1));
        } catch (error: any) {
            const message =
                error?.message ||
                "Ocurrió un error al consultar el asistente IA. Intenta de nuevo.";
            Alert.alert("Error del asistente", message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <CabeceraNavegacion nombrePagina="Asistente IA">
                <View className="rounded-full bg-slate-100 px-2 py-1">
                    <Text className="text-[11px] font-semibold text-slate-600">
                        {remainingLabel}
                    </Text>
                </View>
            </CabeceraNavegacion>

            {resetLabel ? (
                <View className="px-4 pt-2">
                    <Text className="text-xs text-slate-500">{resetLabel}</Text>
                </View>
            ) : null}

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
                        <View className="flex-row items-end">
                            {item.role === "ai" && (
                                <View className="mr-2 h-7 w-7 items-center justify-center rounded-full bg-slate-200">
                                    <Text className="text-[10px] font-semibold text-slate-700">
                                        IA
                                    </Text>
                                </View>
                            )}
                            <View>
                                <View
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                        item.role === "user"
                                            ? "bg-emerald-600"
                                            : "bg-slate-200"
                                    }`}>
                                    <Text
                                        className={`text-sm ${
                                            item.role === "user"
                                                ? "text-white"
                                                : "text-slate-900"
                                        }`}>
                                        {item.content}
                                    </Text>
                                </View>
                                <Text
                                    className={`mt-1 text-[11px] ${
                                        item.role === "user"
                                            ? "text-right text-slate-500"
                                            : "text-left text-slate-500"
                                    }`}>
                                    {(typeof item.timestamp === "string"
                                        ? new Date(item.timestamp)
                                        : item.timestamp
                                    ).toLocaleTimeString("es-MX", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </Text>
                            </View>
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
                ListFooterComponent={
                    isLoading ? (
                        <View className="mb-3 flex items-start">
                            <View className="flex-row items-end">
                                <View className="mr-2 h-7 w-7 items-center justify-center rounded-full bg-slate-200">
                                    <Text className="text-[10px] font-semibold text-slate-700">
                                        IA
                                    </Text>
                                </View>
                                <View className="rounded-2xl bg-slate-200 px-4 py-3">
                                    <View className="flex-row items-center gap-1">
                                        {[dot1Anim, dot2Anim, dot3Anim].map((anim, index) => (
                                            <Animated.View
                                                key={`dot-${index}`}
                                                style={{
                                                    opacity: anim,
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: 4,
                                                    backgroundColor: "#64748B",
                                                }}
                                            />
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </View>
                    ) : null
                }
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                className="border-t border-slate-200 bg-white px-4 py-3">
                <View className="flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <TextInput
                        className="flex-1 pr-2 text-slate-900"
                        placeholder="Escribe tu pregunta..."
                        placeholderTextColor="#94A3B8"
                        value={inputText}
                        onChangeText={setInputText}
                        editable={!isLoading}
                    />
                    <Pressable
                        className={`ml-2 items-center justify-center rounded-xl px-3 py-2 ${
                            isLoading ? "bg-slate-300" : "bg-emerald-600"
                        }`}
                        onPress={sendQuestion}
                        disabled={isLoading}>
                        <Send size={18} color="#FFFFFF" />
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
