import { estilos } from "@/constantes/estilos";
import { Lock, Plus } from "lucide-react-native";
import { Alert, TouchableOpacity } from "react-native";

type props = {
    accion?: () => void;
    disabled?: boolean;
};

export default function BotonMasFlotante({ accion, disabled = false }: props) {
    return (
        <TouchableOpacity
            className={`absolute bottom-16 right-6 h-16 w-16 items-center justify-center rounded-full ${
                disabled
                    ? "bg-slate-200 border-2 border-slate-300"
                    : "bg-emerald-600"
            }`}
            style={estilos.sombraNormal}
            // Este debe de abrir la ventana modal para añadir los productos
            onPress={() => {
                if (disabled) {
                    Alert.alert(
                        "Límite alcanzado",
                        "Actualiza a la versión PRO para guardar más productos",
                    );
                    return;
                }

                accion?.();
            }}>
            {disabled ? (
                <Lock size={24} color="#94a3b8" />
            ) : (
                <Plus size={28} color="white" />
            )}
        </TouchableOpacity>
    );
}
