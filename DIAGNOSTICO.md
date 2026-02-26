# 📊 DIAGNÓSTICO COMPLETO DEL PROYECTO — AppNegocIA

**Fecha:** 25 de febrero, 2026  
**Estado General:** En desarrollo — 55-60% completado

---

## 🎯 Resumen Ejecutivo

El proyecto está en **Semanas 1-4 completadas, iniciando Semana 5-6**. Tiene foundations sólidas de autenticación, estado global y sincronización con Firestore. Listo para implementar Cloud Functions y sistema de IA.

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

### **SEMANA 3 — Persistencia + Ventas Básicas** ✅ COMPLETO

- ✅ AsyncStorage configurado
- ✅ `useSaleStore` con estado de ventas
- ✅ Carrito con funciones `agregarAlCarrito`, `vaciarCarrito`
- ✅ `eliminarDelCarrito()` implementado correctamente
- ✅ Pantalla Nueva Venta completa
- ✅ Cálculo automático de total y cambio
- ✅ Persistencia local de productos y carrito
- ✅ Badges circulares rojos en cards de productos
- ✅ Botones +/- en cada card
- ✅ Modal bottom sheet del carrito con detalle de items
- ✅ Swipe izquierdo para eliminar items del carrito
- ✅ KeyboardAvoidingView corregido en nueva-venta.tsx
- ✅ Fix padding input Monto Recibido
- ✅ Validación de carrito vacío
- ✅ Búsqueda y filtrado funcional en buscador.tsx
- ✅ Refresco inmediato de lista al agregar producto

**Archivos clave:**

- `store/useStore.ts`
- `app/(main)/(navigation)/(ventas)/nueva-venta.tsx`
- `components/buscador.tsx`

---

### **SEMANA 4 — Firebase + Autenticación** ✅ COMPLETO

- ✅ Firebase inicializado correctamente
- ✅ Firebase Auth configurado
- ✅ Pantalla de Login funcional
- ✅ Pantalla de Registro con validaciones
- ✅ `useAuthStore` con login/logout
- ✅ Sesión persistente (AsyncStorage)
- ✅ Emuladores configurados (desarrollo local)
- ✅ Protección de rutas en `app/_layout.tsx`
- ✅ Botón cerrar sesión implementado
- ✅ trim() de email en crear-cuenta.tsx
- ✅ Mensajes de error descriptivos en iniciar-sesion.tsx
- ✅ Eliminado AsyncStorage.clear() en index.tsx
- ⚠️ **Pendiente (post-MVP):** Google OAuth

**Archivos clave:**

- `firebase/firebaseConfig.js`
- `app/(auth)/iniciar-sesion.tsx`
- `app/(auth)/crear-cuenta.tsx`
- `app/_layout.tsx`

---

## 🔄 EN PROGRESO (INCOMPLETO)

### **Pantalla de Productos** — Pendientes

| Línea | Archivo                                          | Tipo     | Descripción                                                                        |
| ----- | ------------------------------------------------ | -------- | ---------------------------------------------------------------------------------- |
| 22    | `app/(main)/(navigation)/(ventas)/productos.tsx` | **TODO** | Iconos en categorías — agregar librería de iconos o que IA decida icono por nombre |

---

### **OAuth (Post-MVP)**

| Línea | Archivo                         | Tipo     | Descripción                                                                                                   |
| ----- | ------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| 66    | `app/(auth)/iniciar-sesion.tsx` | **TODO** | **Autenticación con Google** — botón existe pero sin implementación (post-MVP)                                |
| 100   | `app/(auth)/crear-cuenta.tsx`   | **TODO** | Refactorizar sign-up para usar OAuth (Google, iCloud, GameCenter) — el email/password actual será reemplazado |

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

### 🔴 **CRÍTICO (Semana 5-6, En Progreso)**

1. **Cloud Functions skeleton** — crear estructura básica
2. **Pantalla Asistente IA** — `asistente-ia.tsx` (actualmente vacío)
3. **Sistema de límites de usuario en Firestore** — contadores mensuales
4. **Gemini API integration** — backend solamente

### 🟠 **IMPORTANTE (Mejoras Post-Semana 4)**

5. **Iconos en categorías** — productos.tsx
6. **Google OAuth** — post-MVP, reemplazará email/password

### 🟡 **PARA SEMANA 7-8 (Monetización)**

7. **RevenueCat + pagos** — suscripciones GRATIS/PRO
8. **Pantalla de Planes (Paywall)** — comparación planes
9. **Validación de suscripción backend** — Cloud Function

### ⚪ **FUTURO (Semana 9-10)**

- Build para producción (EAS)
- Deploy a Google Play Store
- Assets finales (icono, splash screen)
- Configuración inicial con IA (post-MVP)

---

## 🚀 Recomendación

**Estatus Actual:** El proyecto está **bien fundamentado con Semanas 1-4 completadas**. Listo para iniciar Cloud Functions y sistema de IA.

**Prioridad inmediata (Semana 5-6):**

1. 🚀 Configurar **Cloud Functions** con Gemini API
2. 🚀 Implementar **sistema de límites** en Firestore (contadores mensuales)
3. 🚀 Crear **Pantalla Asistente IA** con chat conversacional
4. 🚀 Sincronizar **productos y ventas** a Firestore
5. 🚀 Testing end-to-end de funcionalidad IA

Una vez eso esté listo, será momento de abordar RevenueCat y monetización.

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

- **Límites de Consultas IA:**
    - **Plan GRATIS:** 3 consultas cada 30 días
    - **Plan PRO:** 30 consultas cada 30 días
    - Reset cada 30 días desde fecha de registro (GRATIS) o fecha de compra (PRO)
    - Contador: `queriesUsedThisMonth` en Firestore (`usuarios/{uid}/ai_usage/analytics`)
    - Próximo reset: `nextResetDate` calculado como subscriptionStartDate + 30 días
