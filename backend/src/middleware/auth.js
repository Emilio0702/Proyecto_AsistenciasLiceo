const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'serviterra_secret_key_2024';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Se requiere un token de autenticación' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Contiene id, email, rol, pension_id
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.rol === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado: Se requiere rol de Administrador' });
    }
};

module.exports = { verifyToken, isAdmin };
