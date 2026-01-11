import { estilos } from "@/constantes/estilos";
import { Plus } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

type props = {
    accion?: () => void;
};

export default function BotonMasFlotante({ accion }: props) {
    return (
        <TouchableOpacity
            className="absolute bottom-16 right-6 h-16 w-16 items-center justify-center rounded-full bg-primary"
            style={estilos.sombraNormal}
            // Este debe de abrir la ventana modal para añadir los productos
            onPress={accion}>
            <Plus size={28} color="white" />
        </TouchableOpacity>
    );
}
