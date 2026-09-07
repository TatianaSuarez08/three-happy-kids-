import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Vistas de Cliente (SIN .jsx al final)
import Index from './Index';
import Catalogo from './cliente/page-catalogo';
import Carrito from './cliente/page-Carrito';
import ConfirmarCompra from './cliente/page-ConfirmarCompra';
import DetalleProducto from './cliente/page-DetalleProducto';
import Favoritos from './cliente/page-Favoritos';
import MisPedidos from './cliente/page-MisPedidosBD';
import RecuperarPass from './cliente/page-RecuperarPass';
import Mensajeria from './mensajeria/page-Mensajeria';
import EntregasMensajeria from './mensajeria/page-EntregasMensajeria';
import RutaMensajeria from './mensajeria/page-RutaMensajeria';
import DetalleEntregaMensajeria from './mensajeria/page-DetalleEntregaMensajeria';
import EvidenciasMensajeria from './mensajeria/page-EvidenciasMensajeria';
import NovedadesMensajeria from './mensajeria/page-NovedadesMensajeria';
import AgendaMensajeria from './mensajeria/page-AgendaMensajeria';
import PagosMensajeria from './mensajeria/page-PagosMensajeria';
import HistorialMensajeria from './mensajeria/page-HistorialMensajeria';
import NotificacionesMensajeria from './mensajeria/page-NotificacionesMensajeria';
import PerfilMensajeria from './mensajeria/page-PerfilMensajeria';
import ConfiguracionMensajeria from './mensajeria/page-ConfiguracionMensajeria';

// Vistas de Autenticación (SIN .jsx al final)
import Login from './InicioSesion';
import Registro from './Registro';


// Vistas de Admin (SIN .jsx al final)
import Dashboard from './admin/page-Dashboard';
import Pedidos from './admin/page-PedidosBD';
import Inventario from './admin/page-producto';
import AgregarProducto from './admin/page-AgregarProducto';
import EditarProducto from './admin/page-EditarProducto';
import Usuarios from './admin/page-UsuariosBD';
import CrearUsuario from './admin/page-CrearUsuario';
import EditarUsuario from './admin/page-EditarUsuario';

// Componentes globales
import Nav from './Componentes/Nav';
import ProtectedRoute from './Componentes/ProtectedRoute';
import NoAutorizado from './Componentes/NoAutorizado';

function EntradaPrincipal() {
  const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
  const userJson = storage.getItem('user') || storage.getItem('usuario');

  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      const roles = Array.isArray(user.roles) ? user.roles : user.rol ? [user.rol] : [];
      const esMensajero = roles.some((role) => String(role).trim().toLowerCase() === 'mensajero');

      if (esMensajero) return <Navigate to="/mensajeria" replace />;
    } catch {
      // La portada sigue disponible si los datos de sesión no son válidos.
    }
  }

  return <Index />;
}

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>


        {/* Rutas Cliente */}
        <Route path="/" element={<EntradaPrincipal />} />
        <Route path="/cliente/catalogo" element={<ProtectedRoute allowedRoles={["cliente", "mensajero"]}><Catalogo /></ProtectedRoute>} />
        <Route path="/catalogo" element={<ProtectedRoute allowedRoles={["cliente", "mensajero"]}><Catalogo /></ProtectedRoute>} />
        <Route path="/producto/:id" element={<ProtectedRoute allowedRoles={["cliente", "mensajero"]}><DetalleProducto /></ProtectedRoute>} />
        <Route path="/carrito" element={<ProtectedRoute allowedRoles={["cliente"]}><Carrito /></ProtectedRoute>} />
        <Route path="/confirmar-compra" element={<ProtectedRoute allowedRoles={["cliente"]}><ConfirmarCompra /></ProtectedRoute>} />
        <Route path="/favoritos" element={<ProtectedRoute allowedRoles={["cliente"]}><Favoritos /></ProtectedRoute>} />
        <Route path="/mis-pedidos" element={<ProtectedRoute allowedRoles={["cliente"]}><MisPedidos /></ProtectedRoute>} />
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
        {[
          ["entregas", EntregasMensajeria], ["ruta", RutaMensajeria], ["detalle", DetalleEntregaMensajeria],
          ["evidencias", EvidenciasMensajeria], ["novedades", NovedadesMensajeria], ["agenda", AgendaMensajeria],
          ["pagos", PagosMensajeria], ["historial", HistorialMensajeria], ["notificaciones", NotificacionesMensajeria],
          ["perfil", PerfilMensajeria], ["configuracion", ConfiguracionMensajeria],
        ].map(([nombre, Componente]) => (
          <Route key={nombre} path={`/mensajeria/${nombre}`} element={<ProtectedRoute allowedRoles={["mensajero"]}><Componente /></ProtectedRoute>} />
        ))}

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