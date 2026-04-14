const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas las rutas de tareas requieren autenticación
router.use(authMiddleware);

// GET    /api/tasks         — HU-05: Ver tablero, HU-09: Filtrar, HU-10: Buscar
router.get('/', getTasks);

// POST   /api/tasks         — HU-04: Crear tarea
router.post('/', createTask);

// PUT    /api/tasks/:id     — HU-06: Editar tarea, HU-08: Cambiar estado
router.put('/:id', updateTask);

// DELETE /api/tasks/:id     — HU-07: Eliminar tarea
router.delete('/:id', deleteTask);

module.exports = router;
