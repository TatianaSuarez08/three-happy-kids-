import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/style.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const rolColor = {
  Cliente: { bg: "#e8f4ff", color: "#4a90d9" },
  Administrador: { bg: "#fff3e0", color: "#ff8c42" },
  Bodeguero: { bg: "#eafbea", color: "#3a7d44" },
  Mensajero: { bg: "#f5f0ff", color: "#7c3aed" },
};

function Usuarios() {
  const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [modal, setModal] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = () => {
    const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
    return storage.getItem("token");
  };

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const response = await fetch(`${backend}/usuarios`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudieron cargar los usuarios");
        setUsuarios(data.users || []);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los usuarios");
      } finally {
        setLoading(false);
      }
    };

    cargarUsuarios();
  }, [backend]);

  const cambiarEstado = async () => {
    if (!usuarioSeleccionado) return;
    setError("");
    const activo = usuarioSeleccionado.estado !== "Activo";

    try {
      const response = await fetch(`${backend}/usuarios/${usuarioSeleccionado.id}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ activo }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo actualizar el usuario");

      setUsuarios((prev) => prev.map((usuario) => (
        usuario.id === usuarioSeleccionado.id
          ? { ...usuario, activo, estado: activo ? "Activo" : "Inactivo" }
          : usuario
      )));
      setModal(null);
      setUsuarioSeleccionado(null);
    } catch (err) {
      setError(err.message || "No se pudo actualizar el usuario");
    }
  };

  const eliminarUsuario = async (usuario) => {
    if (!window.confirm(`¿Desactivar a ${usuario.nombre}?`)) return;
    try {
      const response = await fetch(`${backend}/usuarios/${usuario.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo eliminar el usuario");
      setUsuarios((prev) => prev.map((item) => item.id === usuario.id ? { ...item, activo: 0, estado: "Inactivo" } : item));
    } catch (err) {
      setError(err.message || "No se pudo eliminar el usuario");
    }
  };

  const roles = ["todos", ...new Set(usuarios.flatMap((usuario) => usuario.rol.split(", ")))];
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const texto = busqueda.toLowerCase();
    const coincideBusqueda = usuario.nombre.toLowerCase().includes(texto) || usuario.correo.toLowerCase().includes(texto);
    const coincideRol = filtroRol === "todos" || usuario.rol.split(", ").includes(filtroRol);
    return coincideBusqueda && coincideRol;
  });

  const confirmarCambio = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModal("estado");
  };


  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Todos los usuarios</h2>
            <p className="admin-sub">Gestiona los usuarios registrados en la base de datos</p>
          </div>
          <div className="admin-meta">
            <span style={{ fontSize: "14px", color: "#888" }}>Total: {usuarios.length} usuarios</span>
            <button className="btn-admin-primary" onClick={() => navigate("/admin/crear-usuario")}>+ Crear usuario</button>
          </div>
        </div>

        {error && <div className="login-error">{error}</div>}

        <div className="admin-toolbar">
          {roles.map((rol) => (
            <button key={rol} type="button" onClick={() => setFiltroRol(rol)} className={`admin-pill ${filtroRol === rol ? "active" : ""}`}>
              {rol === "todos" ? "Todos" : rol}
            </button>
          ))}
        </div>

        <div className="admin-search">
          <span>🔍</span>
          <input type="text" placeholder="Buscar por nombre o correo..." value={busqueda} onChange={(event) => setBusqueda(event.target.value)} />
        </div>

        <div className="admin-tabla-wrap">
          <table className="admin-tabla">
            <thead><tr><th>#</th><th>Usuario</th><th>Correo</th><th>Teléfono</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="7" style={{ textAlign: "center", color: "#888", padding: "2rem" }}>Cargando usuarios...</td></tr> : usuariosFiltrados.length === 0 ? <tr><td colSpan="7" style={{ textAlign: "center", color: "#888", padding: "2rem" }}>No se encontraron usuarios</td></tr> : usuariosFiltrados.map((usuario, indice) => {
                const color = rolColor[usuario.rol.split(", ")[0]] || { bg: "#f5f5f5", color: "#555" };
                return <tr key={usuario.id}>
                  <td>{indice + 1}</td>
                  <td className="admin-tabla-nombre"><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><img src={usuario.fotoPerfil ? `${backendUrl}${usuario.fotoPerfil}` : ""} alt="" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", background: "#fff3e0" }} />{usuario.nombre} {usuario.apellido}</div></td>
                  <td>{usuario.correo}</td>
                  <td>{usuario.telefono || "Sin registrar"}</td>
                  <td><span className="status-badge" style={{ background: color.bg, color: color.color }}>{usuario.rol}</span></td>
                  <td><span className={usuario.estado === "Activo" ? "status-badge is-active" : "status-badge is-inactive"}>{usuario.estado}</span></td>
                  <td><div className="admin-acciones"><button className="btn-admin-editar" onClick={() => navigate(`/admin/editar-usuario/${usuario.id}`)}>✏️ Editar</button><button className={usuario.estado === "Activo" ? "btn-admin-eliminar" : "btn-admin-editar"} onClick={() => confirmarCambio(usuario)}>{usuario.estado === "Activo" ? "🔒 Desactivar" : "✅ Activar"}</button><button className="btn-admin-eliminar" onClick={() => eliminarUsuario(usuario)}>🗑 Eliminar</button></div></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
        <p className="admin-contador">{usuariosFiltrados.length} usuario(s) encontrado(s)</p>
      </div>

      {modal === "estado" && usuarioSeleccionado && <div className="modal-overlay"><div className="modal-box">
        <h4>{usuarioSeleccionado.estado === "Activo" ? "¿Desactivar usuario?" : "¿Activar usuario?"}</h4>
        <p>{usuarioSeleccionado.estado === "Activo" ? `¿Estás seguro de desactivar a ${usuarioSeleccionado.nombre}? No podrá iniciar sesión.` : `¿Deseas activar a ${usuarioSeleccionado.nombre}?`}</p>
        <div className="admin-modal-actions"><button className={usuarioSeleccionado.estado === "Activo" ? "btn-admin-eliminar" : "btn-admin-editar"} style={{ height: "44px" }} onClick={cambiarEstado}>Sí, confirmar</button><button className="btn-admin-cancelar" style={{ height: "44px" }} onClick={() => setModal(null)}>Cancelar</button></div>
      </div></div>}

    </div>
  );
}

export default Usuarios;
