import Cabecera from "@/components/cabecera";
import { SafeAreaView } from "react-native-safe-area-context";
// Iconos a usar Feather: message-... download user
// EvilIcons gear
export default function dashboard() {
    return (
        <SafeAreaView className="flex-1">
            <Cabecera />
        </SafeAreaView>
    );
}
