const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/register  — HU-01
router.post('/register', register);

// POST /api/auth/login     — HU-02
router.post('/login', login);

// POST /api/auth/logout    — HU-03 (el cliente elimina el token)
router.post('/logout', authMiddleware, (req, res) => {
  return res.status(200).json({ message: 'Sesión cerrada exitosamente' });
});

// GET  /api/auth/profile   — obtener datos del usuario autenticado
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
