const express = require('express');
const db = require('../db/db');
const { verifyToken, isAdmin } = require('../src/middleware/auth');

const router = express.Router();

// Obtener todas las pensiones (Solo para Admins o usuarios autenticados)
router.get('/', verifyToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM pensiones ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear una nueva pensión
router.post('/', async (req, res) => {
    const { nombre, ubicacion, latitud, longitud } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO pensiones (nombre, ubicacion, latitud, longitud) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, ubicacion || null, latitud || null, longitud || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
