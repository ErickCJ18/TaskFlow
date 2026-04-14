// ============================================================
// HU-09: Filtrar Tareas por Estado
// TC-024: Filtrar por Pendiente muestra solo pendientes
// TC-025: Filtrar por Completada muestra solo completadas
// TC-026: Seleccionar "Todas" restaura la vista completa
// ============================================================

describe('HU-09 | Filtrar Tareas por Estado', () => {
  const email = `filtrar_${Date.now()}@prueba.com`;

  before(() => {
    cy.registrarUsuario('Usuario Filtrar', email, 'Test1234!');
    // Crear tareas en distintos estados
    cy.crearTarea('Tarea Pendiente A', 'Estado pendiente', 'Alta', '2026-06-01');
    cy.crearTarea('Tarea Pendiente B', 'Estado pendiente', 'Media', '2026-06-05');
    cy.crearTarea('Tarea Para Completar', 'Se moverá a completada', 'Baja', '2026-06-10');
    // Cambiar estado de la última tarea a Completada
    cy.get('[data-testid^="select-status-"]').last().select('Completada');
  });

  beforeEach(() => {
    cy.iniciarSesion(email, 'Test1234!');
  });

  it('TC-024 | Filtrar por Pendiente muestra solo tareas pendientes', () => {
    cy.get('[data-testid="select-filter-status"]').select('Pendiente');

    // Esperar a que termine el fetch (por debounce)
    cy.wait(500);

    // Verificar que la columna Pendiente existe
    cy.get('[data-testid="column-Pendiente"]').should('be.visible');

    // Verificar que otras columnas no tienen tareas visibles
    cy.get('[data-testid="column-Completada"]').should('contain', 'Sin tareas');
    cy.get('[data-testid="column-En-Progreso"]').should('contain', 'Sin tareas');
  });

  it('TC-025 | Filtrar por Completada muestra solo tareas completadas', () => {
    cy.get('[data-testid="select-filter-status"]').select('Completada');

    cy.wait(500);

    cy.get('[data-testid="column-Completada"]').should('be.visible');

    cy.get('[data-testid="column-Pendiente"]').should('contain', 'Sin tareas');
    cy.get('[data-testid="column-En-Progreso"]').should('contain', 'Sin tareas');
  });

  it('TC-026 | Seleccionar "Todas" restaura la vista completa', () => {
    // Aplicar filtro primero
    cy.get('[data-testid="select-filter-status"]').select('Completada');

    // Restaurar a Todas
    cy.get('[data-testid="select-filter-status"]').select('');

    // Todas las tareas deben estar visibles nuevamente
    cy.get('[data-testid="kanban-board"]')
      .should('contain', 'Tarea Pendiente A')
      .and('contain', 'Tarea Para Completar');

    // Captura: vista completa restaurada
    cy.screenshot('HU09-TC026-01_vista_completa_restaurada');
  });
});
