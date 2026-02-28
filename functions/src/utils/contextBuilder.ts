import * as logger from "firebase-functions/logger";
import { getUserProducts, getUserSales } from "../services/firestoreService";

/**
 * Utilidad para construir el contexto de negocio
 */

/**
 * Calcular el producto más vendido
 */
function calculateMostSoldProduct(
    sales: any[],
    products: any[],
): { name: string; quantity: number; total: number } | null {
    const productSales: {
        [key: string]: { name: string; quantity: number; total: number };
    } = {};

    sales.forEach((sale) => {
        if (sale.items && Array.isArray(sale.items)) {
            sale.items.forEach((item: any) => {
                const productId = item.productId;
                if (!productSales[productId]) {
                    productSales[productId] = {
                        name: item.productName || "Producto desconocido",
                        quantity: 0,
                        total: 0,
                    };
                }
                productSales[productId].quantity += item.quantity || 0;
                productSales[productId].total += item.subtotal || 0;
            });
        }
    });

    if (Object.keys(productSales).length === 0) {
        return null;
    }

    return Object.values(productSales).reduce((prev, current) =>
        current.quantity > prev.quantity ? current : prev,
    );
}

/**
 * Calcular ventas de hoy
 */
function calculateTodaySales(sales: any[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return sales
        .filter((sale) => {
            const saleDate = new Date(sale.fecha?.toDate?.() || sale.fecha);
            saleDate.setHours(0, 0, 0, 0);
            return saleDate.getTime() === today.getTime();
        })
        .reduce((total, sale) => total + (sale.total || 0), 0);
}

/**
 * Calcular ventas de esta semana
 */
function calculateWeekSales(sales: any[]): number {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return sales
        .filter((sale) => {
            const saleDate = new Date(sale.fecha?.toDate?.() || sale.fecha);
            return saleDate >= weekAgo && saleDate <= today;
        })
        .reduce((total, sale) => total + (sale.total || 0), 0);
}

/**
 * Calcular ventas del mes actual
 */
function calculateMonthSales(sales: any[]): number {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    return sales
        .filter((sale) => {
            const saleDate = new Date(sale.fecha?.toDate?.() || sale.fecha);
            return saleDate >= monthStart && saleDate <= today;
        })
        .reduce((total, sale) => total + (sale.total || 0), 0);
}

/**
 * Construir contexto de negocio del usuario para el asistente IA
 * @param userId - UID del usuario
 * @returns Contexto formateado con productos, ventas y métricas
 */
export async function buildBusinessContext(userId: string): Promise<string> {
    try {
        logger.info("buildBusinessContext: iniciando para usuario", {
            userId,
            structuredData: true,
        });

        // Obtener productos y ventas en paralelo
        const [products, sales] = await Promise.all([
            getUserProducts(userId),
            getUserSales(userId),
        ]);

        logger.info("buildBusinessContext: datos obtenidos", {
            userId,
            productCount: products.length,
            salesCount: sales.length,
            structuredData: true,
        });

        // Calcular métricas
        const totalSales = sales.reduce(
            (total, sale) => total + (sale.total || 0),
            0,
        );
        const todaySales = calculateTodaySales(sales);
        const weekSales = calculateWeekSales(sales);
        const monthSales = calculateMonthSales(sales);
        const mostSoldProduct = calculateMostSoldProduct(sales, products);
        const totalTransactions = sales.length;
        const averageTransaction =
            totalTransactions > 0 ? totalSales / totalTransactions : 0;

        // Formatear productos
        const productsText = products.length
            ? products
                  .map(
                      (p) =>
                          `- ${p.nombre || "Sin nombre"}: $${(p.precio || 0).toFixed(2)}`,
                  )
                  .join("\n")
            : "- (Sin productos registrados)";

        // Formatear ventas recientes (últimas 10)
        const recentSalesText = sales.length
            ? sales
                  .slice(0, 10)
                  .map((sale) => {
                      const saleDate = sale.fecha?.toDate?.()
                          ? new Date(sale.fecha.toDate()).toLocaleDateString(
                                "es-MX",
                            )
                          : new Date(sale.fecha).toLocaleDateString("es-MX");
                      return `- ${saleDate}: $${(sale.total || 0).toFixed(2)}`;
                  })
                  .join("\n")
            : "- (Sin ventas registradas)";

        // Construir contexto final
        const context = [
            "=== DATOS REALES DEL NEGOCIO ===",
            "",
            "📊 RESUMEN DE MÉTRICAS:",
            `- Total de ventas: $${totalSales.toFixed(2)}`,
            `- Ventas hoy: $${todaySales.toFixed(2)}`,
            `- Ventas esta semana: $${weekSales.toFixed(2)}`,
            `- Ventas este mes: $${monthSales.toFixed(2)}`,
            `- Total de transacciones: ${totalTransactions}`,
            `- Promedio por venta: $${averageTransaction.toFixed(2)}`,
            mostSoldProduct
                ? `- Producto más vendido: ${mostSoldProduct.name} (${mostSoldProduct.quantity} unidades, $${mostSoldProduct.total.toFixed(2)})`
                : "- Producto más vendido: (sin datos)",
            "",
            "📦 PRODUCTOS REGISTRADOS:",
            productsText,
            "",
            "💰 ÚLTIMAS VENTAS:",
            recentSalesText,
        ].join("\n");

        logger.info("buildBusinessContext: contexto construido exitosamente", {
            userId,
            contextLength: context.length,
            structuredData: true,
        });

        return context;
    } catch (error) {
        logger.error("contextBuilder.buildBusinessContext falló", {
            service: "contextBuilder",
            functionName: "buildBusinessContext",
            userId,
            error: error instanceof Error ? error.message : String(error),
            structuredData: true,
        });
        throw error;
    }
}
