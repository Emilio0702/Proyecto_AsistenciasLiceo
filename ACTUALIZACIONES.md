# Guía de Actualizaciones - ServiTerra

Este documento explica cómo mantener actualizada la aplicación tanto para cambios menores (automáticos) como para cambios mayores (manuales).

## 1. Actualizaciones Automáticas (OTA - Over The Air)

Utiliza este método para cambios que **no** involucren nuevas librerías nativas o cambios en el SDK de Expo.

### ¿Cuándo usarlo?
- Cambios en el diseño (colores, fuentes, estilos).
- Corrección de errores en la lógica de JavaScript/TypeScript.
- Nuevas pantallas o navegación.
- Cambios en los textos de la aplicación.

### Comando para publicar:
Ejecuta el siguiente comando dentro de la carpeta `frontend`:

```bash
npx eas update --branch production --message "Descripción breve de los cambios"
```

Los usuarios recibirán esta actualización automáticamente la próxima vez que abran la aplicación.

---

## 2. Actualizaciones Nativas (Nuevos Builds)

Utiliza este método cuando realices cambios estructurales en la aplicación.

### ¿Cuándo usarlo?
- Instalación de nuevas librerías que usan hardware (Cámara, GPS, Biometría, etc.).
- Actualización del SDK de Expo (ej. de SDK 54 a SDK 55).
- Cambios en el nombre de la app, el icono o la pantalla de inicio (splash screen).
- Cambios en los permisos de Android/iOS en `app.json`.

### Comandos para generar el archivo:
Para Android (APK):
```bash
npx eas build --platform android --profile preview
```
Para Play Store (AAB):
```bash
npx eas build --platform android --profile production
```

---

## 3. Resumen de Flujo de Trabajo

| Tipo de Cambio | Herramienta | ¿Requiere nueva descarga? |
| :--- | :--- | :--- |
| **Lógica/Diseño** | `EAS Update` | **No** (Automático) |
| **Librería Nativa** | `EAS Build` | **Sí** (Descarga APK/Tienda) |
| **Versión SDK** | `EAS Build` | **Sí** (Descarga APK/Tienda) |

---

## Consejos Útiles
- **Pruebas:** Siempre prueba tus cambios localmente con `npx expo start` antes de lanzar una actualización.
- **Mensajes claros:** Usa mensajes descriptivos en el comando `--message` para llevar un historial claro de qué se cambió en cada actualización OTA.
- **Versión de la App:** Si haces cambios nativos, es recomendable aumentar la versión en `app.json` (ej. de `1.0.0` a `1.0.1`) para que los usuarios sepan que es una versión nueva.
