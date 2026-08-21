import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/style.css";

const roles = ["Administrador", "Bodeguero", "Mensajero"];

function EditarUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const [formulario, setFormulario] = useState({ nombre: "", apellido: "", correo: "", password: "", rol: "Administrador" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
        const response = await fetch(`${backend}/usuarios`, { headers: { Authorization: `Bearer ${storage.getItem("token")}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudieron cargar los usuarios");
        const usuario = data.users.find((item) => item.id === Number(id));
        if (!usuario) throw new Error("Usuario no encontrado");
        setFormulario({ nombre: usuario.nombre, apellido: usuario.apellido || "", correo: usuario.correo, password: "", rol: usuario.rol.split(", ")[0] });
      } catch (err) {
        setError(err.message || "No se pudo cargar el usuario");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [backend, id]);

  const guardar = async (event) => {
    event.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
      const response = await fetch(`${backend}/usuarios/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${storage.getItem("token")}` }, body: JSON.stringify(formulario) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo editar el usuario");
      navigate("/admin/usuarios");
    } catch (err) {
      setError(err.message || "No se pudo editar el usuario");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <div className="admin-page"><div className="admin-container">Cargando usuario...</div></div>;

  return <div className="admin-page"><div className="admin-container">
    <div className="admin-header"><div><h2 className="admin-titulo">Editar usuario</h2><p className="admin-sub">Actualiza los datos y el rol administrativo</p></div><button className="btn-admin-cancelar" onClick={() => navigate("/admin/usuarios")}>Volver a usuarios</button></div>
    {error && <div className="login-error">{error}</div>}
    <form className="producto-formulario" onSubmit={guardar}><div className="producto-formulario-grid">
      <label className="producto-formulario-campo">Nombre de usuario<input name="nombre" value={formulario.nombre} onChange={(event) => setFormulario({ ...formulario, nombre: event.target.value })} minLength="3" required /></label>
      <label className="producto-formulario-campo">Apellido<input name="apellido" value={formulario.apellido} onChange={(event) => setFormulario({ ...formulario, apellido: event.target.value })} minLength="2" required /></label>
      <label className="producto-formulario-campo">Correo<input name="correo" type="email" value={formulario.correo} onChange={(event) => setFormulario({ ...formulario, correo: event.target.value })} required /></label>
      <label className="producto-formulario-campo">Nueva contraseña (opcional)<input name="password" type="password" value={formulario.password} onChange={(event) => setFormulario({ ...formulario, password: event.target.value })} minLength="6" /></label>
      <label className="producto-formulario-campo">Rol<select name="rol" value={formulario.rol} onChange={(event) => setFormulario({ ...formulario, rol: event.target.value })} required>{roles.map((rol) => <option key={rol} value={rol}>{rol}</option>)}</select></label>
    </div><div className="producto-formulario-acciones"><button type="button" className="btn-admin-cancelar" onClick={() => navigate("/admin/usuarios")}>Cancelar</button><button type="submit" className="btn-admin-primary" disabled={guardando}>{guardando ? "Guardando..." : "Guardar cambios"}</button></div></form>
  </div></div>;
}

export default EditarUsuario;
