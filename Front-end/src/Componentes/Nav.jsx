import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

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
  const esAdministrador = roles.some((role) => {
    const normalizedRole = String(role).trim().toLowerCase();
    return normalizedRole === "admin" || normalizedRole === "administrador";
  });
  const rolPrincipal = esAdministrador ? "Administrador" : "Cliente";

  const estaActivo = (ruta) => {
    if (ruta === "/") return location.pathname === "/";
    return location.pathname === ruta || location.pathname.startsWith(`${ruta}/`);
  };

  const estiloEnlace = (ruta, colorNormal = "#ccc") => ({
    color: estaActivo(ruta) ? "#ff8c42" : colorNormal,
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: estaActivo(ruta) ? 600 : 400,
    borderBottom: estaActivo(ruta) ? "2px solid #ff8c42" : "2px solid transparent",
    padding: "6px 0 4px",
  });

  const estiloEnlaceDropdown = (ruta) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 16px",
    color: estaActivo(ruta) ? "#ff8c42" : "#ccc",
    background: estaActivo(ruta) ? "#2a2a2a" : "transparent",
    borderLeft: estaActivo(ruta) ? "3px solid #ff8c42" : "3px solid transparent",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: estaActivo(ruta) ? 600 : 400,
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    fetch(`${backend}/categorias`)
      .then((response) => response.json())
      .then((data) => setCategorias(data.categories || []))
      .catch(() => setCategorias([]));
  }, []);

  const cerrarSesion = () => {
    setDropdownOpen(false);
    localStorage.removeItem("usuario");
    localStorage.removeItem("user");
    localStorage.removeItem("userRoles");
    localStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userRoles");
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    if (busqueda.trim()) {
      navigate(`/?buscar=${busqueda}`);
    }
  };

  return (
    <>
      {/* Fila superior */}
      <nav style={{ background: "#1a1a1a", padding: "10px 0", borderBottom: "1px solid #2e2e2e" }}>
        <div className="container d-flex align-items-center gap-3">

          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", whiteSpace: "nowrap" }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: "22px", letterSpacing: "1px" }}>
              Happy kids<span style={{ color: "#ff8c42" }}>.</span>
            </span>
          </Link>

          {/* Búsqueda */}
          <form onSubmit={handleBuscar} style={{ flex: 1, display: "flex", alignItems: "center", background: "#fff", borderRadius: "8px", overflow: "hidden", height: "42px" }}>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar productos..."
              style={{ flex: 1, border: "none", outline: "none", padding: "0 16px", fontSize: "14px", color: "#1a1a1a", background: "transparent" }}
            />
            <button type="submit" style={{ background: "#f0f0f0", border: "none", borderLeft: "1px solid #ddd", height: "100%", padding: "0 16px", cursor: "pointer" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </form>

          {/* Iconos */}
          <div className="d-flex align-items-center gap-2">

            {/* Favoritos */}
            <button className="btn text-white border-0 p-2 position-relative" onClick={() => navigate("/favoritos")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>

            {/* Carrito */}
            <button className="btn text-white border-0 p-2 position-relative" onClick={() => navigate("/carrito")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </button>

            {/* Usuario */}
            <div className="position-relative" ref={dropdownRef}>
              <button className="btn text-white border-0 p-2" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </button>

              {dropdownOpen && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", minWidth: "220px", zIndex: 999, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", overflow: "hidden" }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #2e2e2e" }}>
                    <div style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>
                      {usuario ? usuario.correo : "Invitado"}
                    </div>
                    <div style={{ color: "#666", fontSize: "12px" }}>
                      {usuario ? `${rolPrincipal} · Sesión activa` : "No has iniciado sesión"}
                    </div>
                  </div>

                  {usuario ? (
                    <>
                      {esAdministrador && (
                        <div style={{ borderBottom: "1px solid #2e2e2e", padding: "6px 0" }}>
                          <Link to="/admin/dashboard" onClick={() => setDropdownOpen(false)} style={estiloEnlaceDropdown("/admin/dashboard")}>
                            <span aria-hidden="true">▦</span>
                            Dashboard
                          </Link>
                          <Link to="/admin/inventario" onClick={() => setDropdownOpen(false)} style={estiloEnlaceDropdown("/admin/inventario")}>
                            <span aria-hidden="true">▤</span>
                            Inventario
                          </Link>
                          <Link to="/admin/pedidos" onClick={() => setDropdownOpen(false)} style={estiloEnlaceDropdown("/admin/pedidos")}>
                            <span aria-hidden="true">▧</span>
                            Pedidos
                          </Link>
                          <Link to="/admin/usuarios" onClick={() => setDropdownOpen(false)} style={estiloEnlaceDropdown("/admin/usuarios")}>
                            <span aria-hidden="true">♙</span>
                            Usuarios
                          </Link>
                        </div>
                      )}
                      <Link to="/ActualizarPerfil" onClick={() => setDropdownOpen(false)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", color: "#4a90d9", textDecoration: "none", background: "#2a3a5c", fontSize: "14px", fontWeight: 500 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#4a90d9" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        Actualizar perfil
                      </Link>
                      <Link to="/favoritos" onClick={() => setDropdownOpen(false)} style={{ ...estiloEnlaceDropdown("/favoritos"), padding: "12px 16px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        Mis favoritos
                      </Link>
                      <Link to="/mis-pedidos" onClick={() => setDropdownOpen(false)} style={{ ...estiloEnlaceDropdown("/mis-pedidos"), padding: "12px 16px" }}>
                        <span aria-hidden="true">📦</span>
                        Mis pedidos
                      </Link>
                      <button onClick={cerrarSesion} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", color: "#e53935", background: "none", border: "none", borderTop: "1px solid #2e2e2e", width: "100%", textAlign: "left", fontSize: "14px", cursor: "pointer" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setDropdownOpen(false)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", color: "#ff8c42", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
                        🔑 Iniciar sesión
                      </Link>
                      <Link to="/registro" onClick={() => setDropdownOpen(false)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", color: "#ccc", textDecoration: "none", fontSize: "14px" }}>
                        📝 Registrarse
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* Fila inferior: links */}
      <div style={{ background: "#111", borderBottom: "1px solid #2e2e2e", padding: "6px 0" }}>
        <div className="container nav-links-bar d-flex align-items-center gap-4">
          {esAdministrador ? (
            <>
              <Link to="/admin/dashboard" style={estiloEnlace("/admin/dashboard")}>Dashboard</Link>
              <Link to="/admin/inventario" style={estiloEnlace("/admin/inventario")}>Inventario</Link>
              <Link to="/admin/pedidos" style={estiloEnlace("/admin/pedidos")}>Pedidos</Link>
              <Link to="/admin/usuarios" style={estiloEnlace("/admin/usuarios")}>Usuarios</Link>
              <Link to="/mis-pedidos" style={estiloEnlace("/mis-pedidos")}>Mis pedidos</Link>
              <Link to="/catalogo" style={{ ...estiloEnlace("/catalogo", "#ff8c42"), marginLeft: "auto" }}>Comprar en la tienda</Link>
            </>
          ) : (
            <>
              <Link to="/" style={estiloEnlace("/")}>Inicio</Link>
              <div style={{ position: "relative" }}>
                <button type="button" onClick={() => setCategoriasOpen(!categoriasOpen)} style={{ ...estiloEnlace("/catalogo"), display: "inline-flex", alignItems: "center", gap: "5px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", lineHeight: 1.2 }}>
                  Categorías <span style={{ fontSize: "10px" }}>▾</span>
                </button>
                {categoriasOpen && (
                  <div className="catalogo-categorias-menu">
                    {categorias.length === 0 ? (
                      <span style={{ display: "block", padding: "10px 14px", color: "#888", fontSize: "13px" }}>Sin categorías disponibles</span>
                    ) : categorias.map((categoria) => (
                      <Link key={categoria.id_categoria} to={`/catalogo?categoria=${categoria.id_categoria}`} onClick={() => setCategoriasOpen(false)} style={{ display: "block", padding: "10px 14px", color: "#ccc", textDecoration: "none", fontSize: "13px", borderLeft: "3px solid transparent" }} onMouseEnter={(event) => { event.currentTarget.style.color = "#ff8c42"; event.currentTarget.style.background = "#2a2a2a"; event.currentTarget.style.borderLeftColor = "#ff8c42"; }} onMouseLeave={(event) => { event.currentTarget.style.color = "#ccc"; event.currentTarget.style.background = "transparent"; event.currentTarget.style.borderLeftColor = "transparent"; }}>
                        {categoria.nombre} <span style={{ color: "#888", fontSize: "12px" }}>({categoria.id_categoria})</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {usuario && (
                <Link to="/mis-pedidos" style={estiloEnlace("/mis-pedidos")}>Mis pedidos</Link>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Nav;