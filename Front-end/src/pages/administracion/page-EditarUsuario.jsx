import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/style.css";
import { getUsers, updateUser } from "../../services/usuarioService";

const roles = ["Administrador", "Bodeguero", "Mensajero"];

function EditarUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState({ nombre: "", apellido: "", correo: "", telefono: "", password: "", rol: "Administrador" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getUsers();
        const usuario = data.users.find((item) => item.id === Number(id));
        if (!usuario) throw new Error("Usuario no encontrado");
        setFormulario({ nombre: usuario.nombre, apellido: usuario.apellido || "", correo: usuario.correo, telefono: usuario.telefono || "", password: "", rol: usuario.rol.split(", ")[0] });
      } catch (err) {
        setError(err.message || "No se pudo cargar el usuario");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  const guardar = async (event) => {
    event.preventDefault();
    setGuardando(true);
    setError("");
    try {
      await updateUser(id, formulario);
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
    <form className="admin-form" onSubmit={guardar}><div className="admin-form-grid">
      <label className="admin-form-field">Nombre de usuario<input name="nombre" value={formulario.nombre} onChange={(event) => setFormulario({ ...formulario, nombre: event.target.value })} minLength="3" required /></label>
      <label className="admin-form-field">Apellido<input name="apellido" value={formulario.apellido} onChange={(event) => setFormulario({ ...formulario, apellido: event.target.value })} minLength="2" required /></label>
      <label className="admin-form-field">Correo<input name="correo" type="email" value={formulario.correo} onChange={(event) => setFormulario({ ...formulario, correo: event.target.value })} required /></label>
      <label className="admin-form-field">Teléfono<input name="telefono" type="tel" value={formulario.telefono} onChange={(event) => setFormulario({ ...formulario, telefono: event.target.value })} maxLength="20" /></label>
      <label className="admin-form-field">Nueva contraseña (opcional)<input name="password" type="password" value={formulario.password} onChange={(event) => setFormulario({ ...formulario, password: event.target.value })} minLength="6" /></label>
      <label className="admin-form-field">Rol<select name="rol" value={formulario.rol} onChange={(event) => setFormulario({ ...formulario, rol: event.target.value })} required>{roles.map((rol) => <option key={rol} value={rol}>{rol}</option>)}</select></label>
    </div><div className="admin-form-actions"><button type="button" className="btn-admin-cancelar" onClick={() => navigate("/admin/usuarios")}>Cancelar</button><button type="submit" className="btn-admin-primary" disabled={guardando}>{guardando ? "Guardando..." : "Guardar cambios"}</button></div></form>
  </div></div>;
}

export default EditarUsuario;
