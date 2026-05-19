## ServiTerra_Colacion — Sistema de Registro de Colaciones para Camioneros

### Descripción del Proyecto
Este proyecto tiene como objetivo desarrollar un sistema robusto para el registro y monitoreo de las colaciones de camioneros en diferentes puntos de atención. La solución consiste en una aplicación móvil para las encargadas de las tiendas, un backend que gestiona la lógica de negocio y una base de datos para almacenar la información de manera segura y consistente, permitiendo la generación de reportes para monitoreo.

El objetivo principal es eliminar las inconsistencias y el registro duplicado de colaciones, garantizando que la empresa solo pague por las colaciones efectivamente consumidas y registradas una única vez por camionero por día y por tienda.

### Requerimientos
#### Requerimientos Funcionales
-   **Registro de Colaciones:** Las encargadas de las tiendas podrán registrar las colaciones de los camioneros.
    -   Identificación de camionero (ej. por RUT/ID o código QR).
    -   Selección/detección de la tienda.
    -   Validación en tiempo real para evitar registros duplicados por camionero por día y por tienda.
    -   Confirmación visual del registro exitoso o mensaje de error/duplicado.
-   **Autenticación:** Las encargadas de las tiendas deberán iniciar sesión en la aplicación móvil de forma segura.
-   **Monitoreo:** La empresa podrá monitorear en tiempo real (o casi real) los registros de colaciones.
-   **Reportes:** Posibilidad de generar reportes de colaciones en formato Excel.

#### Requerimientos No Funcionales
-   **Rendimiento:** La aplicación y el backend deben ser responsivos y rápidos.
-   **Seguridad:** Protección de datos y autenticación segura.
-   **Confiabilidad:** Alta disponibilidad del servicio y consistencia de los datos.
-   **Escalabilidad:** Capacidad de crecer con más tiendas y camioneros.
-   **Facilidad de Uso:** Interfaz intuitiva para las encargadas de tienda.

#### Requerimientos Tecnológicos
-   **Aplicación Móvil (Frontend):** React Native.
-   **Backend (API):** Node.js con Express.js.
-   **Base de Datos:** PostgreSQL.
-   **Lenguajes:** JavaScript/TypeScript.

### Arquitectura Propuesta
El sistema seguirá una arquitectura de microservicios o monolítica dividida en capas, con una clara separación entre el cliente (aplicación móvil), el servidor (backend API) y la base de datos.

-   **Frontend (Mobile App):** Desarrollada con React Native, se comunicará con el Backend a través de una API RESTful.
-   **Backend (API):** Desarrollado con Node.js y Express.js, será responsable de la lógica de negocio, la autenticación, la validación de registros y la interacción con la base de datos.
-   **Base de Datos:** PostgreSQL, como almacén de datos persistente y relacional.
-   **Monitoreo Web (Opcional, Futuro):** Un dashboard web simple podría ser desarrollado para visualizar los datos de la base de datos en tiempo real.

### PostgreSQL: Conceptos Básicos y Configuración
PostgreSQL es un potente sistema de base de datos relacional de código abierto, conocido por su fiabilidad, robustez de características y rendimiento. Es una excelente elección para aplicaciones que requieren integridad de datos y manejo transaccional.

#### ¿Por qué PostgreSQL y no Excel directamente?
Aunque la solicitud inicial mencionaba un "Excel en tiempo real", la realidad es que los archivos Excel no están diseñados para ser una base de datos multiusuario concurrente en tiempo real. Esto presenta varios problemas:
-   **Concurrencia:** Múltiples usuarios escribiendo al mismo tiempo pueden causar corrupción de datos o sobrescritura.
-   **Integridad de Datos:** Es difícil aplicar reglas de negocio (ej. "no permitir duplicados") de forma robusta.
-   **Rendimiento:** Con el tiempo, los archivos Excel grandes pueden volverse lentos.
-   **Seguridad:** Gestión de accesos y permisos es más compleja y menos segura.
-   **Escalabilidad:** Limitaciones en el tamaño y manejo de datos.

PostgreSQL resuelve todos estos problemas, proporcionando un almacén de datos seguro, escalable y transaccional. La generación de reportes en Excel desde una base de datos es una práctica común y robusta.

#### Configuración de PostgreSQL (Guía Rápida)
1.  **Instalación:** Descarga e instala PostgreSQL desde su sitio oficial (postgresql.org) o usa un gestor de paquetes como `apt` (Linux) o `brew` (macOS).
2.  **Creación de Base de Datos y Usuario:**
    -   Accede a la interfaz de línea de comandos de `psql`: `psql -U postgres` (si usaste el usuario por defecto).
    -   Crea un nuevo usuario (con contraseña fuerte): `CREATE USER nombre_usuario WITH PASSWORD 'tu_contraseña_segura';`
    -   Crea una nueva base de datos: `CREATE DATABASE nombre_base_datos WITH OWNER nombre_usuario;`
    -   Concede todos los privilegios al usuario sobre la base de datos: `GRANT ALL PRIVILEGES ON DATABASE nombre_base_datos TO nombre_usuario;`
3.  **Herramientas GUI (Opcional pero Recomendado):** Utiliza herramientas como `pgAdmin` o `DBeaver` para una gestión más sencilla de la base de datos.

### Plan de Desarrollo Detallado (Pasos Siguientes)
1.  **Configuración del Entorno de Backend:**
    -   Inicialización del proyecto Node.js.
    -   Instalación de dependencias: `express`, `pg`, `dotenv`.
    -   Estructura inicial de carpetas: `src`, `config`, `routes`, `controllers`, `models`, `db`.
    -   Configuración de la conexión a la base de datos PostgreSQL.
2.  **Definición de Modelos y Migraciones:**
    -   Crear el esquema para `Tiendas`.
    -   Crear el esquema para `Camioneros`.
    -   Crear el esquema para `RegistrosColaciones`.
3.  **Desarrollo de la API del Backend:**
    -   Implementar autenticación básica.
    -   Crear endpoints para la gestión de camioneros y tiendas (CRUD básico).
    -   Desarrollar el endpoint principal para el registro de colaciones con su lógica de validación.
4.  **Desarrollo de la Aplicación Móvil (Frontend):**
    -   Configuración inicial de React Native.
    -   Diseño y desarrollo de pantallas: Login, Registro de Colación.
    -   Conexión con la API del Backend.
5.  **Desarrollo del Sistema de Monitoreo/Reportes:**
    -   Creación de endpoints para obtener datos de reportes.
    -   Implementación de la generación de archivos Excel.

