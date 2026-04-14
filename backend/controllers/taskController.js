const { getPool } = require('../config/database');

// HU-05, HU-09, HU-10
const getTasks = async (req, res) => {
  try {
    const pool = getPool();
    const { status, search } = req.query;
    let query = 'SELECT * FROM Tasks WHERE userId = ?';
    const params = [req.user.id];

    if (status && status !== 'Todas') { query += ' AND status = ?'; params.push(status); }
    if (search) { query += ' AND title LIKE ?'; params.push(`%${search}%`); }
    query += ' ORDER BY createdAt DESC';

    const [tasks] = await pool.query(query, params);

    const [countRows] = await pool.query(
      'SELECT status, COUNT(*) as count FROM Tasks WHERE userId = ? GROUP BY status',
      [req.user.id]
    );
    const counts = { Pendiente: 0, 'En Progreso': 0, Completada: 0 };
    countRows.forEach(r => { counts[r.status] = r.count; });

    return res.status(200).json({ tasks, counts });
  } catch (err) {
    console.error('Error en getTasks:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// HU-04
const createTask = async (req, res) => {
  const { title, description, priority, dueDate } = req.body;
  if (!title) return res.status(400).json({ message: 'El título de la tarea es requerido' });
  const validPriorities = ['Alta', 'Media', 'Baja'];
  if (priority && !validPriorities.includes(priority))
    return res.status(400).json({ message: 'Prioridad inválida. Debe ser Alta, Media o Baja' });
  if (dueDate) {
    const today = new Date(); today.setHours(0,0,0,0);
    if (new Date(dueDate) < today)
      return res.status(400).json({ message: 'La fecha límite debe ser igual o posterior a hoy' });
  }
  try {
    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO Tasks (userId, title, description, priority, dueDate, status) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, title, description || '', priority || 'Media', dueDate || null, 'Pendiente']
    );
    const [rows] = await pool.query('SELECT * FROM Tasks WHERE id = ?', [result.insertId]);
    return res.status(201).json({ message: 'Tarea creada exitosamente', task: rows[0] });
  } catch (err) {
    console.error('Error en createTask:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// HU-06, HU-08
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, dueDate, status } = req.body;
  const validStatuses = ['Pendiente', 'En Progreso', 'Completada'];
  if (status && !validStatuses.includes(status))
    return res.status(400).json({ message: 'Estado inválido' });
  try {
    const pool = getPool();
    const [existing] = await pool.query('SELECT * FROM Tasks WHERE id = ? AND userId = ?', [id, req.user.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Tarea no encontrada' });
    const t = existing[0];
    await pool.query(
      'UPDATE Tasks SET title=?, description=?, priority=?, dueDate=?, status=? WHERE id=? AND userId=?',
      [title||t.title, description!==undefined?description:t.description, priority||t.priority, dueDate!==undefined?dueDate:t.dueDate, status||t.status, id, req.user.id]
    );
    const [updated] = await pool.query('SELECT * FROM Tasks WHERE id = ?', [id]);
    return res.status(200).json({ message: 'Tarea actualizada exitosamente', task: updated[0] });
  } catch (err) {
    console.error('Error en updateTask:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// HU-07
const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = getPool();
    const [existing] = await pool.query('SELECT id FROM Tasks WHERE id = ? AND userId = ?', [id, req.user.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Tarea no encontrada' });
    await pool.query('DELETE FROM Tasks WHERE id = ? AND userId = ?', [id, req.user.id]);
    return res.status(200).json({ message: 'Tarea eliminada exitosamente' });
  } catch (err) {
    console.error('Error en deleteTask:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
