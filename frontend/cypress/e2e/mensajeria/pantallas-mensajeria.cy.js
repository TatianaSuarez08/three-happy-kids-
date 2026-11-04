import { mockApi, pageCases, visitAsRole } from '../../support/pantallas-helpers.js';

describe('Pruebas de caja negra - pantallas de HappyKids', () => {
  beforeEach(() => {
    mockApi();
  });

  pageCases.filter(({ role }) => role === 'mensajero').forEach(({ path, role, text }) => {
    it(`abre ${path} y muestra su contenido principal`, () => {
      visitAsRole(path, role);

      cy.contains(text).should('be.visible');
      cy.location('pathname').should('equal', path);
    });
  });
});
