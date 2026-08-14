import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Vistas de Cliente (SIN .jsx al final)
import Index from './Index';
import Catalogo from './cliente/page-catalogo';
import Carrito from './cliente/page-Carrito';
import ConfirmarCompra from './cliente/page-ConfirmarCompra';
import DetalleProducto from './cliente/page-DetalleProducto';
import Favoritos from './cliente/page-Favoritos';
import MisPedidos from './cliente/page-MisPedidos';
import RecuperarPass from './cliente/page-RecuperarPass';

// Vistas de Autenticación (SIN .jsx al final)
import Login from './InicioSesion';
import Registro from './Registro';


// Vistas de Admin (SIN .jsx al final)
import IndexAdmi from './admin/IndexAdmi';
import Dashboard from './admin/page-Dashboard';
import Inventario from './admin/page-Inventario';
import Pedidos from './admin/page-Pedidos';
import Producto from './admin/page-producto';
import Usuarios from './admin/page-Usuarios';

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
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/confirmar-compra" element={<ConfirmarCompra />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-pass" element={<RecuperarPass />} />

        {/* Página para cuando el usuario no tiene permisos */}
        <Route path="/no-autorizado" element={<NoAutorizado />} />

        {/* Rutas Admin protegidas por role 'administrador' */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["administrador"]}>
              <IndexAdmi />
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
          path="/admin/producto"
          element={
            <ProtectedRoute allowedRoles={["administrador"]}>
              <Producto />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;