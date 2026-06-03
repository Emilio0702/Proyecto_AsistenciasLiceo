const express = require('express');
const db = require('../db/db');

const router = express.Router();

const { formatInTimeZone } = require('date-fns-tz');

// Registrar una nueva colación
router.post('/', async (req, res) => {
    const { camionero_id, tienda_id, usuario_id, tipo_servicio } = req.body;
    
    // Obtener hora local en Chile
    const timeZone = 'America/Santiago';
    const now = new Date();
    const horaChile = formatInTimeZone(now, timeZone, 'HH:mm:ss');
    const fechaChile = formatInTimeZone(now, timeZone, 'yyyy-MM-dd');

    try {
        const result = await db.query(
            'INSERT INTO registros_colaciones (camionero_id, tienda_id, usuario_id, fecha, hora, tipo_servicio) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [camionero_id, tienda_id, usuario_id, fechaChile, horaChile, tipo_servicio]
        );
        res.status(201).json({
            message: 'Colación registrada exitosamente',
            registro: result.rows[0]
        });
    } catch (error) {
        if (error.code === '23505') { // Error de duplicado (Unique violation)
            return res.status(400).json({ 
                message: `Error: El camionero ya registró ${tipo_servicio} el día de hoy.` 
            });
        }
        res.status(500).json({ error: error.message });
    }
});

const ExcelJS = require('exceljs');

// Obtener historial de colaciones con paginación opcional y filtros
router.get('/', async (req, res) => {
    try {
        const { limit, offset, tienda_id, search, fecha_inicio, fecha_fin } = req.query;
        let queryStr = `
            SELECT r.*, c.nombre as camionero_nombre, c.rut as camionero_rut, c.patente as camionero_patente, t.nombre as tienda_nombre, t.ubicacion as tienda_ubicacion,
                   TO_CHAR(r.fecha, 'DD-MM-YYYY') as fecha_registro,
                   TO_CHAR(r.hora, 'HH24:MI') as hora_registro,
                   r.tipo_servicio
            FROM registros_colaciones r
            JOIN camioneros c ON r.camionero_id = c.id
            JOIN tiendas t ON r.tienda_id = t.id
            WHERE 1=1
        `;
        let countQueryStr = `
            SELECT COUNT(*) FROM registros_colaciones r
            JOIN camioneros c ON r.camionero_id = c.id
            JOIN tiendas t ON r.tienda_id = t.id
            WHERE 1=1
        `;
        let params = [];
        let paramsCount = [];

        if (tienda_id) {
            params.push(tienda_id);
            paramsCount.push(tienda_id);
            const condition = ` AND r.tienda_id = $${params.length}`;
            queryStr += condition;
            countQueryStr += condition;
        }

        if (search) {
            const searchParam = `%${search}%`;
            params.push(searchParam);
            paramsCount.push(searchParam);
            const condition = ` AND (c.nombre ILIKE $${params.length} OR t.nombre ILIKE $${params.length} OR c.rut ILIKE $${params.length} OR c.patente ILIKE $${params.length})`;
            queryStr += condition;
            countQueryStr += condition;
        }

        if (fecha_inicio) {
            params.push(fecha_inicio);
            paramsCount.push(fecha_inicio);
            const condition = ` AND r.fecha >= $${params.length}`;
            queryStr += condition;
            countQueryStr += condition;
        }

        if (fecha_fin) {
            params.push(fecha_fin);
            paramsCount.push(fecha_fin);
            const condition = ` AND r.fecha <= $${params.length}`;
            queryStr += condition;
            countQueryStr += condition;
        }

        queryStr += ` ORDER BY r.fecha DESC, r.hora DESC`;

        if (limit) {
            params.push(limit);
            queryStr += ` LIMIT $${params.length}`;
            if (offset) {
                params.push(offset);
                queryStr += ` OFFSET $${params.length}`;
            }
        }

        const countResult = await db.query(countQueryStr, paramsCount);
        const result = await db.query(queryStr, params);

        res.json({
            data: result.rows,
            total: parseInt(countResult.rows[0].count)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Exportar reporte Excel
router.get('/reporte/excel', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT r.id, c.nombre as camionero_nombre, c.rut, t.nombre as tienda_nombre, 
                   u.nombre as usuario_nombre, r.fecha, r.hora
            FROM registros_colaciones r
            JOIN camioneros c ON r.camionero_id = c.id
            JOIN tiendas t ON r.tienda_id = t.id
            JOIN usuarios u ON r.usuario_id = u.id
            ORDER BY r.fecha DESC, r.hora DESC
        `);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Colaciones');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Camionero', key: 'camionero_nombre', width: 30 },
            { header: 'RUT', key: 'rut', width: 15 },
            { header: 'Tienda', key: 'tienda_nombre', width: 30 },
            { header: 'Encargada', key: 'usuario_nombre', width: 30 },
            { header: 'Fecha', key: 'fecha', width: 15 },
            { header: 'Hora', key: 'hora', width: 15 },
        ];

        result.rows.forEach(row => {
            const fechaStr = row.fecha instanceof Date ? row.fecha.toISOString().split('T')[0] : row.fecha;
            worksheet.addRow({
                ...row,
                fecha: fechaStr
            });
        });

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=ReporteColaciones.xlsx'
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error al generar Excel:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
