import { estilos } from "@/constantes/estilos";
import { Plus } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

type props = {
    redireccionamiento?: () => void;
};

export default function BotonMasFlotante({ redireccionamiento }: props) {
    return (
        <TouchableOpacity
            className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary"
            style={estilos.sombraNormal}
            // Este debe de abrir la ventana modal para añadir los productos
            onPress={redireccionamiento}>
            <Plus size={28} color="white" />
        </TouchableOpacity>
    );
}
