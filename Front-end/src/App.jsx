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

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>


        {/* Rutas Cliente */}
        <Route path="/" element={<Index />} />
        <Route path="/cliente/catalogo" element={<Catalogo />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/producto/:id" element={<DetalleProducto />} />
        <Route path="/carrito" element={<ProtectedRoute><Carrito /></ProtectedRoute>} />
        <Route path="/confirmar-compra" element={<ProtectedRoute><ConfirmarCompra /></ProtectedRoute>} />
        <Route path="/favoritos" element={<ProtectedRoute><Favoritos /></ProtectedRoute>} />
        <Route path="/mis-pedidos" element={<ProtectedRoute><MisPedidos /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-pass" element={<RecuperarPass />} />

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