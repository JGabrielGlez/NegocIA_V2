import { Producto, Venta } from "../store/types";

export interface ProductoFirestore extends Producto {
    usuarioId: string;
    fechaAgregado: Date;
}

export interface VentaFirestore extends Venta {
    usuarioID: string;
}

export const COLLECTIONS = {
    PRODUCTOS: "productos",
    USUARIOS: "usuarios",
    VENTAS: "ventas",
} as const;
