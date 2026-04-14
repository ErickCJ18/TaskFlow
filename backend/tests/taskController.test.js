// ============================================================
// Pruebas Unitarias: taskController
// Cubre: HU-04 (crear), HU-05 (listar), HU-06 (editar),
//        HU-07 (eliminar), HU-08 (cambiar estado),
//        HU-09 (filtrar), HU-10 (buscar)
// ============================================================

jest.mock('../config/database', () => ({
  getPool: jest.fn(),
  sql: {
    NVarChar: 'NVarChar',
    Int: 'Int',
    Date: 'Date',
    Max: 'Max',
  },
}));

const { getPool } = require('../config/database');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

const mockReq = (body = {}, params = {}, query = {}, user = { id: 1 }) =>
  ({ body, params, query, user });

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const tareaMock = {
  id: 1, userId: 1, title: 'Tarea Test', description: 'Descripción',
  priority: 'Media', status: 'Pendiente', dueDate: '2026-06-30', createdAt: new Date(),
};

// ─────────────────────────────────────────────
// HU-05, HU-09, HU-10: Obtener tareas
// ─────────────────────────────────────────────
describe('HU-05/09/10 | Obtener y filtrar tareas', () => {

  it('TC-U11 | Debe retornar todas las tareas del usuario', async () => {
    const mockPool = {
      request: jest.fn().mockReturnValue({
        input: jest.fn().mockReturnThis(),
        query: jest.fn()
          .mockResolvedValueOnce({ recordset: [tareaMock] })
          .mockResolvedValueOnce({ recordset: [{ status: 'Pendiente', count: 1 }] })
      })
    };
    getPool.mockReturnValue(mockPool);

    const req = mockReq({}, {}, {});
    const res = mockRes();

    await getTasks(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        tasks: expect.arrayContaining([expect.objectContaining({ title: 'Tarea Test' })]),
        counts: expect.objectContaining({ Pendiente: 1 })
      })
    );
  });

  it('TC-U12 | Debe filtrar tareas por estado (HU-09)', async () => {
    const mockPool = {
      request: jest.fn().mockReturnValue({
        input: jest.fn().mockReturnThis(),
        query: jest.fn()
          .mockResolvedValueOnce({ recordset: [tareaMock] })
          .mockResolvedValueOnce({ recordset: [] })
      })
    };
    getPool.mockReturnValue(mockPool);

    const req = mockReq({}, {}, { status: 'Pendiente' });
    const res = mockRes();

    await getTasks(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('TC-U13 | Debe buscar tareas por título (HU-10)', async () => {
    const mockPool = {
      request: jest.fn().mockReturnValue({
        input: jest.fn().mockReturnThis(),
        query: jest.fn()
          .mockResolvedValueOnce({ recordset: [tareaMock] })
          .mockResolvedValueOnce({ recordset: [] })
      })
    };
    getPool.mockReturnValue(mockPool);

    const req = mockReq({}, {}, { search: 'Tarea' });
    const res = mockRes();

    await getTasks(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ tasks: expect.any(Array) })
    );
  });
});

// ─────────────────────────────────────────────
// HU-04: Crear tarea
// ─────────────────────────────────────────────
describe('HU-04 | Crear Tarea', () => {

  it('TC-U14 | Debe crear una tarea con datos válidos', async () => {
    const mockPool = {
      request: jest.fn().mockReturnValue({
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValueOnce({ recordset: [tareaMock] })
      })
    };
    getPool.mockReturnValue(mockPool);

    const req = mockReq({ title: 'Nueva Tarea', description: 'Desc', priority: 'Alta', dueDate: '2026-06-30' });
    const res = mockRes();

    await createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Tarea creada exitosamente' })
    );
  });

  it('TC-U15 | Debe rechazar tarea sin título', async () => {
    const req = mockReq({ title: '', description: 'Desc' });
    const res = mockRes();

    await createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'El título de la tarea es requerido' })
    );
  });

  it('TC-U16 | Debe rechazar prioridad inválida', async () => {
    const req = mockReq({ title: 'Test', priority: 'MuyAlta' });
    const res = mockRes();

    await createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Prioridad inválida. Debe ser Alta, Media o Baja' })
    );
  });

  it('TC-U17 | Debe rechazar fecha límite en el pasado', async () => {
    const req = mockReq({ title: 'Test', dueDate: '2020-01-01' });
    const res = mockRes();

    await createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'La fecha límite debe ser igual o posterior a hoy' })
    );
  });
});

// ─────────────────────────────────────────────
// HU-06 y HU-08: Editar tarea / Cambiar estado
// ─────────────────────────────────────────────
describe('HU-06/08 | Editar Tarea y Cambiar Estado', () => {

  it('TC-U18 | Debe actualizar la tarea correctamente', async () => {
    const tareaActualizada = { ...tareaMock, title: 'Tarea Actualizada', status: 'En Progreso' };
    const mockPool = {
      request: jest.fn().mockReturnValue({
        input: jest.fn().mockReturnThis(),
        query: jest.fn()
          .mockResolvedValueOnce({ recordset: [tareaMock] })
          .mockResolvedValueOnce({ recordset: [tareaActualizada] })
      })
    };
    getPool.mockReturnValue(mockPool);

    const req = mockReq({ title: 'Tarea Actualizada', status: 'En Progreso' }, { id: '1' });
    const res = mockRes();

    await updateTask(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Tarea actualizada exitosamente' })
    );
  });

  it('TC-U19 | Debe retornar 404 si la tarea no existe o no pertenece al usuario', async () => {
    const mockPool = {
      request: jest.fn().mockReturnValue({
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValueOnce({ recordset: [] }) // tarea no encontrada
      })
    };
    getPool.mockReturnValue(mockPool);

    const req = mockReq({ title: 'Nuevo título' }, { id: '999' });
    const res = mockRes();

    await updateTask(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Tarea no encontrada' })
    );
  });

  it('TC-U20 | Debe rechazar un estado inválido', async () => {
    const req = mockReq({ status: 'EstadoInvalido' }, { id: '1' });
    const res = mockRes();

    await updateTask(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Estado inválido' })
    );
  });
});

// ─────────────────────────────────────────────
// HU-07: Eliminar tarea
// ─────────────────────────────────────────────
describe('HU-07 | Eliminar Tarea', () => {

  it('TC-U21 | Debe eliminar la tarea correctamente', async () => {
    const mockPool = {
      request: jest.fn().mockReturnValue({
        input: jest.fn().mockReturnThis(),
        query: jest.fn()
          .mockResolvedValueOnce({ recordset: [{ id: 1 }] }) // existe
          .mockResolvedValueOnce({}) // delete
      })
    };
    getPool.mockReturnValue(mockPool);

    const req = mockReq({}, { id: '1' });
    const res = mockRes();

    await deleteTask(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Tarea eliminada exitosamente' })
    );
  });

  it('TC-U22 | Debe retornar 404 al intentar eliminar tarea inexistente', async () => {
    const mockPool = {
      request: jest.fn().mockReturnValue({
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValueOnce({ recordset: [] })
      })
    };
    getPool.mockReturnValue(mockPool);

    const req = mockReq({}, { id: '999' });
    const res = mockRes();

    await deleteTask(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Tarea no encontrada' })
    );
  });
});
