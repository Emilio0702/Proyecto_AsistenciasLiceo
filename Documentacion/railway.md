# Guía de Implementación en Railway

Esta guía detalla los pasos para desplegar el proyecto "RegistroColacion" en la plataforma Railway.

## 1. Preparación del Repositorio
Asegúrate de que tu repositorio en GitHub esté limpio y contenga únicamente el código esencial.

1.  **Verificar `.gitignore`:** Confirma que archivos sensibles (`.env`) y carpetas innecesarias (`node_modules`, `.expo`, `.vscode`) estén ignorados.
2.  **Subir cambios:**
    ```bash
    git add .
    git commit -m "Preparación para despliegue en Railway"
    git push origin main
    ```

## 2. Configuración en Railway
1.  Inicia sesión en [Railway.app](https://railway.app/).
2.  Haz clic en **"+ New Project"**.
3.  Selecciona **"Deploy from GitHub repo"** y elige tu repositorio del proyecto.

## 3. Configuración de Base de Datos (PostgreSQL)
1.  Dentro de tu proyecto en Railway, haz clic en **"+ New"**.
2.  Selecciona **"Database"** y luego **"PostgreSQL"**.
3.  Railway creará automáticamente las variables de entorno necesarias (`PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT`, `PGDATABASE`).

## 4. Configuración del Backend
1.  Haz clic en **"+ New"** y selecciona **"GitHub repo"** (o despliega tu servicio de backend si lo tienes en una carpeta separada).
2.  En la configuración del servicio del backend, ve a la pestaña **"Variables"**.
3.  Añade manualmente las variables de entorno necesarias, utilizando las referencias automáticas de la base de datos que creó Railway en el paso anterior:
    *   `DB_USER`: `${PGUSER}`
    *   `DB_PASSWORD`: `${PGPASSWORD}`
    *   `DB_HOST`: `${PGHOST}`
    *   `DB_PORT`: `${PGPORT}`
    *   `DB_DATABASE`: `${PGDATABASE}`
    *   `JWT_SECRET`: (Define una cadena secreta segura)
    *   `PORT`: `3000`

## 5. Despliegue y Validación
1.  Railway detectará automáticamente el `Dockerfile` en tu carpeta `backend/` y comenzará el despliegue.
2.  Una vez finalizado, ve a la pestaña **"Settings"** de tu servicio de backend.
3.  Haz clic en **"+ Add Domain"** para asignar una URL pública a tu API.
4.  Prueba el endpoint de salud o el registro: `https://tu-dominio.railway.app/api/colaciones` (ajusta según tus rutas).

## 6. Migraciones
Como tu base de datos está en Railway, necesitarás ejecutar el esquema SQL inicial:
1.  En el panel de Railway, abre la consola ("Shell") del contenedor de PostgreSQL o usa una herramienta externa (como DBeaver) conectándote con las credenciales que Railway te dio en el paso 3.
2.  Copia y pega el contenido de `backend/db/schema.sql` para crear las tablas.

## 7. Convertir tu proyecto en un .apk para que tu cliente pueda instalarlo en sus tablets o teléfonos es un proceso muy sencillo gracias a EAS (Expo Application Services).

  Al usar Expo, ya no necesitas configurar Android Studio ni gestionar firmas digitales complejas manualmente; Expo lo hace en la nube por ti.

  El flujo de trabajo para generar tu APK:

  1. Preparación inicial
  Necesitas instalar la herramienta de comandos de Expo (EAS CLI) en tu computadora:
   1 npm install -g eas-cli
  Luego, inicia sesión en tu cuenta de Expo:

   1 eas login

  2. Configuración del proyecto
  Dentro de la carpeta frontend/ de tu proyecto, ejecutas:
   1 eas build:configure
  Esto creará un archivo llamado eas.json que contiene las instrucciones para la compilación.

  3. Generar el APK
  Para crear un archivo de instalación rápida (tipo "preview"), ejecutas:
   1 eas build -p android --profile preview

  ¿Qué hace este comando?
   1. Sube tu código a los servidores de Expo.
   2. Ellos compilan el proyecto (descargan las librerías nativas, instalan los módulos, etc.).
   3. Te devuelven un enlace de descarga en tu terminal.
   4. Tú abres ese enlace, descargas el .apk y se lo envías al cliente por WhatsApp, correo o nube.

  ---

  Lo que debes tener en cuenta (Muy importante):

   * Conexión al Backend: Antes de generar el APK, recuerda que en frontend/src/services/api.ts pusimos la IP 192.168.1.85. Esto no funcionará cuando el cliente instale el APK porque
     esa es tu IP local.
       * Antes de crear el APK final: Debes cambiar esa IP por la URL de tu nuevo servidor de Railway (ej: https://api-colaciones.railway.app/api).
   * Modo Preview: El comando que te di (--profile preview) genera un APK de desarrollo que te permite instalarlo fácilmente en cualquier Android, lo cual es ideal para pruebas con
     clientes.