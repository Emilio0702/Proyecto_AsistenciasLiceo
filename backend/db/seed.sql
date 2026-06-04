-- Script de inicialización limpia para producción
-- Solo incluye el usuario administrador inicial

-- 1. Insertar Usuario (Admin) inicial
-- Email: admin@serviterra.com
-- Password: El mismo que estaba configurado anteriormente
INSERT INTO usuarios (email, password_hash, nombre, rol) VALUES 
('admin@serviterra.com', '$2b$10$5EDfw0N7hv0QdXF3GW8qRONQOXeP0.v7qLnsESUUFBlidJ1090Mc2', 'Administrador Principal', 'admin')
ON CONFLICT (email) DO NOTHING;
