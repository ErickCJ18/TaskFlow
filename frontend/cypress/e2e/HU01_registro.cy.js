// ============================================================
// HU-01: Registro de Nuevo Usuario
// TC-001: Registro exitoso
// TC-002: Correo ya registrado
// TC-003: Contraseña menor a 8 caracteres
// ============================================================

describe('HU-01 | Registro de Nuevo Usuario', () => {
  const email = `test_${Date.now()}@prueba.com`;

  beforeEach(() => {
    cy.visit('/register');
  });

  it('TC-001 | Registro exitoso con datos válidos', () => {
    // Captura: pantalla de registro vacía
    cy.screenshot('HU01-TC001-01_pantalla_registro');

    cy.get('[data-testid="input-name"]').type('Usuario Test');
    cy.get('[data-testid="input-email"]').type(email);
    cy.get('[data-testid="input-password"]').type('Test1234!');

    // Captura: formulario lleno antes de enviar
    cy.screenshot('HU01-TC001-02_formulario_completo');

    cy.get('[data-testid="btn-register"]').click();

    // Verificar redirección al dashboard
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="navbar"]').should('be.visible');

    // Captura: dashboard tras registro exitoso
    cy.screenshot('HU01-TC001-03_dashboard_post_registro');
  });

  it('TC-002 | Error si el correo ya está registrado', () => {
    cy.get('[data-testid="input-name"]').type('Otro Usuario');
    cy.get('[data-testid="input-email"]').type(email); // mismo correo
    cy.get('[data-testid="input-password"]').type('Test1234!');
    cy.get('[data-testid="btn-register"]').click();

    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'correo ya está registrado');

    // Captura: mensaje de error correo duplicado
    cy.screenshot('HU01-TC002-01_error_correo_duplicado');
  });

  it('TC-003 | Error si la contraseña tiene menos de 8 caracteres', () => {
    cy.get('[data-testid="input-name"]').type('Usuario Test');
    cy.get('[data-testid="input-email"]').type(`nuevo_${Date.now()}@prueba.com`);
    cy.get('[data-testid="input-password"]').type('123');
    cy.get('[data-testid="btn-register"]').click();

    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', '8 caracteres');

    // Captura: error contraseña corta
    cy.screenshot('HU01-TC003-01_error_password_corta');
  });
});
