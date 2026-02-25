# POS con IA — Instrucciones de Proyecto para GitHub Copilot

## Descripción General

App de **punto de venta (POS)** para negocios pequeños y medianos en México/Latinoamérica (tienditas, taquerías, panaderías, peluquerías, etc.). El diferenciador principal es un **asistente de IA conversacional** que conoce todos los números del negocio y permite configurar/operar la app usando lenguaje natural, sin tecnicismos.

**Propuesta de valor central:** Configurar y operar la app debe sentirse tan fácil como mandar un mensaje de WhatsApp.

---

## Stack Tecnológico

### Frontend

- **Framework:** React Native con Expo (expo-router para navegación)
- **Estilos:** NativeWind (Tailwind CSS para React Native)
- **Estado global:** Zustand
- **Persistencia local:** react-native-mmkv
- **Plataforma objetivo:** Android (Play Store) — iOS en versión futura

### Backend

- **Servidor:** Firebase Cloud Functions (Node.js)
- **Base de datos:** Firestore (usuarios, límites de uso, sincronización)
- **Autenticación:** Firebase Auth (email/password)
- **Storage:** Firebase Storage (backup en la nube — plan PRO)
- **IA:** Gemini 2.0 Flash API (SOLO desde el backend, nunca exponer API key en el cliente)

### Pagos

- **Gestor de suscripciones:** RevenueCat + Google Play Billing
- **Planes:** GRATIS y PRO ($299 MXN/mes)

### Analytics

- Mixpanel

### Almacenamiento local

- Archivos JSON + MMKV para persistencia local
- La app funciona **100% offline** — el backend solo es necesario para IA y sincronización en la nube

---

## Arquitectura de Datos

### Modelos principales

```typescript
// Producto
interface Product {
    id: string;
    name: string;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}

// Venta
interface Sale {
    id: string;
    items: SaleItem[];
    total: number;
    amountPaid?: number;
    change?: number;
    alias?: string; // nombre/alias del pedido, sin datos completos de cliente
    createdAt: Date;
}

interface SaleItem {
    productId: string;
    productName: string; // snapshot del nombre al momento de venta
    productPrice: number; // snapshot del precio al momento de venta
    quantity: number;
    subtotal: number;
}

// Usuario (Firestore)
interface UserProfile {
    uid: string;
    email: string;
    plan: "free" | "pro";
    aiQueriesUsedToday: number;
    aiQueriesResetAt: Date;
    priceUpdateUsedThisMonth: number;
    createdAt: Date;
}
```

---

## Funcionalidades Core del MVP (v1.0)

### ✅ Implementadas en esta versión

1. **Gestión de Productos**
    - CRUD completo de productos (nombre, precio)
    - Guardado local con MMKV
    - Persistencia al cerrar/abrir la app
    - Límite: 30 productos en plan gratuito, ilimitados en PRO
    - **Sin gestión de stock** — el inventario queda para v2.0

2. **Registro de Ventas**
    - Selección de productos con carrito
    - Cálculo automático de total y cambio
    - Alias/nombre del pedido (opcional, sin registro completo de clientes)
    - Historial local de ventas
    - Historial de 1 mes en plan gratuito, ilimitado en PRO

3. **Autenticación**
    - Registro e inicio de sesión con email/password (Firebase Auth)
    - Sesión persistente
    - Protección de rutas autenticadas

4. **Asistente IA Conversacional** (solo plan PRO)
    - Chat en lenguaje natural sobre los datos del negocio
    - Responde preguntas sobre ventas, productos, tendencias
    - Genera insights y recomendaciones accionables
    - Límite: 10 consultas/día (plan PRO), 0 consultas (plan gratuito)
    - Ejemplos: "¿Cuánto vendí esta semana?", "¿Qué producto se vende más?", "¿Me conviene subir precios?"
    - **La API key de Gemini NUNCA va en el cliente** — todas las llamadas pasan por Cloud Functions

5. **Configuración Inicial con IA** (gratuita — 1 vez en plan free, ilimitada en PRO)
    - Usuario describe su tipo de negocio
    - IA genera menú inicial con productos y precios sugeridos
    - Usuario revisa y confirma

6. **Actualización Masiva de Precios con IA**
    - En lenguaje natural: "Sube todos los precios 10%"
    - Preview de cambios antes de aplicar
    - Alerta en caso de incongruencias de precios
    - Límite: 5 veces/mes (plan gratuito), ilimitado (plan PRO)

7. **Sistema de Planes y Pagos**
    - Pantalla de comparación de planes (paywall)
    - Compra de suscripción PRO vía RevenueCat + Google Play Billing
    - Verificación del estado premium en el backend
    - Badge "PRO" para usuarios premium
    - Upgrade prompts cuando usuario gratuito intenta usar funciones PRO

### ❌ Fuera del alcance en v1.0 (para v2.0)

- Gestión de stock / inventario
- Múltiples empleados / roles
- Impresión de tickets (Bluetooth)
- Integración con WhatsApp
- Reportes avanzados con gráficas
- Backup automático en la nube (solo bajo demanda en PRO)
- App iOS
- Múltiples sucursales
- Pantalla de Historial de Ventas — eliminada por decisión
  de producto. El historial se consulta ÚNICAMENTE a través
  del Asistente IA conversacional. Nunca sugerir ni crear
  esta pantalla.

---

## Planes de Monetización

### Plan GRATUITO

- ❌ Sin asistente conversacional de IA
- ✅ Configuración inicial del menú con IA (una vez)
- ✅ Actualización de precios con IA (5 veces/mes)
- ✅ Hasta 30 productos
- ✅ Ventas ilimitadas
- ✅ Historial de 1 mes
- ✅ 1 usuario

### Plan PRO — $299 MXN/mes

- ✅ Asistente conversacional: 10 consultas IA/día
- ✅ Configuración ilimitada con IA
- ✅ Actualización de precios ilimitada
- ✅ Productos ilimitados
- ✅ Historial ilimitado
- ✅ Backup en la nube
- ✅ Hasta 3 empleados
- ✅ Sin anuncios

---

## Seguridad — Reglas Críticas

1. **La API key de Gemini NUNCA va en el código de la app** — siempre en variables de entorno del servidor.
2. **Todas las llamadas a IA pasan por Firebase Cloud Functions** — el cliente llama a la función, la función llama a Gemini.
3. **Validación de suscripción siempre en el backend** — nunca confiar solo en el estado local.
4. **Sistema de límites por usuario** en Firestore (contadores de uso diario/mensual).
5. **Guardar API keys en `.env`**, nunca hardcodeadas en el código.

---

## Principios de UX

1. **Simplicidad extrema** — onboarding en menos de 2 minutos
2. **Más rápido que papel** — registrar una venta debe ser más ágil que anotar en un cuaderno
3. **Lenguaje natural** — sin jerga técnica ni contable
4. **Feedback inmediato** — respuestas y cambios instantáneos
5. **Modo offline completo** — crítico para negocios sin internet confiable
6. **Sin tecnicismos en la UI** — el usuario objetivo tiene nivel técnico bajo/medio, 25-55 años

---

## Estructura de Carpetas Esperada

```
/
├── app/                    # Rutas con expo-router
│   ├── (auth)/             # Pantallas de login/registro
│   ├── (tabs)/             # Pantallas principales (tabs)
│   │   ├── index.tsx       # Dashboard
│   │   ├── products.tsx    # Lista de productos
│   │   ├── sale.tsx        # Nueva venta
│   │   ├── history.tsx     # Historial de ventas
│   │   └── assistant.tsx   # Asistente IA (solo PRO)
│   └── _layout.tsx
├── components/             # Componentes reutilizables
├── store/                  # Stores de Zustand
│   ├── useProductStore.ts
│   ├── useSaleStore.ts
│   └── useAuthStore.ts
├── services/               # Lógica de negocio y APIs
│   ├── firebase.ts
│   ├── ai.ts               # Llamadas al asistente IA
│   └── subscriptions.ts    # RevenueCat
├── utils/                  # Helpers y utilidades
├── types/                  # TypeScript interfaces
├── functions/              # Firebase Cloud Functions
│   └── src/
│       ├── ai/             # Lógica de Gemini
│       └── subscriptions/  # Validación de pagos
└── .env                    # Variables de entorno (nunca en git)
```

---

## Contexto del Negocio para la IA

Cuando el asistente de IA responde preguntas del usuario, tiene acceso al contexto completo del negocio:

- Lista de todos los productos y precios
- Historial completo de ventas (fechas, productos, cantidades, totales)
- Métricas calculadas (producto más vendido, ventas por día/semana/mes, etc.)

El asistente debe responder siempre en **español**, en **lenguaje sencillo y amigable**, sin tecnicismos, y con información accionable para el dueño del negocio.

---

## Costos Estimados (referencia)

| Servicio              | Costo actual                         |
| --------------------- | ------------------------------------ |
| Firebase              | $0 (hasta ~200-300 usuarios activos) |
| Gemini API            | $0 (hasta 1.5M tokens/día)           |
| RevenueCat            | $0 (hasta $10k USD/mes facturados)   |
| Mixpanel              | $0 (hasta 100k eventos/mes)          |
| EAS Build             | $0 (hasta 30 compilaciones/mes)      |
| Google Play Developer | $25 USD (pago único)                 |

Margen por usuario PRO: ~70-75% después de comisión de Google.
