-- Migración: Renombrar Tiendas a Pensiones
-- Ejecuta esto en tu base de datos actual para sincronizar con los cambios de código

-- 1. Renombrar la tabla principal
ALTER TABLE tiendas RENAME TO pensiones;

-- 2. Renombrar columnas en la tabla de Usuarios
ALTER TABLE usuarios RENAME COLUMN tienda_id TO pension_id;

-- 3. Renombrar columnas en la tabla de Registros de Colaciones
ALTER TABLE registros_colaciones RENAME COLUMN tienda_id TO pension_id;

-- 4. Actualizar índices si es necesario (PostgreSQL lo hace automáticamente en la mayoría de los casos al renombrar columnas/tablas)
