const express = require('express');
const db = require('../db/db');

const router = express.Router();

const { format } = require('date-fns-tz');

// Registrar una nueva colación
router.post('/', async (req, res) => {
    const { camionero_id, tienda_id, usuario_id } = req.body;
    
    // Obtener hora local en Chile
    const timeZone = 'America/Santiago';
    const now = new Date();
    const horaChile = format(now, 'HH:mm:ss', { timeZone });
    const fechaChile = format(now, 'yyyy-MM-dd', { timeZone });

    try {
        const result = await db.query(
            'INSERT INTO registros_colaciones (camionero_id, tienda_id, usuario_id, fecha, hora) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [camionero_id, tienda_id, usuario_id, fechaChile, horaChile]
        );
        res.status(201).json({
            message: 'Colación registrada exitosamente',
            registro: result.rows[0]
        });
    } catch (error) {
        if (error.code === '23505') { // Error de duplicado (Unique violation)
            return res.status(400).json({ 
                message: 'Error: El camionero ya registró una colación el día de hoy.' 
            });
        }
        res.status(500).json({ error: error.message });
    }
});

// Obtener historial de colaciones (opcional con filtros)
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT r.*, c.nombre as camionero_nombre, t.nombre as tienda_nombre 
            FROM registros_colaciones r
            JOIN camioneros c ON r.camionero_id = c.id
            JOIN tiendas t ON r.tienda_id = t.id
            ORDER BY r.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
