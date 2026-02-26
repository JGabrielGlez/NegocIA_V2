import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS, Producto, Usuario, Venta } from "../store/types";

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
            const productosObtenidos = querySnapShot.docs.map((doc) => {
                const data = doc.data() as Producto;

                return {
                    ...data,
                    id: doc.id,
                };
            });

            return productosObtenidos;
        } catch (error: any) {
            console.log("Error en databaseService.getProductos", error);
            throw error;
        }
    },

    updateProducto: async (
        userId: string,
        id: string,
        datos: Partial<Producto>,
    ) => {
        try {
            const docRef = doc(db, COLLECTIONS.PRODUCTOS, id);

            await updateDoc(docRef, {
                ...datos,
                uid: userId,
                updatedAt: serverTimestamp(),
            });
        } catch (error: any) {
            console.log("Error en databaseService.updateProducto", error);
            throw error;
        }
    },

    deleteProducto: async (userId: string, id: string) => {
        try {
            const docRef = doc(db, COLLECTIONS.PRODUCTOS, id);

            await deleteDoc(docRef);
        } catch (error: any) {
            console.log("Error en databaseService.deleteProducto", error);
            throw error;
        }
    },

    addVenta: async (userId: string, venta: Venta) => {
        try {
            const docRef = await addDoc(collection(db, COLLECTIONS.VENTAS), {
                ...venta,
                usuarioId: userId,
                createdAt: serverTimestamp(),
            });

            return docRef.id;
        } catch (error: any) {
            console.log("Error en databaseService.addVenta", error);
            throw error;
        }
    },

    getVentas: async (userId: string, dias: number = 30) => {
        try {
            const fechaInicio = new Date();
            fechaInicio.setDate(fechaInicio.getDate() - dias);

            const q = query(
                collection(db, COLLECTIONS.VENTAS),
                where("usuarioId", "==", userId),
                where("fecha", ">=", fechaInicio),
                orderBy("fecha", "desc"),
            );

            const querySnapShot = await getDocs(q);

            const ventasObtenidas = querySnapShot.docs.map((doc) => {
                const data = doc.data() as Venta;

                return {
                    ...data,
                    idVenta: doc.id,
                };
            });

            return ventasObtenidas;
        } catch (error: any) {
            console.log("Error en databaseService.getVentas", error);
            throw error;
        }
    },

    getVentasPorFecha: async (userId: string, fecha: Date) => {
        try {
            const fechaInicio = new Date(fecha);
            fechaInicio.setHours(0, 0, 0, 0);
            const fechaFin = new Date(fecha);
            fechaFin.setHours(23, 59, 59, 999);

            const q = query(
                collection(db, COLLECTIONS.VENTAS),
                where("usuarioId", "==", userId),
                where("fecha", ">=", fechaInicio),
                where("fecha", "<=", fechaFin),
                orderBy("fecha", "desc"),
            );

            const querySnapShot = await getDocs(q);

            const ventasObtenidas = querySnapShot.docs.map((doc) => {
                const data = doc.data() as Venta;

                return {
                    ...data,
                    idVenta: doc.id,
                };
            });

            return ventasObtenidas;
        } catch (error: any) {
            console.log("Error en databaseService.getVentasPorFecha", error);
            throw error;
        }
    },

    crearUsuario: async (uid: string, email: string) => {
        try {
            const docRef = doc(db, COLLECTIONS.USUARIOS, uid);
            const usuario: Usuario = {
                correo: email,
                nombre: "",
                plan: "GRATIS",
                creditos: 0,
            };

            await setDoc(docRef, {
                ...usuario,
                estado: "activo",
                createdAt: serverTimestamp(),
            });
        } catch (error: any) {
            console.log("Error en databaseService.crearUsuario", error);
            throw error;
        }
    },

    getUsuario: async (uid: string) => {
        try {
            const docRef = doc(db, COLLECTIONS.USUARIOS, uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            const data = docSnap.data() as Usuario;

            return {
                ...data,
                id: docSnap.id,
            } as Usuario;
        } catch (error: any) {
            console.log("Error en databaseService.getUsuario", error);
            throw error;
        }
    },

    updateUsuario: async (uid: string, datos: Partial<Usuario>) => {
        try {
            const docRef = doc(db, COLLECTIONS.USUARIOS, uid);

            await updateDoc(docRef, {
                ...datos,
                updatedAt: serverTimestamp(),
            });
        } catch (error: any) {
            console.log("Error en databaseService.updateUsuario", error);
            throw error;
        }
    },
};
