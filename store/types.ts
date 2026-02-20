// Este archivo define los modelos de datos individualmente

// Lo que hace es definir como son los productos, se usa en la lista de productos, agregar producto, y buscar producto
export interface Producto {
    id?: string;
    uid?: string; //se genera en automático por firestore
    nombre: string; //este debe de ser único
    precio: number;
    categoria?: string; //será una función de la que me preocuparé más delante
    stock?: number; //quedará pendiende
}

// Esto es para definir producto dentro del carrito (con cantidad), se puede usar en el carrito de compra y registrar venta, se puede ver como el renglon de cada producto a comprar
// Esta es la logica para la parte de las ventas
export interface ItemVenta {
    producto: Producto;
    cantidad: number;
    subtotal: number;
}

// Esto lo que hace es registrar la transacción completa, se usará como el historial de ventas, reportes, cálculo de totales, captando su fecha
export interface Venta {
    idVenta?: string;
    fecha: Date;
    items: ItemVenta[];
    total: number;
    metodoPago?: "efectivo" | "tarjeta" | "transferencia";
    cliente?: string;
}

// Define la informacion del dueño, su perfil para verificar qué tipo de plan tiene, sus límites de IA
export interface Usuario {
    id?: string; // le pongo opcional, ya que su id es generado por firebase una vez se envía
    correo: string;
    nombre: string;
    negocio?: string;
    plan: "GRATIS" | "PRO";
    creditos: number;
}

// Esto creo no lo usaré
export interface ProductoFirestore extends Producto {
    fechaAgregado?: any;
}

export interface VentaFirestore extends Venta {
    usuarioID: string;
}

export const COLLECTIONS = {
    PRODUCTOS: "productos",
    USUARIOS: "usuarios",
    VENTAS: "ventas",
} as const;
