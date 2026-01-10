import Buscador from "@/components/buscador";
import CabeceraNavegacion from "@/components/cabeceraNavegacion";
import ItemProducto from "@/components/itemProducto";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BotonMasFlotante from "@/components/masFlotante";

// TODO En las categorías poner x cantidad de íconos, agregando una librería de iconos para que puedan configurar sus iconos, o bueno, hacer que la IA al momento de crear las categorías, decida qué icono poner en base a su nombre. 

// También agregar el modal productos, para agregarlos
export default function productos() {
    return (
        <SafeAreaView className="flex-1">
            <CabeceraNavegacion nombrePagina="Productos" />
            <Buscador filtrar={true} placeholder="Buscar productos..." />

            <ScrollView className="bg-white">
                <ItemProducto nombre="Coca bien fría" precio={23} />
                <ItemProducto nombre="Coca bien fría" precio={23} />
                <ItemProducto nombre="Coca bien fría" precio={23} />
                <ItemProducto nombre="Coca bien fría" precio={23} />
                <ItemProducto nombre="Coca bien fría" precio={23} />
                <ItemProducto nombre="Coca bien fría" precio={23} />
                <ItemProducto nombre="Coca bien fría" precio={2323} />
            </ScrollView>

            <BotonMasFlotante/>;
        </SafeAreaView>
    );
}
