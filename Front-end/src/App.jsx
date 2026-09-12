import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Vistas de Cliente (SIN .jsx al final)
import Index from './pages/publicas/Index';
import Catalogo from './pages/cliente/page-catalogo';
import Carrito from './pages/cliente/page-Carrito';
import ConfirmarCompra from './pages/cliente/page-ConfirmarCompra';
import DetalleProducto from './pages/cliente/page-DetalleProducto';
import Favoritos from './pages/cliente/page-Favoritos';
import MisPedidos from './pages/cliente/page-MisPedidosBD';
import RecuperarPass from './pages/cliente/page-RecuperarPass';
import Mensajeria from './pages/mensajeria/page-Mensajeria';
import EntregasMensajeria from './pages/mensajeria/page-EntregasMensajeria';
import RutaMensajeria from './pages/mensajeria/page-RutaMensajeria';
import EvidenciasMensajeria from './pages/mensajeria/page-EvidenciasMensajeria';
import NovedadesMensajeria from './pages/mensajeria/page-NovedadesMensajeria';
import HistorialMensajeria from './pages/mensajeria/page-HistorialMensajeria';
import PerfilMensajeria from './pages/mensajeria/page-PerfilMensajeria';

// Vistas de Autenticación (SIN .jsx al final)
import Login from './pages/publicas/InicioSesion';
import Registro from './pages/publicas/Registro';


// Vistas de Admin (SIN .jsx al final)
import Dashboard from './pages/administracion/page-Dashboard';
import Pedidos from './pages/administracion/page-PedidosBD';
import Inventario from './pages/administracion/page-producto';
import AgregarProducto from './pages/administracion/page-AgregarProducto';
import EditarProducto from './pages/administracion/page-EditarProducto';
import Usuarios from './pages/administracion/page-UsuariosBD';
import CrearUsuario from './pages/administracion/page-CrearUsuario';
import EditarUsuario from './pages/administracion/page-EditarUsuario';
import BodegueroLayout from './pages/bodeguero/BodegueroLayout';
import BodegueroDashboard from './pages/bodeguero/BodegueroDashboard';
import BodegueroInventario from './pages/bodeguero/BodegueroInventario';
import BodegueroPedidos from './pages/bodeguero/BodegueroPedidos';
import BodegueroMovimientos from './pages/bodeguero/BodegueroMovimientos';

// Componentes globales
import Nav from './components/Nav';
import ProtectedRoute from './components/ProtectedRoute';
import NoAutorizado from './components/NoAutorizado';

function EntradaPrincipal() {
  const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
  const userJson = storage.getItem('user') || storage.getItem('usuario');
  let redirectPath = '';

  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      const roles = Array.isArray(user.roles) ? user.roles : user.rol ? [user.rol] : [];
      const esMensajero = roles.some((role) => String(role).trim().toLowerCase() === 'mensajero');
      const esBodeguero = roles.some((role) => String(role).trim().toLowerCase() === 'bodeguero');

      if (esMensajero) redirectPath = '/mensajeria';
      if (esBodeguero) redirectPath = '/bodeguero';
    } catch {
      // La portada sigue disponible si los datos de sesión no son válidos.
    }
  }

  if (redirectPath) return <Navigate to={redirectPath} replace />;
  return <Index />;
}

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>


        {/* Rutas Cliente */}
        <Route path="/" element={<EntradaPrincipal />} />
        <Route path="/cliente/catalogo" element={<ProtectedRoute allowedRoles={["cliente", "administrador", "bodeguero", "mensajero"]}><Catalogo /></ProtectedRoute>} />
        <Route path="/catalogo" element={<ProtectedRoute allowedRoles={["cliente", "administrador", "bodeguero", "mensajero"]}><Catalogo /></ProtectedRoute>} />
        <Route path="/producto/:id" element={<ProtectedRoute allowedRoles={["cliente", "administrador", "bodeguero", "mensajero"]}><DetalleProducto /></ProtectedRoute>} />
        <Route path="/carrito" element={<ProtectedRoute allowedRoles={["cliente", "administrador", "bodeguero", "mensajero"]}><Carrito /></ProtectedRoute>} />
        <Route path="/confirmar-compra" element={<ProtectedRoute allowedRoles={["cliente", "administrador", "bodeguero", "mensajero"]}><ConfirmarCompra /></ProtectedRoute>} />
        <Route path="/favoritos" element={<ProtectedRoute allowedRoles={["cliente", "administrador", "bodeguero", "mensajero"]}><Favoritos /></ProtectedRoute>} />
        <Route path="/mis-pedidos" element={<ProtectedRoute allowedRoles={["cliente", "administrador", "bodeguero", "mensajero"]}><MisPedidos /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-pass" element={<RecuperarPass />} />

        {/* Ruta protegida para usuarios mensajeros */}
        <Route
          path="/mensajeria"
          element={
            <ProtectedRoute allowedRoles={["mensajero"]}>
              <Mensajeria />
            </ProtectedRoute>
          }
        />
        <Route path="/mensajeria/entregas" element={<ProtectedRoute allowedRoles={['mensajero']}><EntregasMensajeria /></ProtectedRoute>} />
        <Route path="/mensajeria/ruta" element={<ProtectedRoute allowedRoles={['mensajero']}><RutaMensajeria /></ProtectedRoute>} />
        <Route path="/mensajeria/evidencias" element={<ProtectedRoute allowedRoles={['mensajero']}><EvidenciasMensajeria /></ProtectedRoute>} />
        <Route path="/mensajeria/novedades" element={<ProtectedRoute allowedRoles={['mensajero']}><NovedadesMensajeria /></ProtectedRoute>} />
        <Route path="/mensajeria/historial" element={<ProtectedRoute allowedRoles={['mensajero']}><HistorialMensajeria /></ProtectedRoute>} />
        <Route path="/mensajeria/perfil" element={<ProtectedRoute allowedRoles={['mensajero']}><PerfilMensajeria /></ProtectedRoute>} />

        {/* Página para cuando el usuario no tiene permisos */}
        <Route path="/no-autorizado" element={<NoAutorizado />} />

        {/* Rutas Admin protegidas por role 'administrador' */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["administrador"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventario"
          element={
            <ProtectedRoute allowedRoles={["administrador"]}>
              <Inventario />
            </ProtectedRoute>
          }
        />
        <Route path="/bodeguero" element={<ProtectedRoute allowedRoles={["bodeguero"]}><BodegueroLayout><BodegueroDashboard /></BodegueroLayout></ProtectedRoute>} />
        <Route path="/bodeguero/inventario" element={<ProtectedRoute allowedRoles={["bodeguero"]}><BodegueroLayout><BodegueroInventario /></BodegueroLayout></ProtectedRoute>} />
        <Route path="/bodeguero/pedidos" element={<ProtectedRoute allowedRoles={["bodeguero"]}><BodegueroLayout><BodegueroPedidos /></BodegueroLayout></ProtectedRoute>} />
        <Route path="/bodeguero/movimientos" element={<ProtectedRoute allowedRoles={["bodeguero"]}><BodegueroLayout><BodegueroMovimientos /></BodegueroLayout></ProtectedRoute>} />
        <Route
          path="/bodega"
          element={
            <ProtectedRoute allowedRoles={["administrador"]}>
              <Inventario />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pedidos"
          element={
            <ProtectedRoute allowedRoles={["administrador"]}>
              <Pedidos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/agregar-producto"
          element={
            <ProtectedRoute allowedRoles={["administrador"]}>
              <AgregarProducto />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/editar-producto/:id"
          element={
            <ProtectedRoute allowedRoles={["administrador"]}>
              <EditarProducto />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute allowedRoles={["administrador"]}>
              <Usuarios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/crear-usuario"
          element={
            <ProtectedRoute allowedRoles={["administrador"]}>
              <CrearUsuario />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/editar-usuario/:id"
          element={
            <ProtectedRoute allowedRoles={["administrador"]}>
              <EditarUsuario />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;