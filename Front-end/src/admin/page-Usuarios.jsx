
import { useState } from "react";
import "../styles/style.css";

const usuariosEjemplo = [
  { id: 1, nombre: "Ana", apellido: "López", correo: "ana@correo.com", telefono: "3001234567", rol: "Cliente", estado: "Activo" },
  { id: 2, nombre: "Carlos", apellido: "Ramírez", correo: "carlos@correo.com", telefono: "3009876543", rol: "Cliente", estado: "Activo" },
  { id: 3, nombre: "María", apellido: "García", correo: "maria@correo.com", telefono: "3005551234", rol: "Cliente", estado: "Inactivo" },
  { id: 4, nombre: "Admin", apellido: "HappyKids", correo: "admin@happykids.com", telefono: "3001111111", rol: "Administrador", estado: "Activo" },
  { id: 5, nombre: "Luis", apellido: "Martínez", correo: "luis@correo.com", telefono: "3002222222", rol: "Bodeguero", estado: "Activo" },
];

const rolColor = {
  "Cliente": { bg: "#e8f4ff", color: "#4a90d9" },
  "Administrador": { bg: "#fff3e0", color: "#ff8c42" },
  "Bodeguero": { bg: "#eafbea", color: "#3a7d44" },
};

function Usuarios() {
  const [usuarios, setUsuarios] = useState(usuariosEjemplo);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [modal, setModal] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideBusqueda =
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.correo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideRol = filtroRol === "todos" || u.rol === filtroRol;
    return coincideBusqueda && coincideRol;
  });

  const toggleEstado = (id) => {
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, estado: u.estado === "Activo" ? "Inactivo" : "Activo" } : u
      )
    );
    setModal(null);
  };

  const confirmarToggle = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModal("toggle");
  };

  return (
    <div className="admin-page">
      <div className="admin-container">

        {/* Header */}
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Usuarios</h2>
            <p className="admin-sub">Gestiona todos los usuarios registrados</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span style={{ fontSize: "14px", color: "#888", alignSelf: "center" }}>
              Total: {usuarios.length} usuarios
            </span>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "1rem", flexWrap: "wrap" }}>
          {["todos", "Cliente", "Administrador", "Bodeguero"].map((rol) => (
            <button
              key={rol}
              onClick={() => setFiltroRol(rol)}
              style={{
                padding: "6px 16px",
                borderRadius: "20px",
                border: filtroRol === rol ? "1px solid #ff8c42" : "1px solid #ddd",
                background: filtroRol === rol ? "#ff8c42" : "#fff",
                color: filtroRol === rol ? "#fff" : "#555",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {rol === "todos" ? "Todos" : rol}
            </button>
          ))}
        </div>

        {/* Búsqueda */}
        <div className="admin-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Tabla */}
        <div className="admin-tabla-wrap">
          <table className="admin-tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "#888", padding: "2rem" }}>
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td className="admin-tabla-nombre">{u.nombre} {u.apellido}</td>
                    <td>{u.correo}</td>
                    <td>{u.telefono}</td>
                    <td>
                      <span
                        className="admin-badge"
                        style={{
                          background: rolColor[u.rol]?.bg,
                          color: rolColor[u.rol]?.color,
                        }}
                      >
                        {u.rol}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge ${u.estado === "Activo" ? "activo" : "inactivo"}`}>
                        {u.estado}
                      </span>
                    </td>
                    <td>
                      <button
                        className={u.estado === "Activo" ? "btn-admin-eliminar" : "btn-admin-editar"}
                        onClick={() => confirmarToggle(u)}
                      >
                        {u.estado === "Activo" ? "🔒 Desactivar" : "✅ Activar"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="admin-contador">{usuariosFiltrados.length} usuario(s) encontrado(s)</p>

      </div>

      {/* Modal confirmar */}
      {modal === "toggle" && usuarioSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4 style={{ color: usuarioSeleccionado.estado === "Activo" ? "#e53935" : "#3a7d44" }}>
              {usuarioSeleccionado.estado === "Activo" ? "¿Desactivar usuario?" : "¿Activar usuario?"}
            </h4>
            <p>
              {usuarioSeleccionado.estado === "Activo"
                ? `¿Estás seguro de desactivar a ${usuarioSeleccionado.nombre}? No podrá iniciar sesión.`
                : `¿Deseas activar a ${usuarioSeleccionado.nombre}? Podrá iniciar sesión nuevamente.`}
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className={usuarioSeleccionado.estado === "Activo" ? "btn-admin-eliminar" : "btn-admin-editar"}
                style={{ flex: 1, height: "44px", borderRadius: "8px" }}
                onClick={() => toggleEstado(usuarioSeleccionado.id)}
              >
                {usuarioSeleccionado.estado === "Activo" ? "Sí, desactivar" : "Sí, activar"}
              </button>
              <button
                className="btn-admin-cancelar"
                style={{ flex: 1, height: "44px", borderRadius: "8px" }}
                onClick={() => setModal(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Usuarios;