describe('Pruebas de caja negra - categorías', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/v1/categorias', {
      statusCode: 200,
      body: {
        success: true,
        categories: [{ id_categoria: 4, nombre: 'Ropa infantil' }]
      }
    }).as('categorias');

    cy.intercept('GET', '**/api/v1/productos-publicos', {
      statusCode: 200,
      body: { success: true, products: [] }
    }).as('productos');

    cy.visit('/', {
      onBeforeLoad(window) {
        window.localStorage.setItem('token', 'token-de-prueba');
        window.localStorage.setItem('user', JSON.stringify({
          id: 7,
          roles: ['cliente']
        }));
      }
    });
    cy.wait('@categorias');
  });

  it('muestra las categorías disponibles en el menú del catálogo', () => {
    cy.get('.catalogo-nav-link').click();
    cy.contains('.catalogo-option', 'Ropa infantil').should('be.visible');
  });

  it('abre el catálogo al seleccionar una categoría', () => {
    cy.get('.catalogo-nav-link').click();
    cy.contains('.catalogo-option', 'Ropa infantil').click();

    cy.location('pathname').should('equal', '/catalogo');
    cy.location('search').should('equal', '?categoria=4');
    cy.wait('@productos');
    cy.contains('No hay productos disponibles.').should('be.visible');
  });
});
