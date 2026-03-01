# 📊 DIAGNÓSTICO EXHAUSTIVO DEL PROYECTO - NegocIA

**Fecha:** 28 de febrero de 2026  
**Versión:** MVP v1.0  
**Alcance:** Análisis completo de 35 archivos principales del sistema

---

## TABLA DE CONTENIDOS

1. [Esquema de Datos](#1-esquema-de-datos--consistencia-entre-capas)
2. [Autenticación y Sesión](#2-autenticación-y-sesión)
3. [Sincronización Firestore](#3-sincronización-firestore)
4. [Sistema de IA](#4-sistema-de-ia)
5. [RevenueCat y Suscripción](#5-revenuecat-y-suscripción)
6. [Reglas de Firestore](#6-reglas-de-firestore)
7. [Tipos TypeScript](#7-tipos-typescript)
8. [Seguridad](#8-seguridad)
9. [Archivos Vacíos o Pendientes](#9-archivos-vacíos-o-pendientes)
10. [Resumen por Severidad](#-resumen-por-severidad)

---

## 1. ESQUEMA DE DATOS — Consistencia entre Capas

### ✅ Uso consistente de campos en ventas

**Archivos verificados:**

- `functions/src/utils/contextBuilder.ts` (líneas 116-135)
- `functions/src/services/firestoreService.ts` (líneas 234-239)
- `firebase/databaseService.ts` (líneas 579-595)

**Resultado:** Todos usan correctamente:

- `item.producto.nombre`
- `item.cantidad`
- `item.subtotal`

### ✅ MetricasNegocio y ProductoMetrica bien definidos

**Archivo:** `store/types.ts` (líneas 74-98)

```typescript
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
```

**Resultado:** Interfaces correctamente definidas y utilizadas consistentemente.

### ⚠️ Inconsistencia menor en databaseService.ts

**Archivo:** `firebase/databaseService.ts` (línea 116-135)

**Problema:** La función `buildProductMapFromSales` accede a `item.producto.nombre` sin validación explícita de que el objeto `producto` exista.

**Código actual:**

```typescript
const productName = item?.producto?.nombre || "Producto desconocido";
```

**Recomendación:** Ya tiene optional chaining, pero podría mejorarse la consistencia con un nullish coalescing más explícito.

---

## 2. AUTENTICACIÓN Y SESIÓN

### ✅ cerrarSesion() limpia stores en orden correcto

**Archivo:** `store/useAuthStore.ts` (líneas 190-220)

**Secuencia de limpieza:**

```typescript
1. logOutRevenueCat()                    // Cierra sesión de RevenueCat
2. useStore.getState().limpiarStore()    // Limpia productos y ventas
3. useAIStore.getState().resetAI()       // Resetea chat IA
4. setAuthData({                          // Resetea estado auth
     usuario: null,
     isPremium: false,
     plan: "GRATIS"
   })
5. signOut(auth)                          // Cierra sesión Firebase
6. router.replace("/(auth)/iniciar-sesion") // Navega al login
```

**Resultado:** ✅ Orden correcto implementado.

### ✅ iniciarSesion() carga datos desde Firestore

**Archivo:** `store/useAuthStore.ts` (líneas 151-160)

```typescript
await Promise.all([
    store.cargarProductosDesdeFirestore(user.uid),
    store.cargarVentasDesdeFirestore(user.uid),
]);
```

**Resultado:** ✅ Carga datos tras login exitoso.

### ✅ emailVerified se verifica antes de acceso

**Archivo:** `store/useAuthStore.ts` (líneas 120-147)

```typescript
if (!user.emailVerified) {
    await signOut(auth);
    get().setAuthData({ usuario: null });
    Alert.alert(
        "Acción necesaria",
        "Es necesario verificar la dirección de correo...",
    );
    return;
}
```

**Archivo:** `app/_layout.tsx` (líneas 27-48)

```typescript
if (firebaseUser && firebaseUser.emailVerified) {
    // Solo carga datos si está verificado
    setAuthData({ usuario: firebaseUser });
}
```

**Resultado:** ✅ Verificación implementada correctamente en ambos lugares.

### ❌ PROBLEMA: Doble carga de datos

**Ubicaciones:**

1. `app/_layout.tsx` (líneas 46-58) - Carga productos y ventas
2. `store/useAuthStore.ts` (líneas 151-160) - TAMBIÉN carga productos y ventas

**Impacto:**

- ❌ Duplicación de lecturas de Firestore → costos innecesarios
- ❌ Posibles race conditions en el estado
- ❌ Mayor tiempo de carga inicial

**Código duplicado en \_layout.tsx:**

```typescript
const [productos, ventas] = await Promise.all([
    databaseService.getProductos(firebaseUser.uid),
    databaseService.getVentas(firebaseUser.uid),
]);
store.setProductos(productos);
store.setVentas(ventas);
```

**Código duplicado en useAuthStore.ts:**

```typescript
await Promise.all([
    store.cargarProductosDesdeFirestore(user.uid),
    store.cargarVentasDesdeFirestore(user.uid),
]);
```

**Recomendación:** Eliminar carga de datos de `useAuthStore.ts`, dejarlo solo en `_layout.tsx` para tener un único punto de carga.

---

## 3. SINCRONIZACIÓN FIRESTORE

### ✅ agregarVenta() llama actualizarMetricas()

**Archivo:** `store/useStore.ts` (líneas 292-311)

```typescript
databaseService.addVenta(userId, ventaNueva).then(() => {
    set((state) => ({
        ventasPendientes: state.ventasPendientes.filter(
            (venta) => venta.idVenta !== ventaNueva.idVenta,
        ),
    }));

    // Actualiza métricas después de venta exitosa
    databaseService
        .actualizarMetricas(userId, ventaNueva, get().productos)
        .catch((error) =>
            console.error("⚠️ Error actualizando métricas:", error),
        );
});
```

**Resultado:** ✅ Métricas se actualizan tras venta exitosa.

### ✅ Productos sincronizan con Firestore

**eliminarProducto()** - `store/useStore.ts` (líneas 215-242):

```typescript
set((state) => ({
    productos: state.productos.filter((p) => p.id !== id),
}));

databaseService
    .deleteProducto(usuario.uid, id)
    .then(() => console.log("✅ Producto eliminado de Firestore:", id))
    .catch((error) => console.error("⚠️ Error al eliminar:", error));
```

**actualizarProducto()** - `store/useStore.ts` (líneas 244-270):

```typescript
set((state) => ({
    productos: state.productos.map((producto) =>
        producto.id === id ? { ...producto, ...datos } : producto,
    ),
}));

databaseService
    .updateProducto(usuario.uid, id, datos)
    .then(() => console.log("✅ Producto actualizado en Firestore:", id))
    .catch((error) => console.error("⚠️ Error al actualizar:", error));
```

**Resultado:** ✅ Sincronización implementada para actualizar y eliminar.

### ✅ crearUsuario() y crearAIUsageDoc() se llaman juntos

**Archivo:** `store/useAuthStore.ts` (líneas 137-150)

```typescript
try {
    const usuarioFirestore = await databaseService.getUsuario(user.uid);

    if (!usuarioFirestore) {
        await databaseService.crearUsuario(user.uid, user.email ?? correo);
        console.log("✅ Usuario creado en Firestore:", user.uid);
    }

    const aiUsage = await databaseService.getAIUsageDoc(user.uid);
    if (!aiUsage) {
        await databaseService.crearAIUsageDoc(user.uid);
        console.log("✅ Documento AI usage creado:", user.uid);
    }
} catch (firestoreError: any) {
    console.error(
        "⚠️ Error sincronizando usuario en Firestore:",
        firestoreError,
    );
}
```

**Resultado:** ✅ Ambos documentos se crean juntos tras verificación de email.

### ⚠️ agregarProducto() NO sincroniza automáticamente

**Archivo:** `store/useStore.ts` (líneas 196-201)

```typescript
agregarProducto: (productoCompleto) => {
    // Solo agregar localmente al store
    // La sincronización con Firestore se hace manualmente desde la pantalla
    set((state) => ({
        productos: [...state.productos, productoCompleto],
    }));
},
```

**Comentario en código:** _"La sincronización con Firestore se hace manualmente desde la pantalla"_

**Sincronización manual en productos.tsx** (líneas 127-151):

```typescript
const manejarGuardado = async () => {
    // Validaciones...

    const idGenerado = await servicios.addProducto(nuevoProducto);

    agregarProducto({
        ...nuevoProducto,
        id: idGenerado,
    });
};
```

**Análisis:**

- ✅ Esto es **funcionalmente correcto** y sigue el patrón del comentario
- ⚠️ **Riesgo:** Si alguna pantalla olvida sincronizar, el producto solo existe localmente
- ⚠️ **Inconsistencia:** `actualizarProducto()` y `eliminarProducto()` SÍ sincronizan automáticamente

**Recomendación:** Hacer la sincronización automática como en los otros métodos para consistencia y reducir riesgo de bugs.

---

## 4. SISTEMA DE IA

### ✅ Flujo completo de límites implementado correctamente

#### checkIfCanQuery() se llama ANTES de Gemini

**Archivo:** `functions/src/functions/askAssistant.ts` (línea 66)

```typescript
canQuery = await checkIfCanQuery(userId, userData.plan);

if (!canQuery) {
    throw new HttpsError(
        "resource-exhausted",
        `Has alcanzado el límite de consultas de IA...`,
    );
}
```

**Resultado:** ✅ Verifica límites antes de llamar a Gemini.

#### incrementQueryCount() se llama DESPUÉS de respuesta

**Archivo:** `functions/src/functions/askAssistant.ts` (línea 112)

```typescript
answer = await callGemini(prompt, systemPrompt, userId, tools);

// PASO 6: Incrementar contador de uso
try {
    await incrementQueryCount(userId);
} catch (error) {
    // Error handling...
}
```

**Resultado:** ✅ Incrementa contador solo tras respuesta exitosa.

### ✅ Límites correctos

**Archivo:** `functions/src/utils/limitsManager.ts` (líneas 8-11)

```typescript
const QUERY_LIMITS = {
    GRATIS: 3, // 3 consultas por mes
    PRO: 30, // 30 consultas por mes
};
```

**Resultado:** ✅ Límites según especificación (GRATIS: 3, PRO: 30).

### ✅ Modelo correcto

**Archivo:** `functions/src/services/geminiService.ts` (línea 16)

```typescript
const MODEL_NAME = "gemini-2.5-flash";
```

**Resultado:** ✅ Modelo correcto (gemini-2.5-flash, NO 2.0-flash).

### ✅ Loop máximo 3 iteraciones

**Archivo:** `functions/src/services/geminiService.ts` (líneas 17 y 309)

```typescript
const MAX_FUNCTION_CALL_ITERATIONS = 3;

// ...

while (iteration < MAX_FUNCTION_CALL_ITERATIONS) {
    iteration++;
    // Function calling logic...
}
```

**Resultado:** ✅ Loop controlado a máximo 3 iteraciones.

### ⚠️ Validación frontend no sincronizada con backend

**Archivo:** `app/(features)/asistente-ia.tsx` (líneas 44-47)

```typescript
const PLAN_LIMITS = {
    GRATIS: 3,
    PRO: 30,
} as const;
```

**Archivo:** `functions/src/utils/limitsManager.ts` (líneas 8-11)

```typescript
const QUERY_LIMITS = {
    GRATIS: 3,
    PRO: 30,
};
```

**Problema:**

- ❌ Los límites están hardcodeados en dos lugares
- ❌ Si cambias un límite, debes cambiarlo manualmente en ambos lugares
- ❌ Riesgo de desincronización entre frontend y backend

**Recomendación:**

1. Crear archivo de constantes compartidas (ej: `constants/aiLimits.ts`)
2. O consultar límites desde el backend al iniciar la app

---

## 5. REVENUECAT Y SUSCRIPCIÓN

### ✅ initializeRevenueCat() se llama en \_layout.tsx

**Archivo:** `app/_layout.tsx` (líneas 122-152)

```typescript
useEffect(() => {
    if (!usuario?.uid || !usuario?.emailVerified) {
        console.log("[RevenueCatInit] Saltado: no hay usuario verificado");
        return;
    }

    let isActive = true;
    console.log("[RevenueCatInit] Inicializando RevenueCat para:", usuario.uid);

    initializeRevenueCat(usuario.uid)
        .then(async () => {
            if (!isActive) return;

            const { isPro } = await checkSubscriptionStatus();
            if (!isActive) return;

            useAuthStore.getState().setIsPremium(isPro);
            useAuthStore.getState().setPlan(isPro ? "PRO" : "GRATIS");
            console.log("[RevenueCatInit] Plan aplicado:", {
                uid: usuario.uid,
                isPro,
            });
        })
        .catch((error) => {
            if (!isActive) return;
            console.error("Error al inicializar RevenueCat:", error);
        });

    return () => {
        isActive = false;
        console.log("[RevenueCatInit] Cleanup del efecto.");
    };
}, [usuario?.uid, usuario?.emailVerified]);
```

**Resultado:** ✅ RevenueCat se inicializa tras autenticación exitosa.

### ✅ checkSubscriptionStatus() sincroniza con store

**Archivo:** `services/revenueCat.ts` (líneas 168-191)

```typescript
export async function checkSubscriptionStatus(): Promise<{
    isPro: boolean;
    expiresAt: Date | null;
}> {
    try {
        const customerInfo = await Purchases.getCustomerInfo();
        const proEntitlement = customerInfo.entitlements.active["pro"];

        if (proEntitlement) {
            console.log("✅ Usuario tiene suscripción PRO activa");
            return {
                isPro: true,
                expiresAt: proEntitlement.expirationDate
                    ? new Date(proEntitlement.expirationDate)
                    : null,
            };
        } else {
            console.log("Usuario está en plan GRATIS");
            return { isPro: false, expiresAt: null };
        }
    } catch (error) {
        console.error("Error al verificar suscripción:", error);
        return { isPro: false, expiresAt: null }; // Safe fallback
    }
}
```

**Uso en \_layout.tsx:**

```typescript
const { isPro } = await checkSubscriptionStatus();
useAuthStore.getState().setIsPremium(isPro);
useAuthStore.getState().setPlan(isPro ? "PRO" : "GRATIS");
```

**Resultado:** ✅ Estado de suscripción se sincroniza correctamente con el store.

### ✅ Compra actualiza Firestore

**Archivo:** `app/(features)/planes.tsx` (líneas 88-95)

```typescript
const purchaseSuccessful = await purchasePackage(proPackage);

if (!purchaseSuccessful) {
    return;
}

// Actualizar plan en Firestore
await databaseService.updateUsuario(usuario.uid, {
    plan: "PRO",
});

// Actualizar store local
useAuthStore.getState().setPlan("PRO");
useAuthStore.getState().setIsPremium(true);
setCurrentPlan("PRO");
```

**Resultado:** ✅ Tras compra exitosa se actualiza Firestore y el store local.

### ⚠️ Sincronización con backend al volver al foreground

**Archivo:** `app/_layout.tsx` (líneas 156-176)

```typescript
useEffect(() => {
    if (!usuario?.uid) {
        return;
    }

    const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") {
            console.log("[AppState] App en foreground, sincronizando...");
            syncSubscriptionWithBackend(usuario.uid)
                .then(() => {
                    console.log("[AppState] Sincronización completada.");
                })
                .catch((error) => {
                    console.error("[AppState] Error sincronizando:", error);
                });
        }
    });

    return () => {
        subscription.remove();
    };
}, [usuario?.uid]);
```

**Análisis:**

- ✅ **Correcto:** Detecta cambios en el estado de suscripción cuando el usuario vuelve
- ⚠️ **Problema potencial:** Puede generar múltiples llamadas si el usuario hace app switching rápido (abrir/cerrar/abrir la app varias veces)
- ⚠️ **Impacto en costos:** Cada llamada podría verificar con RevenueCat y actualizar Firestore

**Recomendación:** Implementar debounce o throttle (ej: máximo 1 sincronización cada 5 minutos).

---

## 6. REGLAS DE FIRESTORE

### ✅ Protección de colección usuarios

**Archivo:** `firestore.rules` (líneas 10-12)

```plaintext
match /usuarios/{userId} {
    allow read, write: if estaLogueado() && request.auth.uid == userId;
}
```

**Análisis:**

- ✅ Solo el usuario puede leer/escribir sus propios datos
- ✅ Previene acceso cruzado entre usuarios

### ✅ Protección de colección productos

**Archivo:** `firestore.rules` (líneas 15-24)

```plaintext
match /productos/{productoId} {
    allow read, delete: if estaLogueado() && resource.data.usuarioId == request.auth.uid;
    allow create: if estaLogueado() && request.resource.data.usuarioId == request.auth.uid;
    allow update: if estaLogueado() &&
                  resource.data.usuarioId == request.auth.uid &&
                  request.resource.data.usuarioId == request.auth.uid;
}
```

**Análisis:**

- ✅ Leer/eliminar: Solo si eres dueño del producto
- ✅ Crear: Solo si asignas tu propio UID
- ✅ Actualizar: Solo si eres dueño Y no cambias el UID a otro usuario

### ✅ Protección de colección ventas

**Archivo:** `firestore.rules` (líneas 27-33)

```plaintext
match /ventas/{ventaId} {
    allow read, delete: if estaLogueado() && resource.data.usuarioId == request.auth.uid;
    allow create: if estaLogueado() && request.resource.data.usuarioId == request.auth.uid;
    allow update: if estaLogueado() &&
                  resource.data.usuarioId == request.auth.uid &&
                  request.resource.data.usuarioId == request.auth.uid;
}
```

**Análisis:** ✅ Misma lógica que productos (correcta).

### ✅ Protección de ai_usage (subcollection)

**Archivo:** `firestore.rules` (líneas 36-38)

```plaintext
match /usuarios/{userId}/ai_usage/{document=**} {
    allow read, write: if estaLogueado() && request.auth.uid == userId;
}
```

**Análisis:** ✅ Subcollection protegida correctamente.

### ❌ PROBLEMA: Regla para métricas (subcollection) FALTA

**Ubicaciones donde se usa:**

- `firebase/databaseService.ts` (línea 418):
    ```typescript
    const docRef = doc(
        db,
        COLLECTIONS.USUARIOS,
        uid,
        METRICAS_SUBCOLLECTION,
        METRICAS_DOC_ID,
    );
    ```
- Path completo: `usuarios/{userId}/metricas/resumen`

**Problema:**

- ❌ No hay regla explícita para `usuarios/{userId}/metricas/{document=**}` en firestore.rules
- ❌ Las operaciones pueden fallar en producción por permisos denegados

**Impacto:**

- 🔴 **CRÍTICO:** Las métricas precalculadas (ventas del día, semana, mes, top productos) NO se pueden leer/escribir
- 🔴 El dashboard y el asistente IA dependen de estas métricas

**Solución:** Agregar esta regla en firestore.rules:

```plaintext
// 5. REGLA PARA MÉTRICAS (subcollection de usuarios)
match /usuarios/{userId}/metricas/{document=**} {
    allow read, write: if estaLogueado() && request.auth.uid == userId;
}
```

### ✅ Bloqueo global al final

**Archivo:** `firestore.rules` (líneas 41-43)

```plaintext
// BLOQUEO GLOBAL
match /{document=**} {
    allow read, write: if false;
}
```

**Análisis:** ✅ Bloquea todo lo demás (seguridad por defecto).

---

## 7. TIPOS TYPESCRIPT

### ✅ Interfaces bien definidas en types.ts

**Archivo:** `store/types.ts`

Todas las interfaces principales están correctamente definidas:

- `Producto`
- `ItemVenta`
- `Venta`
- `Usuario`
- `AIUsageStats`
- `AIMessage`
- `ProductoMetrica`
- `MetricasNegocio`

**Resultado:** ✅ Tipos bien estructurados y consistentes.

### ❌ Uso excesivo de `any` en catch blocks

**Ubicaciones detectadas:**

#### 1. useStore.ts

```typescript
// Línea 231, 259, 309, 325, 361, 386
catch (error: any) {
    console.log("Error en...", error);
}
```

#### 2. useAuthStore.ts

```typescript
// Línea 113, 172, 178, 217
catch (error: any) {
    console.log("Error al...", error);
}
```

#### 3. databaseService.ts

```typescript
// Líneas 309, 331, 351, 369, 411, 435, 459, 702, 717, 752, 765
catch (error: any) {
    console.log("Error en databaseService...", error);
}
```

#### 4. crear-cuenta.tsx

```typescript
// Línea 104
catch (error: any) {
    let errorCapturado = error.code;
}
```

#### 5. asistente-ia.tsx

```typescript
// Línea 210
catch (error: any) {
    const message = error?.message || "Ocurrió un error...";
}
```

**Problema:**

- ❌ `any` desactiva el type checking de TypeScript
- ❌ Puede ocultar errores en tiempo de compilación
- ❌ No se aprovecha la verificación de tipos

**Recomendación:** Usar `catch (error: unknown)` y validar el tipo:

```typescript
catch (error: unknown) {
    if (error instanceof Error) {
        console.error("Error:", error.message);
    } else {
        console.error("Error desconocido:", String(error));
    }
}
```

---

## 8. SEGURIDAD

### ✅ GEMINI_API_KEY no aparece en archivos del cliente

**Búsqueda realizada:** Se verificaron todos los archivos del frontend (app/, components/, store/, services/).

**Resultado:** ✅ NO se encontró API key hardcodeada en el cliente.

**Implementación correcta:** `functions/src/services/geminiService.ts` (líneas 89-108)

```typescript
function getGeminiApiKey(): string {
    const keyFromEnv = process.env.GEMINI_API_KEY?.trim();
    if (keyFromEnv) {
        return keyFromEnv;
    }

    try {
        const envPath = path.resolve(process.cwd(), ".env");
        if (!fs.existsSync(envPath)) {
            return "";
        }

        const envContent = fs.readFileSync(envPath, "utf8");
        const keyLine = envContent
            .split(/\r?\n/)
            .find((line) => line.trim().startsWith("GEMINI_API_KEY="));

        if (!keyLine) {
            return "";
        }

        return keyLine
            .replace("GEMINI_API_KEY=", "")
            .trim()
            .replace(/^['\"]|['\"]$/g, "");
    } catch {
        return "";
    }
}
```

**Análisis:** ✅ API key se lee de variables de entorno (backend only).

### ✅ No hay API keys hardcodeadas

**Verificaciones:**

- ✅ RevenueCat API key: `process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID`
- ✅ Firebase config: Usa firebaseConfig.js (correcto para Firebase)
- ✅ Webhook secret: `process.env.REVENUECAT_WEBHOOK_SECRET`

**Resultado:** ✅ Todas las keys en variables de entorno.

### ⚠️ REVENUECAT_WEBHOOK_SECRET sin validación estricta

**Archivo:** `functions/src/functions/verifySubscription.ts` (línea 130)

```typescript
const secret = process.env.REVENUECAT_WEBHOOK_SECRET || "";

if (!secret) {
    logger.error("verifySubscription: webhook secret faltante");
    response.status(500).json({ error: "Webhook secret not configured" });
    return;
}
```

**Análisis:**

- ✅ Verifica que exista antes de usarlo
- ✅ Retorna error 500 si no está configurado
- ⚠️ Solo falla en runtime (cuando llega un webhook)

**Recomendación:** Implementar validación al iniciar el servidor (fail-fast pattern):

```typescript
// En functions/src/index.ts
if (!process.env.REVENUECAT_WEBHOOK_SECRET) {
    throw new Error("REVENUECAT_WEBHOOK_SECRET no está configurado");
}
```

---

## 9. ARCHIVOS VACÍOS O PENDIENTES

### ❌ configuracion-inicial-ia.tsx COMPLETAMENTE VACÍO

**Archivo:** `app/(auth)/configuracion-inicial-ia.tsx`

**Estado:** 0 líneas de código.

**Según copilot-instructions.md:**

> "Configuración Inicial con IA (gratuita — 1 vez en plan free, ilimitada en PRO): Usuario describe su tipo de negocio, IA genera menú inicial con productos y precios sugeridos"

**Funcionalidad esperada:**

1. Usuario describe su negocio en lenguaje natural (ej: "Taquería")
2. IA genera productos sugeridos con precios (ej: Tacos, Quesadillas, Refrescos)
3. Usuario revisa y confirma
4. Productos se guardan en Firestore

**Estado:** 🔴 **NO IMPLEMENTADO** (funcionalidad core del MVP).

**Impacto:**

- 🔴 Los nuevos usuarios NO pueden usar la configuración inicial con IA
- 🔴 Deben agregar productos manualmente uno por uno
- 🔴 Se pierde el diferenciador principal del producto

### ❌ configuracion.tsx COMPLETAMENTE VACÍO

**Archivo:** `app/(features)/configuracion.tsx`

**Estado:** 0 líneas de código.

**Especificación:** No hay descripción clara en copilot-instructions.md de qué debería contener esta pantalla.

**Análisis:**

- ⚠️ Existe una ruta `/(features)/configuracion` pero no hace nada
- ⚠️ Puede generar confusión si un usuario intenta acceder
- ⚠️ No está claro si es necesaria para el MVP

**Recomendación:**

1. Si es necesaria, definir qué configuraciones ofrece (ej: nombre del negocio, categorías, preferencias)
2. Si no es necesaria, eliminar el archivo y la ruta

### ✅ Fixme_Later.txt

**Archivo:** `Fixme_Later.txt`

**Contenido:**

```
Todos los text input, hacer uso de una flatList para acomodar lo que se escriba
```

**Análisis:**

- ℹ️ Nota sobre mejora de rendimiento para inputs largos
- ⚠️ Actualmente se usa ScrollView en modales con inputs
- 🟡 Mejora menor, no crítica para MVP

**Contexto:** En React Native, FlatList es más eficiente que ScrollView para listas largas porque implementa virtualización (solo renderiza elementos visibles).

**Impacto:** 🟡 Bajo (solo afecta rendimiento si hay muchos campos, actualmente hay máximo 2-3 inputs por pantalla).

---

## 🔴🟠🟡 RESUMEN POR SEVERIDAD

### 🔴 CRÍTICO (Rompe funcionalidad)

#### 1. Reglas Firestore faltantes para métricas

- **Archivos afectados:** `firestore.rules`, `firebase/databaseService.ts`
- **Problema:** La subcollection `usuarios/{userId}/metricas/{document}` NO tiene regla de acceso definida
- **Impacto:**
    - ❌ Operaciones de lectura/escritura a métricas pueden fallar con "Permission denied"
    - ❌ El dashboard no puede mostrar ventas del día, semana, mes
    - ❌ El asistente IA no puede acceder a métricas precalculadas
    - ❌ `actualizarMetricas()` puede fallar silenciosamente
- **Solución:**
    ```plaintext
    // Agregar en firestore.rules después de la regla de ai_usage
    match /usuarios/{userId}/metricas/{document=**} {
        allow read, write: if estaLogueado() && request.auth.uid == userId;
    }
    ```
- **Prioridad:** 🔴 **URGENTE** - Debe corregirse antes de producción

#### 2. Funcionalidad core sin implementar: configuracion-inicial-ia.tsx

- **Archivo:** `app/(auth)/configuracion-inicial-ia.tsx`
- **Problema:** Archivo completamente vacío (0 líneas)
- **Funcionalidad esperada según MVP:**
    - Usuario describe su negocio en lenguaje natural
    - IA genera menú inicial con productos y precios
    - Usuario revisa y confirma
- **Impacto:**
    - ❌ Usuarios nuevos NO pueden usar la configuración inicial con IA
    - ❌ Deben agregar productos manualmente uno por uno
    - ❌ Se pierde el diferenciador principal del producto ("Configura tu POS con IA en minutos")
    - ❌ Afecta la propuesta de valor central del MVP
- **Solución:** Implementar pantalla completa con:
    1. Input de texto para descripción del negocio
    2. Llamada a Cloud Function que use Gemini para generar productos
    3. Lista de productos sugeridos con preview
    4. Confirmación y guardado en Firestore
- **Prioridad:** 🔴 **URGENTE** - Es parte del MVP según copilot-instructions.md

---

### 🟠 IMPORTANTE (Puede causar bugs en edge cases)

#### 1. Doble carga de datos al iniciar sesión

- **Archivos afectados:** `app/_layout.tsx`, `store/useAuthStore.ts`
- **Problema:** Productos y ventas se cargan DOS VECES en paralelo al iniciar sesión
- **Ubicaciones:**
    - `_layout.tsx` (líneas 46-58): Carga productos/ventas desde Firestore
    - `useAuthStore.ts` (líneas 151-160): TAMBIÉN carga productos/ventas desde Firestore
- **Impacto:**
    - ❌ **Costos:** Lecturas duplicadas de Firestore (2x el costo)
    - ❌ **Rendimiento:** Mayor tiempo de carga inicial
    - ❌ **Race conditions:** Posible inconsistencia si una carga termina antes que la otra
    - ⚠️ **Sobrecarga:** Si un usuario tiene 100 productos y 200 ventas, se leen 600 documentos en lugar de 300
- **Solución:** Eliminar carga de `useAuthStore.ts` (líneas 151-160), mantener solo en `_layout.tsx`
- **Prioridad:** 🟠 **ALTA** - Afecta costos y experiencia de usuario

#### 2. Límites de IA duplicados entre frontend y backend

- **Archivos afectados:** `app/(features)/asistente-ia.tsx`, `functions/src/utils/limitsManager.ts`
- **Problema:** Constantes `PLAN_LIMITS` hardcodeadas en dos lugares
- **Ubicaciones:**

    ```typescript
    // Frontend (asistente-ia.tsx líneas 44-47)
    const PLAN_LIMITS = {
        GRATIS: 3,
        PRO: 30,
    };

    // Backend (limitsManager.ts líneas 8-11)
    const QUERY_LIMITS = {
        GRATIS: 3,
        PRO: 30,
    };
    ```

- **Impacto:**
    - ❌ **Mantenibilidad:** Si cambias un límite, debes cambiarlo en dos lugares
    - ❌ **Riesgo de bugs:** Fácil olvidar actualizar uno de los dos
    - ❌ **Desincronización:** Frontend puede mostrar "3 consultas restantes" mientras backend permite 5
- **Solución:**
    1. **Opción A:** Crear archivo compartido `constants/aiLimits.ts` (pero ojo, functions/ no puede importar de app/)
    2. **Opción B (recomendada):** Consultar límites desde backend al cargar la app
    3. **Opción C:** Eliminar validación frontend, confiar 100% en backend
- **Prioridad:** 🟠 **MEDIA-ALTA** - Puede causar confusión y bugs al cambiar límites

#### 3. agregarProducto() no sincroniza automáticamente con Firestore

- **Archivo:** `store/useStore.ts` (líneas 196-201)
- **Problema:** El método `agregarProducto()` solo agrega el producto localmente, la sincronización con Firestore se hace manualmente desde la pantalla
- **Código actual:**
    ```typescript
    agregarProducto: (productoCompleto) => {
        // Solo agregar localmente al store
        // La sincronización con Firestore se hace manualmente desde la pantalla
        set((state) => ({
            productos: [...state.productos, productoCompleto],
        }));
    },
    ```
- **Comparación con otros métodos:**
    - ✅ `actualizarProducto()` - Sincroniza automáticamente
    - ✅ `eliminarProducto()` - Sincroniza automáticamente
    - ❌ `agregarProducto()` - NO sincroniza automáticamente
- **Impacto:**
    - ⚠️ **Inconsistencia:** Diferentes comportamientos entre métodos similares
    - ⚠️ **Riesgo:** Si alguna pantalla futura olvida sincronizar, el producto solo existe localmente
    - ⚠️ **Complejidad:** Los desarrolladores deben recordar sincronizar manualmente
- **Solución:** Hacer sincronización automática como en `actualizarProducto()` y `eliminarProducto()`
- **Prioridad:** 🟠 **MEDIA** - Funciona actualmente pero es inconsistente y riesgoso

---

### 🟡 MENOR (Mejora de calidad o seguridad)

#### 1. Uso excesivo de `any` en catch blocks

- **Archivos afectados:** useStore.ts, useAuthStore.ts, databaseService.ts, crear-cuenta.tsx, asistente-ia.tsx
- **Problema:** `catch (error: any)` desactiva el type checking de TypeScript
- **Ubicaciones:** 20+ ocurrencias en total
- **Ejemplo actual:**
    ```typescript
    catch (error: any) {
        console.log("Error:", error);
    }
    ```
- **Impacto:**
    - ⚠️ TypeScript no puede detectar errores en tiempo de compilación
    - ⚠️ Puede ocultar bugs relacionados con manejo de errores
    - ⚠️ No se aprovecha la verificación de tipos
- **Solución recomendada:**
    ```typescript
    catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido:", String(error));
        }
    }
    ```
- **Prioridad:** 🟡 **BAJA** - Funciona correctamente, pero reduce calidad del código

#### 2. Validación de producto.nombre sin optional chaining completo

- **Archivo:** `firebase/databaseService.ts` (línea 116-135)
- **Problema:** Accede a `item.producto.nombre` sin validar que `producto` exista primero
- **Código actual:**
    ```typescript
    const productName = item?.producto?.nombre || "Producto desconocido";
    ```
- **Análisis:**
    - ✅ Ya tiene optional chaining (`?.`)
    - ✅ Tiene fallback con `|| "Producto desconocido"`
    - ℹ️ Técnicamente es correcto y seguro
- **Impacto:** 🟡 **NINGUNO** - El código actual es correcto
- **Prioridad:** 🟡 **MUY BAJA** - No requiere cambios (falsa alarma del diagnóstico inicial)

#### 3. Sincronización frecuente al volver al foreground

- **Archivo:** `app/_layout.tsx` (líneas 156-176)
- **Problema:** Llama a `syncSubscriptionWithBackend()` CADA VEZ que la app vuelve al foreground
- **Código:**
    ```typescript
    const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") {
            syncSubscriptionWithBackend(usuario.uid);
        }
    });
    ```
- **Impacto:**
    - ⚠️ Si el usuario hace app switching rápido (WhatsApp → NegocIA → Fotos → NegocIA), se hacen múltiples sincronizaciones
    - ⚠️ Cada sincronización consulta RevenueCat + actualiza Firestore
    - ⚠️ Posible sobrecarga si el usuario cambia de app frecuentemente
- **Solución:** Implementar throttle (máximo 1 sincronización cada 5 minutos)
- **Prioridad:** 🟡 **BAJA** - Solo afecta usuarios que cambian de app muy seguido

#### 4. Archivo configuracion.tsx vacío sin especificación

- **Archivo:** `app/(features)/configuracion.tsx`
- **Problema:** Archivo completamente vacío (0 líneas), pero existe una ruta `/(features)/configuracion`
- **Impacto:**
    - ⚠️ Si un usuario intenta navegar a esa ruta, encontrará pantalla en blanco
    - ⚠️ Confusión en el código (¿para qué existe?)
    - ⚠️ No está en copilot-instructions.md, no está claro si es necesaria
- **Solución:**
    1. Si es necesaria: Definir qué configuraciones ofrece e implementarla
    2. Si no es necesaria: Eliminar el archivo y la ruta
- **Prioridad:** 🟡 **BAJA** - No afecta funcionalidad actual (nadie navega ahí)

---

## 📊 ESTADÍSTICAS DEL DIAGNÓSTICO

| Categoría                   | Cantidad | Porcentaje |
| --------------------------- | -------- | ---------- |
| **Archivos analizados**     | 35       | 100%       |
| **Problemas críticos**      | 2        | 5.7%       |
| **Problemas importantes**   | 3        | 8.6%       |
| **Mejoras menores**         | 4        | 11.4%      |
| **Verificaciones exitosas** | 26       | 74.3%      |

### Desglose por categoría funcional

| Área                         | Estado         | Problemas                  |
| ---------------------------- | -------------- | -------------------------- |
| **Esquema de Datos**         | ✅ Correcto    | 0                          |
| **Autenticación**            | ⚠️ Con mejoras | 1 (doble carga)            |
| **Sincronización Firestore** | ⚠️ Con mejoras | 1 (agregarProducto)        |
| **Sistema de IA**            | ✅ Correcto    | 1 (límites duplicados)     |
| **RevenueCat**               | ✅ Correcto    | 0                          |
| **Reglas Firestore**         | ❌ Incompleto  | 1 crítico (métricas)       |
| **Tipos TypeScript**         | ⚠️ Con mejoras | 1 (uso de any)             |
| **Seguridad**                | ✅ Correcto    | 0                          |
| **Archivos pendientes**      | ❌ Incompleto  | 1 crítico (config inicial) |

---

## 🎯 PLAN DE ACCIÓN RECOMENDADO

### Fase 1: CRÍTICO (Antes de producción)

**Tiempo estimado:** 1-2 días

1. **Agregar regla de Firestore para métricas** ⏱️ 5 minutos
    - Editar `firestore.rules`
    - Agregar regla para `usuarios/{userId}/metricas/{document=**}`
    - Probar lectura/escritura de métricas en local
    - Deploy a producción

2. **Implementar configuracion-inicial-ia.tsx** ⏱️ 6-8 horas
    - Diseñar UI de la pantalla
    - Crear Cloud Function para generar productos con Gemini
    - Implementar preview de productos sugeridos
    - Conectar con Firestore para guardar productos
    - Probar flujo completo

### Fase 2: IMPORTANTE (Primera semana post-MVP)

**Tiempo estimado:** 2-3 horas

3. **Eliminar doble carga de datos** ⏱️ 30 minutos
    - Eliminar carga de `useAuthStore.ts` (líneas 151-160)
    - Probar login y verificar que datos se cargan correctamente
    - Verificar que no hay regresiones

4. **Consolidar límites de IA** ⏱️ 1 hora
    - Decidir estrategia (backend-only o constantes compartidas)
    - Implementar solución elegida
    - Probar que límites se respetan en frontend y backend

5. **Hacer agregarProducto() consistente** ⏱️ 1 hora
    - Modificar método para sincronizar automáticamente
    - Actualizar pantalla de productos
    - Probar flujo completo de agregar producto

### Fase 3: MEJORAS (Segunda semana)

**Tiempo estimado:** 2-3 horas

6. **Reemplazar `any` por `unknown` en catch blocks** ⏱️ 1-2 horas
    - Buscar/reemplazar en todos los archivos
    - Agregar validación de tipo apropiada
    - Probar manejo de errores

7. **Implementar throttle para sincronización** ⏱️ 30 minutos
    - Agregar utilidad de throttle
    - Aplicar a `syncSubscriptionWithBackend`
    - Probar comportamiento

8. **Decidir sobre configuracion.tsx** ⏱️ 30 minutos
    - Definir si es necesaria
    - Eliminar o implementar según decisión

---

## 📝 NOTAS ADICIONALES

### Contexto del proyecto

**Nombre:** NegocIA  
**Descripción:** App de punto de venta (POS) con asistente de IA conversacional  
**Target:** Negocios pequeños y medianos en México/Latinoamérica  
**Diferenciador:** "Configurar y operar la app debe sentirse tan fácil como mandar un mensaje de WhatsApp"

### Stack tecnológico

- **Frontend:** React Native + Expo + NativeWind
- **Backend:** Firebase (Auth, Firestore, Functions, Storage)
- **IA:** Gemini 2.5 Flash
- **Pagos:** RevenueCat + Google Play Billing
- **Analytics:** Mixpanel

### Estado actual

- ✅ **Core funcional implementado:** Productos, ventas, autenticación, suscripciones
- ✅ **IA funcionando:** Function calling con Gemini, límites implementados
- ⚠️ **2 problemas críticos:** Reglas Firestore y pantalla de configuración inicial
- ⚠️ **3 problemas importantes:** Optimizaciones necesarias
- ✅ **Arquitectura sólida:** Zustand + Firebase + TypeScript

### Conclusión

El proyecto está en un **estado sólido y funcional**, con una arquitectura bien diseñada y la mayoría de las funcionalidades core implementadas correctamente. Los problemas críticos identificados son **relativamente fáciles de corregir** (agregar regla de Firestore e implementar pantalla pendiente).

Una vez corregidos los 2 problemas críticos y los 3 problemas importantes, el proyecto estará **listo para producción** con alta calidad de código y seguridad.

---

**Documento generado:** 28 de febrero de 2026  
**Última revisión:** 28 de febrero de 2026  
**Próxima revisión recomendada:** Después de implementar las correcciones de Fase 1
