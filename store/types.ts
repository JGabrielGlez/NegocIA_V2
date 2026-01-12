// Este archivo define los modelos de datos individualmente

// Lo que hace es definir como son los productos, se usa en la lista de productos, agregar producto, y buscar producto
export interface Producto {
    id: string;
    nombre: string;
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
    id: string;
    fecha: Date;
    items: ItemVenta[];
    total: number;
    metodoPago?: "efectivo" | "tarjeta" | "transferencia";
    cliente?: string;
}

// Define la informacion del duelo, su perfil para verificar qué tipo de plan tiene, sus límites de IA
export interface Usuario {
    id: string;
    correo: string;
    nombre: string;
    negocio: string;
    plan: "GRATIS" | "PRO";
    consultasIA_mes: number;
}
