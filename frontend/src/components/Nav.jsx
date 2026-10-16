import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_BASE_URL } from "../services/httpClient";
import Icon from "./Icon";
import ThemeToggle from "./ThemeToggle";

const roleLabel = (roles) => {
  if (roles.includes("administrador")) return "Administrador";
  if (roles.includes("bodeguero")) return "Bodeguero";
  if (roles.includes("mensajero")) return "Mensajero";
  return "Cliente";
};

function Nav() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categoriasOpen, setCategoriasOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
  const usuario = JSON.parse(storage.getItem("user") || storage.getItem("usuario") || "null");
  const roles = Array.isArray(usuario?.roles)
    ? usuario.roles.map((role) => String(role).trim().toLowerCase())
    : [];
  const esAdministrador = roles.includes("admin") || roles.includes("administrador");
  const esMensajero = roles.includes("mensajero");
  const esBodeguero = roles.includes("bodeguero");
  const esCliente = roles.includes("cliente");

  const estaActivo = (ruta) => ruta === "/"
    ? location.pathname === "/"
    : location.pathname === ruta || location.pathname.startsWith(`${ruta}/`);

  const estiloDropdown = (ruta) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 16px",
    color: estaActivo(ruta) ? "var(--color-primary)" : "var(--color-text-secondary)",
    background: estaActivo(ruta) ? "var(--color-primary-soft)" : "transparent",
    borderLeft: estaActivo(ruta) ? "3px solid var(--color-primary)" : "3px solid transparent",
    textDecoration: "none",
    fontSize: "14px",
  });

  useEffect(() => {
    const close = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/categorias`)
      .then((response) => response.json())
      .then((data) => setCategorias(data.categories || []))
      .catch(() => setCategorias([]));
  }, []);

  const cerrarSesion = () => {
    [localStorage, sessionStorage].forEach((store) => ["usuario", "user", "userRoles", "token"].forEach((key) => store.removeItem(key)));
    window.dispatchEvent(new Event("happykids:session-changed"));
    setDropdownOpen(false);
    navigate("/login", { replace: true });
  };

  const menuLink = (to, label, icon) => (
    <Link to={to} onClick={() => setDropdownOpen(false)} style={estiloDropdown(to)}>
      <Icon name={icon} size={18} />
      {label}
    </Link>
  );

  const primaryLink = (to, label, icon) => (
    <Link to={to} className="nav-link-item">
      <Icon name={icon} size={18} />
      {label}
    </Link>
  );

  return (
    <>
      <nav className="topbar-shell" style={{ padding: "10px 0" }}>
        <div className="container d-flex align-items-center gap-3">
          <Link to="/" className="brand-wordmark">Happy kids<span className="brand-accent">.</span></Link>
          <form onSubmit={(event) => { event.preventDefault(); if (busqueda.trim()) navigate(`/?buscar=${busqueda}`); }} className="search-shell">
            <input value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar productos..." className="search-input" />
            <button type="submit" className="search-button" aria-label="Buscar" title="Buscar"><Icon name="search" size={18} /></button>
          </form>
          <div className="d-flex align-items-center gap-2">
            <ThemeToggle />
            {(esCliente || esAdministrador || esBodeguero || esMensajero) && <>
              <button className="icon-button nav-icon-button" onClick={() => navigate("/favoritos")} aria-label="Favoritos" title="Favoritos"><Icon name="heart" size={20} /></button>
              <button className="icon-button nav-icon-button" onClick={() => navigate("/carrito")} aria-label="Carrito" title="Carrito"><Icon name="cart" size={20} /></button>
            </>}
            <div className="position-relative" ref={dropdownRef}>
              <button className="icon-button nav-icon-button" onClick={() => setDropdownOpen(!dropdownOpen)} aria-label="Cuenta" title="Cuenta"><Icon name="person" size={20} /></button>
              {dropdownOpen && <div className="nav-dropdown-menu">
                <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border)" }}>
                  <div style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{usuario ? usuario.email || usuario.correo : "Invitado"}</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>{usuario ? `${roleLabel(roles)} · Sesión activa` : "No has iniciado sesión"}</div>
                </div>
                {usuario ? <>
                  {esAdministrador && <div style={{ borderBottom: "1px solid var(--color-border)", padding: "6px 0" }}>{menuLink("/admin/dashboard", "Dashboard", "dashboard")}{menuLink("/admin/inventario", "Inventario", "package")}{menuLink("/admin/pedidos", "Pedidos", "receipt")}{menuLink("/admin/novedades-bodega", "Novedades de Bodega", "activity")}{menuLink("/admin/usuarios", "Usuarios", "people")}</div>}
                  {esBodeguero && <div style={{ borderBottom: "1px solid var(--color-border)", padding: "6px 0" }}>{menuLink("/bodeguero", "Inicio bodeguero", "dashboard")}{menuLink("/bodeguero/inventario", "Inventario", "package")}{menuLink("/bodeguero/pedidos", "Pedidos", "receipt")}{menuLink("/bodeguero/envio", "Envío", "truck")}{menuLink("/bodeguero/movimientos", "Movimientos", "activity")}</div>}
                  {esMensajero && menuLink("/mensajeria", "Mensajería", "truck")}
                  {menuLink("/perfil", "Actualizar perfil", "person")}
                  <button onClick={cerrarSesion} aria-label="Cerrar sesión" title="Cerrar sesión" style={{ width: "100%", padding: "12px 16px", color: "var(--color-danger)", background: "transparent", border: "none", borderTop: "1px solid var(--color-border)", textAlign: "left", display: "flex", alignItems: "center", gap: "10px" }}><Icon name="logout" size={18} />Cerrar sesión</button>
                </> : <>{menuLink("/login", "Iniciar sesión", "person")}{menuLink("/registro", "Registrarse", "plus")}</>}
              </div>}
            </div>
          </div>
        </div>
      </nav>
      <div className="nav-secondary">
        <div className="container nav-links-bar">
          {esAdministrador ? <>{primaryLink("/admin/dashboard", "Dashboard", "dashboard")}{primaryLink("/admin/inventario", "Inventario", "package")}{primaryLink("/admin/pedidos", "Pedidos", "receipt")}{primaryLink("/admin/novedades-bodega", "Novedades de Bodega", "activity")}{primaryLink("/admin/usuarios", "Usuarios", "people")}</> : esBodeguero ? <>{primaryLink("/bodeguero", "Inicio", "dashboard")}{primaryLink("/bodeguero/inventario", "Inventario", "package")}{primaryLink("/bodeguero/pedidos", "Pedidos", "receipt")}{primaryLink("/bodeguero/envio", "Envío", "truck")}{primaryLink("/bodeguero/movimientos", "Movimientos", "activity")}</> : esMensajero ? <>{primaryLink("/mensajeria", "Inicio", "dashboard")}{primaryLink("/mensajeria/entregas", "Mis pedidos", "truck")}{primaryLink("/mensajeria/ruta", "Ruta / Mapa", "mapPin")}{primaryLink("/mensajeria/historial", "Historial", "receipt")}</> : <>
            {primaryLink("/", "Inicio", "dashboard")}
            <div style={{ position: "relative" }}>
              <button type="button" className="nav-link-item catalogo-nav-link" onClick={() => setCategoriasOpen(!categoriasOpen)}><Icon name="tags" size={18} />Catálogo <Icon name="arrowDown" size={16} /></button>
              {categoriasOpen && <div className="catalogo-categorias-menu">{categorias.map((categoria) => <Link className="catalogo-option" key={categoria.id_categoria} to={`/catalogo?categoria=${categoria.id_categoria}`} onClick={() => setCategoriasOpen(false)}><Icon name="tags" size={16} /><span>{categoria.nombre}</span><Icon name="chevronRight" size={16} /></Link>)}</div>}
            </div>
            {usuario && primaryLink("/mis-pedidos", "Mis pedidos", "receipt")}
          </>}
        </div>
      </div>
    </>
  );
}

export default Nav;
