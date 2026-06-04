const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/db');
const { verifyToken, isAdmin } = require('../src/middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'serviterra_secret_key_2024';

// Registro de usuario (Solo accesible para Administradores)
router.post('/register', verifyToken, isAdmin, async (req, res) => {
    const { email, password, nombre, tienda_id, rol } = req.body;

    try {
        // Verificar si el usuario ya existe
        const userCheck = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insertar usuario
        const result = await db.query(
            'INSERT INTO usuarios (email, password_hash, nombre, tienda_id, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, nombre, rol, tienda_id',
            [email, passwordHash, nombre, tienda_id, rol || 'encargada']
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login de usuario (Público)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuario e incluir información de la tienda
        const result = await db.query(`
            SELECT u.*, t.nombre as tienda_nombre 
            FROM usuarios u 
            LEFT JOIN tiendas t ON u.tienda_id = t.id 
            WHERE u.email = $1
        `, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar token
        const token = jwt.sign(
            { id: user.id, email: user.email, rol: user.rol, tienda_id: user.tienda_id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                rol: user.rol,
                tienda_id: user.tienda_id,
                tienda_nombre: user.tienda_nombre
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/reset-password', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'El correo y la nueva contraseña son obligatorios' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    try {
        const userCheck = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);

        if (userCheck.rows.length === 0) {
            return res.status(404).json({ message: 'No encontramos una cuenta con ese correo' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await db.query('UPDATE usuarios SET password_hash = $1 WHERE email = $2', [passwordHash, email]);

        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
