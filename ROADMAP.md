# 🗺️ Roadmap de Desarrollo — POS con IA

> **Cómo usar este archivo con Copilot:**
> Abre el chat de Copilot y escribe `#file:ROADMAP.md` para que Copilot tenga contexto del avance actual y pueda ayudarte con la tarea de la semana en curso.

---

## Estado del Proyecto

| Semana | Tema                               | Estado       |
| ------ | ---------------------------------- | ------------ |
| 1      | Setup + Primera Pantalla           | ⬜ Pendiente |
| 2      | Estado Global + Lista de Productos | ⬜ Pendiente |
| 3      | Persistencia + Ventas Básicas      | ⬜ Pendiente |
| 4      | Firebase + Autenticación           | ⬜ Pendiente |
| 5-6    | Cloud Functions + IA               | ⬜ Pendiente |
| 7-8    | RevenueCat + Pagos                 | ⬜ Pendiente |
| 9-10   | Build + Deploy (Play Store)        | ⬜ Pendiente |

**Leyenda:** ⬜ Pendiente · 🔄 En progreso · ✅ Completado

---

## SEMANA 1 — Setup + Primera Pantalla

**Objetivo:** App corriendo en el celular con Expo Go, pantalla de bienvenida y navegación básica.

### Tareas

- [ ] **Día 1:** Crear proyecto Expo con TypeScript
    ```bash
    npx create-expo-app@latest mi-pos-app --template blank-typescript
    ```
- [ ] **Día 1:** Instalar y configurar NativeWind + Tailwind
- [ ] **Día 1:** Instalar todas las dependencias del proyecto
- [ ] **Día 1:** Configurar expo-router para navegación
- [ ] **Día 2-3:** Pantalla de Bienvenida (Onboarding)
    - Título grande, descripción de la app
    - Botón "Empezar" que navega al Dashboard
- [ ] **Día 4-5:** Dashboard básico (estructura vacía con header)
- [ ] **Día 4-5:** Verificar navegación Bienvenida → Dashboard en Expo Go

### Producto Final ✅

- App corriendo en celular con Expo Go
- Pantalla de bienvenida con diseño
- Navegación entre 2 pantallas funcional
- Dashboard vacío pero con estructura

---

## SEMANA 2 — Estado Global + Lista de Productos

**Objetivo:** Sistema de estado con Zustand, pantalla de productos funcional.

### Tareas

- [x] **Día 6-7:** Configurar Zustand — crear `useProductStore`
    - Estado: `products[]`, acciones: `addProduct`, `updateProduct`, `deleteProduct`
- [x] **Día 6-7:** Crear interfaces TypeScript para `Product`
- [x] **Día 8-9:** Pantalla Lista de Productos con FlatList
    - Mostrar nombre y precio de cada producto
    - Botón para agregar nuevo producto
    - Productos hardcodeados inicialmente (Coca Cola, Pan, etc.)
- [x] **Día 10:** Pantalla/Modal Agregar Producto
    - Formulario: nombre + precio
    - Al guardar, aparece en la lista inmediatamente
- [x] **Día 10:** Búsqueda y filtrado funcional en buscador.tsx
- [x] **Día 10:** Refresco inmediato de lista al agregar producto

### Producto Final ✅

- Zustand configurado con store de productos
- Pantalla que muestra lista de productos
- Formulario para agregar producto funcional
- Al agregar, aparece en la lista sin recargar
- Búsqueda funcional de productos
- Lista se actualiza inmediatamente al agregar

---

## SEMANA 3 — Persistencia + Ventas Básicas

**Objetivo:** Datos que sobreviven al cerrar la app, pantalla de venta con carrito.

### Tareas

- [x] **Día 11-12:** Instalar y configurar MMKV
- [x] **Día 11-12:** Conectar MMKV al store de Zustand (middleware `persist`)
    - Productos persisten al cerrar/abrir la app
- [x] **Día 13:** Crear `useSaleStore` con Zustand
    - Estado: `cart[]`, `currentSale`, `salesHistory[]`
    - Acciones: `addToCart`, `removeFromCart`, `completeSale`, `clearCart`
- [x] **Día 13-14:** Pantalla Nueva Venta
    - Lista de productos disponibles (clickable)
    - Sección de carrito con items seleccionados
    - Cálculo automático de total
- [x] **Día 15:** Funcionalidad "Completar Venta"
    - Guarda la venta en el historial local
    - Limpia el carrito
    - Feedback visual de éxito
- [x] **Día 15:** Implementar eliminarDelCarrito() en useStore.ts
- [x] **Día 15:** Badge circular rojo con cantidad en cada card de producto
- [x] **Día 15:** Botones [+] y [-] en cada card
- [x] **Día 15:** Modal bottom sheet del carrito con detalle de items
- [x] **Día 15:** Swipe izquierdo para eliminar item del carrito
- [x] **Día 15:** Fix KeyboardAvoidingView en nueva-venta.tsx
- [x] **Día 15:** Fix padding de input Monto Recibido al cerrar teclado

### Producto Final ✅

- Productos persisten al cerrar la app
- Pantalla de venta con carrito funcional
- Cálculo de total automático
- Historial de ventas guardado localmente
- Gestión avanzada del carrito (badges, botones +/-, modal, swipe)
- UI fija en nueva-venta.tsx sin salteos visuales

---

## SEMANA 4 — Firebase + Autenticación

**Objetivo:** Backend conectado, login/registro funcional, sesión persistente.

### Tareas

- [x] **Día 16:** Crear proyecto en Firebase Console
- [x] **Día 16:** Instalar y configurar `@react-native-firebase/*`
- [x] **Día 16:** Configurar Firebase Auth en el proyecto
- [x] **Día 17:** Pantalla de Login
    - Campos: email + password
    - Validaciones básicas
    - Link a registro
    - Manejo de errores (credenciales incorrectas, etc.)
- [x] **Día 17:** Pantalla de Registro
    - Campos: email + password + confirmar password
    - Link a login
- [x] **Día 18:** Crear `useAuthStore` con Zustand
    - Estado: `user`, `isAuthenticated`, `isPro`
    - Acciones: `login`, `register`, `logout`
- [x] **Día 18:** Protección de rutas en \_layout.tsx
- [x] **Día 18:** Sesión persistente (no pedir login cada vez)
- [x] **Día 18:** Botón cerrar sesión
- [x] **Día 18:** trim() automático de email en crear-cuenta.tsx
- [x] **Día 18:** Mensajes de error descriptivos en iniciar-sesion.tsx
- [x] **Día 18:** Eliminado AsyncStorage.clear() en index.tsx

### Producto Final ✅

- Firebase configurado y conectado
- Login y Registro funcionales
- Sesión persiste entre aperturas de la app
- Rutas protegidas redirigen a login
- Cerrar sesión funcional
- Validaciones y errores mejorados
- Email trimmed automáticamente

---

## SEMANA 5-6 — Cloud Functions + IA

**Objetivo:** Asistente IA conversacional funcional, con datos reales del negocio.

### Tareas

- [ ] **Día 19:** Configurar proyecto de Cloud Functions (Node.js/TypeScript)
- [ ] **Día 19-20:** Crear primera Cloud Function básica (ping/test)
- [ ] **Día 20:** Configurar Gemini API en el backend
    - API key en variables de entorno del servidor (NUNCA en el cliente)
    - Instalar `@google/generative-ai`
- [ ] **Día 21:** Cloud Function `askAssistant`
    - Recibe: pregunta del usuario + contexto del negocio (ventas, productos)
    - Envía a Gemini con prompt del sistema apropiado
    - Retorna respuesta en texto
    - Valida que el usuario sea PRO antes de responder
    - Incrementa contador de consultas del día
- [ ] **Día 21:** Sistema de límites en Firestore
    - Documento por usuario con: `aiQueriesUsedToday`, `aiQueriesResetAt`
    - Reset automático del contador cada 24 horas
- [ ] **Día 22:** Pantalla del Asistente IA
    - Interfaz de chat (mensajes usuario/IA)
    - Input para escribir preguntas
    - Indicador de carga mientras Gemini responde
    - Contador de consultas restantes del día
    - Si es usuario gratuito: mostrar pantalla de upgrade

### Prompt del Sistema para Gemini

```
Eres el asistente de ventas de [nombre del negocio]. Tienes acceso completo
a todos los datos del negocio. Responde siempre en español, de forma clara y
amigable, sin tecnicismos. Da información específica y accionable al dueño.

Contexto actual del negocio:
- Productos: [lista de productos con precios]
- Ventas recientes: [historial de ventas]
- Métricas: [calculadas automáticamente]
```

### Producto Final ✅

- Cloud Function desplegada en Firebase
- API de Gemini integrada de forma segura
- Pantalla de chat con IA funcional
- IA responde con datos reales del negocio
- Límite de consultas por usuario respetado

---

## SEMANA 7-8 — RevenueCat + Pagos

**Objetivo:** Sistema de suscripciones funcional, flujo completo de compra.

### Tareas

- [ ] **Día 23:** Crear app en Google Play Console (requiere $25 USD)
- [ ] **Día 23:** Crear cuenta en RevenueCat y conectar con Google Play
- [ ] **Día 24:** Crear producto de suscripción en Google Play Console
    - ID sugerido: `pos_pro_monthly`
    - Precio: $299 MXN/mes
- [ ] **Día 24:** Configurar RevenueCat
    - Instalar `react-native-purchases`
    - Configurar entitlements y offerings
- [ ] **Día 25:** Pantalla de Planes (Paywall)
    - Comparación visual: GRATIS vs PRO
    - Lista de beneficios de cada plan
    - Botón "Actualizar a PRO" con precio
    - Opción de restaurar compras
- [ ] **Día 25:** Integrar RevenueCat en `useAuthStore`
    - Verificar estado de suscripción al abrir la app
    - Actualizar `isPro` según suscripción activa
- [ ] **Día 26:** Validación de suscripción en el backend
    - Cloud Function que verifica con RevenueCat si el usuario es PRO
    - Guardar estado en Firestore
- [ ] **Día 26:** Lógica de upgrade prompts
    - Usuario gratuito toca IA → pantalla de upgrade
    - Usuario gratuito llega a 30 productos → prompt de upgrade

### Producto Final ✅

- RevenueCat configurado
- Producto de suscripción en Google Play
- Pantalla de planes funcional
- Flujo de compra de Google funcional
- App verifica correctamente si usuario es PRO
- Asistente IA bloqueado para usuarios gratuitos

---

## SEMANA 9-10 — Build + Deploy

**Objetivo:** App compilada, publicada en Google Play Store.

### Tareas

- [ ] **Día 27:** Generar icono de la app (1024x1024px)
- [ ] **Día 27:** Generar splash screen
- [ ] **Día 27:** Configurar `app.json` con datos finales (nombre, bundle ID, versión)
- [ ] **Día 28:** Instalar y configurar EAS CLI
    ```bash
    npm install -g eas-cli
    eas login
    eas build:configure
    ```
- [ ] **Día 29:** Primera compilación para producción
    ```bash
    eas build --platform android --profile production
    ```
- [ ] **Día 29:** Probar el AAB generado en un dispositivo real
- [ ] **Día 30:** Completar el listing en Google Play Console
    - Descripción corta y larga (en español)
    - Capturas de pantalla (mínimo 4, preferible 6-8)
    - Categoría: Herramientas de negocios
    - Clasificación de contenido
- [ ] **Día 31:** Subir build a Google Play Console
- [ ] **Día 31:** Configurar prueba interna o beta cerrada
- [ ] **Día 32:** Enviar a revisión de Google (puede tomar 1-7 días)

### Producto Final ✅

- App compilada (.aab) sin errores
- Icono y splash screen profesionales
- App creada en Google Play Console
- Screenshots y descripción completos
- App en revisión o publicada (beta/producción)
- Link de descarga funcional

---

## Checklist Final del MVP

Al completar las 10 semanas deberías poder decir:

- [ ] Mi app corre en mi celular
- [ ] Puedo agregar productos
- [ ] Puedo registrar ventas
- [ ] Los datos se guardan (persisten)
- [ ] Tengo login funcional
- [ ] El asistente IA responde preguntas
- [ ] Puedo comprar la suscripción PRO
- [ ] La app está en Play Store
- [ ] Alguien más puede descargarla y usarla

**Si todas están marcadas → ¡MISIÓN CUMPLIDA! 🎉**

---

## Post-MVP: Versiones Futuras

### v1.1 (Semanas 11-14)

- [ ] Configuración inicial completa con IA (genera menú desde tipo de negocio)
- [ ] Actualización masiva de precios con IA y preview de cambios
- [ ] Reportes básicos con gráficas (ventas por día/semana/mes)
- [ ] Control de stock opcional (activable/desactivable)

### v1.5 (Semanas 15-20)

- [ ] Múltiples empleados (hasta 3 en plan PRO)
- [ ] Backup automático en Firebase
- [ ] Integración con WhatsApp (envío de recibos)
- [ ] Impresión de tickets vía Bluetooth

### v2.0 (Meses 6-12)

- [ ] Múltiples sucursales
- [ ] Reportes avanzados con IA
- [ ] Integraciones con sistemas de contabilidad
- [ ] App iOS

---

## Notas Técnicas Importantes

- **Stock:** Deliberadamente excluido del MVP. No crear ninguna lógica de inventario hasta v1.1.
- **Clientes:** Solo se guarda alias/nombre del pedido, sin datos completos de clientes.
- **Offline:** Toda la funcionalidad core (productos, ventas, historial) debe funcionar sin internet.
- **IA en cliente:** Nunca hacer llamadas directas a Gemini desde la app. Siempre a través de Cloud Functions.
- **Límites:** Verificar siempre los límites de uso en el servidor, no confiar solo en el estado local.
- **Pantalla Historial de Ventas:** Eliminada por decisión de producto. El historial se consulta únicamente a través del Asistente IA conversacional. Nunca sugerir ni crear esta pantalla.
