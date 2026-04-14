// ============================================================
// HU-03: Cierre de Sesión
// TC-007: Logout elimina el token y redirige al login
// TC-008: Acceder al dashboard sin sesión redirige al login
// ============================================================

describe('HU-03 | Cierre de Sesión', () => {
  const email = `logout_${Date.now()}@prueba.com`;
  const password = 'Test1234!';

  before(() => {
    cy.visit('/register');
    cy.get('[data-testid="input-name"]').type('Usuario Logout');
    cy.get('[data-testid="input-email"]').type(email);
    cy.get('[data-testid="input-password"]').type(password);
    cy.get('[data-testid="btn-register"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('TC-007 | Logout elimina sesión y redirige al login', () => {
    cy.visit('/dashboard');
    cy.get('[data-testid="navbar"]').should('be.visible');

    // Captura: dashboard antes del logout
    cy.screenshot('HU03-TC007-01_dashboard_antes_logout');

    cy.get('[data-testid="btn-logout"]').click();

    // Verificar redirección
    cy.url().should('include', '/login');

    // Verificar que el token fue eliminado
    cy.window().then(win => {
      expect(win.localStorage.getItem('token')).to.be.null;
      expect(win.localStorage.getItem('user')).to.be.null;
    });

    // Captura: pantalla de login tras cierre de sesión
    cy.screenshot('HU03-TC007-02_login_post_logout');
  });

  it('TC-008 | Acceder al dashboard sin sesión redirige al login', () => {
    // Asegurarse de que no hay sesión
    cy.window().then(win => {
      win.localStorage.clear();
    });

    cy.visit('/dashboard');
    cy.url().should('include', '/login');

    // Captura: redirección automática sin sesión
    cy.screenshot('HU03-TC008-01_redireccion_sin_sesion');
  });
});
