import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCategorias } from '../services/catalogoService';
import { useCarrito } from '../context/useCarrito';
import ThemeToggle from './ThemeToggle';

function Nav() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categoriasOpen, setCategoriasOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCarrito();
  const storage = localStorage.getItem('user') ? localStorage : sessionStorage;
  const usuario = JSON.parse(storage.getItem('user') || storage.getItem('usuario') || 'null');
  const roles = Array.isArray(usuario?.roles) ? usuario.roles : [];
  const esAdministrador = roles.some((role) => ['admin', 'administrador'].includes(String(role).trim().toLowerCase()));
  const esMensajero = roles.some((role) => String(role).trim().toLowerCase() === 'mensajero');
  const esBodeguero = roles.some((role) => String(role).trim().toLowerCase() === 'bodeguero');
  const esCliente = roles.some((role) => String(role).trim().toLowerCase() === 'cliente');
  const rolPrincipal = esAdministrador
    ? 'Administrador'
    : esBodeguero
      ? 'Bodeguero'
      : esMensajero
        ? 'Mensajero'
        : 'Cliente';

  const estaActivo = (ruta) => (
    ruta === '/'
      ? location.pathname === '/'
      : location.pathname === ruta || location.pathname.startsWith(`${ruta}/`)
  );
  const navLinkProps = (ruta) => {
    const current = location.pathname === ruta;
    return {
      className: `nav-link-item${current ? ' is-active' : ''}`,
      'aria-current': current ? 'page' : undefined,
    };
  };

  useEffect(() => {
    const close = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    getCategorias()
      .then((data) => setCategorias(data.categories || []))
      .catch((error) => {
        console.error('No se pudieron cargar las categorías:', error);
        setCategorias([]);
      });
  }, []);

  const cerrarSesion = () => {
    [localStorage, sessionStorage].forEach((store) => (
      ['usuario', 'user', 'userRoles', 'token'].forEach((key) => store.removeItem(key))
    ));
    window.dispatchEvent(new Event('happykids:session-changed'));
    setDropdownOpen(false);
    navigate('/login', { replace: true });
  };

  const menuLink = (to, label, icon = '') => (
    <Link
      to={to}
      onClick={() => setDropdownOpen(false)}
      className={`nav-menu-link${estaActivo(to) ? ' is-active' : ''}`}
      aria-current={estaActivo(to) ? 'page' : undefined}
    >
      <i className={`bi ${icon}`} aria-hidden="true" />
      {label}
    </Link>
  );

  const renderCatalogMenu = () => (
    <div className="catalogo-categorias-menu" id="catalogo-categorias-menu">
      <Link className="catalogo-option" to="/catalogo" onClick={() => setCategoriasOpen(false)}>
        <span className="catalogo-option-icon" aria-hidden="true"><i className="bi bi-grid" /></span>
        <span>Todos los productos</span>
        <span className="catalogo-option-arrow" aria-hidden="true">›</span>
      </Link>
      {categorias.map((categoria) => (
        <Link
          className="catalogo-option"
          key={categoria.id_categoria}
          to={`/catalogo?categoria=${categoria.id_categoria}`}
          onClick={() => setCategoriasOpen(false)}
        >
          <span className="catalogo-option-icon" aria-hidden="true"><i className="bi bi-tag-fill" /></span>
          <span>{categoria.nombre}</span>
          <span className="catalogo-option-arrow" aria-hidden="true">›</span>
        </Link>
      ))}
    </div>
  );

  return (
    <>
      <nav className="topbar-shell">
        <div className="container d-flex align-items-center gap-3">
          <Link to="/" className="brand-wordmark">
            <span>Happy kids<span className="brand-accent">.</span></span>
          </Link>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (busqueda.trim()) navigate(`/?${new URLSearchParams({ buscar: busqueda.trim() })}`);
            }}
            className="search-shell"
          >
            <input
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar productos..."
              aria-label="Buscar productos"
              className="search-input"
            />
            <button type="submit" className="search-button" aria-label="Buscar">⌕</button>
          </form>
          <div className="d-flex align-items-center gap-2">
            <ThemeToggle />
            {(esCliente || esAdministrador || esBodeguero || esMensajero) && (
              <>
                <button
                  className="btn nav-action-button"
                  onClick={() => navigate('/favoritos')}
                  aria-label="Favoritos"
                >
                  <i className="bi bi-heart" aria-hidden="true" />
                </button>
                <button
                  className="btn nav-action-button nav-cart-button"
                  onClick={() => navigate('/carrito')}
                  aria-label={`Carrito${totalItems ? `, ${totalItems} unidades` : ''}`}
                >
                  <i className="bi bi-cart3" aria-hidden="true" />
                  {totalItems > 0 && <span className="nav-cart-count">{totalItems > 99 ? '99+' : totalItems}</span>}
                </button>
              </>
            )}
            <div className="position-relative" ref={dropdownRef}>
              <button
                className="btn nav-icon-button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="Cuenta"
                aria-expanded={dropdownOpen}
                aria-controls="account-menu"
              >
                <i className="bi bi-person-circle" aria-hidden="true" />
              </button>
              {dropdownOpen && (
                <div className="nav-dropdown-menu" id="account-menu">
                  <div className="nav-dropdown-header">
                    <div className="nav-dropdown-email">{usuario ? usuario.correo : 'Invitado'}</div>
                    <div className="nav-dropdown-caption">
                      {usuario ? `${rolPrincipal} · Sesión activa` : 'No has iniciado sesión'}
                    </div>
                  </div>
                  {usuario ? (
                    <>
                      {esAdministrador && (
                        <div className="nav-dropdown-group">
                          {menuLink('/admin/dashboard', 'Dashboard', 'bi-speedometer2')}
                          {menuLink('/admin/inventario', 'Inventario', 'bi-boxes')}
                          {menuLink('/admin/compras', 'Compras', 'bi-receipt')}
                          {menuLink('/admin/actividad-empleados', 'Actividad de empleados', 'bi-list-check')}
                          {menuLink('/admin/pedidos', 'Pedidos', 'bi-box-seam')}
                          {menuLink('/admin/novedades-pedidos', 'Novedades de pedidos', 'bi-exclamation-triangle')}
                          {menuLink('/admin/usuarios', 'Usuarios', 'bi-people')}
                        </div>
                      )}
                      {esBodeguero && (
                        <div className="nav-dropdown-group">
                          {menuLink('/bodeguero', 'Inicio bodeguero', 'bi-house')}
                          {menuLink('/bodeguero/inventario', 'Inventario', 'bi-boxes')}
                          {menuLink('/bodeguero/pedidos', 'Pedidos', 'bi-box-seam')}
                          {menuLink('/bodeguero/compras', 'Compras y recepción', 'bi-truck')}
                          {menuLink('/bodeguero/movimientos', 'Mi actividad', 'bi-list-check')}
                        </div>
                      )}
                      {esMensajero && menuLink('/mensajeria', 'Mensajería', 'bi-truck')}
                      {menuLink('/perfil', 'Actualizar perfil', 'bi-person-circle')}
                      <button
                        onClick={cerrarSesion}
                        className="nav-logout-button"
                      >
                        <i className="bi bi-box-arrow-right" aria-hidden="true" /> Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <>
                      {menuLink('/login', 'Iniciar sesión', 'bi-box-arrow-in-right')}
                      {menuLink('/registro', 'Registrarse', 'bi-pencil-square')}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="nav-secondary">
        <div className="container nav-links-bar">
          {esAdministrador ? (
            <>
              <Link to="/admin/dashboard" {...navLinkProps('/admin/dashboard')}>Dashboard</Link>
              <Link to="/admin/inventario" {...navLinkProps('/admin/inventario')}>Inventario</Link>
              <Link to="/admin/compras" {...navLinkProps('/admin/compras')}>Compras</Link>
              <Link to="/admin/actividad-empleados" {...navLinkProps('/admin/actividad-empleados')}>Actividad de empleados</Link>
              <Link to="/admin/pedidos" {...navLinkProps('/admin/pedidos')}>Pedidos</Link>
              <Link to="/admin/novedades-pedidos" {...navLinkProps('/admin/novedades-pedidos')}>Novedades</Link>
              <Link to="/admin/usuarios" {...navLinkProps('/admin/usuarios')}>Usuarios</Link>
            </>
          ) : esBodeguero ? (
            <>
              <Link to="/bodeguero" {...navLinkProps('/bodeguero')}>Inicio</Link>
              <Link to="/bodeguero/inventario" {...navLinkProps('/bodeguero/inventario')}>Inventario</Link>
              <Link to="/bodeguero/pedidos" {...navLinkProps('/bodeguero/pedidos')}>Pedidos</Link>
              <Link to="/bodeguero/compras" {...navLinkProps('/bodeguero/compras')}>Compras y recepción</Link>
              <Link to="/bodeguero/movimientos" {...navLinkProps('/bodeguero/movimientos')}>Mi actividad</Link>
            </>
          ) : esMensajero ? (
            <>
              <Link to="/mensajeria" {...navLinkProps('/mensajeria')}>Inicio</Link>
              <Link to="/mensajeria/entregas" {...navLinkProps('/mensajeria/entregas')}>Mis entregas</Link>
              <Link to="/mensajeria/ruta" {...navLinkProps('/mensajeria/ruta')}>Ruta / Mapa</Link>
              <Link to="/mensajeria/historial" {...navLinkProps('/mensajeria/historial')}>Historial</Link>
            </>
          ) : (
            <>
              <Link to="/" {...navLinkProps('/')}>Inicio</Link>
              <div className="nav-category-control">
                <button
                  type="button"
                  className="nav-link-item catalogo-nav-link"
                  onClick={() => setCategoriasOpen(!categoriasOpen)}
                  aria-expanded={categoriasOpen}
                  aria-controls="catalogo-categorias-menu"
                >
                  <i className="bi bi-grid-3x3-gap" aria-hidden="true" /> Catálogo ▾
                </button>
                {categoriasOpen && renderCatalogMenu()}
              </div>
              {usuario && <Link to="/mis-pedidos" {...navLinkProps('/mis-pedidos')}>Historial de compras</Link>}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Nav;
