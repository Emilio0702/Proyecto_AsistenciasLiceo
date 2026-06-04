const express = require('express');
const db = require('../db/db');
const { verifyToken, isAdmin } = require('../src/middleware/auth');

const router = express.Router();

// Obtener todas las tiendas (Solo para Admins o usuarios autenticados)
router.get('/', verifyToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tiendas ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear una nueva tienda
// Se permite a usuarios no autenticados o se protege según el flujo de registro actual
// Dado que el frontend llama a esto antes de registrar al usuario, 
// podríamos dejarlo abierto o requerir un token de admin si el registro lo hace un admin.
router.post('/', async (req, res) => {
    const { nombre, ubicacion, latitud, longitud } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO tiendas (nombre, ubicacion, latitud, longitud) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, ubicacion || null, latitud || null, longitud || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
