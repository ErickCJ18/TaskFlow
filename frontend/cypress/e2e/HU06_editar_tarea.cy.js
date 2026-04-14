// ============================================================
// HU-06: Editar Tarea Existente
// TC-015: Abrir modal de edición con datos actuales
// TC-016: Guardar cambios y verificar en tablero
// TC-017: Cancelar edición no modifica la tarea
// ============================================================

describe('HU-06 | Editar Tarea Existente', () => {
  const email = `editar_${Date.now()}@prueba.com`;

  before(() => {
    cy.registrarUsuario('Usuario Editar', email, 'Test1234!');
    cy.crearTarea('Tarea Para Editar', 'Descripción original', 'Baja', '2026-06-15');
  });

  beforeEach(() => {
    cy.iniciarSesion(email, 'Test1234!');
  });

  it('TC-015 | Modal de edición abre con los datos actuales de la tarea', () => {
    // Click en el primer botón de editar disponible
    cy.get('[data-testid^="btn-edit-"]').first().click();

    cy.get('[data-testid="task-modal"]').should('be.visible');

    // Verificar que el título ya está cargado en el input
    cy.get('[data-testid="input-task-title"]')
      .should('have.value', 'Tarea Para Editar');

    // Captura: modal de edición con datos precargados
    cy.screenshot('HU06-TC015-01_modal_edicion_datos_precargados');
  });

  it('TC-016 | Guardar cambios actualiza la tarea en el tablero', () => {
    cy.get('[data-testid^="btn-edit-"]').first().click();
    cy.get('[data-testid="task-modal"]').should('be.visible');

    // Modificar el título
    cy.get('[data-testid="input-task-title"]').clear().type('Tarea Editada Correctamente');
    cy.get('[data-testid="select-priority"]').select('Alta');

    // Captura: formulario con cambios listos para guardar
    cy.screenshot('HU06-TC016-01_formulario_con_cambios');

    cy.get('[data-testid="btn-save-task"]').click();

    // Modal debe cerrarse
    cy.get('[data-testid="task-modal"]').should('not.exist');

    // El nuevo título debe aparecer en el tablero
    cy.get('[data-testid="kanban-board"]')
      .should('contain', 'Tarea Editada Correctamente');

    // Captura: tablero con la tarea actualizada
    cy.screenshot('HU06-TC016-02_tarea_actualizada_en_tablero');
  });

  it('TC-017 | Cancelar edición no modifica la tarea', () => {
    cy.get('[data-testid^="btn-edit-"]').first().click();
    cy.get('[data-testid="task-modal"]').should('be.visible');

    // Modificar algo pero luego cancelar
    cy.get('[data-testid="input-task-title"]').clear().type('Cambio que no se guarda');

    cy.get('[data-testid="btn-close-modal"]').click();

    // Modal cerrado
    cy.get('[data-testid="task-modal"]').should('not.exist');

    // El cambio NO debe verse en el tablero
    cy.get('[data-testid="kanban-board"]')
      .should('not.contain', 'Cambio que no se guarda');

    // Captura: tablero sin cambios tras cancelar
    cy.screenshot('HU06-TC017-01_cancelar_no_modifica');
  });
});
