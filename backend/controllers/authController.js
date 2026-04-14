const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/database');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'taskflow_secret_key_2026';

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ message: 'El formato del correo no es válido' });
  if (password.length < 8)
    return res.status(400).json({ message: 'La contraseña debe tener mínimo 8 caracteres' });
  try {
    const pool = getPool();
    const [existing] = await pool.query('SELECT id FROM Users WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(409).json({ message: 'El correo ya está registrado' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    const token = jwt.sign({ id: result.insertId, name, email }, JWT_SECRET, { expiresIn: '24h' });
    return res.status(201).json({ message: 'Usuario registrado exitosamente', token, user: { id: result.insertId, name, email } });
  } catch (err) {
    console.error('Error en register:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    return res.status(200).json({ message: 'Inicio de sesión exitoso', token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getProfile = async (req, res) => {
  return res.status(200).json({ user: { id: req.user.id, name: req.user.name, email: req.user.email } });
};

module.exports = { register, login, getProfile };
