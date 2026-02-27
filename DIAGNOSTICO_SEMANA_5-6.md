# 📊 DIAGNÓSTICO: Semana 5-6 — Cloud Functions + IA

**Fecha:** 25 de febrero, 2026  
**Enfoque:** Análisis de dependencias para implementar Cloud Functions y Asistente IA

---

## 1️⃣ ESTADO ACTUAL — FIRESTORE

### ✅ Lo que Existe

#### Estructura de Base de Datos

```
Firestore (definido en firestore.rules):
├── usuarios/{userId}
│   └── Reglas: solo lectura/escritura del propietario
├── productos/{productoId}
│   └── Estructura esperada: { nombre, precio, usuarioId, ... }
│   └── Reglas: Solo el dueño puede leer/modificar
└── ventas/{ventaId}
    └── Estructura esperada: { usuarioId, items[], total, fecha, ... }
    └── Reglas: Solo el dueño puede leer/modificar
```

#### Archivos Existentes

- ✅ `firebase/firebaseConfig.js` — Inicialización de Firebase + Emuladores configurados
- ✅ `firebase/databaseService.ts` — Servicio completo:
    - ✅ `addProducto()` — Funcional, agrega a Firestore
    - ✅ `getProductos()` — Mapeo completo
    - ✅ `updateProducto()` y `deleteProducto()`
    - ✅ `addVenta()` y `getVentas()`
    - ✅ `getVentasPorFecha()`
    - ✅ `crearUsuario()`, `getUsuario()`, `updateUsuario()`
- ✅ `firestore.rules` — Reglas completas y funcionales
- ✅ Interfaces TypeScript:
    - `Usuario` — con `plan` ("GRATIS"|"PRO") y `creditos`
    - `Producto` — con `id`, `uid`, `nombre`, `precio`
    - `Venta` — con `items[]`, `total`, `fecha`
    - `ItemVenta` — con `producto`, `cantidad`, `subtotal`

#### Sincronización Actual

- ❌ **CRÍTICO**: Los datos NO se sincronizan automáticamente a Firestore
- ❌ Las ventas se guardan SOLO en MMKV (Zustand local)
- ❌ Los productos se guardan SOLO en MMKV (aunque `databaseService.addProducto()` existe)
- ❌ El usuario autenticado NO se sincroniza a la colección `usuarios`
- ❌ No hay escucha (listeners) a cambios en Firestore

---

## 2️⃣ DEPENDENCIAS TÉCNICAS FALTANTES

### Bloqueadores Críticos para IA

| Necesidad                                       | Estado        | Por qué es crítico para IA                                                                                                       |
| ----------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Datos en Firestore**                          | ❌ FALTA      | La IA necesita leer productos y ventas reales. Si están solo en local, cada usuario ve datos inconsistentes en la Cloud Function |
| **Sincronización bidireccional**                | ❌ FALTA      | Si el usuario crea un producto offline, debe sincronizarse cuando tenga conexión, para que Cloud Function lo vea                 |
| **Gemini API instalada**                        | ❌ FALTA      | `npm install @google/generative-ai` en `functions/`                                                                              |
| **Variable de entorno GEMINI_API_KEY**          | ❌ FALTA      | Debe estar en `.env` de Cloud Functions (nunca en el cliente)                                                                    |
| **Cloud Function askAssistant()**               | ❌ FALTA      | Endpoint que recibe pregunta + contexto del negocio                                                                              |
| **Sistema de límites en Firestore**             | ❌ FALTA      | `usuarioId/ai_usage` documento con `queriesUsedToday`, `resetAt`                                                                 |
| **Validación de suscripción en Cloud Function** | ❌ FALTA      | La función debe verificar que usuario sea PRO antes de responder (no confiar en `isPro` local)                                   |
| **Pantalla Chat IA (vacía)**                    | ❌ INCOMPLETO | `app/(features)/asistente-ia.tsx` existe pero está vacía                                                                         |

### Dependencias de Librerías

**En `functions/package.json` (actual):**

```json
"dependencies": {
  "firebase-admin": "^13.6.0",
  "firebase-functions": "^7.0.0"
}
```

**Falta agregar:**

```json
"@google/generative-ai": "^0.5.0"  // Para Gemini API
```

---

## 3️⃣ PLAN DE CONSTRUCCIÓN — Orden Sin Dependencias Circulares

### **BLOQUE A: Infraestructura de Firestore**

_Desbloquea:_ Que Cloud Functions tenga datos reales para leer

#### A.1 — Completar databaseService.ts ✅ **BASE**

- [x] Completar `getProductos(userId)` — terminar mapeo de resultados
- [x] Agregar `updateProducto(userId, id, datos)`
- [x] Agregar `deleteProducto(userId, id)`
- [x] Agregar `addVenta(userId, venta: Venta)`
- [x] Agregar `getVentas(userId, dias?: number)` — último mes por defecto
- [x] Agregar `getVentasPorFecha(userId, fecha: Date)` — para análisis
- [x] Agregar `crearUsuario(uid, email)` — al registrarse
- [x] Agregar `getUsuario(uid)` — para verificar plan
- [x] Agregar `updateUsuario(uid, datos)`

**Por qué aquí:** Sin estos métodos, Cloud Functions no puede leer los datos que necesita la IA

---

#### A.2 — Sincronizar ventas a Firestore desde Zustand

- [x] Cuando `agregarVenta()` se ejecuta en `useStore.ts`, también llamar a `databaseService.addVenta()`
- [x] Agregar `sincronizarVentasLocales()` para offline-sync: cuando se recupere conexión, enviar ventas guardadas localmente
- [x] Manejar errores: si Firestore falla, la venta sigue guardada en MMKV

**Por qué aquí:** Las ventas deben estar en Firestore para que la IA las lea

---

#### A.3 — Sincronizar productos a Firestore desde Zustand ✅ COMPLETADO

- [x] Cuando `agregarProducto()` se ejecuta, también llamar a `databaseService.addProducto()`
- [x] Idem `actualizarProducto()` y `eliminarProducto()`
- [x] Agregar sincronización offline similar a A.2

**Por qué aquí:** Los productos deben estar en Firestore (aunque ya exista `addProducto()`, no se está usando)

---

#### A.4 — Crear usuario en Firestore al registrarse ✅ COMPLETADO

- [x] En `crear-cuenta.tsx`, después de crear cuenta con Firebase Auth, llamar a `databaseService.crearUsuario(uid, email)`
- [x] Documento debe incluir:
    - `uid`, `correo`, `nombre` (vacío), `plan` ("GRATIS"), `estado` ("activo")
    - `subscriptionStartDate`: Timestamp (fecha de registro para GRATIS)
    - `nextResetDate`: Timestamp (subscriptionStartDate + 30 días)

**Por qué aquí:** La IA necesita saber el plan del usuario y datos básicos

---

### **BLOQUE B: Infraestructura de Cloud Functions**

_Desbloquea:_ Que podamos escribir la lógica de IA

#### B.1 — Preparar Cloud Functions para Gemini API ✅ **BASE**

- [ ] En `functions/package.json`, agregrar `@google/generative-ai`
- [ ] En `.env.example` (crear archivo), documentar variables: `GEMINI_API_KEY`, `FIREBASE_PROJECT_ID`
- [ ] En `functions/.env` (crear y **NO commitear**), agregar valores reales
- [ ] En `functions/tsconfig.json`, asegurar que `lib/index.js` sea el main

**Por qué aquí:** Sin la librería de Gemini, no podemos llamar a la API

---

#### B.2 — Crear estructura de carpetas en functions/src

- [ ] `functions/src/types/` — interfaces para TypeScript
    - `AIRequest.ts` — { question: string, userId: string }
    - `AIResponse.ts` — { answer: string, tokensUsed: number }
- [ ] `functions/src/services/` — servicios reutilizables
    - `geminiService.ts` — llamar a Gemini API
    - `firestoreService.ts` — leer/escribir datos de usuario
- [ ] `functions/src/utils/` — helpers
    - `contextBuilder.ts` — construir contexto de negocio (productos, ventas)
    - `limitsManager.ts` — verificar y actualizar límites de uso

**Por qué aquí:** Código organizado y reutilizable

---

#### B.3 — Crear Cloud Function `askAssistant` (básica)

- [ ] `functions/src/functions/askAssistant.ts`
- [ ] Estructura mínima:
    ```typescript
    export const askAssistant = onCall(async (request) => {
        // 1. Validar: usuario autenticado
        // 2. Leer usuario de Firestore
        // 3. Verificar plan PRO
        // 4. Verificar límites diarios (10/día PRO, 0/día GRATIS)
        // 5. Construir contexto (productos, ventas, métricas)
        // 6. Llamar a Gemini con prompt de sistema
        // 7. Incrementar contador de uso
        // 8. Retornar respuesta
    });
    ```

**Por qué aquí:** Desbloquea la pantalla Chat IA

---

### **BLOQUE C: Sistema de Límites y Validación**

_Desbloquea:_ Protección contra abuso, billingconsi

#### C.1 — Crear estructura de límites en Firestore

- [ ] Agregar documento `usuarios/{uid}/ai_usage/analytics` con:
    ```
    {
      queriesUsedThisMonth: 0,
      nextResetDate: Timestamp, // registro + 30 días (GRATIS) o compra + 30 días (PRO)
      totalQueriesAllTime: 0,
      priceUpdatesUsedThisMonth: 0,
      lastQueryAt: Timestamp
    }
    ```
- [ ] Cloud Function debe mantener estos campos actualizados

**Por qué aquí:** Implementar límites de Cloud Function sin esta estructura es imposible

---

#### C.2 — Implementar limitsManager.ts

- [ ] `checkIfCanQuery(userId, plan)` — retorna true/false
    - Plan GRATIS: límite 3 consultas/mes (30 días)
    - Plan PRO: límite 30 consultas/mes (30 días)
    - Al verificar: comparar fecha actual contra nextResetDate
    - Si ya pasó nextResetDate: resetear queriesUsedThisMonth a 0 y calcular nuevo nextResetDate = nextResetDate anterior + 30 días
    - Si no ha pasado: verificar contra límite normalmente
- [ ] `incrementQueryCount(userId)` — suma 1 al contador
- [ ] `resetCounterIfNeeded(userId)` — verifica si nextResetDate ya pasó y resetea automáticamente
- [ ] `getQueriesRemaining(userId)` — para UI (cuántas consultas quedan en este ciclo de 30 días)

**Por qué aquí:** Lógica centralizada para límites

---

### **BLOQUE D: Pantalla Chat IA**

_Desbloquea:_ Que usuario vea las respuestas de la IA

#### D.1 — Crear componente Chat IA (asistente-ia.tsx)

- [ ] Pantalla con:
    - Historial de mensajes (user/IA)
    - Input para escribir preguntas
    - Indicador de carga mientras Gemini responde
    - Contador de "consultas restantes" (ej: 7/10)
    - Si es GRATIS: paywall "Actualiza a PRO"
- [ ] Integración con Cloud Function:
    ```typescript
    const askAI = async (question: string) => {
        const response = await firebase
            .functions()
            .httpsCallable("askAssistant")({
            question,
            userId: authStore.user.uid,
        });
        return response.data.answer;
    };
    ```

**Por qué aquí:** UI visible para usuario

---

#### D.2 — Crear Store para Chat IA

- [ ] `store/useAIStore.ts`:
    - `messages: { role: "user"|"ai", content: string, timestamp: Date }[]`
    - `isLoading: boolean`
    - `queriesRemaining: number`
    - `addMessage()`
    - `clearChat()`
    - Persistencia en MMKV

**Por qué aquí:** Mantener el chat si usuario cierra la app

---

### **BLOQUE E: Setup de Endpoints (Cloud Functions)**

_Desbloquea:_ Que todo esté desplegado y escriba logs claros

#### E.1 — Crear función de prueba (ping)

- [ ] Cloud Function básica que retorna `{ status: "ok", timestamp }`
- [ ] Deployment en emuladores + testing local

**Por qué aquí:** Verificar que Cloud Functions funciona antes de escribir IA

---

#### E.2 — Agregar logging y error handling

- [ ] Usar `logger.info()` y `logger.error()` en todas las funciones
- [ ] Structured logging con IDs de usuario e IDs de request
- [ ] Mensajes de error claros y específicos (no genéricos)

**Por qué aquí:** Debugging en producción

---

### **BLOQUE F: Configuración de Prompts**

_Desbloquea:_ Que Gemini responda en el tono correcto

#### F.1 — Crear prompt de sistema configurable

- [ ] `functions/src/config/systemPrompt.ts`:
    ```typescript
    export const getSystemPrompt = (nombreNegocio: string) => `
      Eres el asistente de ventas de ${nombreNegocio}.
      [contexto detallado aquí]
    `;
    ```
- [ ] Agregar ejemplos de preguntas esperadas
- [ ] Agregar restricciones (ej: "No responden datos personales de clientes")

**Por qué aquí:** Que IA responda apropiadamente para un POS

---

## 4️⃣ ARCHIVOS RELACIONADOS — Estado Actual

### Archivos que EXISTEN pero están INCOMPLETOS

| Archivo                           | Estado | Qué falta                                        |
| --------------------------------- | ------ | ------------------------------------------------ |
| `firebase/databaseService.ts`     | 20%    | 7 métodos a completar (ver A.1)                  |
| `functions/src/index.ts`          | 1%     | Casi todo — solo boilerplate                     |
| `app/(features)/asistente-ia.tsx` | 0%     | Archivo vacío                                    |
| `store/types.ts`                  | 90%    | Agregar `AIMessage`, `AIUsageStats`              |
| `store/useAuthStore.ts`           | 85%    | Agregar sincronización a Firestore tras registro |

### Archivos que DEBEN CREARSE

| Archivo                                      | Propósito                     | Se crea en |
| -------------------------------------------- | ----------------------------- | ---------- |
| `functions/src/services/geminiService.ts`    | Llamar Gemini API             | Bloque B.2 |
| `functions/src/services/firestoreService.ts` | Leer/escribir Firestore       | Bloque B.2 |
| `functions/src/types/AIRequest.ts`           | Tipado de solicitudes         | Bloque B.2 |
| `functions/src/types/AIResponse.ts`          | Tipado de respuestas          | Bloque B.2 |
| `functions/src/utils/contextBuilder.ts`      | Armar contexto negocio        | Bloque B.3 |
| `functions/src/utils/limitsManager.ts`       | Validar límites               | Bloque C.2 |
| `functions/src/functions/askAssistant.ts`    | Cloud Function principal      | Bloque B.3 |
| `functions/src/config/systemPrompt.ts`       | Prompt del sistema            | Bloque F.1 |
| `store/useAIStore.ts`                        | Store chat IA                 | Bloque D.2 |
| `.env.example`                               | Documentar variables          | Bloque B.1 |
| `.env` (local)                               | Valores reales - NO commitear | Bloque B.1 |

---

## 5️⃣ PUNTOS CRÍTICOS Y RIESGOS

### ⚠️ Riesgo 1: Datos locales vs Firestore

**Problema:** Actualmente productos y ventas están solo en MMKV. IA no ve nada.  
**Solución:** Completar A.1 → A.2 → A.3 en orden.  
**Riesgo si no se hace:** La IA tendrá contexto vacío, respuestas inútiles.

### ⚠️ Riesgo 2: API Key de Gemini expuesta

**Problema:** Si se hardcodea en el código client o se commitea en `.env`.  
**Solución:** SOLO en `functions/.env`, nunca en código o Git.  
**Validación:** Ejecutar `grep -r "sk-" .git/ functions/` antes de deploy.

### ⚠️ Riesgo 3: Límites no verificados en servidor

**Problema:** Si confías solo en `isPro` local, usuario hace 1000 queries offline.  
**Solución:** La Cloud Function SIEMPRE verifica límites en Firestore (bloque C).  
**Validación:** Cloud Function rechaza si contador ≥ límite (10/día PRO).

### ⚠️ Riesgo 4: Cambios en el chat no persisten

**Problema:** Usuario cierra app a mitad de conversación.  
**Solución:** `useAIStore` con persistencia en MMKV (bloque D.2).

---

## 6️⃣ SECUENCIA RECOMENDADA DE IMPLEMENTACIÓN

```
SEMANA 5 (Días 1-3): Infraestructura Firestore
├─ A.1 Completar databaseService.ts
├─ A.2 Sincronizar ventas
└─ A.3 Sincronizar productos

SEMANA 5 (Días 4-5): Setup Cloud Functions
├─ B.1 Gemini API + .env
├─ B.2 Estructura de carpetas + tipos
└─ B.3 Cloud Function askAssistant (básica)

SEMANA 5 (Días 6-7): Límites y Validación
├─ A.4 Crear usuario en Firestore
├─ C.1 Estructura de límites
└─ C.2 limitsManager.ts

SEMANA 6 (Días 1-2): Pantalla Chat IA
├─ D.1 asistente-ia.tsx
└─ D.2 useAIStore.ts

SEMANA 6 (Días 3-4): Testing y Refinamiento
├─ E.1 Cloud Function de prueba
├─ E.2 Logging completo
├─ F.1 Prompt de sistema
└─ Testing end-to-end

SEMANA 6 (Días 5-7): Pulido
├─ Mensajes de error clarificados
├─ UI/UX del chat mejorada
└─ Deploy a staging para pruebas
```

---

## ⚡ Resumen de Bloqueadores

| Bloqueador                      | Solución | Esfuerzo |
| ------------------------------- | -------- | -------- |
| ❌ Datos no en Firestore        | A.1-A.3  | 2 días   |
| ❌ No hay Cloud Functions       | B.1-B.3  | 3 días   |
| ❌ No hay límites implementados | C.1-C.2  | 1 día    |
| ❌ No hay UI de Chat            | D.1-D.2  | 1.5 días |
| ❌ No hay Gemini API            | B.1      | 0.5 días |

**Total estimado:** 8 días para v1 funcional (Semana 5-6).
