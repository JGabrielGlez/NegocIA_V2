import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { ItemVenta, Producto, Venta } from "./types";
// En este archivo se define qupe es lo que tiene la store de zustand, no se usa en otro lado

interface AppState {
    // Se define qué tiene la store completa
    // Nota: como el archivo de types es un tipo declaration file, no es necesario hacer la importacion TS lo reconoce en automático
    productos: Producto[];
    ventas: Venta[];
    carrito: ItemVenta[];

    obtenerTotalCarrito: () => number;
    vaciarCarrito: () => void;
    cantidadProductos: () => number;

    agregarAlCarrito: (idProducto: string) => void;

    // TODO recibirá el string del id del producto y se reducirá su cantidad en 1, cuando llegue a 0, se elimina del carrito, eso checará siempre el método, que lo haré hasta el final
    eliminarDelCarrito: (idProducto: string) => void;

    // CRUD básico
    agregarProducto: (nombre: string, precio: string) => void;
    eliminarProducto: (id: string) => void;

    // el partial sirve para actualizar solo x o x's cosas del objeto, sin necesidad de estar haciendo un nuevo método para cuando se quiera cambiar solo el nombre, precio, etc.
    actualizarProducto: (id: string, datos: Partial<Producto>) => void;
    obtenerProductoPorId: (id: string) => Producto | undefined;

    //  ------------------- VENTAS ---------------------
    // Una vez se imprima una venta, y se cobre, esta no se puede modificar por ningún motivo
    agregarVenta: () => void;

    // ---------------- Utilidades -------------------
    calcularVentasHoy: () => number;
    obtenerTotalVentas: () => number;
}

export const useStore = create<AppState>()(
    devtools(
        persist(
            (set, get) => ({
                // Aquí va la definición de cada uno de los métodos de la interfaz
                // Estado inicial: vacío
                productos: [
                    { id: "asdfasd}", nombre: "Coca bien fría", precio: 234 },
                    { id: "asdasf", nombre: "Iced coffe", precio: 234 },
                    { id: "adfsdf", nombre: "Gansito", precio: 234 },
                    { id: "adasdf", nombre: "Tortuga", precio: 234 },
                    {
                        id: "adsdf",
                        nombre: "Tortuga ninja rafaeasdfasdfasdfasdfaslo",
                        precio: 234,
                    },
                    {
                        id: "aasdf",
                        nombre: "Tortuga ninja rafaelo",
                        precio: 234,
                    },
                    {
                        id: "dasdf",
                        nombre: "Tortuga ninja rafaelo",
                        precio: 234,
                    },
                    {
                        id: "adasdfasdf",
                        nombre: "Tortuga ninja rafaelo",
                        precio: 234,
                    },
                    {
                        id: "adasdasdff",
                        nombre: "Tortuga ninja rafaelo",
                        precio: 234,
                    },
                ],
                carrito: [],

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

                eliminarDelCarrito(id) {
                    return 0;
                },

                obtenerTotalCarrito: () =>
                    // Con esto se obtiene el estado actual del carrito
                    get().carrito.reduce(
                        (acumulador, itemActual) =>
                            acumulador + itemActual.subtotal,
                        0,
                    ),
                ventas: [],

                // Estos son todos los métodos
                agregarProducto: (nombre, precio) =>
                    set((state) => ({
                        productos: [
                            ...state.productos,
                            {
                                id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                                nombre,
                                precio: parseFloat(precio) || 0,
                            },
                        ],
                    })),

                eliminarProducto: (id) =>
                    set((state) => ({
                        // <--- Agrega esto
                        productos: state.productos.filter((p) => p.id !== id),
                    })),

                actualizarProducto: (id, datos) =>
                    set((state) => ({
                        productos: state.productos.map((producto) =>
                            producto.id === id
                                ? {
                                      ...producto,
                                      ...datos,
                                  }
                                : producto,
                        ),
                    })),

                obtenerProductoPorId: (id) => {
                    // Se usa get para acceder a la lista de productos actual

                    // Estoy declarando un objeto con productos, y se usa la destructuracion para no tener que estar llamando por ejemplo productos.id, solo uso el id y ya está, la destructuración es para extraer solo lo que está dentro de ese objeto que se obtuvo
                    const { productos } = get();

                    return productos.find((p) => p.id === id);
                },

                agregarVenta: () =>
                    set((state) => ({
                        ventas: [
                            ...state.ventas,
                            {
                                id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                                fecha: new Date(),
                                items: state.carrito,
                                total: get().obtenerTotalCarrito(),
                           },
                        ],
                    })),

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
            }),
            
            // esto es para la persistencia
            {
                name: "inventario-storage", // Nombre único para la base de datos local
                storage: createJSONStorage(() => AsyncStorage), // Configuramos para React Native
            },
        ),
    ),
);
