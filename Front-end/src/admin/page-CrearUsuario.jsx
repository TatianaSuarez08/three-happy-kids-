import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/style.css";

const roles = ["Administrador", "Bodeguero", "Mensajero"];

function CrearUsuario() {
  const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState({ nombre: "", apellido: "", correo: "", password: "", rol: "Administrador" });
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cambiar = (event) => setFormulario({ ...formulario, [event.target.name]: event.target.value });

  const guardar = async (event) => {
    event.preventDefault();
    setError("");
    setGuardando(true);
    try {
      const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
      const response = await fetch(`${backend}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${storage.getItem("token")}` },
        body: JSON.stringify(formulario),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo crear el usuario");
      navigate("/admin/usuarios");
    } catch (err) {
      setError(err.message || "No se pudo crear el usuario");
    } finally {
      setGuardando(false);
    }
  };

  return <div className="admin-page"><div className="admin-container">
    <div className="admin-header"><div><h2 className="admin-titulo">Crear usuario</h2><p className="admin-sub">Crea usuarios administrativos registrados en MySQL</p></div><button className="btn-admin-cancelar" onClick={() => navigate("/admin/usuarios")}>Volver a usuarios</button></div>
    {error && <div className="login-error">{error}</div>}
    <form className="producto-formulario" onSubmit={guardar}><div className="producto-formulario-grid">
      <label className="producto-formulario-campo">Nombre de usuario<input name="nombre" value={formulario.nombre} onChange={cambiar} minLength="3" required /></label>
      <label className="producto-formulario-campo">Apellido<input name="apellido" value={formulario.apellido} onChange={cambiar} minLength="2" required /></label>
      <label className="producto-formulario-campo">Correo<input name="correo" type="email" value={formulario.correo} onChange={cambiar} required /></label>
      <label className="producto-formulario-campo">Contraseña<input name="password" type="password" value={formulario.password} onChange={cambiar} minLength="6" required /></label>
      <label className="producto-formulario-campo">Rol<select name="rol" value={formulario.rol} onChange={cambiar} required>{roles.map((rol) => <option key={rol} value={rol}>{rol}</option>)}</select></label>
    </div><div className="producto-formulario-acciones"><button type="button" className="btn-admin-cancelar" onClick={() => navigate("/admin/usuarios")}>Cancelar</button><button type="submit" className="btn-admin-primary" disabled={guardando}>{guardando ? "Guardando..." : "Crear usuario"}</button></div></form>
  </div></div>;
}

export default CrearUsuario;
