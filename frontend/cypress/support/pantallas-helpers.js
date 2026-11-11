const product = {
  id: 1,
  nombre: 'Sudadera Cypress',
  precio: 45000,
  precioVenta: 45000,
  descripcion: 'Prenda de prueba para el catálogo.',
  stock: 8,
  talla: '8',
  color: 'Azul',
  imagen_producto: ''
};

export const pageCases = [
  { path: '/', role: null, text: 'Bienvenido a HappyKids' },
  { path: '/login', role: null, text: 'Ingresa a tu cuenta para continuar.' },
  { path: '/registro', role: null, text: 'Crea tu cuenta' },
  { path: '/recuperar-pass', role: null, text: 'Recuperar contraseña' },
  { path: '/no-autorizado', role: null, text: 'Acceso denegado' },
  { path: '/cliente/catalogo', role: 'cliente', text: 'Sudadera Cypress' },
  { path: '/catalogo', role: 'cliente', text: 'Sudadera Cypress' },
  { path: '/producto/1', role: 'cliente', text: 'Sudadera Cypress' },
  { path: '/carrito', role: 'cliente', text: 'Mi carrito' },
  { path: '/confirmar-compra', role: 'cliente', text: 'Confirmar compra' },
  { path: '/favoritos', role: 'cliente', text: 'No tienes productos en favoritos.' },
  { path: '/mis-pedidos', role: 'cliente', text: 'Historial de compras' },
  { path: '/perfil', role: 'cliente', text: 'Actualizar perfil' },
  { path: '/admin/dashboard', role: 'administrador', text: 'Dashboard' },
  { path: '/admin/inventario', role: 'administrador', text: 'Inventario' },
  { path: '/bodega', role: 'administrador', text: 'Inventario' },
  { path: '/admin/pedidos', role: 'administrador', text: 'Pedidos reales registrados en la base de datos' },
  { path: '/admin/agregar-producto', role: 'administrador', text: 'Agregar producto' },
  { path: '/admin/editar-producto/1', role: 'administrador', text: 'Editar producto' },
  { path: '/admin/usuarios', role: 'administrador', text: 'Todos los usuarios' },
  { path: '/admin/crear-usuario', role: 'administrador', text: 'Crear usuario' },
  { path: '/admin/editar-usuario/1', role: 'administrador', text: 'Editar usuario' },
  { path: '/bodeguero', role: 'bodeguero', text: 'Mi actividad reciente' },
  { path: '/bodeguero/inventario', role: 'bodeguero', text: 'Inventario disponible' },
  { path: '/bodeguero/pedidos', role: 'bodeguero', text: 'Pedidos disponibles' },
  { path: '/bodeguero/movimientos', role: 'bodeguero', text: 'Mi historial de actividad' },
  { path: '/mensajeria', role: 'mensajero', text: 'Pedidos listos para despacho' },
  { path: '/mensajeria/entregas', role: 'mensajero', text: 'Mis entregas' },
  { path: '/mensajeria/ruta', role: 'mensajero', text: 'Ruta / Mapa' },
  { path: '/mensajeria/evidencias', role: 'mensajero', text: 'Evidencias' },
  { path: '/mensajeria/novedades', role: 'mensajero', text: 'Novedades' },
  { path: '/mensajeria/historial', role: 'mensajero', text: 'Historial' },
  { path: '/mensajeria/perfil', role: 'mensajero', text: 'Mi perfil' }
];

export const protectedPaths = pageCases
  .filter(({ path, role }) => role && !['/cliente/catalogo', '/catalogo', '/producto/1'].includes(path))
  .map(({ path }) => path);

export const mockApi = () => {
  cy.intercept('**/api/v1/**', (request) => {
    const { pathname } = new URL(request.url);
    let body = {};

    if (pathname.endsWith('/categorias')) {
      body = { success: true, categories: [{ id_categoria: 4, nombre: 'Ropa infantil' }] };
    } else if (pathname.endsWith('/tipos-documento')) {
      body = {
        success: true,
        documentTypes: [{ id: 1, nombre: 'Cédula', sigla: 'CC' }]
      };
    } else if (pathname.endsWith('/productos-publicos')) {
      body = { success: true, products: [product] };
    } else if (/\/productos-publicos\/\d+$/.test(pathname) || /\/productos\/\d+$/.test(pathname)) {
      body = { success: true, product };
    } else if (pathname.endsWith('/productos')) {
      body = { success: true, products: [product] };
    } else if (pathname.endsWith('/carrito')) {
      body = { success: true, cart: [product] };
    } else if (pathname.endsWith('/favoritos')) {
      body = { success: true, favorites: [] };
    } else if (pathname.endsWith('/mis-pedidos') || pathname.endsWith('/pedidos')) {
      body = { success: true, orders: [] };
    } else if (pathname.endsWith('/dashboard')) {
      body = {
        success: true,
        stats: {},
        recentOrders: [],
        lowStock: []
      };
    } else if (pathname.endsWith('/logistica')) {
      body = { success: true, summary: {}, tasks: [] };
    } else if (/\/inventario\/\d+\/historial$/.test(pathname)) {
      body = { success: true, movements: [] };
    } else if (pathname.endsWith('/usuarios')) {
      body = { success: true, users: [] };
    } else if (pathname.endsWith('/colores')) {
      body = { success: true, colors: [] };
    } else if (pathname.endsWith('/me')) {
      body = {
        success: true,
        user: {
          id: 7,
          nombre: 'Usuario de prueba',
          email: 'cypress@example.test',
          telefono: '',
          direccion: '',
          fotoPerfil: ''
        }
      };
    }

    request.reply({ statusCode: 200, body });
  }).as('api');
};

export const visitAsRole = (path, role) => {
  cy.visit(path, {
    onBeforeLoad(window) {
      window.localStorage.clear();
      window.sessionStorage.clear();
      if (role) {
        window.localStorage.setItem('token', 'token-cypress');
        window.localStorage.setItem('user', JSON.stringify({
          id: 7,
          correo: 'cypress@example.test',
          roles: [role]
        }));
      }
    }
  });
};
