const express = require('express');
const db = require('../db/db');

const router = express.Router();

// Obtener todas las tiendas (con coordenadas GPS si existen)
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tiendas ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear una nueva tienda (acepta ubicación en texto y/o coordenadas GPS)
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
