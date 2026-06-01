-- Script de migración: Agrega coordenadas GPS a la tabla tiendas
-- Ejecutar: docker exec -i serviterra_db psql -U postgres -d registro_colacion -f /tmp/migrate.sql
-- O directamente: docker exec -it serviterra_db psql -U postgres -d registro_colacion -c "ALTER TABLE..."

ALTER TABLE tiendas ADD COLUMN IF NOT EXISTS latitud DECIMAL(10, 8);
ALTER TABLE tiendas ADD COLUMN IF NOT EXISTS longitud DECIMAL(11, 8);
