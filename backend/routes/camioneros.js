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
        const normalizedRut = String(req.params.rut || '').replace(/[^0-9kK]/g, '').toUpperCase().trim();
        const result = await db.query(
            `SELECT * FROM camioneros
             WHERE REGEXP_REPLACE(UPPER(TRIM(rut)), '[^0-9K]', '', 'g') = $1
             LIMIT 1`,
            [normalizedRut]
        );
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
    const { rut, nombre, patente, telefono, empresa } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO camioneros (rut, nombre, patente, telefono, empresa) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [rut, nombre, patente, telefono, empresa]
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
