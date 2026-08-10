import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Vistas de Cliente (SIN .jsx al final)
import Index from './Index';
import Catalogo from './cliente/page-catalogo';
import Carrito from './cliente/page-Carrito';
import ConfirmarCompra from './cliente/page-ConfirmarCompra';
import DetalleProducto from './cliente/page-DetalleProducto';
import Favoritos from './cliente/page-Favoritos';
import MisPedidos from './cliente/page-MisPedidos';
import Login from './cliente/page-Iniciosesion';
import Registro from './cliente/page-Registro';
import RecuperarPass from './cliente/page-RecuperarPass';

// Vistas de Admin (SIN .jsx al final)
import Dashboard from './admin/page-Dashboard';
import Inventario from './admin/page-Inventario';
import Pedidos from './admin/page-Pedidos';
import Producto from './admin/page-producto';
import Usuarios from './admin/page-Usuarios';

// Componentes globales
import Nav from './Componentes/Nav';

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        {/* Rutas Cliente */}
        <Route path="/" element={<Index />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/producto/:id" element={<DetalleProducto />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/confirmar-compra" element={<ConfirmarCompra />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-pass" element={<RecuperarPass />} />

        {/* Rutas Admin */}
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/inventario" element={<Inventario />} />
        <Route path="/admin/pedidos" element={<Pedidos />} />
        <Route path="/admin/producto" element={<Producto />} />
        <Route path="/admin/usuarios" element={<Usuarios />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;