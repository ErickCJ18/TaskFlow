// Comando reutilizable: registrar un usuario de prueba
Cypress.Commands.add('registrarUsuario', (name, email, password) => {
  cy.visit('/register');
  cy.get('[data-testid="input-name"]').clear().type(name);
  cy.get('[data-testid="input-email"]').clear().type(email);
  cy.get('[data-testid="input-password"]').clear().type(password);
  cy.get('[data-testid="btn-register"]').click();
  cy.url().should('include', '/dashboard');
});

// Comando reutilizable: iniciar sesión
Cypress.Commands.add('iniciarSesion', (email, password) => {
  cy.visit('/login');
  cy.get('[data-testid="input-email"]').clear().type(email);
  cy.get('[data-testid="input-password"]').clear().type(password);
  cy.get('[data-testid="btn-login"]').click();
  cy.url().should('include', '/dashboard');
});

// Comando reutilizable: crear tarea desde el dashboard
Cypress.Commands.add('crearTarea', (titulo, descripcion, prioridad, fecha) => {
  cy.get('[data-testid="btn-new-task"]').click();
  cy.get('[data-testid="task-modal"]').should('be.visible');
  cy.get('[data-testid="input-task-title"]').clear().type(titulo);
  if (descripcion) cy.get('[data-testid="input-task-description"]').clear().type(descripcion);
  if (prioridad) cy.get('[data-testid="select-priority"]').select(prioridad);
  if (fecha) cy.get('[data-testid="input-due-date"]').type(fecha);
  cy.get('[data-testid="btn-save-task"]').click();
  cy.get('[data-testid="task-modal"]').should('not.exist');
});

// Declaraciones TypeScript para los comandos personalizados
