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

/**
 * Obtener métricas precalculadas del negocio desde Firestore
 * @param userId - UID del usuario
 * @returns Documento de métricas o null si no existe
 */
export async function getMetricasResumen(userId: string): Promise<any> {
    try {
        const metricasDoc = await db
            .collection("usuarios")
            .doc(userId)
            .collection("metricas")
            .doc("resumen")
            .get();

        if (!metricasDoc.exists) {
            return null;
        }

        return metricasDoc.data();
    } catch (error) {
        logger.error("firestoreService.getMetricasResumen falló", {
            service: "firestoreService",
            functionName: "getMetricasResumen",
            userId,
            error: error instanceof Error ? error.message : String(error),
            structuredData: true,
        });
        throw error;
    }
}

/**
 * Obtener ventas del usuario en un rango de fechas
 * @param userId - UID del usuario
 * @param fechaInicio - Fecha de inicio del rango
 * @param fechaFin - Fecha de fin del rango
 * @returns Array de ventas en el rango
 */
export async function getVentasPorRango(
    userId: string,
    fechaInicio: Date,
    fechaFin: Date,
): Promise<any[]> {
    try {
        const salesSnapshot = await db
            .collection("ventas")
            .where("usuarioId", "==", userId)
            .where("fecha", ">=", fechaInicio)
            .where("fecha", "<=", fechaFin)
            .orderBy("fecha", "desc")
            .get();

        const sales = salesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        logger.info("firestoreService.getVentasPorRango completado", {
            service: "firestoreService",
            functionName: "getVentasPorRango",
            userId,
            salesCount: sales.length,
            structuredData: true,
        });

        return sales;
    } catch (error) {
        logger.error("firestoreService.getVentasPorRango falló", {
            service: "firestoreService",
            functionName: "getVentasPorRango",
            userId,
            error: error instanceof Error ? error.message : String(error),
            structuredData: true,
        });
        throw error;
    }
}

/**
 * Calcular top N productos más vendidos en un rango de fechas
 * @param userId - UID del usuario
 * @param fechaInicio - Fecha de inicio del rango
 * @param fechaFin - Fecha de fin del rango
 * @param limite - Número máximo de productos a retornar
 * @returns Array de productos ordenados por unidades vendidas (desc)
 */
export async function getTopProductos(
    userId: string,
    fechaInicio: Date,
    fechaFin: Date,
    limite: number = 10,
): Promise<
    Array<{
        nombre: string;
        unidades: number;
        total: number;
        porcentaje: number;
    }>
> {
    try {
        const ventas = await getVentasPorRango(userId, fechaInicio, fechaFin);

        const productsMap = new Map<
            string,
            { nombre: string; unidades: number; total: number }
        >();

        ventas.forEach((venta) => {
            const items = venta.items || [];
            items.forEach((item: any) => {
                const nombre = item?.producto?.nombre || "Producto desconocido";
                const current = productsMap.get(nombre) || {
                    nombre,
                    unidades: 0,
                    total: 0,
                };

                productsMap.set(nombre, {
                    nombre,
                    unidades: current.unidades + (item?.cantidad || 0),
                    total: current.total + (item?.subtotal || 0),
                });
            });
        });

        const totalGeneral = Array.from(productsMap.values()).reduce(
            (acc, p) => acc + p.total,
            0,
        );

        const topProductos = Array.from(productsMap.values())
            .map((product) => ({
                ...product,
                porcentaje:
                    totalGeneral > 0 ? (product.total / totalGeneral) * 100 : 0,
            }))
            .sort((a, b) => {
                if (b.unidades !== a.unidades) {
                    return b.unidades - a.unidades;
                }
                return b.total - a.total;
            })
            .slice(0, limite);

        logger.info("firestoreService.getTopProductos completado", {
            service: "firestoreService",
            functionName: "getTopProductos",
            userId,
            productCount: topProductos.length,
            structuredData: true,
        });

        return topProductos;
    } catch (error) {
        logger.error("firestoreService.getTopProductos falló", {
            service: "firestoreService",
            functionName: "getTopProductos",
            userId,
            error: error instanceof Error ? error.message : String(error),
            structuredData: true,
        });
        throw error;
    }
}

/**
 * Calcular productos menos vendidos en un rango de fechas
 * @param userId - UID del usuario
 * @param fechaInicio - Fecha de inicio del rango
 * @param fechaFin - Fecha de fin del rango
 * @param limite - Número máximo de productos a retornar
 * @returns Array de productos ordenados por unidades vendidas (asc), incluye productos con 0 ventas
 */
export async function getBottomProductos(
    userId: string,
    fechaInicio: Date,
    fechaFin: Date,
    limite: number = 10,
): Promise<
    Array<{
        nombre: string;
        unidades: number;
        total: number;
        porcentaje: number;
        tieneCeroVentas: boolean;
    }>
> {
    try {
        const [ventas, todosProductos] = await Promise.all([
            getVentasPorRango(userId, fechaInicio, fechaFin),
            getUserProducts(userId),
        ]);

        const productsMap = new Map<
            string,
            {
                nombre: string;
                unidades: number;
                total: number;
                tieneCeroVentas: boolean;
            }
        >();

        todosProductos.forEach((producto) => {
            const nombre = producto.nombre;
            productsMap.set(nombre, {
                nombre,
                unidades: 0,
                total: 0,
                tieneCeroVentas: true,
            });
        });

        ventas.forEach((venta) => {
            const items = venta.items || [];
            items.forEach((item: any) => {
                const nombre = item?.producto?.nombre || "Producto desconocido";
                const current = productsMap.get(nombre) || {
                    nombre,
                    unidades: 0,
                    total: 0,
                    tieneCeroVentas: false,
                };

                productsMap.set(nombre, {
                    nombre,
                    unidades: current.unidades + (item?.cantidad || 0),
                    total: current.total + (item?.subtotal || 0),
                    tieneCeroVentas: false,
                });
            });
        });

        const totalGeneral = Array.from(productsMap.values()).reduce(
            (acc, p) => acc + p.total,
            0,
        );

        const bottomProductos = Array.from(productsMap.values())
            .map((product) => ({
                ...product,
                porcentaje:
                    totalGeneral > 0 ? (product.total / totalGeneral) * 100 : 0,
            }))
            .sort((a, b) => {
                if (a.unidades !== b.unidades) {
                    return a.unidades - b.unidades;
                }
                return a.total - b.total;
            })
            .slice(0, limite);

        logger.info("firestoreService.getBottomProductos completado", {
            service: "firestoreService",
            functionName: "getBottomProductos",
            userId,
            productCount: bottomProductos.length,
            structuredData: true,
        });

        return bottomProductos;
    } catch (error) {
        logger.error("firestoreService.getBottomProductos falló", {
            service: "firestoreService",
            functionName: "getBottomProductos",
            userId,
            error: error instanceof Error ? error.message : String(error),
            structuredData: true,
        });
        throw error;
    }
}
