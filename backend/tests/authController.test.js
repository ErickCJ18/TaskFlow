// ============================================================
// Pruebas Unitarias: authController
// Cubre: HU-01 (registro), HU-02 (login), HU-03 (logout)
// ============================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock del módulo de base de datos
jest.mock('../config/database', () => ({
  getPool: jest.fn(),
  sql: {
    NVarChar: 'NVarChar',
    Int: 'Int',
  },
}));

const { getPool } = require('../config/database');
const { register, login, getProfile } = require('../controllers/authController');

// Helper para crear mocks de request y response
const mockReq = (body = {}, user = null) => ({ body, user });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ─────────────────────────────────────────────
// HU-01: Registro de Usuario
// ─────────────────────────────────────────────
describe('HU-01 | Registro de Usuario', () => {

  it('TC-U01 | Debe registrar un usuario con datos válidos', async () => {
    const mockPool = {
      request: jest.fn().mockReturnValue({
        input: jest.fn().mockReturnThis(),
        query: jest.fn()
          .mockResolvedValueOnce({ recordset: [] }) // email no existe
          .mockResolvedValueOnce({ recordset: [{ id: 1, name: 'Test', email: 'test@prueba.com' }] })
      })
    };
    getPool.mockReturnValue(mockPool);

    const req = mockReq({ name: 'Test', email: 'test@prueba.com', password: 'Test1234!' });
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Usuario registrado exitosamente', token: expect.any(String) })
    );
  });

  it('TC-U02 | Debe rechazar si faltan campos requeridos', async () => {
    const req = mockReq({ name: '', email: '', password: '' });
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Todos los campos son requeridos' })
    );
  });

  it('TC-U03 | Debe rechazar correo con formato inválido', async () => {
    const req = mockReq({ name: 'Test', email: 'correo-invalido', password: 'Test1234!' });
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'El formato del correo no es válido' })
    );
  });

  it('TC-U04 | Debe rechazar contraseña con menos de 8 caracteres', async () => {
    const req = mockReq({ name: 'Test', email: 'test@test.com', password: '123' });
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'La contraseña debe tener mínimo 8 caracteres' })
    );
  });

  it('TC-U05 | Debe rechazar si el correo ya está registrado', async () => {
    const mockPool = {
      request: jest.fn().mockReturnValue({
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValueOnce({ recordset: [{ id: 1 }] }) // correo existe
      })
    };
    getPool.mockReturnValue(mockPool);

    const req = mockReq({ name: 'Test', email: 'existente@test.com', password: 'Test1234!' });
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'El correo ya está registrado' })
    );
  });
});

// ─────────────────────────────────────────────
// HU-02: Inicio de Sesión
// ─────────────────────────────────────────────
describe('HU-02 | Inicio de Sesión', () => {

  it('TC-U06 | Debe retornar token con credenciales correctas', async () => {
    const hashedPassword = await bcrypt.hash('Test1234!', 10);

    const mockPool = {
      request: jest.fn().mockReturnValue({
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValueOnce({
          recordset: [{ id: 1, name: 'Test', email: 'test@prueba.com', password: hashedPassword }]
        })
      })
    };
    getPool.mockReturnValue(mockPool);

    const req = mockReq({ email: 'test@prueba.com', password: 'Test1234!' });
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Inicio de sesión exitoso', token: expect.any(String) })
    );
  });

  it('TC-U07 | Debe rechazar con contraseña incorrecta', async () => {
    const hashedPassword = await bcrypt.hash('Test1234!', 10);

    const mockPool = {
      request: jest.fn().mockReturnValue({
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValueOnce({
          recordset: [{ id: 1, name: 'Test', email: 'test@prueba.com', password: hashedPassword }]
        })
      })
    };
    getPool.mockReturnValue(mockPool);

    const req = mockReq({ email: 'test@prueba.com', password: 'WrongPass!' });
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Credenciales incorrectas' })
    );
  });

  it('TC-U08 | Debe rechazar si el usuario no existe', async () => {
    const mockPool = {
      request: jest.fn().mockReturnValue({
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValueOnce({ recordset: [] }) // usuario no encontrado
      })
    };
    getPool.mockReturnValue(mockPool);

    const req = mockReq({ email: 'noexiste@test.com', password: 'Test1234!' });
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Credenciales incorrectas' })
    );
  });

  it('TC-U09 | Debe rechazar si faltan campos de login', async () => {
    const req = mockReq({ email: '', password: '' });
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ─────────────────────────────────────────────
// HU-03: Perfil de usuario autenticado
// ─────────────────────────────────────────────
describe('HU-03 | Perfil de Usuario Autenticado', () => {

  it('TC-U10 | Debe retornar el perfil del usuario autenticado', async () => {
    const req = mockReq({}, { id: 1, name: 'Test', email: 'test@prueba.com' });
    const res = mockRes();

    await getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.objectContaining({ id: 1, name: 'Test', email: 'test@prueba.com' })
      })
    );
  });
});
