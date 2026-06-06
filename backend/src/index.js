const express = require('express');
const cors = require('cors');
const db = require('../db/db'); 

// Importar rutas
const camionerosRoutes = require('../routes/camioneros');
const colacionesRoutes = require('../routes/colaciones');
const authRoutes = require('../routes/auth');
const pensionesRoutes = require('../routes/pensiones');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Permitir peticiones desde otros dominios
app.use(express.json()); 

// Usar rutas
app.use('/api/camioneros', camionerosRoutes);
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

app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
  console.log('Intenta ir a http://localhost:3000/test-db para probar la conexión a la base de datos.');
});
