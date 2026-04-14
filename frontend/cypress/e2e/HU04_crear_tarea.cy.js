// ============================================================
// HU-04: Crear Nueva Tarea (CORREGIDO)
// ============================================================

describe('HU-04 | Crear Nueva Tarea', () => {
  const email = `crear_${Date.now()}@prueba.com`;

  before(() => {
    cy.registrarUsuario('Usuario Crear', email, 'Test1234!');
  });

  beforeEach(() => {
    cy.iniciarSesion(email, 'Test1234!');
  });

  it('TC-009 | Crear tarea con todos los campos correctamente', () => {
    cy.screenshot('HU04-TC009-01_dashboard_vacio');
    cy.get('[data-testid="btn-new-task"]').click();
    cy.wait(1000);
    cy.get('[data-testid="input-task-title"]').should('be.visible').type('Diseñar wireframes del dashboard');
    cy.get('[data-testid="input-task-description"]').type('Crear los mockups de las pantallas principales');
    cy.get('[data-testid="select-priority"]').select('Alta');
    cy.get('[data-testid="input-due-date"]').type('2026-06-30');
    cy.screenshot('HU04-TC009-03_formulario_tarea_completo');
    cy.get('[data-testid="btn-save-task"]').click();
    cy.get('[data-testid="task-modal"]').should('not.exist');
    cy.get('[data-testid="kanban-board"]').should('contain', 'Diseñar wireframes del dashboard');
    cy.screenshot('HU04-TC009-04_tarea_creada_en_tablero');
  });

  it('TC-010 | Error al intentar crear tarea sin título', () => {
    cy.url().should('include', '/dashboard');

    // Abrir modal correctamente
    cy.get('[data-testid="btn-new-task"]').click();

    // Intentar guardar sin título
    cy.get('[data-testid="btn-save-task"]').click();

    // Validación: el modal sigue abierto (no se creó tarea)
    cy.get('[data-testid="btn-save-task"]').should('be.visible');
  });

  it('TC-011 | Tarea nueva aparece en columna Pendiente', () => {
    cy.crearTarea('Tarea columna Pendiente', 'Para verificar columna', 'Media', '2026-07-01');

    cy.get('[data-testid="column-Pendiente"]')
      .should('contain', 'Tarea columna Pendiente');

    cy.get('[data-testid="count-Pendiente"]')
      .invoke('text')
      .then(text => expect(parseInt(text)).to.be.greaterThan(0));

    cy.screenshot('HU04-TC011-01_tarea_en_columna_pendiente');
  });
});