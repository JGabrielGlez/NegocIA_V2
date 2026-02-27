# GUÍA DE PAGOS — RevenueCat + Google Play Billing

**Última actualización:** Semana 7-8  
**Versión de documentación:** 1.0

Esta guía te ayudará a configurar el sistema de suscripciones de POS con IA usando RevenueCat como intermediario entre tu app y Google Play Billing.

---

## 1. ¿Cómo funciona el flujo de pagos?

```
┌─────────────────────────┐
│   App (React Native)    │
│   - initializeRevenueCat │
│   - purchasePackage()    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│      RevenueCat (intermediario)      │
│  - Gestiona entitlements             │
│  - Sincroniza con Google Play        │
│  - Envía webhooks a Firebase         │
└────────────┬────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│    Google Play Billing API           │
│  - Procesa el pago de la suscripción │
│  - Cobra al usuario                  │
│  - Maneja renovaciones               │
└──────────────────────────────────────┘
```

### Conceptos clave:

- **Package (Paquete):** Producto específico en RevenueCat (ej: pro_monthly, pro_annual)
- **Entitlement (Derecho):** Permiso o acceso que el usuario gana (ej: "pro", "pro_plus")
- **Offering:** Conjunto de packages agrupados (ej: mostrar al usuario diferentes opciones de suscripción)
- **Webhook:** Notificación que RevenueCat envía a Firebase cuando ocurre un evento de pago

---

## 2. Configurar RevenueCat Dashboard

### Paso 1: Crear cuenta en RevenueCat

1. Ve a https://app.revenuecat.com/
2. Crea una cuenta con email y contraseña
3. Verifica tu email

### Paso 2: Crear un Proyecto

1. En el dashboard, haz clic en **+ New Project**
2. Nombre del proyecto: `pos-con-ia` (o tu nombre de app)
3. Selecciona zona horaria: `America/Mexico_City`
4. Haz clic en **Create Project**

### Paso 3: Vincular Google Play

1. En el panel lateral izquierdo, ve a **Settings** → **Apps**
2. Haz clic en **+ New App**
3. Selecciona plataforma: **Android**
4. Nombre: `POS con IA (Android)`
5. Bundle ID: Este debe coincidir con tu `android.package` en `app.json`
    - Ejemplo: `com.example.posenconIA` (reemplaza `example` con tu nombre)
6. Haz clic en **Create App**

### Paso 4: Obtener la API Key de RevenueCat

1. Copia el **API Key** que aparece (necesitarás esto para `.env`)
2. Haz clic en **Save**
3. **Importante:** Esto es `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID`

### Paso 5: Configurar Entitlements

Los entitlements son los "derechos" que otorgas a usuarios premium.

1. En el panel lateral, ve a **Products** → **Entitlements**
2. Haz clic en **+ New Entitlement**
3. Nombre: `pro` (minúsculas)
4. ID único automático: `pro`
5. Haz clic en **Create**

**¿Por qué "pro"?** Porque tu código busca `customerInfo.entitlements.active["pro"]`. Debe coincidir exactamente.

### Paso 6: Crear un Package (Paquete)

1. Ve a **Products** → **Packages**
2. Haz clic en **+ New Package**
3. Nombre: `pro_monthly`
4. Duración: Mensual (selecciona "Monthly")
5. Precio: Deja en blanco por ahora (lo sincronizaremos desde Google Play)
6. **Vincular Entitlement:** Selecciona `pro` (el que acabas de crear)
7. Haz clic en **Create**

### Paso 7: Crear un Offering

Un offering es una "oferta" que agruppa packages.

1. Ve a **Products** → **Offerings**
2. Haz clic en **+ New Offering**
3. Nombre: `default` o `main_offering`
4. **Agregar Packages:** Busca `pro_monthly` y añádelo
5. Haz clic en **Create**

---

## 3. Configurar Google Play Console (Producto en Android)

### Paso 1: Crear Producto de Suscripción

1. Ve a https://play.google.com/console/
2. Selecciona tu aplicación (o crea una si no existe)
3. En el panel lateral, ve a **Monetization setup** → **Products** → **Subscriptions**
4. Haz clic en **+ Create Subscription**

### Paso 2: Rellenar Detalles

1. **Product name:** `Pro Monthly`
2. **Product ID:** `pro_monthly` (debe coincidir con RevenueCat)

### Paso 3: Configurar Precio y Período

1. **Billing period:** Mensual (1 month)
2. **Region & price:** Crea un precio para cada región donde quieras vender
    - Para México: `299` MXN
    - Puedes agregar otros países según necesites
3. **Oferta de prueba (opcional):** Puedes ofrecer 7 días gratis si quieres

### Paso 4: Guardar

Haz clic en **Save subscription**

---

## 4. Conectar RevenueCat con Google Play Console

Esta es la parte crítica. RevenueCat necesita credenciales de Google Play para sincronizar suscripciones.

### Paso 1: Obtener Service Account JSON desde Google Play

1. En Google Play Console, ve a **Settings** → **API access**
2. Haz clic en **Create Service Account**
3. Sigue los pasos que Google te proporciona para crear un archivo JSON
4. Descarga el JSON (guárdalo en un lugar seguro)

### Paso 2: Subir a RevenueCat

1. Ve a RevenueCat → **Settings** → **Apps** → Tu app Android
2. Busca la sección **Google Play Configuration**
3. Sube el JSON que descargaste
4. Haz clic en **Save**

RevenueCat ahora sincronizará automáticamente con Google Play. Cada vez que:

- Alguien compre una suscripción
- Se renueve una suscripción
- Se cancele una suscripción

RevenueCat lo sabrá y actualizará el entitlement "pro".

---

## 5. Configurar Webhooks para Firestore

Los webhooks permiten que RevenueCat notifique a tu Firebase cuando ocurren eventos de pago.

### Paso 1: Obtener URL de Firebase Cloud Functions

Necesitas que la función `verifySubscription` esté desplegada en Firebase. Si no, despliégala:

```bash
cd functions
npm run build
firebase deploy --only functions:verifySubscription
```

Copia la URL de la función (algo como):

```
https://us-central1-tu-proyecto.cloudfunctions.net/verifySubscription
```

### Paso 2: Configurar Webhook en RevenueCat

1. Ve a RevenueCat → **Settings** → **Apps** → Tu app Android
2. Busca **Event Webhooks**
3. **URL:** Pega la URL de tu Cloud Function
4. **Secret:** USA el valor de `REVENUECAT_WEBHOOK_SECRET` de tu `.env`
5. Haz clic en **Test** para verificar que es válida
6. Haz clic en **Save**

---

## 6. Variables de Entorno Necesarias

Crea o actualiza tu archivo `.env` con:

```dotenv
# RevenueCat Configuration
# Obtener desde: https://app.revenuecat.com/ → Settings → API Keys → Google Play
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=pk_goog_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Webhook Secret (para verificar que los webhooks vienen de RevenueCat)
# Obtener desde: https://app.revenuecat.com/ → Settings → Apps → Event Webhooks
REVENUECAT_WEBHOOK_SECRET=tu_webhook_secret_super_seguro_y_largo
```

**Nota de seguridad:**

- `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID` puede estar en la app (es pública por RevenueCat)
- `REVENUECAT_WEBHOOK_SECRET` NUNCA debe estar en el cliente, solo en Cloud Functions (servidor)

---

## 7. Cómo Probar Compras en Sandbox

### Opción A: Google Play Testing (Recomendado para desarrollo)

1. En Google Play Console, ve a **Settings** → **License Testing**
2. Añade el email de tu dispositivo Android a la lista como "Licensed Testers"
3. En tu dispositivo Andrоid, asegúrate que estés logueado con ese email en Google Play
4. Las compras en tu app NO cobrarán dinero real

### Opción B: Usar cuenta de prueba de Google Play

Google Play tiene cuentas automáticas para testing. Consulta la documentación oficial.

### Para probar en tu app:

1. Asegúrate que `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID` apunta a tu proyecto de RevenueCat
2. Ejecuta tu app
3. Navega a la pantalla de planes (paywall)
4. Haz clic en "Comprar PRO"
5. Completa el flujo de compra (no cobrará si estás en modo testing)

---

## 8. Troubleshooting Común

### Error: "HMAC inválido" en webhooks

**Causa:** El `REVENUECAT_WEBHOOK_SECRET` no coincide entre RevenueCat y tu `.env`

**Solución:**

1. Ve a RevenueCat → Settings → Apps → Event Webhooks
2. Copia el secret exacto
3. Pégalo en `.env` como `REVENUECAT_WEBHOOK_SECRET`
4. Redeploy tus Cloud Functions: `firebase deploy --only functions`

### Error: "Offerings no cargadas" en la app

**Causa:**

- API Key inválida o mal configurada
- No hay offerings creados en RevenueCat
- Offering no tiene packages vinculados

**Solución:**

1. Verifica que `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID` sea correcta en `.env`
2. Recarga la app
3. Revisa la consola de logs (busca `[getOfferings]`)
4. En RevenueCat, verifica que existe un offering con packages

### Error: "Compra no refleja en Firestore"

**Causa:** El webhook no está llegando a Firebase o `verifySubscription` tiene error

**Solución:**

1. En RevenueCat, ve a **Settings** → **Event Webhooks**
2. Haz clic en **Test** para enviar un evento de prueba
3. Abre la consola de Firebase Cloud Functions y busca logs
4. Si ves error, revisa el código en `functions/src/functions/verifySubscription.ts`

### Error: "PurchaseCancelledError" al comprar

**Causa:** El usuario presionó "Atrás" o canceló manualmente durante el flujo de compra

**Solución:** Es normal. Tu app maneja esto correctamente (retorna `false` sin mostrar alerta). El usuario puede intentar de nuevo.

### Google Play dice "Producto no encontrado"

**Causa:**

- El Product ID en Google Play no coincide con el de RevenueCat
- El paquete no está publicado
- Hay delay de sincronización

**Solución:**

1. Verifica que `pro_monthly` exista en Google Play Console
2. Espera 15-30 minutos a que la sincronización se complete
3. Si persiste, reimpleméntalo:
    - Elimina el paquete en RevenueCat
    - Espera 5 minutos
    - Recrearlo
    - Repite sincronización desde Google Play

---

## 9. Checklist de Implementación

Para asegurar que todo funciona:

- [ ] Cuenta de RevenueCat creada
- [ ] Proyecto en RevenueCat configurado
- [ ] Plan/Offering creado en RevenueCat
- [ ] Entitlement "pro" creado
- [ ] Package "pro_monthly" creado
- [ ] Google Play Console tiene producto "pro_monthly"
- [ ] Service Account JSON descargado y subido a RevenueCat
- [ ] Webhook configurado en RevenueCat
- [ ] `.env` tiene `REVENUECAT_API_KEY_ANDROID` y `REVENUECAT_WEBHOOK_SECRET`
- [ ] Cloud Function `verifySubscription` desplegada
- [ ] Testing con cuenta de prueba validado
- [ ] Página de planes (paywall) muestra offerings correctamente
- [ ] Compra de prueba completada sin error

---

## 10. Referencias Útiles

- [Documentación oficial RevenueCat](https://docs.revenuecat.com/)
- [Google Play Billing Setup](https://developer.android.com/google/play/billing/integrate)
- [React Native Purchases SDK](https://github.com/RevenueCat/react-native-purchases)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)

---

**¿Preguntas o problemas?** Revisa los logs en:

- App: `console.log()` en tu terminal de Expo
- Firebase: `firebase functions:log`
- RevenueCat: Dashboard → Event Logs
