# 📊 DIAGNÓSTICO COMPLETO DEL PROYECTO — AppNegocIA

**Fecha:** 25 de febrero, 2026  
**Estado General:** En desarrollo — 35-40% completado

---

## 🎯 Resumen Ejecutivo

El proyecto está en **SEMANA 3-4 de progreso**. Tiene foundations sólidas de autenticación y estado global, pero le faltan componentes críticos en IA, pagos y varias pantallas clave.

---

## ✅ COMPLETADO EN EL ROADMAP

### **SEMANA 1 — Setup + Primera Pantalla** ✅ COMPLETO

- ✅ Proyecto Expo creado con TypeScript
- ✅ NativeWind + Tailwind configurados
- ✅ expo-router funcionando
- ✅ Pantalla de bienvenida (Onboarding)
- ✅ Navegación entre pantallas
- ✅ Estructura base del dashboard

**Archivos clave:**

- `app/index.tsx`
- `app/_layout.tsx`
- `tailwind.config.js`

---

### **SEMANA 2 — Estado Global + Lista de Productos** ✅ COMPLETO

- ✅ Zustand configurado con persistencia
- ✅ `useProductStore` implementado
- ✅ Interfaces TypeScript (`Product`, `Venta`, `ItemVenta`)
- ✅ Pantalla de Lista de Productos
- ✅ Modal para agregar productos
- ✅ Funcionalidad CRUD para productos (add, delete, update)

**Archivos clave:**

- `store/useStore.ts`
- `store/useAuthStore.ts`
- `store/types.ts`
- `app/(main)/(navigation)/(ventas)/productos.tsx`

---

### **SEMANA 4 — Firebase + Autenticación** ⚠️ 85% COMPLETADO

- ✅ Firebase inicializado correctamente
- ✅ Firebase Auth configurado
- ✅ Pantalla de Login funcional
- ✅ Pantalla de Registro con validaciones
- ✅ `useAuthStore` con login/logout
- ✅ Sesión persistente (AsyncStorage)
- ✅ Emuladores configurados (desarrollo local)
- ⚠️ **Falta:** Protección de rutas clara en `app/_layout.tsx`
- ⚠️ **Falta:** Botón de cerrar sesión en app
- ⚠️ **Falta:** Google OAuth (marcado como TODO)

**Archivos clave:**

- `firebase/firebaseConfig.js`
- `app/(auth)/iniciar-sesion.tsx`
- `app/(auth)/crear-cuenta.tsx`

---

## 🔄 EN PROGRESO (INCOMPLETO)

### **SEMANA 3 — Persistencia + Ventas Básicas** ⚠️ 70% COMPLETADO

#### ✅ Lo que Sí Existe:

- ✅ AsyncStorage configurado
- ✅ `useSaleStore` con estado de ventas
- ✅ Carrito con funciones `agregarAlCarrito`, `vaciarCarrito`
- ✅ Pantalla Nueva Venta (estructura base)
- ✅ Cálculo automático de total y cambio
- ✅ Persistencia local de productos y carrito

#### ❌ Lo que Falta:

| Línea | Archivo                                            | Tipo        | Descripción                                                                                                           |
| ----- | -------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------- |
| 20    | `store/useStore.ts`                                | **TODO**    | `eliminarDelCarrito()` — actualmente es **STUB** (solo retorna 0). Debe reducir cantidad en 1 y eliminar si llega a 0 |
| 22    | `app/(main)/(navigation)/(ventas)/nueva-venta.tsx` | **TODO**    | Modal para mostrar productos seleccionados en el carrito                                                              |
| 24    | `app/(main)/(navigation)/(ventas)/nueva-venta.tsx` | **TODO**    | Validación: si no hay productos, mostrar mensaje y redirigir a pantalla de productos                                  |
| —     | —                                                  | **MISSING** | **Pantalla de Historial de Ventas** — No existe archivo ni ruta. Necesaria para semana 3                              |
| 20    | `app/(main)/(navigation)/(ventas)/nueva-venta.tsx` | **FIXME**   | SafeAreaView causa padding feo cuando se activa el teclado                                                            |
| 59    | `app/(main)/(navigation)/(ventas)/nueva-venta.tsx` | **FIXME**   | Input de "Monto Recibido" deja padding feo al cerrarse                                                                |

---

### **SEMANA 4 — Autenticación (cont.)** — FIXMEs Importantes

| Línea | Archivo                         | Tipo      | Descripción                                                                                                   |
| ----- | ------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| 20    | `app/(auth)/crear-cuenta.tsx`   | **FIXME** | **Trim de espacios en email** — usuarios al pegar email con espacios finales, la app rechaza como inválido    |
| 7     | `app/(auth)/iniciar-sesion.tsx` | **FIXME** | Mensajes de error genéricos o incompletos — crear mensajes más descriptivos                                   |
| 66    | `app/(auth)/iniciar-sesion.tsx` | **TODO**  | **Autenticación con Google** — botón existe pero sin implementación                                           |
| 100   | `app/(auth)/crear-cuenta.tsx`   | **TODO**  | Refactorizar sign-up para usar OAuth (Google, iCloud, GameCenter) — el email/password actual será reemplazado |

---

### **Pantalla de Productos** — TODOs

| Línea | Archivo                                          | Tipo     | Descripción                                                                         |
| ----- | ------------------------------------------------ | -------- | ----------------------------------------------------------------------------------- |
| 22    | `app/(main)/(navigation)/(ventas)/productos.tsx` | **TODO** | Iconos en categorías — agregar librería de iconos o que IA decida icono por nombre  |
| 46    | `app/(main)/(navigation)/(ventas)/productos.tsx` | **TODO** | **Refrescar lista de productos** cuando se agrega uno nuevo (sin recargar pantalla) |

---

### **Componentes** — TODOs y FIXMEs

| Línea | Archivo                   | Tipo     | Descripción                                                             |
| ----- | ------------------------- | -------- | ----------------------------------------------------------------------- |
| 38    | `components/buscador.tsx` | **TODO** | Buscador es solo visual — agregar método de búsqueda/filtrado funcional |

---

### **Limpieza de Código**

| Línea | Archivo         | Tipo     | Descripción                                            |
| ----- | --------------- | -------- | ------------------------------------------------------ |
| 10-11 | `app/index.tsx` | **TODO** | Eliminar `AsyncStorage.clear()` (código de desarrollo) |

---

## ❌ NO INICIADO / VACÍO

### **SEMANA 5-6 — Cloud Functions + IA** ❌ 0% (TODO)

#### 📁 Archivos Vacíos:

- 🔴 `app/(features)/asistente-ia.tsx` — **VACÍO**
- 🔴 `app/(auth)/configuracion-inicial-ia.tsx` — **VACÍO**

#### ❌ Lo que Falta Completamente:

| Funcionalidad                              | Estado       | Roadmap    |
| ------------------------------------------ | ------------ | ---------- |
| Cloud Function `askAssistant`              | ❌ NO EXISTE | Semana 5-6 |
| Gemini API Integration                     | ❌ NO EXISTE | Semana 5-6 |
| Sistema de límites por usuario (Firestore) | ❌ NO EXISTE | Semana 5-6 |
| Pantalla Chat IA                           | ❌ VACÍO     | Semana 5-6 |
| Configuración inicial con IA               | ❌ VACÍO     | Semana 5-6 |
| Actualización masiva de precios            | ❌ NO EXISTE | Post-MVP   |

**Crítico:** Gemini API key debe estar SOLO en backend (Cloud Functions), NUNCA en app.

---

### **SEMANA 7-8 — RevenueCat + Pagos** ❌ 0% (TODO)

| Funcionalidad                     | Estado | Notas                                                   |
| --------------------------------- | ------ | ------------------------------------------------------- |
| RevenueCat instalado              | ❌ NO  | Necesario package: `react-native-purchases`             |
| Pantalla de Planes (Paywall)      | ❌ NO  | Debe comparar GRATIS vs PRO                             |
| Google Play Console Integration   | ❌ NO  | Revisar `firebaseConfig.js` — no hay referencias        |
| Validación de suscripción backend | ❌ NO  | Cloud Function necesaria                                |
| Lógica de upgrade prompts         | ❌ NO  | Cuando usuario gratuito toque IA o alcance 30 productos |

**Status:** Esta funcionalidad es crítica para monetización — sin ella NO hay ROI.

---

### **SEMANA 9-10 — Build + Deploy** ❌ 0% (TODO)

| Tarea                           | Estado     | Notas                                       |
| ------------------------------- | ---------- | ------------------------------------------- |
| Icono de app (1024x1024)        | ❌ NO      | Assets solo tiene `presentacion.png`        |
| Splash screen                   | ❌ NO      | No está configurado                         |
| Configuración final de app.json | ⚠️ PARCIAL | Necesita nombre final, bundle ID, versión   |
| EAS CLI setup                   | ❌ NO      | `eas build:configure` no ejecutado          |
| Build para producción           | ❌ NO      | Sin testing                                 |
| Google Play listing             | ❌ NO      | Sin descripción, screenshots, clasificación |

---

### **Pantallas Vacías (Sin Implementar)**

| Ruta                        | Archivo                            | Semana   | Estado   |
| --------------------------- | ---------------------------------- | -------- | -------- |
| `/(features)/asistente-ia`  | `app/(features)/asistente-ia.tsx`  | 5-6      | 🔴 VACÍO |
| `/(features)/configuracion` | `app/(features)/configuracion.tsx` | Post-MVP | 🔴 VACÍO |
| `/(main)/perfil`            | `app/(main)/perfil.tsx`            | 4+       | 🔴 VACÍO |

---

## 📦 Dependencias y Configuración

### ✅ Instaladas:

- ✅ Firebase (auth, firestore, functions)
- ✅ Zustand (estado global)
- ✅ AsyncStorage (persistencia)
- ✅ NativeWind + Tailwind
- ✅ expo-router
- ✅ lucide-react-native (iconos)

### ❌ Faltarán (para completar MVP):

- ❌ `@google/generative-ai` (backend solamente)
- ❌ `react-native-purchases` (RevenueCat)
- ❌ Mixpanel (analytics)

---

## 📋 Matriz de Prioridad — Qué Completar Primero

### 🔴 **CRÍTICO (Semana 3-4, Bloquean Avance)**

1. **Pantalla Historial de Ventas** — FALTA completamente (semana 3)
2. **`eliminarDelCarrito()`** — actualmente es stub (semana 3)
3. **Protección de rutas** — validar autenticación en `app/_layout.tsx` (semana 4)
4. **Google OAuth** — IA sugerirá OAuth en lugar de email/password (semana 4)

### 🟠 **IMPORTANTE (Semana 3-4, Mejora UX)**

5. **FIXME: trim() de email** — usuarios pegan con espacios
6. **FIXME: SafeAreaView y padding** — issues visuales en `nueva-venta.tsx`
7. **TODO: Refrescar lista de productos** — sin recargar pantalla
8. **TODO: Modal de carrito seleccionado** — mostrar items agregados

### 🟡 **PARA SEMANA 5-6 (IA — POST-SEMANA-4)**

9. **Cloud Functions skeleton** — crear estructura básica
10. **Pantalla Asistente IA** — `asistente-ia.tsx` (actualmente vacío)
11. **Límites de usuario en Firestore**

### ⚪ **FUTURO (Fuera MVP)**

- RevenueCat + pagos (semana 7-8)
- Build y deploy (semana 9-10)
- Configuración inicial con IA (post-MVP)

---

## 🚀 Recomendación

**Estatus Actual:** El proyecto está **bien fundamentado pero necesita completar las semanas 3-4 completamente** antes de avanzar a IA y pagos.

**Prioridad inmediata:**

1. ✋ Crear pantalla de **Historial de Ventas**
2. ✋ Completar `**eliminarDelCarrito()**` en `store/useStore.ts`
3. ✋ Resolver **FIXMEs visuales** en `nueva-venta.tsx`
4. ✋ Implementar **protección de rutas** en `app/_layout.tsx`
5. ✋ Agregar **botón cerrar sesión**

Una vez eso esté listo, será momento de abordar las Cloud Functions y el asistente IA.

---

## 📝 Notas Técnicas

- **Offline:** La app funciona 100% offline actualmente — bien hecho
- **Persistencia:** AsyncStorage + Zustand configurado correctamente
- **Firebase:** Emuladores locales configurados para desarrollo
- **TypeScript:** Tipado completo, buen foundation
- **UI/UX:** Componentes reutilizables bien estructurados

## ❌ FUERA DE SCOPE — Decisiones de Producto

- **Historial de Ventas:** Eliminado intencionalmente del MVP.
  La consulta de historial se hace exclusivamente a través
  del Asistente IA. No crear esta pantalla en ninguna versión.
