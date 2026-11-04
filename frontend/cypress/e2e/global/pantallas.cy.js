import { mockApi, pageCases, protectedPaths, visitAsRole } from '../../support/pantallas-helpers.js';

describe('Pruebas de caja negra - pantallas de HappyKids', () => {
  beforeEach(() => {
    mockApi();
  });

  pageCases.filter(({ role }) => !role).forEach(({ path, role, text }) => {
    it(`abre ${path} y muestra su contenido principal`, () => {
      visitAsRole(path, role);

      cy.contains(text).should('be.visible');
      cy.location('pathname').should('equal', path);
    });
  });

  protectedPaths.forEach((path) => {
    it(`redirige ${path} al inicio de sesión si no hay sesión`, () => {
      visitAsRole(path, null);

      cy.location('pathname').should('equal', '/login');
      cy.contains('Inicia sesión para continuar').should('be.visible');
    });
  });

  it('redirige /admin al dashboard para usuarios administradores', () => {
    visitAsRole('/admin', 'administrador');

    cy.location('pathname').should('equal', '/admin/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });

  it('rechaza el acceso al dashboard administrativo para un cliente', () => {
    visitAsRole('/admin/dashboard', 'cliente');

    cy.location('pathname').should('equal', '/no-autorizado');
    cy.contains('Acceso denegado').should('be.visible');
  });

  it('muestra el error de validación de login antes de contactar la API', () => {
    cy.intercept('POST', '**/api/v1/login').as('login');
    visitAsRole('/login', null);
    cy.contains('button', 'Ingresar').click();

    cy.contains('Ingresa tu correo electrónico.').should('be.visible');
    cy.get('@login.all').should('have.length', 0);
  });
});
