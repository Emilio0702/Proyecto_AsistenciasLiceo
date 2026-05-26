# 🚛 ServiTerra Colación

Sistema robusto para el registro y monitoreo de colaciones de camioneros en diferentes puntos de atención. 

## 📋 Descripción del Proyecto
La solución consiste en una aplicación móvil para las encargadas de las tiendas y administradores, un backend robusto que gestiona la lógica de negocio y una base de datos PostgreSQL para almacenar la información de manera segura.

El objetivo principal es llevar un control estricto, garantizar que la empresa solo pague por las colaciones efectivamente consumidas y gestionar al personal encargado en cada tienda, obteniendo reportes en tiempo real.

## ✨ Características Principales
*   **Gestión Basada en Roles:**
    *   **Encargadas de Tienda:** Panel dedicado al registro de colaciones. Búsqueda por RUT (Manual o código QR) y listado de colaciones paginado.
    *   **Administradores:** Panel de control (Dashboard) general de la empresa.
*   **Búsqueda y Filtros Avanzados:** El panel de administración permite buscar registros en tiempo real por Nombre, RUT, Patente, con filtros instantáneos por Rango de Fechas y Tienda.
*   **Validaciones en Tiempo Real:** Intercepta intentos de registros duplicados en el mismo día.
*   **Exportación:** Generación instantánea de reportes centralizados en formato Excel (.xlsx).
*   **Gestión de Entidades:** Configuración y alta de nuevos Camioneros, así como el registro de nuevas Tiendas, Encargadas y Administradores adicionales.

## 🛠️ Tecnologías Utilizadas
-   **Frontend (App Móvil):** React Native / Expo.
-   **Backend (API REST):** Node.js con Express.js.
-   **Base de Datos:** PostgreSQL.

---
**ServiTerra** - *Sistema de Gestión de Colaciones*
