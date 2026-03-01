import {
    Timestamp,
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import {
    COLLECTIONS,
    MetricasNegocio,
    Producto,
    ProductoMetrica,
    Usuario,
    Venta,
} from "../store/types";

const METRICAS_DOC_ID = "resumen";
const METRICAS_SUBCOLLECTION = "metricas";
const MAX_RANKING_ITEMS = 10;
const ALL_SALES_LOOKBACK_DAYS = 36500;

const toDate = (value: any): Date => {
    if (value instanceof Date) {
        return value;
    }

    if (value?.toDate && typeof value.toDate === "function") {
        return value.toDate();
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return new Date();
    }

    return parsed;
};

const startOfDay = (date: Date): Date => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
};

const startOfWeek = (date: Date): Date => {
    const result = startOfDay(date);
    const day = result.getDay();
    const distanceToMonday = (day + 6) % 7;
    result.setDate(result.getDate() - distanceToMonday);
    return result;
};

const startOfMonth = (date: Date): Date =>
    new Date(date.getFullYear(), date.getMonth(), 1);

const diffDays = (from: Date, to: Date): number => {
    const fromDay = startOfDay(from).getTime();
    const toDay = startOfDay(to).getTime();
    return Math.max(0, Math.floor((toDay - fromDay) / (1000 * 60 * 60 * 24)));
};

const buildProductMapFromSales = (
    sales: Venta[],
): Map<string, ProductoMetrica & { ultimaVenta?: Date | null }> => {
    const productsMap = new Map<
        string,
        ProductoMetrica & { ultimaVenta?: Date | null }
    >();

    sales.forEach((sale) => {
        const saleDate = toDate((sale as any).fecha);
        (sale.items || []).forEach((item) => {
            const productName =
                item?.producto?.nombre || "Producto desconocido";
            const current = productsMap.get(productName) || {
                nombre: productName,
                unidades: 0,
                total: 0,
                porcentaje: 0,
                tieneCeroVentas: false,
                diasSinVentas: 0,
                ultimaVenta: null,
            };

            const updated: ProductoMetrica & { ultimaVenta?: Date | null } = {
                ...current,
                unidades: current.unidades + (item?.cantidad || 0),
                total: current.total + (item?.subtotal || 0),
                tieneCeroVentas: false,
            };

            if (!updated.ultimaVenta || saleDate > updated.ultimaVenta) {
                updated.ultimaVenta = saleDate;
            }

            productsMap.set(productName, updated);
        });
    });

    return productsMap;
};

const ensureBottomZeroSales = (
    productsMap: Map<string, ProductoMetrica & { ultimaVenta?: Date | null }>,
    productosActuales: Producto[],
    now: Date,
) => {
    productosActuales.forEach((producto) => {
        const nombre = producto.nombre;

        if (!productsMap.has(nombre)) {
            productsMap.set(nombre, {
                nombre,
                unidades: 0,
                total: 0,
                porcentaje: 0,
                tieneCeroVentas: true,
                diasSinVentas: diffDays(now, now),
                ultimaVenta: null,
            });
        }
    });
};

const recalculateRankingAndPercentages = (
    productsMap: Map<string, ProductoMetrica & { ultimaVenta?: Date | null }>,
    now: Date,
): { topProductos: ProductoMetrica[]; bottomProductos: ProductoMetrica[] } => {
    const totalGeneral = Array.from(productsMap.values()).reduce(
        (acc, product) => acc + product.total,
        0,
    );

    const normalizedProducts: ProductoMetrica[] = Array.from(
        productsMap.values(),
    ).map((product) => {
        const porcentaje =
            totalGeneral > 0 ? (product.total / totalGeneral) * 100 : 0;
        const diasSinVentas = product.tieneCeroVentas
            ? diffDays(now, now)
            : product.ultimaVenta
              ? diffDays(product.ultimaVenta, now)
              : 0;

        return {
            nombre: product.nombre,
            unidades: product.unidades,
            total: product.total,
            porcentaje,
            tieneCeroVentas: product.tieneCeroVentas,
            diasSinVentas,
        };
    });

    const topProductos = [...normalizedProducts]
        .sort((a, b) => {
            if (b.unidades !== a.unidades) {
                return b.unidades - a.unidades;
            }
            if (b.total !== a.total) {
                return b.total - a.total;
            }
            return a.nombre.localeCompare(b.nombre, "es");
        })
        .slice(0, MAX_RANKING_ITEMS);

    const bottomProductos = [...normalizedProducts]
        .sort((a, b) => {
            if (a.unidades !== b.unidades) {
                return a.unidades - b.unidades;
            }
            if (a.total !== b.total) {
                return a.total - b.total;
            }
            return a.nombre.localeCompare(b.nombre, "es");
        })
        .slice(0, MAX_RANKING_ITEMS);

    return { topProductos, bottomProductos };
};

const buildMetricasFromSales = (
    sales: Venta[],
    productosActuales: Producto[],
    now: Date,
): MetricasNegocio & {
    _totalVentasAcumuladas: number;
    _totalTransaccionesAcumuladas: number;
} => {
    const nowDayStart = startOfDay(now);
    const nextDayStart = new Date(nowDayStart);
    nextDayStart.setDate(nextDayStart.getDate() + 1);

    const weekStart = startOfWeek(now);
    const previousWeekStart = new Date(weekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);

    const monthStart = startOfMonth(now);
    const previousMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
    );

    let ventasHoy = 0;
    let transaccionesHoy = 0;
    let ventasSemanaActual = 0;
    let ventasSemanaPasada = 0;
    let ventasMesActual = 0;
    let ventasMesAnterior = 0;

    let totalVentasAcumuladas = 0;
    let totalTransaccionesAcumuladas = 0;

    let ultimaVenta: Date | null = null;

    sales.forEach((sale) => {
        const saleDate = toDate((sale as any).fecha);
        const saleTotal = sale.total || 0;

        totalVentasAcumuladas += saleTotal;
        totalTransaccionesAcumuladas += 1;

        if (!ultimaVenta || saleDate > ultimaVenta) {
            ultimaVenta = saleDate;
        }

        if (saleDate >= nowDayStart && saleDate < nextDayStart) {
            ventasHoy += saleTotal;
            transaccionesHoy += 1;
        }

        if (saleDate >= weekStart && saleDate <= now) {
            ventasSemanaActual += saleTotal;
        } else if (saleDate >= previousWeekStart && saleDate < weekStart) {
            ventasSemanaPasada += saleTotal;
        }

        if (saleDate >= monthStart && saleDate <= now) {
            ventasMesActual += saleTotal;
        } else if (saleDate >= previousMonthStart && saleDate < monthStart) {
            ventasMesAnterior += saleTotal;
        }
    });

    const productsMap = buildProductMapFromSales(sales);
    ensureBottomZeroSales(productsMap, productosActuales, now);
    const rankings = recalculateRankingAndPercentages(productsMap, now);

    const diasSinVentas = ultimaVenta ? diffDays(ultimaVenta, now) : 0;
    const ticketPromedio =
        totalTransaccionesAcumuladas > 0
            ? totalVentasAcumuladas / totalTransaccionesAcumuladas
            : 0;

    return {
        ventasHoy,
        transaccionesHoy,
        ventasSemanaActual,
        ventasSemanaPasada,
        ventasMesActual,
        ventasMesAnterior,
        ticketPromedio,
        topProductos: rankings.topProductos,
        bottomProductos: rankings.bottomProductos,
        diasSinVentas,
        ultimaActualizacion: now,
        _totalVentasAcumuladas: totalVentasAcumuladas,
        _totalTransaccionesAcumuladas: totalTransaccionesAcumuladas,
    };
};

const metricasDocRef = (uid: string) =>
    doc(db, COLLECTIONS.USUARIOS, uid, METRICAS_SUBCOLLECTION, METRICAS_DOC_ID);

export const databaseService = {
    // Añadir un producto a la colección, cabe mencionar que el producto ya debe de venir completo desde el momento en el que se manda para agregarlo a la colección.
    addProducto: async (prod: Producto) => {
        try {
            // Si el producto ya tiene un ID (generado en frontend), usarlo directamente
            if (prod.id) {
                const docRef = doc(db, COLLECTIONS.PRODUCTOS, prod.id);
                await setDoc(docRef, {
                    ...prod,
                    createdAt: serverTimestamp(),
                });
                return prod.id;
            } else {
                // Si no tiene ID, dejar que Firestore lo genere (para backward compatibility)
                const docRef = await addDoc(
                    collection(db, COLLECTIONS.PRODUCTOS),
                    {
                        ...prod,
                        createdAt: serverTimestamp(),
                    },
                );

                // Guardar el ID generado como campo en el documento
                await updateDoc(docRef, {
                    id: docRef.id,
                });

                return docRef.id;
            }
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
                where("usuarioId", "==", userId),
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
                usuarioId: userId,
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

    getMetricasNegocio: async (
        uid: string,
    ): Promise<MetricasNegocio | null> => {
        try {
            const docRef = metricasDocRef(uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            const data = docSnap.data() as any;

            return {
                ventasHoy: data.ventasHoy || 0,
                transaccionesHoy: data.transaccionesHoy || 0,
                ventasSemanaActual: data.ventasSemanaActual || 0,
                ventasSemanaPasada: data.ventasSemanaPasada || 0,
                ventasMesActual: data.ventasMesActual || 0,
                ventasMesAnterior: data.ventasMesAnterior || 0,
                ticketPromedio: data.ticketPromedio || 0,
                topProductos: data.topProductos || [],
                bottomProductos: data.bottomProductos || [],
                diasSinVentas: data.diasSinVentas || 0,
                ultimaActualizacion: toDate(data.ultimaActualizacion),
            };
        } catch (error: any) {
            console.log("Error en databaseService.getMetricasNegocio", error);
            throw error;
        }
    },

    actualizarMetricas: async (
        uid: string,
        ventaNueva: Venta,
        productosActuales: Producto[],
    ): Promise<void> => {
        try {
            const docRef = metricasDocRef(uid);

            await runTransaction(db, async (transaction) => {
                const now = new Date();
                const saleDate = toDate((ventaNueva as any).fecha);
                const docSnap = await transaction.get(docRef);

                if (!docSnap.exists()) {
                    const ventasHistoricas = await databaseService.getVentas(
                        uid,
                        ALL_SALES_LOOKBACK_DAYS,
                    );

                    const metricasIniciales = buildMetricasFromSales(
                        ventasHistoricas,
                        productosActuales,
                        now,
                    );

                    transaction.set(docRef, {
                        ...metricasIniciales,
                        ultimaActualizacion: Timestamp.now(),
                    });

                    return;
                }

                const existing = docSnap.data() as any;
                const lastUpdate = existing.ultimaActualizacion
                    ? toDate(existing.ultimaActualizacion)
                    : now;

                const nowDayStart = startOfDay(now);
                const nextDayStart = new Date(nowDayStart);
                nextDayStart.setDate(nextDayStart.getDate() + 1);

                const nowWeekStart = startOfWeek(now);
                const nowMonthStart = startOfMonth(now);

                let ventasHoy = existing.ventasHoy || 0;
                let transaccionesHoy = existing.transaccionesHoy || 0;
                let ventasSemanaActual = existing.ventasSemanaActual || 0;
                let ventasSemanaPasada = existing.ventasSemanaPasada || 0;
                let ventasMesActual = existing.ventasMesActual || 0;
                let ventasMesAnterior = existing.ventasMesAnterior || 0;

                if (
                    startOfDay(lastUpdate).getTime() !== nowDayStart.getTime()
                ) {
                    ventasHoy = 0;
                    transaccionesHoy = 0;
                }

                if (
                    startOfWeek(lastUpdate).getTime() !== nowWeekStart.getTime()
                ) {
                    ventasSemanaPasada = ventasSemanaActual;
                    ventasSemanaActual = 0;
                }

                if (
                    startOfMonth(lastUpdate).getTime() !==
                    nowMonthStart.getTime()
                ) {
                    ventasMesAnterior = ventasMesActual;
                    ventasMesActual = 0;
                }

                if (saleDate >= nowDayStart && saleDate < nextDayStart) {
                    ventasHoy += ventaNueva.total || 0;
                }

                if (saleDate >= nowWeekStart && saleDate <= now) {
                    ventasSemanaActual += ventaNueva.total || 0;
                }

                if (saleDate >= nowMonthStart && saleDate <= now) {
                    ventasMesActual += ventaNueva.total || 0;
                }

                transaccionesHoy += 1;

                const productsMap = new Map<
                    string,
                    ProductoMetrica & { ultimaVenta?: Date | null }
                >();

                [
                    ...(existing.topProductos || []),
                    ...(existing.bottomProductos || []),
                ].forEach((product: any) => {
                    if (!product?.nombre) {
                        return;
                    }

                    productsMap.set(product.nombre, {
                        nombre: product.nombre,
                        unidades: product.unidades || 0,
                        total: product.total || 0,
                        porcentaje: product.porcentaje || 0,
                        tieneCeroVentas: product.tieneCeroVentas || false,
                        diasSinVentas: product.diasSinVentas || 0,
                        ultimaVenta: saleDate,
                    });
                });

                (ventaNueva.items || []).forEach((item) => {
                    const productName =
                        item?.producto?.nombre || "Producto desconocido";
                    const current = productsMap.get(productName) || {
                        nombre: productName,
                        unidades: 0,
                        total: 0,
                        porcentaje: 0,
                        tieneCeroVentas: false,
                        diasSinVentas: 0,
                        ultimaVenta: null,
                    };

                    productsMap.set(productName, {
                        ...current,
                        unidades: current.unidades + (item?.cantidad || 0),
                        total: current.total + (item?.subtotal || 0),
                        tieneCeroVentas: false,
                        ultimaVenta: saleDate,
                    });
                });

                ensureBottomZeroSales(productsMap, productosActuales, now);

                const rankings = recalculateRankingAndPercentages(
                    productsMap,
                    now,
                );

                const previousTotalVentas =
                    existing._totalVentasAcumuladas || 0;
                const previousTotalTransacciones =
                    existing._totalTransaccionesAcumuladas || 0;

                const totalVentasAcumuladas =
                    previousTotalVentas + (ventaNueva.total || 0);
                const totalTransaccionesAcumuladas =
                    previousTotalTransacciones + 1;

                const ticketPromedio =
                    totalTransaccionesAcumuladas > 0
                        ? totalVentasAcumuladas / totalTransaccionesAcumuladas
                        : 0;

                const diasSinVentas = diffDays(saleDate, now);

                transaction.update(docRef, {
                    ventasHoy,
                    transaccionesHoy,
                    ventasSemanaActual,
                    ventasSemanaPasada,
                    ventasMesActual,
                    ventasMesAnterior,
                    ticketPromedio,
                    topProductos: rankings.topProductos,
                    bottomProductos: rankings.bottomProductos,
                    diasSinVentas,
                    ultimaActualizacion: Timestamp.now(),
                    _totalVentasAcumuladas: totalVentasAcumuladas,
                    _totalTransaccionesAcumuladas: totalTransaccionesAcumuladas,
                });
            });
        } catch (error: any) {
            console.log("Error en databaseService.actualizarMetricas", error);
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

    crearAIUsageDoc: async (uid: string) => {
        try {
            // Crear documento de uso de IA en usuarios/{uid}/ai_usage/analytics
            const docRef = doc(
                db,
                COLLECTIONS.USUARIOS,
                uid,
                "ai_usage",
                "analytics",
            );

            // Calcular nextResetDate (fecha actual + 30 días)
            const nextResetDate = new Date();
            nextResetDate.setDate(nextResetDate.getDate() + 30);

            await setDoc(docRef, {
                queriesUsedThisMonth: 0,
                nextResetDate: nextResetDate,
                totalQueriesAllTime: 0,
                priceUpdatesUsedThisMonth: 0,
                lastQueryAt: null,
            });
        } catch (error: any) {
            console.log("Error en databaseService.crearAIUsageDoc", error);
            throw error;
        }
    },

    getAIUsageDoc: async (uid: string) => {
        try {
            // Leer documento de uso de IA desde usuarios/{uid}/ai_usage/analytics
            const docRef = doc(
                db,
                COLLECTIONS.USUARIOS,
                uid,
                "ai_usage",
                "analytics",
            );
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            return docSnap.data();
        } catch (error: any) {
            console.log("Error en databaseService.getAIUsageDoc", error);
            throw error;
        }
    },
};
