const express = require('express');
const db = require('../db/db');

const router = express.Router();

// Obtener todas las tiendas
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tiendas ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear una nueva tienda
router.post('/', async (req, res) => {
    const { nombre, ubicacion } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO tiendas (nombre, ubicacion) VALUES ($1, $2) RETURNING *',
            [nombre, ubicacion]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
