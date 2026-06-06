const express = require('express');
const db = require('../db/db');
const { verifyToken } = require('../src/middleware/auth');

const router = express.Router();

const { formatInTimeZone } = require('date-fns-tz');

// Registrar una nueva colación
router.post('/', verifyToken, async (req, res) => {
    let { camionero_id, pension_id, usuario_id, tipo_servicio } = req.body;
    
    // Seguridad: Si es encargada, forzar su pension_id y su usuario_id
    if (req.user.rol === 'encargada') {
        pension_id = req.user.pension_id;
        usuario_id = req.user.id;
    }

    // Obtener hora local en Chile
    const timeZone = 'America/Santiago';
    const now = new Date();
    const horaChile = formatInTimeZone(now, timeZone, 'HH:mm:ss');
    const fechaChile = formatInTimeZone(now, timeZone, 'yyyy-MM-dd');

    try {
        const result = await db.query(
            `INSERT INTO registros_colaciones (camionero_id, pension_id, usuario_id, fecha, hora, tipo_servicio) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *, 
             TO_CHAR(fecha, 'DD/MM/YYYY') as fecha_f,
             TO_CHAR(hora, 'HH12:MI AM') as hora_f`,
            [camionero_id, pension_id, usuario_id, fechaChile, horaChile, tipo_servicio]
        );
        res.status(201).json({
            message: 'Colación registrada exitosamente',
            registro: { ...result.rows[0], empresa: req.body.empresa }
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
router.get('/', verifyToken, async (req, res) => {
    try {
        let { limit, offset, pension_id, search, fecha_inicio, fecha_fin } = req.query;
        
        // Seguridad: Si es encargada, solo puede ver su pensión
        if (req.user.rol === 'encargada') {
            pension_id = req.user.pension_id;
        }

        let queryStr = `
            SELECT r.*, c.nombre as camionero_nombre, c.rut as camionero_rut, c.patente as camionero_patente, c.empresa as camionero_empresa, p.nombre as pension_nombre, p.ubicacion as pension_ubicacion,
                   TO_CHAR(r.fecha, 'DD-MM-YYYY') as fecha_registro,
                   TO_CHAR(r.hora, 'HH24:MI') as hora_registro,
                   r.tipo_servicio
            FROM registros_colaciones r
            JOIN camioneros c ON r.camionero_id = c.id
            JOIN pensiones p ON r.pension_id = p.id
            WHERE 1=1
        `;
        let countQueryStr = `
            SELECT COUNT(*) FROM registros_colaciones r
            JOIN camioneros c ON r.camionero_id = c.id
            JOIN pensiones p ON r.pension_id = p.id
            WHERE 1=1
        `;
        let params = [];
        let paramsCount = [];

        if (pension_id) {
            params.push(pension_id);
            paramsCount.push(pension_id);
            const condition = ` AND r.pension_id = $${params.length}`;
            queryStr += condition;
            countQueryStr += condition;
        }

        if (search) {
            const searchParam = `%${search}%`;
            params.push(searchParam);
            paramsCount.push(searchParam);
            const condition = ` AND (c.nombre ILIKE $${params.length} OR p.nombre ILIKE $${params.length} OR c.rut ILIKE $${params.length} OR c.patente ILIKE $${params.length})`;
            queryStr += condition;
            countQueryStr += condition;
        }

        if (fecha_inicio) {
            // Asegurar que la fecha esté en formato YYYY-MM-DD
            params.push(fecha_inicio.trim());
            paramsCount.push(fecha_inicio.trim());
            const condition = ` AND r.fecha >= $${params.length}::date`;
            queryStr += condition;
            countQueryStr += condition;
        }

        if (fecha_fin) {
            params.push(fecha_fin.trim());
            paramsCount.push(fecha_fin.trim());
            const condition = ` AND r.fecha <= $${params.length}::date`;
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
router.get('/reporte/excel', verifyToken, async (req, res) => {
    try {
        let pensionFilter = '';
        let params = [];

        // Seguridad: Si es encargada, filtrar solo su pensión
        if (req.user.rol === 'encargada') {
            pensionFilter = 'WHERE r.pension_id = $1';
            params.push(req.user.pension_id);
        }

        const result = await db.query(`
            SELECT r.id, c.nombre as camionero_nombre, c.rut, p.nombre as pension_nombre, 
                   u.nombre as usuario_nombre, r.fecha, r.hora
            FROM registros_colaciones r
            JOIN camioneros c ON r.camionero_id = c.id
            JOIN pensiones p ON r.pension_id = p.id
            JOIN usuarios u ON r.usuario_id = u.id
            ${pensionFilter}
            ORDER BY r.fecha DESC, r.hora DESC
        `, params);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Colaciones');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Camionero', key: 'camionero_nombre', width: 30 },
            { header: 'RUT', key: 'rut', width: 15 },
            { header: 'Pensión', key: 'pension_nombre', width: 30 },
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
