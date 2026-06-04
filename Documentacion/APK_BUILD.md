# Guía para Generar el archivo APK (Android)

Esta guía describe los pasos necesarios para compilar tu aplicación Expo y generar el archivo instalable (`.apk`) para entregar a tu cliente. Utilizaremos **EAS (Expo Application Services)**, que realiza la compilación en la nube.

---

## 1. Requisitos Previos
Debes tener instalado EAS CLI en tu computadora:

```bash
npm install -g eas-cli
```

Inicia sesión en tu cuenta de Expo:
```bash
eas login
```

---

## 2. Configurar el Backend (Producción)
**MUY IMPORTANTE:** Antes de generar el APK, la aplicación debe apuntar al servidor de producción (Railway) y no a tu IP local.

1.  Abre `frontend/src/services/api.ts`.
2.  Cambia la constante `DEFAULT_API_URL` por la URL de tu backend desplegado en Railway:
    ```typescript
    // Cambia esto:
    const DEFAULT_API_URL = 'http://192.168.1.85:3000/api';
    
    // Por esto:
    const DEFAULT_API_URL = 'https://tu-proyecto-backend.railway.app/api';
    ```

---

## 3. Configuración del Proyecto
En la raíz de la carpeta `frontend/`, ejecuta:

```bash
eas build:configure
```
Esto creará el archivo `eas.json`. Asegúrate de seleccionar **Android** cuando te lo pregunte.

---

## 4. Generar el APK
Para crear un archivo de instalación rápida (fácil de enviar por WhatsApp o correo), ejecuta:

```bash
eas build -p android --profile preview
```

### ¿Qué sucede ahora?
1.  **Subida:** Tu código se sube a los servidores de Expo.
2.  **Compilación:** Expo compila el proyecto y genera el APK.
3.  **Resultado:** Después de unos minutos, aparecerá un enlace en tu terminal. Ábrelo en tu navegador y podrás descargar el archivo `.apk`.

---

## 5. Entrega al Cliente
1.  Descarga el archivo `.apk` desde el enlace que te proporcionó Expo.
2.  Envíalo al cliente.
3.  Para instalarlo en su Android, el cliente debe:
    *   Descargar el archivo `.apk` en su dispositivo.
    *   Abrirlo.
    *   Si es la primera vez, el teléfono le pedirá permiso para **"Instalar aplicaciones de fuentes desconocidas"**. Debe aceptarlo.
    *   ¡Listo! La aplicación quedará instalada.

---

### Notas:
*   **Actualizaciones:** Si realizas cambios en el código (ej: mejoras en la UI), deberás ejecutar el comando `eas build` nuevamente para generar un nuevo archivo APK con las versiones actualizadas.
*   **Producción (Play Store):** Si en el futuro quieres subir la app a la Google Play Store, deberás usar el perfil de `production` en lugar de `preview` y configurar una cuenta de desarrollador en Google.