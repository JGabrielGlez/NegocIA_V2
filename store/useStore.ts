import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { databaseService } from "../firebase/databaseService";
import {
    ItemVenta,
    OperacionPendienteProducto,
    Producto,
    Venta,
} from "./types";
import { useAuthStore } from "./useAuthStore";
// En este archivo se define qupe es lo que tiene la store de zustand, no se usa en otro lado

interface AppState {
    // Se define qué tiene la store completa
    // Nota: como el archivo de types es un tipo declaration file, no es necesario hacer la importacion TS lo reconoce en automático
    productos: Producto[];
    ventas: Venta[];
    ventasPendientes: Venta[];
    productosPendientes: OperacionPendienteProducto[];
    carrito: ItemVenta[];

    obtenerTotalCarrito: () => number;
    vaciarCarrito: () => void;
    cantidadProductos: () => number;

    agregarAlCarrito: (idProducto: string) => void;

    // TODO recibirá el string del id del producto y se reducirá su cantidad en 1, cuando llegue a 0, se elimina del carrito, eso checará siempre el método, que lo haré hasta el final
    eliminarDelCarrito: (idProducto: string) => void;

    // Elimina completamente un item del carrito sin importar la cantidad
    eliminarItemCompleto: (idProducto: string) => void;

    // CRUD básico
    agregarProducto: (prod: Producto) => void;
    eliminarProducto: (id: string) => void;

    // el partial sirve para actualizar solo x o x's cosas del objeto, sin necesidad de estar haciendo un nuevo método para cuando se quiera cambiar solo el nombre, precio, etc.
    actualizarProducto: (id: string, datos: Partial<Producto>) => void;
    obtenerProductoPorId: (id: string) => Producto | undefined;

    //  ------------------- VENTAS ---------------------
    // Una vez se imprima una venta, y se cobre, esta no se puede modificar por ningún motivo
    agregarVenta: () => void;
    sincronizarVentasLocales: () => Promise<void>;
    sincronizarProductosLocales: () => Promise<void>;

    // ---------------- Utilidades -------------------
    calcularVentasHoy: () => number;
    obtenerTotalVentas: () => number;
    limpiarStore: () => void;
    cargarProductosDesdeFirestore: (userId: string) => Promise<void>;
    cargarVentasDesdeFirestore: (userId: string) => Promise<void>;
    setProductos: (productos: Producto[]) => void;
    setVentas: (ventas: Venta[]) => void;
}

export const useStore = create<AppState>()(
    devtools(
        persist(
            (set, get) => ({
                // Aquí va la definición de cada uno de los métodos de la interfaz
                // Estado inicial: vacío
                productos: [],
                carrito: [],
                ventas: [],
                ventasPendientes: [],
                productosPendientes: [],

                vaciarCarrito: () =>
                    set(() => ({
                        carrito: [],
                    })),

                cantidadProductos: () =>
                    get().carrito.reduce(
                        (contador, productos) => contador + productos.cantidad,
                        0,
                    ),

                agregarAlCarrito: (idProducto) =>
                    set((state) => {
                        // Busco el producto dentro del carrito
                        const existe = state.carrito.find(
                            (productoBuscado: ItemVenta) =>
                                productoBuscado.producto.id === idProducto,
                        );

                        // Ya tengo la manera de validar si existe, en caso de que no, se agrega ese item venta , en caso contrario, se aumenta su cantidad
                        if (existe === undefined) {
                            // Voy a buscar dentro del arreglo de productos, para traerme ese objeto en específico
                            const productoSeleccionado = state.productos.find(
                                (prod: Producto) => prod.id === idProducto,
                            )!;

                            const nuevoItemVenta = {
                                producto: productoSeleccionado,
                                cantidad: 1,
                                subtotal: productoSeleccionado.precio,
                            };

                            // Ya tengo lo que es el producto, ahora me falta agregarlo al carrito
                            return {
                                // Ya tengo lo que es el producto, ahora me falta agregarlo al carrito
                                carrito: [...state.carrito, nuevoItemVenta],
                            };
                        }

                        // Este es el caso en el que ya exista dentro del carrito, por lo que debo de aumentarle a ese item su cantidad y
                        return {
                            carrito: state.carrito.map((item) =>
                                item.producto.id === idProducto
                                    ? {
                                          ...item,
                                          cantidad: item.cantidad + 1,
                                          subtotal:
                                              (item.cantidad + 1) *
                                              item.producto.precio,
                                      }
                                    : item,
                            ),
                        };
                    }),

                eliminarDelCarrito: (idProducto) =>
                    set((state) => {
                        // Buscar el item en el carrito
                        const itemExistente = state.carrito.find(
                            (item) => item.producto.id === idProducto,
                        );

                        // Si no existe en el carrito, no hacer nada
                        if (!itemExistente) {
                            console.warn(
                                "No se puede eliminar: producto no está en el carrito",
                            );
                            return state;
                        }

                        // Si la cantidad es 1, eliminar el item completamente
                        if (itemExistente.cantidad === 1) {
                            return {
                                carrito: state.carrito.filter(
                                    (item) => item.producto.id !== idProducto,
                                ),
                            };
                        }

                        // Si la cantidad es mayor a 1, reducir en 1 y recalcular subtotal
                        return {
                            carrito: state.carrito.map((item) =>
                                item.producto.id === idProducto
                                    ? {
                                          ...item,
                                          cantidad: item.cantidad - 1,
                                          subtotal:
                                              (item.cantidad - 1) *
                                              item.producto.precio,
                                      }
                                    : item,
                            ),
                        };
                    }),

                eliminarItemCompleto: (idProducto) =>
                    set((state) => ({
                        carrito: state.carrito.filter(
                            (item) => item.producto.id !== idProducto,
                        ),
                    })),

                obtenerTotalCarrito: () =>
                    // Con esto se obtiene el estado actual del carrito
                    get().carrito.reduce(
                        (acumulador, itemActual) =>
                            acumulador + itemActual.subtotal,
                        0,
                    ),
                // Estos son todos los métodos
                agregarProducto: (productoCompleto) => {
                    // 1. Agregar localmente primero (operación síncrona)
                    set((state) => ({
                        productos: [...state.productos, productoCompleto],
                    }));

                    // 2. Intentar sincronizar con Firestore (asíncrono, no bloquea)
                    // Solo sincronizar si el producto tiene ID (fue generado en frontend)
                    if (productoCompleto.id) {
                        databaseService
                            .addProducto(productoCompleto)
                            .then(() => {
                                console.log(
                                    "✅ Producto agregado a Firestore:",
                                    productoCompleto.id,
                                );
                            })
                            .catch((error) => {
                                console.error(
                                    "⚠️ Error al agregar producto a Firestore (agregado local exitoso):",
                                    error,
                                );
                                // Agregar a la cola de operaciones pendientes
                                const operacion: OperacionPendienteProducto = {
                                    id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                    tipo: "create",
                                    productoId: productoCompleto.id!,
                                    producto: productoCompleto,
                                    timestamp: new Date(),
                                };
                                set((state) => ({
                                    productosPendientes: [
                                        ...state.productosPendientes,
                                        operacion,
                                    ],
                                }));
                            });
                    }
                },

                eliminarProducto: (id) => {
                    // 1. Eliminar localmente primero (operación síncrona)
                    set((state) => ({
                        productos: state.productos.filter((p) => p.id !== id),
                    }));

                    // 2. Intentar sincronizar con Firestore (asíncrono, no bloquea)
                    const usuario = useAuthStore.getState().usuario;
                    if (usuario?.uid && id) {
                        databaseService
                            .deleteProducto(usuario.uid, id)
                            .then(() => {
                                console.log(
                                    "✅ Producto eliminado de Firestore:",
                                    id,
                                );
                            })
                            .catch((error) => {
                                console.error(
                                    "⚠️ Error al eliminar producto de Firestore (eliminado local exitoso):",
                                    error,
                                );
                                // Agregar a la cola de operaciones pendientes
                                const operacion: OperacionPendienteProducto = {
                                    id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                    tipo: "delete",
                                    productoId: id,
                                    timestamp: new Date(),
                                };
                                set((state) => ({
                                    productosPendientes: [
                                        ...state.productosPendientes,
                                        operacion,
                                    ],
                                }));
                            });
                    }
                },

                actualizarProducto: (id, datos) => {
                    // 1. Actualizar localmente primero (operación síncrona)
                    set((state) => ({
                        productos: state.productos.map((producto) =>
                            producto.id === id
                                ? {
                                      ...producto,
                                      ...datos,
                                  }
                                : producto,
                        ),
                    }));

                    // 2. Intentar sincronizar con Firestore (asíncrono, no bloquea)
                    const usuario = useAuthStore.getState().usuario;
                    if (usuario?.uid && id) {
                        databaseService
                            .updateProducto(usuario.uid, id, datos)
                            .then(() => {
                                console.log(
                                    "✅ Producto actualizado en Firestore:",
                                    id,
                                );
                            })
                            .catch((error) => {
                                console.error(
                                    "⚠️ Error al actualizar producto en Firestore (actualizado local exitoso):",
                                    error,
                                );
                                // Agregar a la cola de operaciones pendientes
                                const operacion: OperacionPendienteProducto = {
                                    id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                    tipo: "update",
                                    productoId: id,
                                    datos,
                                    timestamp: new Date(),
                                };
                                set((state) => ({
                                    productosPendientes: [
                                        ...state.productosPendientes,
                                        operacion,
                                    ],
                                }));
                            });
                    }
                },

                obtenerProductoPorId: (id) => {
                    // Se usa get para acceder a la lista de productos actual

                    // Estoy declarando un objeto con productos, y se usa la destructuracion para no tener que estar llamando por ejemplo productos.id, solo uso el id y ya está, la destructuración es para extraer solo lo que está dentro de ese objeto que se obtuvo
                    const { productos } = get();

                    return productos.find((p) => p.id === id);
                },

                agregarVenta: () => {
                    const ventaNueva: Venta = {
                        idVenta: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        fecha: new Date(),
                        items: get().carrito,
                        total: get().obtenerTotalCarrito(),
                    };

                    set((state) => ({
                        ventas: [...state.ventas, ventaNueva],
                        ventasPendientes: [
                            ...state.ventasPendientes,
                            ventaNueva,
                        ],
                    }));

                    const userId = useAuthStore.getState().usuario?.uid;

                    if (!userId) {
                        console.warn(
                            "No se pudo sincronizar la venta: usuario no autenticado",
                        );
                        return;
                    }

                    databaseService
                        .addVenta(userId, ventaNueva)
                        .then(() => {
                            set((state) => ({
                                ventasPendientes: state.ventasPendientes.filter(
                                    (venta) =>
                                        venta.idVenta !== ventaNueva.idVenta,
                                ),
                            }));

                            databaseService
                                .actualizarMetricas(
                                    userId,
                                    ventaNueva,
                                    get().productos,
                                )
                                .catch((error) =>
                                    console.error(
                                        "⚠️ Error actualizando métricas:",
                                        error,
                                    ),
                                );
                        })
                        .catch((error) => {
                            console.log(
                                "Error al sincronizar venta con Firestore",
                                error,
                            );
                        });
                },

                sincronizarVentasLocales: async () => {
                    const userId = useAuthStore.getState().usuario?.uid;

                    if (!userId) {
                        console.warn(
                            "No se pudo sincronizar ventas: usuario no autenticado",
                        );
                        return;
                    }

                    const ventasPendientes = get().ventasPendientes;

                    if (ventasPendientes.length === 0) {
                        return;
                    }

                    const resultados = await Promise.allSettled(
                        ventasPendientes.map((venta) =>
                            databaseService.addVenta(userId, venta),
                        ),
                    );

                    const pendientesRestantes = ventasPendientes.filter(
                        (_venta, index) =>
                            resultados[index].status !== "fulfilled",
                    );

                    set(() => ({
                        ventasPendientes: pendientesRestantes,
                    }));
                },

                sincronizarProductosLocales: async () => {
                    const userId = useAuthStore.getState().usuario?.uid;

                    if (!userId) {
                        console.warn(
                            "No se pudo sincronizar productos: usuario no autenticado",
                        );
                        return;
                    }

                    const productosPendientes = get().productosPendientes;

                    if (productosPendientes.length === 0) {
                        return;
                    }

                    console.log(
                        `🔄 Sincronizando ${productosPendientes.length} operaciones de productos pendientes...`,
                    );

                    // Ordenar por timestamp para ejecutar en orden correcto
                    const operacionesOrdenadas = [...productosPendientes].sort(
                        (a, b) =>
                            new Date(a.timestamp).getTime() -
                            new Date(b.timestamp).getTime(),
                    );

                    const resultados = await Promise.allSettled(
                        operacionesOrdenadas.map(async (operacion) => {
                            switch (operacion.tipo) {
                                case "create":
                                    if (operacion.producto) {
                                        return databaseService.addProducto(
                                            operacion.producto,
                                        );
                                    }
                                    break;
                                case "update":
                                    if (operacion.datos) {
                                        return databaseService.updateProducto(
                                            userId,
                                            operacion.productoId,
                                            operacion.datos,
                                        );
                                    }
                                    break;
                                case "delete":
                                    return databaseService.deleteProducto(
                                        userId,
                                        operacion.productoId,
                                    );
                            }
                        }),
                    );

                    // Filtrar solo las operaciones que fallaron
                    const pendientesRestantes = operacionesOrdenadas.filter(
                        (_operacion, index) =>
                            resultados[index].status !== "fulfilled",
                    );

                    const exitosas =
                        operacionesOrdenadas.length -
                        pendientesRestantes.length;
                    console.log(
                        `✅ ${exitosas}/${operacionesOrdenadas.length} operaciones de productos sincronizadas correctamente`,
                    );

                    set(() => ({
                        productosPendientes: pendientesRestantes,
                    }));
                },

                calcularVentasHoy: () => {
                    const { ventas } = get();
                    const hoy = new Date().toLocaleDateString();

                    return ventas
                        .filter(
                            (v) =>
                                new Date(v.fecha).toLocaleDateString() === hoy,
                        )
                        .reduce(
                            (sumatoria, valorVentaActual) =>
                                sumatoria + valorVentaActual.total,
                            0,
                        );
                },

                obtenerTotalVentas() {
                    return 0;
                },

                limpiarStore: () => {
                    set({
                        productos: [],
                        ventas: [],
                        ventasPendientes: [],
                        productosPendientes: [],
                        carrito: [],
                    });
                },

                cargarProductosDesdeFirestore: async (userId: string) => {
                    try {
                        const productos =
                            await databaseService.getProductos(userId);
                        set({ productos });
                        console.log(
                            "✅ Productos cargados desde Firestore:",
                            productos.length,
                        );
                    } catch (error) {
                        console.error(
                            "❌ Error al cargar productos desde Firestore:",
                            error,
                        );
                    }
                },

                cargarVentasDesdeFirestore: async (userId: string) => {
                    try {
                        const ventas = await databaseService.getVentas(userId);
                        set({ ventas });
                        console.log(
                            "✅ Ventas cargadas desde Firestore:",
                            ventas.length,
                        );
                    } catch (error) {
                        console.error(
                            "❌ Error al cargar ventas desde Firestore:",
                            error,
                        );
                    }
                },

                setProductos: (productos: Producto[]) => {
                    set({ productos });
                },

                setVentas: (ventas: Venta[]) => {
                    set({ ventas });
                },
            }),

            // esto es para la persistencia
            {
                name: "inventario-storage", // Nombre único para la base de datos local
                storage: createJSONStorage(() => AsyncStorage), // Configuramos para React Native
            },
        ),
    ),
);
