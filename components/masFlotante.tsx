import { estilos } from "@/constantes/estilos";
import { Plus } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

type props = {
    accion?: () => void;
    disabled?: boolean;
};

export default function BotonMasFlotante({ accion, disabled = false }: props) {
    return (
        <TouchableOpacity
            className={`absolute bottom-16 right-6 h-16 w-16 items-center justify-center rounded-full ${
                disabled ? "bg-gray-400" : "bg-primary"
            }`}
            style={estilos.sombraNormal}
            // Este debe de abrir la ventana modal para añadir los productos
            onPress={disabled ? undefined : accion}
            disabled={disabled}>
            <Plus size={28} color={disabled ? "#999" : "white"} />
        </TouchableOpacity>
    );
}
