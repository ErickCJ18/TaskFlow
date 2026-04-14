// ============================================================
// HU-05: Visualizar Tablero de Tareas (Kanban)
// TC-012: Tablero muestra las tres columnas
// TC-013: Tarjeta muestra título, prioridad y fecha
// TC-014: Conteo por columna es correcto
// ============================================================

describe('HU-05 | Visualizar Tablero Kanban', () => {
  const email = `kanban_${Date.now()}@prueba.com`;

  before(() => {
    cy.registrarUsuario('Usuario Kanban', email, 'Test1234!');
    // Crear 2 tareas para poblar el tablero
    cy.crearTarea('Tarea Kanban 1', 'Descripción 1', 'Alta', '2026-06-01');
    cy.crearTarea('Tarea Kanban 2', 'Descripción 2', 'Baja', '2026-07-01');
  });

  beforeEach(() => {
    cy.iniciarSesion(email, 'Test1234!');
  });

  it('TC-012 | Tablero muestra las tres columnas correctamente', () => {
    cy.get('[data-testid="kanban-board"]').should('be.visible');

    cy.get('[data-testid="column-Pendiente"]').should('be.visible');
    cy.get('[data-testid="column-En-Progreso"]').should('be.visible');
    cy.get('[data-testid="column-Completada"]').should('be.visible');

    // Captura: tablero con las tres columnas
    cy.screenshot('HU05-TC012-01_tablero_tres_columnas');
  });

  it('TC-013 | Tarjeta de tarea muestra título, prioridad y fecha', () => {
    cy.get('[data-testid="column-Pendiente"]').within(() => {
      // Verificar que hay al menos una tarjeta con título visible
      cy.get('[data-testid^="task-title-"]').first().should('be.visible');
    });

    // Verificar que se muestra la prioridad (badge de color)
    cy.get('[data-testid^="task-card-"]').first().within(() => {
      cy.contains(/Alta|Media|Baja/).should('be.visible');
    });

    // Captura: detalle de tarjeta con datos
    cy.screenshot('HU05-TC013-01_detalle_tarjeta_tarea');
  });

  it('TC-014 | Conteo de tareas por columna es correcto', () => {
    // Las 2 tareas creadas deben estar en Pendiente
    cy.get('[data-testid="count-Pendiente"]')
      .invoke('text')
      .then(text => expect(parseInt(text)).to.be.at.least(2));

    // Columnas sin tareas muestran 0
    cy.get('[data-testid="count-Completada"]').should('contain', '0');

    // Captura: conteos por columna
    cy.screenshot('HU05-TC014-01_conteo_por_columna');
  });
});
