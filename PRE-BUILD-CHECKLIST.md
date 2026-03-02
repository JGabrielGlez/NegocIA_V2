# 🚀 Pre-Build Checklist

## ⚠️ CRÍTICO: Regenerar Claves API

**Antes de hacer ANY build (desarrollo, staging, producción), debes regenerar TODAS las claves API.**

Esto es especialmente importante si:

- El archivo `.env` ha sido expuesto
- Ha habido un commit con claves sensibles en el Git history
- Las claves aparecen en logs públicos
- Es la primera vez en producción

### Checklist de Regeneración

- [ ] **Firebase Console**
    1. Ir a https://console.firebase.google.com/
    2. Seleccionar proyecto `negocia-a17c5`
    3. Settings > Service Accounts
    4. Regenerar API Key
    5. Copiar nuevas credenciales

- [ ] **RevenueCat**
    1. Ir a https://app.revenuecat.com/
    2. Settings > API Keys
    3. Regenerar Public Key (Android)
    4. Copiar nueva clave

- [ ] **Actualizar `.env`**
    - [ ] Abrir `.env`
    - [ ] Reemplazar valores de Firebase
    - [ ] Reemplazar valores de RevenueCat
    - [ ] NO commitear este archivo (ya debe estar en `.gitignore`)

- [ ] **Git Cleanup** (si hay commits previos con claves)

    ```bash
    # Limpiar el Git history (solo si las claves fueron expuestas)
    git filter-branch --tree-filter 'rm -f .env' -- --all
    git push origin --force --all
    ```

- [ ] **Commit de confirmación**

    ```bash
    git add .
    git commit -m "chore: update API keys before build"
    git push origin main
    ```

- [ ] **Esperar a que CI/CD pase** (si aplica)

- [ ] **Proceder con el build** (EAS Build, Play Store, etc.)

---

## ¿Por qué es tan importante?

Las claves API expuestas permiten que terceros:

- ❌ Accedan a tu base de datos Firebase
- ❌ Generen solicitudes fraudulentas a RevenueCat
- ❌ Modifiquen configuraciones de tu app
- ❌ Incurran costos en tu cuenta

**Una sola clave comprometida puede costar miles de dólares.**

---

## Referencia Rápida

```dotenv
# Archivos NUNCA deben estar en Git
.env                 # Variables de entorno locales
.env.local          # Config local
functions/.env      # Variables del backend
functions/.env.local

# Si están en Git por accidente:
# 1. Regenerar TODAS las claves AHORA
# 2. Limpiar Git history
# 3. Force push
# 4. Hacer deploy con nuevas claves
```

---

**Última verificación antes de hacer deploy:**

```bash
# Asegurarse que no hay .env en el staging area
git status | grep .env

# Si aparece algo, ejecutar:
git rm --cached .env
git commit --amend --no-edit
```
