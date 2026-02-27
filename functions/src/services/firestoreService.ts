import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

/**
 * Servicio para interactuar con Firestore
 */

const db = admin.firestore();

/**
 * Obtener datos del usuario desde Firestore
 * @param userId - UID del usuario
 * @returns Datos del usuario
 */
export async function getUserData(userId: string): Promise<any> {
    try {
        const userDoc = await db.collection("usuarios").doc(userId).get();

        if (!userDoc.exists) {
            return null;
        }

        return userDoc.data();
    } catch (error) {
        logger.error("firestoreService.getUserData falló", {
            service: "firestoreService",
            functionName: "getUserData",
            userId,
            error: error instanceof Error ? error.message : String(error),
            structuredData: true,
        });
        throw error;
    }
}

/**
 * Actualizar datos del usuario en Firestore
 * @param userId - UID del usuario
 * @param data - Datos a actualizar
 */
export async function updateUserData(userId: string, data: any): Promise<void> {
    try {
        // TODO: Implementar lógica de escritura en Firestore
        throw new Error("updateUserData no implementado aún");
    } catch (error) {
        logger.error("firestoreService.updateUserData falló", {
            service: "firestoreService",
            functionName: "updateUserData",
            userId,
            hasData: Boolean(data),
            error: error instanceof Error ? error.message : String(error),
            structuredData: true,
        });
        throw error;
    }
}

/**
 * Obtener productos del usuario desde Firestore
 * @param userId - UID del usuario
 * @returns Array de productos
 */
export async function getUserProducts(userId: string): Promise<any[]> {
    try {
        const productsSnapshot = await db
            .collection("productos")
            .where("usuarioId", "==", userId)
            .get();

        const products = productsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return products;
    } catch (error) {
        logger.error("firestoreService.getUserProducts falló", {
            service: "firestoreService",
            functionName: "getUserProducts",
            userId,
            error: error instanceof Error ? error.message : String(error),
            structuredData: true,
        });
        throw error;
    }
}

/**
 * Obtener ventas del usuario desde Firestore
 * @param userId - UID del usuario
 * @returns Array de ventas
 */
export async function getUserSales(userId: string): Promise<any[]> {
    try {
        const salesSnapshot = await db
            .collection("ventas")
            .where("usuarioId", "==", userId)
            .get();

        const sales = salesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return sales;
    } catch (error) {
        logger.error("firestoreService.getUserSales falló", {
            service: "firestoreService",
            functionName: "getUserSales",
            userId,
            error: error instanceof Error ? error.message : String(error),
            structuredData: true,
        });
        throw error;
    }
}
