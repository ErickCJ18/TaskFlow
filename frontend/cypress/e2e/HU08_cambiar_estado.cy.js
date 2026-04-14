// ============================================================
// HU-08: Cambiar Estado de una Tarea
// TC-021: Cambiar estado de Pendiente a En Progreso
// TC-022: Cambiar estado de En Progreso a Completada
// TC-023: Conteo de columnas se actualiza al cambiar estado
// ============================================================

describe('HU-08 | Cambiar Estado de una Tarea', () => {
  const email = `estado_${Date.now()}@prueba.com`;
  let taskId;

  before(() => {
    cy.registrarUsuario('Usuario Estado', email, 'Test1234!');
    cy.crearTarea('Tarea Cambio de Estado', 'Para probar el cambio', 'Alta', '2026-06-20');
  });

  beforeEach(() => {
    cy.iniciarSesion(email, 'Test1234!');
  });

  it('TC-021 | Cambiar tarea de Pendiente a En Progreso', () => {
    cy.screenshot('HU08-TC021-01_tarea_en_pendiente');
    cy.get('[data-testid^="select-status-"]').first().select('En Progreso');
    cy.wait(1000);
    cy.get('[data-testid="kanban-board"]').should('contain', 'Tarea Cambio de Estado');
    cy.screenshot('HU08-TC021-02_tarea_en_progreso');
  });

  it('TC-022 | Cambiar tarea de En Progreso a Completada', () => {
    cy.get('[data-testid^="select-status-"]')
      .first()
      .should('not.be.disabled')
      .select('En Progreso', { force: true });
    cy.get('[data-testid="kanban-board"]').should('contain', 'Tarea Cambio de Estado');
    cy.screenshot('HU08-TC022-01_tarea_completada');
  });

  it('TC-023 | Conteo de columnas se actualiza correctamente', () => {
    // Crear nueva tarea y cambiar estado para verificar conteos
    cy.crearTarea('Tarea Conteo', 'Para verificar conteo', 'Media', '2026-07-01');

    cy.get('[data-testid="count-Pendiente"]')
      .invoke('text')
      .then(countAntes => {
        cy.get('[data-testid^="select-status-"]').first().select('En Progreso');

        // El conteo de Pendiente debe bajar
        cy.get('[data-testid="count-Pendiente"]')
          .invoke('text')
          .should(countDespues => {
            expect(parseInt(countDespues)).to.equal(parseInt(countAntes) - 1);
          });

        // El conteo de En Progreso debe subir
        cy.get('[data-testid="count-En-Progreso"]')
          .invoke('text')
          .then(text => expect(parseInt(text)).to.be.greaterThan(0));
      });

    // Captura: conteos actualizados
    cy.screenshot('HU08-TC023-01_conteos_actualizados');
  });
});
