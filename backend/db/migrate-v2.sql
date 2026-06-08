-- Modificar tabla de Trabajadores para incluir empresa
ALTER TABLE trabajadores ADD COLUMN IF NOT EXISTS empresa TEXT;

-- Modificar tabla de Registros de Colaciones para incluir tipo de servicio
ALTER TABLE registros_colaciones ADD COLUMN IF NOT EXISTS tipo_servicio TEXT;

-- Actualizar la restricción UNIQUE para permitir un servicio por día por tipo
-- Primero eliminamos la restricción antigua si existe
ALTER TABLE registros_colaciones DROP CONSTRAINT IF EXISTS unico_registro_por_dia;

-- Creamos la nueva restricción
ALTER TABLE registros_colaciones ADD CONSTRAINT unico_registro_por_dia_servicio 
UNIQUE (trabajador_id, fecha, tipo_servicio);
