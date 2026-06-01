-- Crear tabla de Tiendas
CREATE TABLE IF NOT EXISTS tiendas (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    ubicacion TEXT,                        -- Dirección en texto legible (ej: "Av. Libertador 123, Santiago")
    latitud DECIMAL(10, 8),                -- Coordenada GPS latitud  (ej: -33.44890)
    longitud DECIMAL(11, 8),               -- Coordenada GPS longitud (ej: -70.66930)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de Camioneros
CREATE TABLE IF NOT EXISTS camioneros (
    id SERIAL PRIMARY KEY,
    rut TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    patente TEXT,
    telefono TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de Usuarios (Encargadas de tienda)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nombre TEXT NOT NULL,
    tienda_id INTEGER REFERENCES tiendas(id),
    rol TEXT DEFAULT 'encargada', -- 'admin' o 'encargada'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de Registros de Colaciones
CREATE TABLE IF NOT EXISTS registros_colaciones (
    id SERIAL PRIMARY KEY,
    camionero_id INTEGER REFERENCES camioneros(id) NOT NULL,
    tienda_id INTEGER REFERENCES tiendas(id) NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id) NOT NULL, -- Quién registró
    fecha DATE DEFAULT CURRENT_DATE NOT NULL,
    hora TIME DEFAULT CURRENT_TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricción para evitar que un camionero registre más de una colación por día
    -- Si el requerimiento es estrictamente "por día y por tienda", se agregaría tienda_id al UNIQUE
    CONSTRAINT unico_registro_por_dia UNIQUE (camionero_id, fecha)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_registros_fecha ON registros_colaciones(fecha);
CREATE INDEX IF NOT EXISTS idx_camioneros_rut ON camioneros(rut);
