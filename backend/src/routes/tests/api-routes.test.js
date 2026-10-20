import express from 'express';
import request from 'supertest';
import cors from 'cors';

jest.mock('../../controllers/AdminUsuarioController.js', () => ({
  changeUserStatus: jest.fn(),
  createUser: jest.fn(),
  editUser: jest.fn(),
  getUsers: jest.fn(),
  removeUser: jest.fn()
}));
jest.mock('../../controllers/CarritoController.js', () => ({
  changeCartItem: jest.fn(),
  createCartItem: jest.fn(),
  deleteCart: jest.fn(),
  deleteCartItem: jest.fn(),
  getCart: jest.fn()
}));
jest.mock('../../controllers/CatalogoController.js', () => ({
  getCategories: jest.fn()
}));
jest.mock('../../controllers/DashboardController.js', () => ({
  getDashboard: jest.fn()
}));
jest.mock('../../controllers/FavoritoController.js', () => ({
  createFavorite: jest.fn(),
  deleteFavorite: jest.fn(),
  getFavorites: jest.fn()
}));
jest.mock('../../controllers/HealthController.js', () => ({
  getHealth: jest.fn()
}));
jest.mock('../../controllers/InventarioController.js', () => ({
  createInventoryMovement: jest.fn(),
  getInventoryHistory: jest.fn()
}));
jest.mock('../../controllers/LogisticaController.js', () => ({
  getLogistica: jest.fn()
}));
jest.mock('../../controllers/PedidoController.js', () => ({
  changeOrderStatus: jest.fn(),
  getMyOrders: jest.fn(),
  getOrders: jest.fn(),
  placeOrder: jest.fn()
}));
jest.mock('../../controllers/PedidoFlujoController.js', () => ({
  assignCourier: jest.fn(),
  assignWarehouse: jest.fn(),
  changeCourierStatus: jest.fn(),
  getAdminNovelties: jest.fn(),
  getCourierAssigned: jest.fn(),
  getCourierAvailable: jest.fn(),
  getCourierEvidence: jest.fn(),
  getWarehouseAssigned: jest.fn(),
  getWarehouseAvailable: jest.fn(),
  resolveAdminNovelty: jest.fn(),
  submitPreparation: jest.fn(),
  uploadCourierEvidence: jest.fn()
}));
jest.mock('../../controllers/ProductoController.js', () => ({
  addProduct: jest.fn(),
  editProduct: jest.fn(),
  getColors: jest.fn(),
  getProduct: jest.fn(),
  getProducts: jest.fn(),
  removeProduct: jest.fn()
}));
jest.mock('../../controllers/UsuarioController.js', () => ({
  getMyProfile: jest.fn(),
  loginUser: jest.fn(),
  registerUser: jest.fn(),
  updateMyProfilePhoto: jest.fn()
}));
jest.mock('../../middleware/autenticacion.js', () => jest.fn((_req, _res, next) => next()));
jest.mock('../../middleware/role.js', () => {
  const roleGate = jest.fn((_req, _res, next) => next());
  const permitRoles = jest.fn(() => roleGate);
  permitRoles.roleGate = roleGate;
  return { __esModule: true, default: permitRoles };
});
jest.mock('../../middleware/subidaImagen.js', () => ({
  uploadProductImage: {
    single: jest.fn(() => (_req, _res, next) => next())
  },
  uploadProfileImage: {
    single: jest.fn(() => (_req, _res, next) => next())
  },
  uploadDeliveryEvidence: {
    single: jest.fn(() => (_req, _res, next) => next())
  }
}));

import * as adminUsuarioController from '../../controllers/AdminUsuarioController.js';
import * as carritoController from '../../controllers/CarritoController.js';
import * as catalogoController from '../../controllers/CatalogoController.js';
import * as dashboardController from '../../controllers/DashboardController.js';
import * as favoritoController from '../../controllers/FavoritoController.js';
import * as healthController from '../../controllers/HealthController.js';
import * as inventarioController from '../../controllers/InventarioController.js';
import * as logisticaController from '../../controllers/LogisticaController.js';
import * as pedidoController from '../../controllers/PedidoController.js';
import * as pedidoFlujoController from '../../controllers/PedidoFlujoController.js';
import * as productoController from '../../controllers/ProductoController.js';
import * as usuarioController from '../../controllers/UsuarioController.js';
import auth from '../../middleware/autenticacion.js';
import permitRoles from '../../middleware/role.js';
import { parseCorsOrigins } from '../../config/corsOrigins.js';
import adminUsuarioRouter from '../AdminUsuarioRoute.js';
import carritoRouter from '../CarritoRoute.js';
import catalogoRouter from '../CatalogoRoute.js';
import dashboardRouter from '../DashboardRoute.js';
import favoritoRouter from '../FavoritoRoute.js';
import healthRouter from '../HealthRoute.js';
import inventarioRouter from '../InventarioRoute.js';
import logisticaRouter from '../LogisticaRoute.js';
import pedidoRouter from '../PedidoRoute.js';
import pedidoFlujoRouter from '../PedidoFlujoRoute.js';
import productoRouter from '../ProductoRoute.js';
import rootRouter from '../RootRoute.js';
import usuarioRouter from '../UsuarioRoute.js';

const controllers = {
  ...adminUsuarioController,
  ...carritoController,
  ...catalogoController,
  ...dashboardController,
  ...favoritoController,
  ...healthController,
  ...inventarioController,
  ...logisticaController,
  ...pedidoController,
  ...pedidoFlujoController,
  ...productoController,
  ...usuarioController
};
const controllerMocks = Object.values(controllers).filter(jest.isMockFunction);

const app = express();
app.use(cors({ origin: parseCorsOrigins('http://localhost:5173,http://localhost:3001') }));
app.use(express.json());

const routers = [
  adminUsuarioRouter,
  carritoRouter,
  catalogoRouter,
  dashboardRouter,
  favoritoRouter,
  healthRouter,
  inventarioRouter,
  logisticaRouter,
  pedidoRouter,
  pedidoFlujoRouter,
  productoRouter,
  rootRouter,
  usuarioRouter
];
routers.forEach((router) => {
  app.use('/api/v1', router);
  app.use('/', router);
});

const endpoints = [
  ['get', '/usuarios', 'getUsers'],
  ['post', '/usuarios', 'createUser'],
  ['put', '/usuarios/12', 'editUser'],
  ['put', '/usuarios/12/estado', 'changeUserStatus'],
  ['delete', '/usuarios/12', 'removeUser'],
  ['get', '/carrito', 'getCart'],
  ['post', '/carrito', 'createCartItem'],
  ['put', '/carrito/12', 'changeCartItem'],
  ['delete', '/carrito/12', 'deleteCartItem'],
  ['delete', '/carrito', 'deleteCart'],
  ['get', '/categorias', 'getCategories'],
  ['get', '/dashboard', 'getDashboard'],
  ['get', '/favoritos', 'getFavorites'],
  ['post', '/favoritos', 'createFavorite'],
  ['delete', '/favoritos/12', 'deleteFavorite'],
  ['get', '/health', 'getHealth'],
  ['get', '/inventario/12/historial', 'getInventoryHistory'],
  ['post', '/inventario/movimiento', 'createInventoryMovement'],
  ['get', '/logistica', 'getLogistica'],
  ['get', '/pedidos', 'getOrders'],
  ['post', '/pedidos', 'placeOrder'],
  ['put', '/pedidos/12/estado', 'changeOrderStatus'],
  ['get', '/mis-pedidos', 'getMyOrders'],
  ['get', '/bodega/pedidos/disponibles', 'getWarehouseAvailable'],
  ['get', '/bodega/pedidos/mios', 'getWarehouseAssigned'],
  ['post', '/bodega/pedidos/12/asignar', 'assignWarehouse'],
  ['put', '/bodega/pedidos/12/preparacion', 'submitPreparation'],
  ['get', '/mensajeria/pedidos/disponibles', 'getCourierAvailable'],
  ['get', '/mensajeria/mis-entregas', 'getCourierAssigned'],
  ['post', '/mensajeria/pedidos/12/asignar', 'assignCourier'],
  ['put', '/mensajeria/pedidos/12/estado', 'changeCourierStatus'],
  ['post', '/mensajeria/pedidos/12/evidencia', 'uploadCourierEvidence'],
  ['get', '/mensajeria/pedidos/12/evidencia', 'getCourierEvidence'],
  ['get', '/admin/novedades/pedidos', 'getAdminNovelties'],
  ['put', '/admin/novedades/pedidos/12/resolver', 'resolveAdminNovelty'],
  ['get', '/productos-publicos', 'getProducts'],
  ['get', '/productos-publicos/12', 'getProduct'],
  ['get', '/colores', 'getColors'],
  ['get', '/productos', 'getProducts'],
  ['get', '/productos/12', 'getProduct'],
  ['post', '/productos', 'addProduct'],
  ['put', '/productos/12', 'editProduct'],
  ['delete', '/productos/12', 'removeProduct'],
  ['post', '/registro', 'registerUser'],
  ['post', '/login', 'loginUser'],
  ['get', '/me', 'getMyProfile'],
  ['put', '/me/foto', 'updateMyProfilePhoto']
];

const configuredRolePolicies = permitRoles.mock.calls.map((roles) => [...roles]);

describe('rutas de la API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    controllerMocks.forEach((controller) => {
      controller.mockImplementation((_req, res) => res.status(200).json({ ok: true }));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('GET / devuelve el estado de la API', async () => {
    const response = await request(app).get('/');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'API de Express con MySQL lista'
    });
  });

  test.each(endpoints)('%s %s delega en %s', async (method, path, controllerName) => {
    for (const routePath of [path, `/api/v1${path}`]) {
      const call = request(app)[method](routePath);
      if (method === 'post' || method === 'put') {
        call.send({ prueba: true });
      }

      const response = await call;

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ ok: true });
    }
    expect(controllers[controllerName]).toHaveBeenCalledTimes(2);
  });

  test.each(['http://localhost:5173', 'http://localhost:3001'])(
    'permite CORS para el frontend en %s sin concatenar orígenes',
    async (origin) => {
      const response = await request(app)
        .options('/api/v1/health')
        .set('Origin', origin)
        .set('Access-Control-Request-Method', 'GET');

      expect(response.statusCode).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe(origin);
    }
  );

  test('parsea varios orígenes CORS separados por comas', () => {
    expect(parseCorsOrigins(' http://localhost:5173, http://localhost:3001 , '))
      .toEqual(['http://localhost:5173', 'http://localhost:3001']);
  });

  test('las rutas protegidas detienen la solicitud si falla la autenticación', async () => {
    auth.mockImplementationOnce((req, res) => res.status(401).json({ error: 'Token inválido' }));

    const response = await request(app).get('/carrito');

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ error: 'Token inválido' });
    expect(carritoController.getCart).not.toHaveBeenCalled();
  });

  test('las rutas de administración detienen la solicitud si falla la autorización', async () => {
    permitRoles.roleGate.mockImplementationOnce((req, res) => (
      res.status(403).json({ error: 'Acceso denegado' })
    ));

    const response = await request(app).get('/usuarios');

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({ error: 'Acceso denegado' });
    expect(adminUsuarioController.getUsers).not.toHaveBeenCalled();
  });

  test('configura los permisos declarados por cada router protegido', () => {
    expect(configuredRolePolicies).toContainEqual(['administrador', { permission: 'usuarios:read' }]);
    expect(configuredRolePolicies).toContainEqual(['administrador', { permission: 'usuarios:write' }]);
    expect(configuredRolePolicies).toContainEqual(['administrador', 'bodeguero', { permission: 'productos:read' }]);
    expect(configuredRolePolicies).toContainEqual(['administrador', 'bodeguero', { permission: 'productos:write' }]);
    expect(configuredRolePolicies).toContainEqual(['administrador', { permission: 'dashboard:read' }]);
    expect(configuredRolePolicies).toContainEqual(['administrador', 'bodeguero']);
    expect(configuredRolePolicies).toContainEqual(['administrador']);
    expect(configuredRolePolicies).toContainEqual([
      'administrador',
      'bodeguero',
      'mensajero',
      'cliente',
      { permission: 'comprar' }
    ]);
    expect(configuredRolePolicies).toContainEqual(['bodeguero']);
    expect(configuredRolePolicies).toContainEqual(['mensajero']);
    expect(configuredRolePolicies).toContainEqual(['administrador', 'bodeguero']);
  });
});
