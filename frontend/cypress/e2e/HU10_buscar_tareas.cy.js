// ============================================================
// HU-10: Buscar Tareas por Título
// TC-027: Búsqueda en tiempo real filtra tareas por título
// TC-028: Búsqueda sin resultados muestra mensaje vacío
// TC-029: Borrar búsqueda restaura todas las tareas
// ============================================================

describe('HU-10 | Buscar Tareas por Título', () => {
  const email = `buscar_${Date.now()}@prueba.com`;

  before(() => {
    cy.registrarUsuario('Usuario Buscar', email, 'Test1234!');
    cy.crearTarea('Implementar autenticación JWT', 'Backend auth', 'Alta', '2026-06-01');
    cy.crearTarea('Diseñar pantalla de login', 'UI design', 'Media', '2026-06-10');
    cy.crearTarea('Configurar base de datos', 'SQL Server setup', 'Alta', '2026-06-15');
  });

  beforeEach(() => {
    cy.iniciarSesion(email, 'Test1234!');
  });

  it('TC-027 | Búsqueda en tiempo real filtra tareas por título', () => {
    // Captura: tablero con todas las tareas
    cy.screenshot('HU10-TC027-01_tablero_completo_antes_busqueda');

    cy.get('[data-testid="input-search"]').type('autenticación');

    // Esperar debounce
    cy.wait(400);

    // Solo la tarea que contiene "autenticación" debe aparecer
    cy.get('[data-testid="kanban-board"]')
      .should('contain', 'Implementar autenticación JWT')
      .and('not.contain', 'Diseñar pantalla de login')
      .and('not.contain', 'Configurar base de datos');

    // Captura: resultado de búsqueda
    cy.screenshot('HU10-TC027-02_resultado_busqueda_autenticacion');
  });

  it('TC-028 | Búsqueda sin resultados muestra columnas vacías', () => {
    cy.get('[data-testid="input-search"]').type('xyzterminoquenoexiste');

    cy.wait(400);

    // Todas las columnas deben mostrar mensaje de vacío
    cy.get('[data-testid^="empty-"]').should('have.length.at.least', 1);

    // Captura: búsqueda sin resultados
    cy.screenshot('HU10-TC028-01_busqueda_sin_resultados');
  });

  it('TC-029 | Borrar búsqueda restaura todas las tareas', () => {
    cy.get('[data-testid="input-search"]').type('autenticación');
    cy.wait(400);

    // Ahora borrar
    cy.get('[data-testid="input-search"]').clear();
    cy.wait(400);

    // Todas las tareas deben volver
    cy.get('[data-testid="kanban-board"]')
      .should('contain', 'Implementar autenticación JWT')
      .and('contain', 'Diseñar pantalla de login')
      .and('contain', 'Configurar base de datos');

    // Captura: todas las tareas restauradas
    cy.screenshot('HU10-TC029-01_tareas_restauradas_tras_borrar_busqueda');
  });
});
