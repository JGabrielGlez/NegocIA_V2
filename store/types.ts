// Este archivo define los modelos de datos individualmente

// Lo que hace es definir como son los productos, se usa en la lista de productos, agregar producto, y buscar producto
export interface Producto {
    id?: string; // ID del documento en Firestore
    usuarioId?: string; // UID del usuario propietario
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

// Define las estadísticas de uso del asistente IA
export interface AIUsageStats {
    queriesUsedThisMonth: number;
    nextResetDate: Date;
    totalQueriesAllTime: number;
    priceUpdatesUsedThisMonth: number;
    lastQueryAt: Date | null;
}

// Mensajes del chat IA
export interface AIMessage {
    id: string;
    role: "user" | "ai";
    content: string;
    timestamp: Date;
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

export interface ProductoMetrica {
    nombre: string;
    unidades: number;
    total: number;
    porcentaje: number;
    tieneCeroVentas: boolean;
    diasSinVentas: number;
}

export interface MetricasNegocio {
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
