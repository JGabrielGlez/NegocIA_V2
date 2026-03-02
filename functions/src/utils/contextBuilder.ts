import * as logger from "firebase-functions/logger";
import { getMetricasResumen } from "../services/firestoreService";

/**
 * Interfaz para producto en métricas
 */
interface ProductoMetrica {
    nombre: string;
    unidades: number;
    total: number;
    porcentaje: number;
    tieneCeroVentas: boolean;
    diasSinVentas: number;
}

/**
 * Interfaz para métricas de negocio
 */
interface MetricasNegocio {
    ventasHoy: number;
    transaccionesHoy: number;
    ventasSemanaActual: number;
    ventasSemanaPasada: number;
    ventasMesActual: number;
    ventasMesAnterior: number;
    ticketPromedio: number;
    topProductos: ProductoMetrica[];
    bottomProductos: ProductoMetrica[];
    diasSinVentas: number;
    ultimaActualizacion: Date;
}

/**
 * Construir contexto enriquecido de negocio para el asistente IA
 * @param userId - UID del usuario
 * @param nombreNegocio - Nombre del negocio
 * @param plan - Plan actual (GRATIS o PRO)
 * @returns Contexto formateado con métricas e información del negocio
 */
export async function buildContext(
    userId: string,
    nombreNegocio: string,
    plan: "GRATIS" | "PRO",
): Promise<string> {
    try {
        const metricas = await getMetricasResumen(userId);

        if (!metricas) {
            logger.info("buildContext: sin datos de ventas", {
                userId,
                hasMetrics: false,
                structuredData: true,
            });

            return `NEGOCIO: ${nombreNegocio}
FECHA Y HORA ACTUAL: ${new Date().toLocaleString("es-MX")}
PLAN: ${plan}

Sin datos de ventas registrados aún. Ayuda al usuario a registrar sus primeras ventas.`;
        }

        const m = metricas as MetricasNegocio;
        const fechaActual = new Date().toLocaleString("es-MX");
        const porcentajoCambioSemanal =
            m.ventasSemanaPasada > 0
                ? (
                      ((m.ventasSemanaActual - m.ventasSemanaPasada) /
                          m.ventasSemanaPasada) *
                      100
                  ).toFixed(1)
                : "N/A";

        let contexto = `NEGOCIO: ${nombreNegocio}
FECHA Y HORA ACTUAL: ${fechaActual}
PLAN: ${plan}

MÉTRICAS DE VENTAS:
- Hoy: $${m.ventasHoy.toFixed(2)} en ${m.transaccionesHoy} transacciones
- Esta semana: $${m.ventasSemanaActual.toFixed(2)}
- Semana pasada: $${m.ventasSemanaPasada.toFixed(2)} (${porcentajoCambioSemanal}% vs semana anterior)
- Este mes: $${m.ventasMesActual.toFixed(2)}
- Mes anterior: $${m.ventasMesAnterior.toFixed(2)}
- Ticket promedio: $${m.ticketPromedio.toFixed(2)}
- Días sin ventas este mes: ${m.diasSinVentas}

TOP PRODUCTOS MÁS VENDIDOS:`;

        m.topProductos.forEach((producto: ProductoMetrica, index: number) => {
            contexto += `
${index + 1}. ${producto.nombre} — ${producto.unidades} unidades — $${producto.total.toFixed(
                2,
            )} (${producto.porcentaje.toFixed(1)}%)`;
        });

        contexto += `

PRODUCTOS CON MENOS MOVIMIENTO:`;

        m.bottomProductos.forEach(
            (producto: ProductoMetrica, index: number) => {
                contexto += `
${index + 1}. ${producto.nombre} — ${producto.unidades} unidades (Sin ventas: ${
                    producto.tieneCeroVentas ? "Sí" : "No"
                })`;
            },
        );

        logger.info("buildContext: contexto construido exitosamente", {
            userId,
            nombreNegocio,
            plan,
            topProductosCount: m.topProductos.length,
            bottomProductosCount: m.bottomProductos.length,
            structuredData: true,
        });

        return contexto;
    } catch (error) {
        logger.error("buildContext: error al construir contexto", {
            service: "contextBuilder",
            functionName: "buildContext",
            userId,
            error: error instanceof Error ? error.message : String(error),
            structuredData: true,
        });
        throw error;
    }
}
