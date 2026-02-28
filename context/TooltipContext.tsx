import React, { createContext, useContext, useState } from "react";

interface TooltipState {
    visibleProductoId: string | null;
    nombre: string;
}

interface TooltipContextType {
    tooltip: TooltipState;
    mostrarTooltip: (id: string, nombre: string) => void;
    ocultarTooltip: () => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
    const [tooltip, setTooltip] = useState<TooltipState>({
        visibleProductoId: null,
        nombre: "",
    });

    const mostrarTooltip = (id: string, nombre: string) => {
        setTooltip({ visibleProductoId: id, nombre });
    };

    const ocultarTooltip = () => {
        setTooltip({ visibleProductoId: null, nombre: "" });
    };

    return (
        <TooltipContext.Provider
            value={{ tooltip, mostrarTooltip, ocultarTooltip }}>
            {children}
        </TooltipContext.Provider>
    );
}

export function useTooltip() {
    const context = useContext(TooltipContext);
    if (context === undefined) {
        throw new Error("useTooltip debe usarse dentro de TooltipProvider");
    }
    return context;
}
