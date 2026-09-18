import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { getCategorias } from "../services/catalogoService";
import ThemeToggle from "./ThemeToggle";

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
  const roles = Array.isArray(usuario?.roles) ? usuario.roles : [];
  const esAdministrador = roles.some((role) => ["admin", "administrador"].includes(String(role).trim().toLowerCase()));
  const esMensajero = roles.some((role) => String(role).trim().toLowerCase() === "mensajero");
  const esBodeguero = roles.some((role) => String(role).trim().toLowerCase() === "bodeguero");
  const esCliente = roles.some((role) => String(role).trim().toLowerCase() === "cliente");
  const rolPrincipal = esAdministrador ? "Administrador" : esBodeguero ? "Bodeguero" : esMensajero ? "Mensajero" : "Cliente";

  const estaActivo = (ruta) => ruta === "/" ? location.pathname === "/" : location.pathname === ruta || location.pathname.startsWith(`${ruta}/`);
  const estiloDropdown = (ruta) => ({ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", color: estaActivo(ruta) ? "#ff8c42" : "#ccc", background: estaActivo(ruta) ? "#2a2a2a" : "transparent", borderLeft: estaActivo(ruta) ? "3px solid #ff8c42" : "3px solid transparent", textDecoration: "none", fontSize: "14px" });

  useEffect(() => {
    const close = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    getCategorias().then((data) => setCategorias(data.categories || [])).catch(() => setCategorias([]));
  }, []);

  const cerrarSesion = () => {
    [localStorage, sessionStorage].forEach((store) => ["usuario", "user", "userRoles", "token"].forEach((key) => store.removeItem(key)));
    window.dispatchEvent(new Event("happykids:session-changed"));
    setDropdownOpen(false);
    navigate("/login", { replace: true });
  };

  const menuLink = (to, label, icon = "") => <Link to={to} onClick={() => setDropdownOpen(false)} style={estiloDropdown(to)}><i className={`bi ${icon}`} aria-hidden="true" />{label}</Link>;

  return (
    <>
      <nav className="topbar-shell" style={{ padding: "10px 0" }}>
        <div className="container d-flex align-items-center gap-3">
          <Link to="/" className="brand-wordmark"><span>Happy kids<span className="brand-accent">.</span></span></Link>
          <form onSubmit={(event) => { event.preventDefault(); if (busqueda.trim()) navigate(`/?buscar=${busqueda}`); }} className="search-shell">
            <input value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar productos..." className="search-input" />
            <button type="submit" className="search-button" aria-label="Buscar">⌕</button>
          </form>
          <div className="d-flex align-items-center gap-2">
            <ThemeToggle />
            {(esCliente || esAdministrador || esBodeguero || esMensajero) && <><button className="btn text-white border-0 p-2" onClick={() => navigate("/favoritos")} aria-label="Favoritos"><i className="bi bi-heart" aria-hidden="true" /></button><button className="btn text-white border-0 p-2" onClick={() => navigate("/carrito")} aria-label="Carrito"><i className="bi bi-cart3" aria-hidden="true" /></button></>}
            <div className="position-relative" ref={dropdownRef}>
              <button className="btn nav-icon-button" onClick={() => setDropdownOpen(!dropdownOpen)} aria-label="Cuenta"><i className="bi bi-person-circle" aria-hidden="true" /></button>
              {dropdownOpen && <div className="nav-dropdown-menu">
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #2e2e2e" }}><div style={{ color: "#fff", fontWeight: 600 }}>{usuario ? usuario.correo : "Invitado"}</div><div style={{ color: "#666", fontSize: "12px" }}>{usuario ? `${rolPrincipal} · Sesión activa` : "No has iniciado sesión"}</div></div>
                {usuario ? <>
                  {esAdministrador && <div style={{ borderBottom: "1px solid #2e2e2e", padding: "6px 0" }}>{menuLink("/admin/dashboard", "Dashboard", "bi-speedometer2")}{menuLink("/admin/inventario", "Inventario", "bi-boxes")}{menuLink("/admin/pedidos", "Pedidos", "bi-box-seam")}{menuLink("/admin/usuarios", "Usuarios", "bi-people")}</div>}
                  {esBodeguero && <div style={{ borderBottom: "1px solid #2e2e2e", padding: "6px 0" }}>{menuLink("/bodeguero", "Inicio bodeguero", "bi-house")}{menuLink("/bodeguero/inventario", "Inventario", "bi-boxes")}{menuLink("/bodeguero/pedidos", "Pedidos", "bi-box-seam")}{menuLink("/bodeguero/movimientos", "Movimientos", "bi-list-check")}</div>}
                  {esMensajero && menuLink("/mensajeria", "Mensajería", "bi-truck")}
                  {menuLink("/perfil", "Actualizar perfil", "bi-person-circle")}
                  <button onClick={cerrarSesion} style={{ width: "100%", padding: "12px 16px", color: "#e53935", background: "none", border: "none", borderTop: "1px solid #2e2e2e", textAlign: "left" }}><i className="bi bi-box-arrow-right" aria-hidden="true" /> Cerrar sesión</button>
                </> : <>{menuLink("/login", "Iniciar sesión", "bi-box-arrow-in-right")}{menuLink("/registro", "Registrarse", "bi-pencil-square")}</>}
              </div>}
            </div>
          </div>
        </div>
      </nav>
      <div className="nav-secondary"><div className="container nav-links-bar">
        {esAdministrador ? <><Link to="/admin/dashboard" className="nav-link-item">Dashboard</Link><Link to="/admin/inventario" className="nav-link-item">Inventario</Link><Link to="/admin/pedidos" className="nav-link-item">Pedidos</Link><Link to="/admin/usuarios" className="nav-link-item">Usuarios</Link></> : esBodeguero ? <><Link to="/bodeguero" className="nav-link-item">Inicio</Link><Link to="/bodeguero/inventario" className="nav-link-item">Inventario</Link><Link to="/bodeguero/pedidos" className="nav-link-item">Pedidos</Link><Link to="/bodeguero/movimientos" className="nav-link-item">Movimientos</Link></> : esMensajero ? <><Link to="/mensajeria" className="nav-link-item">Inicio</Link><Link to="/mensajeria/entregas" className="nav-link-item">Mis entregas</Link><Link to="/mensajeria/ruta" className="nav-link-item">Ruta / Mapa</Link><Link to="/mensajeria/historial" className="nav-link-item">Historial</Link></> : <><Link to="/" className="nav-link-item">Inicio</Link><div style={{ position: "relative" }}><button type="button" className="nav-link-item catalogo-nav-link" onClick={() => setCategoriasOpen(!categoriasOpen)}><i className="bi bi-grid-3x3-gap" aria-hidden="true" /> Catálogo ▾</button>{categoriasOpen && <div className="catalogo-categorias-menu">{categorias.map((categoria) => <Link className="catalogo-option" key={categoria.id_categoria} to={`/catalogo?categoria=${categoria.id_categoria}`} onClick={() => setCategoriasOpen(false)}><span className="catalogo-option-icon" aria-hidden="true"><i className="bi bi-tag-fill" /></span><span>{categoria.nombre}</span><span className="catalogo-option-arrow" aria-hidden="true">›</span></Link>)}</div>}</div>{usuario && <Link to="/mis-pedidos" className="nav-link-item">Historial de compras</Link>}</>}
      </div></div>
    </>
  );
}

export default Nav;
