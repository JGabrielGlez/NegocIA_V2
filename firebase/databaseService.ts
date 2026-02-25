import {
    addDoc,
    collection,
    getDocs,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS, Producto } from "../store/types";

export const databaseService = {
    // Añadir un producto a la colección, cabe mencionar que el producto ya debe de venir completo desde el momento en el que se manda para agregarlo a la colección.
    addProducto: async (prod: Producto) => {
        try {
            // Firestore crea la colección productos al insertar el primer documento
            const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTOS), {
                ...prod,
                // En esta parte le agrego este campo al producto insertado
                createdAt: serverTimestamp(),
            });

            // Importante:Si tienes una lista de productos en pantalla y agregas uno nuevo, puedes usar ese ID para actualizar tu lista local (usando Zustand o un State) sin necesidad de recargar toda la página desde Firebase (ahorrando lecturas y dinero).
            return docRef.id;
        } catch (error: any) {
            console.log("Error en databaseService.addProducto", error);
            throw error;
        }
    },

    getProductos: async (userId: string) => {
        try {
            // Se construye lo que es el query para la consulta
            const q = query(
                collection(db, COLLECTIONS.PRODUCTOS),
                where("uid", "==", userId),
            );

            // Aquí se ejecuta el query
            const querySnapShot = await getDocs(q);

            // Mapear los objetos para obtener los productos 
            const productosObtenidos = querySnapShot.docs.map(doc=>({
                
            }))

        } catch (error: any) {}
    },
};
