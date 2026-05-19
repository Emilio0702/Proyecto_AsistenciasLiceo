-- 1. Insertar Tiendas de ejemplo
INSERT INTO tiendas (nombre, ubicacion) VALUES 
('Tienda Central - Santiago', 'Av. Libertador 123'),
('Tienda Norte - Antofagasta', 'Ruta 5 Norte KM 1300'),
('Tienda Sur - Concepción', 'Calle Logística 456')
ON CONFLICT DO NOTHING;

-- 2. Insertar Camioneros de ejemplo
INSERT INTO camioneros (rut, nombre, patente) VALUES 
('12345678-9', 'Juan Pérez', 'ABCD-12'),
('87654321-0', 'Pedro Rodríguez', 'XY-9876'),
('11223344-5', 'Luis Morales', 'FG-4455')
ON CONFLICT (rut) DO NOTHING;

-- 3. Insertar Usuario (Encargada) de ejemplo
-- La contraseña '123456' hasheada (aunque por ahora es texto plano para pruebas rápidas)
INSERT INTO usuarios (email, password_hash, nombre, tienda_id) VALUES 
('encargada1@empresa.com', 'scrypt_o_bcrypt_hash_aqui', 'Ana García', (SELECT id FROM tiendas LIMIT 1))
ON CONFLICT (email) DO NOTHING;

-- 4. Consulta para verificar IDs (Útil para las pruebas de Postman/API)
SELECT 'TIENDAS' as tabla, id, nombre FROM tiendas
UNION ALL
SELECT 'CAMIONEROS', id, nombre FROM camioneros
UNION ALL
SELECT 'USUARIOS', id, nombre FROM usuarios;
