import { mockApi, pageCases, visitAsRole } from '../../support/pantallas-helpers.js';

describe('Pruebas de caja negra - pantallas de HappyKids', () => {
  beforeEach(() => {
    mockApi();
  });

  pageCases.filter(({ role }) => role === 'cliente').forEach(({ path, role, text }) => {
    it(`abre ${path} y muestra su contenido principal`, () => {
      visitAsRole(path, role);

      cy.contains(text).should('be.visible');
      cy.location('pathname').should('equal', path);
    });
  });

  it('muestra el error de validación del registro antes de contactar la API', () => {
    cy.intercept('POST', '**/api/v1/registro').as('registro');
    visitAsRole('/registro', null);
    cy.get('form').within(() => cy.get('button[type="submit"]').click());

    cy.contains('Ingresa tu nombre de usuario.').should('be.visible');
    cy.get('@registro.all').should('have.length', 0);
  });
});
