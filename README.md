<h1 align="center">
  🍱 App Registro de Colaciones y Pensiones
</h1>

<p align="center">
  <strong>Aplicación móvil moderna diseñada para el control y administración de entregas de colaciones/servicios, construida con React Native y Expo.</strong>
</p>

<p align="center">
  <a href="https://servi-terra-colacion-pi.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Vercel-Ver_Demo_en_Vivo-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
</p>

---

## 🚀 Sobre el Proyecto

Este es el **Frontend** de un sistema integral diseñado para gestionar la entrega de beneficios (colaciones, vales, servicios) en faenas y empresas. El sistema permite registrar trabajadores, administrar personal encargado, generar comprobantes (Vouchers) en formato PDF, y leer códigos (escáner) para verificar la autenticidad de los beneficiarios de manera segura y rápida.

> **Visualiza la aplicación directamente en tu navegador web gracias a la portabilidad de Expo Web.**
> 👉 **[Enlace al Demo en Vivo](https://servi-terra-colacion-pi.vercel.app/)**

### 🔑 Credenciales de Prueba (Demo)
Si estás revisando este proyecto como reclutador y quieres probar el panel de administrador:
- **Usuario:** `admin@serviterra.cl` *(Asegúrate de colocar un correo de prueba tuyo o dejarlo como placeholder)*
- **Clave:** `123456`

---

## 🛠️ Stack Tecnológico

El proyecto está desarrollado utilizando herramientas modernas y las mejores prácticas del desarrollo móvil:

* **Framework Core:** [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/)
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) (Tipado estricto para mayor escalabilidad y seguridad)
* **Navegación:** `React Navigation` (Stack & Tabs)
* **Peticiones HTTP:** `Axios` con interceptores para inyección automática de Tokens JWT.
* **Gestión de Estado y Persistencia:** Context API y `AsyncStorage`/`SecureStore` (con Polyfill inteligente para Web).
* **UI e Iconografía:** Componentes estilizados personalizados y `lucide-react-native` para íconos profesionales y escalables.
* **Extras Nativos:** Generación de PDF (`expo-print`), Compartir archivos (`expo-sharing`), Escáner de Códigos, Integración con Mapas.

---

## 📂 Estructura de Carpetas Destacada

El proyecto sigue una arquitectura limpia (Clean Code), separando responsabilidades lógicas y visuales para facilitar el mantenimiento y escalabilidad:

```text
📦 frontend
 ┣ 📂 src
 ┃ ┣ 📂 components     # Componentes visuales reutilizables (Modales, Tarjetas de Lista, Alertas)
 ┃ ┣ 📂 context        # Context API para estado global (AuthContext: Manejo de Sesión y Roles)
 ┃ ┣ 📂 hooks          # Custom Hooks (Lógica de negocio abstraída: useAdminRecords, useInactivityTimeout)
 ┃ ┣ 📂 navigation     # Configuración de rutas seguras y flujos (AppNavigator)
 ┃ ┣ 📂 screens        # Vistas completas de la aplicación (AdminHomeScreen, LoginScreen)
 ┃ ┣ 📂 services       # Configuración de Axios e interceptores (conexión con Backend en Railway)
 ┃ ┗ 📂 utils          # Funciones auxiliares (Formateo de RUT, polyfill multiplataforma para almacenamiento)
 ┣ 📜 App.tsx          # Punto de entrada principal
 ┗ 📜 package.json     # Dependencias de npm
```

---

## ✨ Características Principales

1. **Autenticación Basada en Roles:** Sistema de inicio de sesión seguro manejado globalmente por Context API. Rutas protegidas automáticamente según el rol (`Administrador` vs `Encargada`).
2. **Cierre de Sesión por Inactividad:** Sistema de seguridad bancario. Implementación de un Custom Hook que limpia el almacenamiento local (Storage) y desloguea al usuario tras 5 minutos sin tocar la pantalla.
3. **Paginación e Infinite Scrolling:** Las listas de registros cargan los datos bajo demanda para no saturar el rendimiento del teléfono.
4. **Vouchers PDF:** Creación instantánea de comprobantes HTML dinámicos, renderizados como PDF e integrados con el sistema de compartición nativo (WhatsApp, Correo).
5. **Multiplataforma Absoluta:** Compatibilidad sin fricción entre Android, iOS y Navegadores Web.

---

## 💻 Instalación Local

Si deseas correr el proyecto en tu propia máquina para revisar el código:

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Emilio0702/Proyecto-PIF-copilot.git
   ```
2. Entra a la carpeta del frontend e instala las dependencias:
   ```bash
   cd frontend
   npm install
   ```
3. Levanta el servidor de desarrollo:
   ```bash
   npx expo start
   ```
4. Escanea el código QR desde la app **Expo Go** en tu celular, o presiona la tecla `w` para abrirlo en el navegador web local.

---

<p align="center">
  <i>Desarrollado con ❤️ para optimizar la gestión empresarial logística.</i>
</p>
