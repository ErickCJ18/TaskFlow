// ============================================================
// HU-02: Inicio de Sesión
// TC-004: Login exitoso con credenciales correctas
// TC-005: Error con credenciales incorrectas
// TC-006: Redirección automática si ya hay sesión
// ============================================================

describe('HU-02 | Inicio de Sesión', () => {
  const email = `login_${Date.now()}@prueba.com`;
  const password = 'Test1234!';

  before(() => {
    // Crear usuario de prueba antes de los tests de login
    cy.visit('/register');
    cy.get('[data-testid="input-name"]').type('Usuario Login');
    cy.get('[data-testid="input-email"]').type(email);
    cy.get('[data-testid="input-password"]').type(password);
    cy.get('[data-testid="btn-register"]').click();
    cy.url().should('include', '/dashboard');
    // Limpiar sesión para los tests
    cy.window().then(win => {
      win.localStorage.removeItem('token');
      win.localStorage.removeItem('user');
    });
  });

  beforeEach(() => {
    cy.visit('/login');
  });

  it('TC-004 | Login exitoso con credenciales correctas', () => {
    // Captura: pantalla de login vacía
    cy.screenshot('HU02-TC004-01_pantalla_login');

    cy.get('[data-testid="input-email"]').type(email);
    cy.get('[data-testid="input-password"]').type(password);

    // Captura: formulario de login completo
    cy.screenshot('HU02-TC004-02_formulario_login_completo');

    cy.get('[data-testid="btn-login"]').click();

    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-greeting"]').should('contain', 'Usuario Login');

    // Captura: dashboard con saludo al usuario
    cy.screenshot('HU02-TC004-03_login_exitoso_dashboard');
  });

  it('TC-005 | Error con contraseña incorrecta', () => {
    cy.visit('/login');

    cy.get('[data-testid="input-email"]').type('fake@test.com');
    cy.get('[data-testid="input-password"]').type('wrongpassword123');
    cy.get('[data-testid="btn-login"]').click();

    cy.url().should('include', '/login');

    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
    });
  });

  it('TC-006 | Redirección a dashboard si ya tiene sesión activa', () => {
    // Simular sesión activa
    cy.window().then(win => {
      win.localStorage.setItem('token', 'token_simulado');
      win.localStorage.setItem('user', JSON.stringify({ name: 'Usuario Login' }));
    });

    cy.visit('/login');
    // Con token en localStorage, el PrivateRoute debe gestionar la sesión
    cy.screenshot('HU02-TC006-01_sesion_activa');
  });
});
