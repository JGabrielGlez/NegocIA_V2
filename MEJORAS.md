# 🛠️ Mejoras Pendientes — NegocIA

Documento de referencia para rastrear las mejoras identificadas en el proyecto.
Ordenado por prioridad e impacto en la experiencia del usuario.

---

## 🔴 CRÍTICO — Pantallas de carga (UI se traba)

### 1. `app/_layout.tsx` — Pantalla de carga global en el arranque

**Problema:** Cuando el usuario abre la app o inicia sesión, `onAuthStateChanged` detecta al usuario verificado y el segundo `useEffect` de navegación **redirige inmediatamente al dashboard** sin esperar a que `getProductos()` + `getVentas()` terminen. El usuario llega al dashboard con los stores vacíos o con datos viejos de MMKV. La UI se renderiza sin datos reales y da la sensación de estar "congelada" hasta que llega la respuesta de Firestore.

**Solución propuesta:**
- Agregar un estado `isAppReady: boolean` (inicia en `false`) al `_layout.tsx`.
- La carga de Firestore (`Promise.all`) debe poner `isAppReady = true` cuando termina.
- La navegación al dashboard **solo ocurre cuando `isAppReady === true`**.
- Mientras `isAppReady === false` con usuario autenticado, mostrar una pantalla de bienvenida con el logo de la app y un `ActivityIndicator`.

```
Usuario abre la app
  └─ onAuthStateChanged detecta usuario verificado
       └─ Mostrar: [Logo + Spinner "Cargando tu negocio..."]
            └─ Promise.all(getProductos, getVentas) ✅
                 └─ sincronizarPendientes ✅
                      └─ isAppReady = true → navegar a /dashboard
```

---

### 2. `app/_layout.tsx` — Overlay de carga al cerrar sesión

**Problema:** `cerrarSesion()` ejecuta múltiples operaciones asíncronas (RevenueCat logout → limpiar stores → Firebase signOut → navegar). Durante todo ese proceso no hay ningún indicador visual: la UI puede parpadear, quedar en blanco o parecer que no respondió al tap del botón.

**Solución propuesta:**
- Usar el `isLoading` que ya existe en `useAuthStore` para mostrar un overlay semitransparente con spinner y texto "Cerrando sesión..." encima de toda la UI mientras `cerrarSesion()` está en proceso.
- El overlay puede implementarse en `_layout.tsx` o en `perfil.tsx` donde está el botón de logout.

---

## 🟡 IMPORTANTE — Feedback en operaciones de escritura

### 3. `app/(main)/(navigation)/(ventas)/productos.tsx` — Loading en modales

**Problema:** Al agregar, editar o eliminar un producto, el modal cierra inmediatamente sin esperar confirmación de Firestore. El código incluso tiene comentarios `// Podrías poner un setIsLoading(true) aquí` indicando que esto quedó pendiente. Si hay latencia o falla, el usuario no sabe qué pasó.

**Solución propuesta:**
- Agregar `isLoading` local en el modal de agregar/editar.
- Deshabilitar el botón "Guardar" y mostrar un spinner mientras la operación asíncrona procesa.
- Mostrar feedback de error si Firestore falla.

---

### 4. `app/(main)/(navigation)/(ventas)/nueva-venta.tsx` — Loading al confirmar venta

**Problema:** Al presionar "Confirmar venta" no hay indicador visual mientras se guarda en Firestore/local. El botón responde de inmediato visualmente pero la operación puede tardar.

**Solución propuesta:**
- Agregar `isLoading` al botón de confirmación.
- Deshabilitar el botón y mostrar spinner mientras `agregarVenta()` procesa.

---

### 5. `app/(main)/perfil.tsx` — Reemplazar texto por spinner real

**Problema:** Tiene `isLoading` implementado correctamente, pero el estado de carga solo muestra el texto `"Cargando perfil..."` sin ningún indicador visual real.

**Solución propuesta:**
- Reemplazar el `<Text>Cargando perfil...</Text>` por un `ActivityIndicator` con el color de la marca.

---

### 6. `app/(features)/planes.tsx` — Reemplazar texto por spinner real

**Problema:** Mismo caso que `perfil.tsx`: muestra `"Cargando planes..."` como texto plano.

**Solución propuesta:**
- Reemplazar por `ActivityIndicator`.

---

## 🟢 MENOR — Pulido visual

### 7. `app/(auth)/iniciar-sesion.tsx` — Spinner en botón de login

**Problema:** El botón "Iniciar sesión" se deshabilita durante `isLoading` pero no cambia visualmente (mismo texto, mismo color). El usuario puede pensar que no lo tocó.

**Solución propuesta:**
- El componente `Boton` (`components/Button.tsx`) no soporta aún un estado de carga.
- Agregar prop `isLoading?: boolean` al componente `Boton` que muestre un `ActivityIndicator` en lugar del texto mientras carga.
- Usar ese prop en los botones de login y registro.

---

### 8. `app/(auth)/crear-cuenta.tsx` — Spinner en botón de registro

**Problema:** Mismo caso que `iniciar-sesion.tsx`. El botón se bloquea pero no da feedback visual claro durante el registro.

**Solución propuesta:** Misma que el punto anterior: usar la prop `isLoading` del `Boton` actualizado.

---

### 9. `app/(features)/asistente-ia.tsx` — Indicador "escribiendo..." más visible

**Problema:** El estado `isLoading` solo cambia el color del botón de enviar a gris. No hay indicador en el área del chat que muestre que la IA está generando respuesta.

**Solución propuesta:**
- Agregar un indicador animado de puntos "..." (typing indicator) al final de la lista de mensajes mientras `isLoading === true`.

---

## 🔵 FUNCIONAL — Dashboard con datos reales

### 10. `app/(main)/(navigation)/dashboard.tsx` — Métricas hardcodeadas

**Problema:** Todas las `TarjetaInfo` del dashboard muestran `"$23423.00"` y `"12% más que ayer"` hardcodeados. No conectan con `useStore` ni con ninguna fuente de datos real.

**Solución propuesta:**
- Conectar el dashboard a `useStore` para mostrar datos reales:
  - Ventas del día (`calcularVentasHoy()`)
  - Total de productos registrados (`productos.length`)
  - Venta más reciente
  - Producto más vendido (calcular del historial de ventas)
- Mientras los datos cargan (justo después del login, cuando el store aún está vacío), mostrar un estado esqueleto (skeleton) en las tarjetas.

---

## 📋 Resumen de archivos a modificar

| Archivo | Cambios necesarios |
|---|---|
| `app/_layout.tsx` | Agregar estado `isAppReady`, pantalla de carga global, overlay de logout |
| `store/useAuthStore.ts` | Agregar flag `isLoggingOut` o reutilizar `isLoading` para el logout |
| `components/Button.tsx` | Agregar prop `isLoading?: boolean` con `ActivityIndicator` |
| `app/(auth)/iniciar-sesion.tsx` | Pasar `isLoading` al `Boton` |
| `app/(auth)/crear-cuenta.tsx` | Pasar `isLoading` al `Boton` |
| `app/(main)/perfil.tsx` | Reemplazar texto por `ActivityIndicator`, overlay en logout |
| `app/(features)/planes.tsx` | Reemplazar texto por `ActivityIndicator` |
| `app/(main)/(navigation)/dashboard.tsx` | Conectar métricas reales, agregar skeleton |
| `app/(main)/(navigation)/(ventas)/productos.tsx` | Loading en modales de CRUD |
| `app/(main)/(navigation)/(ventas)/nueva-venta.tsx` | Loading al confirmar venta |
| `app/(features)/asistente-ia.tsx` | Typing indicator animado en el chat |

---

## ✅ Estado actual (implementado y funcionando)

- `isLoading` en `useAuthStore` para bloquear botones durante login
- `isLoading` en `useAIStore` para el asistente
- `isLoading` local en `perfil.tsx` y `planes.tsx` (falta visualizarlo bien)
- Carga paralela de Firestore en `_layout.tsx` con `Promise.all`
- Sincronización offline-first con `ventasPendientes` y `productosPendientes`
- Re-sync automático al recuperar internet (`NetInfo`) y al volver al foreground (`AppState`)
