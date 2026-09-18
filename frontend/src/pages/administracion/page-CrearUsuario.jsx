import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../services/usuarioService";
import "../../styles/style.css";

const roles = ["Administrador", "Bodeguero", "Mensajero"];

function CrearUsuario() {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState({ nombre: "", apellido: "", correo: "", telefono: "", password: "", rol: "Administrador", foto: null });
  const [vistaPrevia, setVistaPrevia] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cambiar = (event) => {
    const { name, value, files } = event.target;
    if (name === "foto") {
      const archivo = files?.[0] || null;
      setFormulario({ ...formulario, foto: archivo });
      setVistaPrevia(archivo ? URL.createObjectURL(archivo) : "");
      return;
    }
    setFormulario({ ...formulario, [name]: value });
  };

  const guardar = async (event) => {
    event.preventDefault();
    setError("");
    setGuardando(true);
    try {
      const datos = new FormData();
      Object.entries(formulario).forEach(([campo, valor]) => {
        if (valor !== null && valor !== "") datos.append(campo, valor);
      });
      await createUser(datos);
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
    <form className="admin-form" onSubmit={guardar}><div className="admin-form-grid">
      <label className="admin-form-field">Nombre de usuario<input name="nombre" value={formulario.nombre} onChange={cambiar} minLength="3" required /></label>
      <label className="admin-form-field">Apellido<input name="apellido" value={formulario.apellido} onChange={cambiar} minLength="2" required /></label>
      <label className="admin-form-field">Correo<input name="correo" type="email" value={formulario.correo} onChange={cambiar} required /></label>
      <label className="admin-form-field">Teléfono<input name="telefono" type="tel" value={formulario.telefono} onChange={cambiar} maxLength="20" /></label>
      <label className="admin-form-field">Contraseña<input name="password" type="password" value={formulario.password} onChange={cambiar} minLength="6" required /></label>
      <label className="admin-form-field">Rol<select name="rol" value={formulario.rol} onChange={cambiar} required>{roles.map((rol) => <option key={rol} value={rol}>{rol}</option>)}</select></label>
      <label className="admin-form-field">Foto de perfil<input name="foto" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={cambiar} /></label>
      {vistaPrevia && <img src={vistaPrevia} alt="Vista previa del perfil" style={{ width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover" }} />}
    </div><div className="admin-form-actions"><button type="button" className="btn-admin-cancelar" onClick={() => navigate("/admin/usuarios")}>Cancelar</button><button type="submit" className="btn-admin-primary" disabled={guardando}>{guardando ? "Guardando..." : "Crear usuario"}</button></div></form>
  </div></div>;
}

export default CrearUsuario;
