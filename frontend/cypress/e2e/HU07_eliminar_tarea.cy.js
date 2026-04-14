// ============================================================
// HU-07: Eliminar Tarea
// TC-018: Clic en eliminar muestra diálogo de confirmación
// TC-019: Confirmar eliminación borra la tarea del tablero
// TC-020: Cancelar eliminación mantiene la tarea
// ============================================================

describe('HU-07 | Eliminar Tarea', () => {
  const email = `eliminar_${Date.now()}@prueba.com`;

  before(() => {
    cy.registrarUsuario('Usuario Eliminar', email, 'Test1234!');
    cy.crearTarea('Tarea A Eliminar', 'Esta tarea será borrada', 'Media', '2026-06-10');
    cy.crearTarea('Tarea A Conservar', 'Esta tarea NO será borrada', 'Baja', '2026-07-10');
  });

  beforeEach(() => {
    cy.iniciarSesion(email, 'Test1234!');
  });

  it('TC-018 | Clic en eliminar muestra diálogo de confirmación', () => {
    cy.get('[data-testid^="btn-delete-"]').first().click();

    cy.get('[data-testid="delete-confirm-dialog"]').should('be.visible');
    cy.get('[data-testid="btn-confirm-delete"]').should('be.visible');
    cy.get('[data-testid="btn-cancel-delete"]').should('be.visible');

    // Captura: diálogo de confirmación de eliminación
    cy.screenshot('HU07-TC018-01_dialogo_confirmacion_eliminar');

    // Cancelar para no eliminar en este test
    cy.get('[data-testid="btn-cancel-delete"]').click();
  });

  it('TC-019 | Confirmar eliminación borra la tarea del tablero', () => {
    // Obtener el título de la primera tarea antes de eliminar
    cy.get('[data-testid^="task-title-"]').first()
      .invoke('text')
      .then(titulo => {
        cy.get('[data-testid^="btn-delete-"]').first().click();
        cy.get('[data-testid="delete-confirm-dialog"]').should('be.visible');

        // Captura: justo antes de confirmar
        cy.screenshot('HU07-TC019-01_antes_de_confirmar_eliminacion');

        cy.get('[data-testid="btn-confirm-delete"]').click();

        // Diálogo cerrado
        cy.get('[data-testid="delete-confirm-dialog"]').should('not.exist');

        // Verificar que la tarea ya no existe en el tablero
        cy.get('[data-testid="kanban-board"]').should('not.contain', titulo);

        // Captura: tablero sin la tarea eliminada
        cy.screenshot('HU07-TC019-02_tarea_eliminada_del_tablero');
      });
  });

  it('TC-020 | Cancelar eliminación mantiene la tarea en el tablero', () => {
    cy.get('[data-testid^="task-title-"]').first()
      .invoke('text')
      .then(titulo => {
        cy.get('[data-testid^="btn-delete-"]').first().click();
        cy.get('[data-testid="delete-confirm-dialog"]').should('be.visible');

        cy.get('[data-testid="btn-cancel-delete"]').click();

        // La tarea debe seguir estando
        cy.get('[data-testid="kanban-board"]').should('contain', titulo);

        // Captura: tarea conservada tras cancelar
        cy.screenshot('HU07-TC020-01_tarea_conservada_tras_cancelar');
      });
  });
});
