const express = require('express');
const db = require('../db/db');

const router = express.Router();

// Obtener todos los camioneros
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM camioneros ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Buscar camionero por RUT
router.get('/:rut', async (req, res) => {
    try {
        const { rut } = req.params;
        const result = await db.query('SELECT * FROM camioneros WHERE rut = $1', [rut]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Camionero no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Registrar nuevo camionero
router.post('/', async (req, res) => {
    const { rut, nombre, patente } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO camioneros (rut, nombre, patente) VALUES ($1, $2, $3) RETURNING *',
            [rut, nombre, patente]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ message: 'El RUT ya está registrado' });
        }
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
