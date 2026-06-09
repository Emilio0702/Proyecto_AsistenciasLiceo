const express = require('express');
const cors = require('cors');
const db = require('../db/db'); 

// Importar rutas
const trabajadoresRoutes = require('../routes/trabajadores');
const colacionesRoutes = require('../routes/colaciones');
const authRoutes = require('../routes/auth');
const pensionesRoutes = require('../routes/pensiones');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Permitir peticiones desde otros dominios
app.use(express.json()); 

// Usar rutas
app.use('/api/trabajadores', trabajadoresRoutes);
app.use('/api/colaciones', colacionesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/pensiones', pensionesRoutes);

app.get('/', (req, res) => {
  res.send('Backend del Sistema de Registro de Colaciones funcionando!');
});

// Prueba de conexión a la base de datos
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.status(200).json({ message: 'Conexión a la base de datos exitosa!', time: result.rows[0].now });
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    res.status(500).json({ message: 'Error al conectar a la base de datos', error: error.message });
  }
});

// Middleware para registrar peticiones y errores
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Endpoint para el healthcheck de Railway
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({ message: 'Error interno del servidor', error: err.message });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor backend escuchando en http://0.0.0.0:${port}`);
});
