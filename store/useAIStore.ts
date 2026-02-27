import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AIMessage } from "./types";

type AIState = {
    messages: AIMessage[];
    isLoading: boolean;
    queriesRemaining: number;
    addMessage: (message: AIMessage) => void;
    clearChat: () => void;
    setIsLoading: (value: boolean) => void;
    setQueriesRemaining: (value: number) => void;
};

export const useAIStore = create<AIState>()(
    persist(
        (set) => ({
            messages: [],
            isLoading: false,
            queriesRemaining: 0,
            addMessage: (message) =>
                set((state) => ({
                    messages: [...state.messages, message],
                })),
            clearChat: () => set({ messages: [] }),
            setIsLoading: (value) => set({ isLoading: value }),
            setQueriesRemaining: (value) => set({ queriesRemaining: value }),
        }),
        {
            name: "ai-chat-store",
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);
