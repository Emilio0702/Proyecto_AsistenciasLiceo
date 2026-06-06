-- Crear tabla de Pensiones
CREATE TABLE IF NOT EXISTS pensiones (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    ubicacion TEXT,                        
    latitud DECIMAL(10, 8),                
    longitud DECIMAL(11, 8),               
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de Camioneros
CREATE TABLE IF NOT EXISTS camioneros (
    id SERIAL PRIMARY KEY,
    rut TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    patente TEXT,
    telefono TEXT,
    empresa TEXT, -- Agregado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nombre TEXT NOT NULL,
    pension_id INTEGER REFERENCES pensiones(id),
    rol TEXT DEFAULT 'encargada',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de Registros de Colaciones
CREATE TABLE IF NOT EXISTS registros_colaciones (
    id SERIAL PRIMARY KEY,
    camionero_id INTEGER REFERENCES camioneros(id) NOT NULL,
    pension_id INTEGER REFERENCES pensiones(id) NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id) NOT NULL,
    fecha DATE DEFAULT CURRENT_DATE NOT NULL,
    hora TIME DEFAULT CURRENT_TIME NOT NULL,
    tipo_servicio TEXT, -- Agregado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricción para permitir diferentes servicios al mismo camionero el mismo día
    CONSTRAINT unico_registro_por_dia_servicio UNIQUE (camionero_id, fecha, tipo_servicio)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_registros_fecha ON registros_colaciones(fecha);
CREATE INDEX IF NOT EXISTS idx_camioneros_rut ON camioneros(rut);
