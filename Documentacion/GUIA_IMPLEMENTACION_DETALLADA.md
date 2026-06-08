# Guía Maestra de Implementación: ServiTerra Colación

Esta guía proporciona instrucciones exhaustivas, paso a paso, para desplegar el proyecto en Railway y generar aplicaciones móviles (APK) para Android usando Expo EAS.

---

## PARTE 1: Despliegue en Railway (Backend y Frontend)

### 1. Preparación en GitHub
1. Asegúrate de que todos tus cambios estén guardados y subidos a tu repositorio:
   ```bash
   git add .
   git commit -m "Preparación final para producción"
   git push origin main
   ```
2. Verifica que tu archivo `.gitignore` contenga `node_modules/` y `.env` para evitar subir archivos innecesarios o secretos.

### 2. Configuración en Railway
1. **Crear Proyecto:** Inicia sesión en [Railway.app](https://railway.app/). Haz clic en **"New Project"** -> **"Deploy from GitHub repo"**.
2. **Seleccionar Repo:** Busca y selecciona `Emilio0702/Proyecto-PIF-copilot`.
3. **Servicios:**
   - Railway detectará automáticamente la carpeta `backend/` y creará un servicio para él basándose en tu `Dockerfile`.
   - Si no detecta el frontend automáticamente, añade un nuevo servicio ("Deploy from repo") y selecciona la carpeta `frontend/`.

### 3. Configuración de Variables de Entorno (CRÍTICO)
No crees archivos `.env` en el servidor. Hazlo desde el panel de Railway:
1. Ve al servicio de **Backend** en el Dashboard de Railway.
2. Haz clic en la pestaña **"Variables"**.
3. Añade las siguientes claves (valores según tu configuración):
   - `DATABASE_URL`: (La URL de tu instancia de PostgreSQL en Railway).
   - `JWT_SECRET`: (Una frase secreta larga y única).
   - `PORT`: `3000`.
4. Ve al servicio de **Frontend**:
   - Pestaña **"Variables"**.
   - Añade: `EXPO_PUBLIC_API_URL`: (La URL pública que Railway le asignó a tu servicio backend, ej: `https://serviterra-backend-production.up.railway.app`).

---

## PARTE 2: Generación de APK para Android (Expo EAS)

Requisito: Tener una cuenta en [Expo.dev](https://expo.dev/).

### 1. Preparación Local
1. Instala el CLI de EAS:
   ```bash
   npm install -g eas-cli
   ```
2. Inicia sesión en tu terminal:
   ```bash
   eas login
   ```
3. Inicializa el proyecto con EAS:
   ```bash
   cd frontend
   eas build:configure
   ```
   *(Sigue las instrucciones en pantalla, selecciona "Android")*.

### 2. Generación del APK
Para pruebas de instalación rápida (genera un archivo `.apk` descargable):
```bash
eas build -p android --profile preview
```
1. El proceso comenzará en los servidores de Expo.
2. Podrás ver el progreso en el enlace que aparecerá en tu terminal.
3. Cuando termine, aparecerá un botón de **"Download"** para obtener el archivo APK. Transfiérelo a tu teléfono Android e instálalo.

### 3. Generación para Play Store (Producción)
Cuando estés listo para subir la app a la Google Play Store, necesitas un archivo `.aab`:
```bash
eas build -p android --profile production
```
*(Nota: Esto requiere configurar las firmas de la aplicación en Expo Dashboard).*

---

## Consejos de Oro
*   **Si algo falla en el Backend:** Revisa la pestaña "Logs" en Railway. Ahí verás si el puerto no abre o si la conexión a la base de datos falla.
*   **Si cambias variables:** Cada vez que agregues o modifiques una variable en el panel de Railway, el servicio se reiniciará automáticamente.
*   **Logs del Frontend:** Si el frontend no conecta con el backend, verifica en la consola del navegador o en los logs de Railway que la variable `EXPO_PUBLIC_API_URL` sea correcta.
