import { create } from "zustand";
import { Producto, Venta } from "./types";
// En este archivo se define qupe es lo que tiene la store de zustand, no se usa en otro lado

interface AppState {
    // Se define qué tiene la store completa
    // Nota: como el archivo de types es un tipo declaration file, no es necesario hacer la importacion TS lo reconoce en automático
    productos: Producto[];
    ventas: Venta[];

    // CRUD básico
    agregarProducto: (producto: Producto) => void;
    eliminarProducto: (id: string) => void;

    // el partial sirve para actualizar solo x o x's cosas del objeto, sin necesidad de estar haciendo un nuevo método para cuando se quiera cambiar solo el nombre, precio, etc.
    actualizarProducto: (id: string, datos: Partial<Producto>) => void;
    obtenerProductoPorId: (id: string) => Producto | undefined;

    //  ------------------- VENTAS ---------------------
    // Una vez se imprima una venta, y se cobre, esta no se puede modificar por ningún motivo
    agregarVenta: (venta: Venta) => void;

    // ---------------- Utilidades -------------------
    calcularVentasHoy: () => number;
    obtenerTotalVentas: () => number;
}

export const useStore = create<AppState>((set, get) => ({
    // Aquí va la definición de cada uno de los métodos de la interfaz
    // Estado inicial: vacío
    productos: [],
    ventas: [],

    // Estos son todos los métodos
    agregarProducto: (producto) =>
        set((state) => ({
            productos: [...state.productos, producto],
        })),

    eliminarProducto: (id) =>
        set((state) => ({
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

    agregarVenta: (venta) =>
        set((state) => ({
            ventas: [...state.ventas, venta],
        })),

    calcularVentasHoy: () => {
        const { ventas } = get();
        const hoy = new Date().toLocaleDateString();

        return ventas
            .filter((v) => new Date(v.fecha).toLocaleDateString() === hoy)
            .reduce(
                (sumatoria, valorVentaActual) =>
                    sumatoria + valorVentaActual.total,
                0,
            );
    },

    obtenerTotalVentas() {
        return 0;
    },
}));
