import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/style.css";

function ActualizarPerfil() {
  const nombreRef = useRef(null);
  const correoRef = useRef(null);
  const telefonoRef = useRef(null);
  const direccionRef = useRef(null);
  const contraseñaRef = useRef(null);
  const confirmarRef = useRef(null);

  const [showPass, setShowPass] =
   useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const contraseña = contraseñaRef.current.value;
    const confirmar = confirmarRef.current.value;

    if (contraseña && contraseña !== confirmar) {
      return setError("Las contraseñas no coinciden.");
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setModal("exito");
    } catch {
      setError("No se pudo actualizar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const modalExito = () => {
    setModal(null);
    navigate("/");
  };

  const cancelar = () => navigate("/");

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">
          <div className="login-logo-icon">👤</div>
          <h1>Actualizar perfil</h1>
          <p>Modifica tus datos personales</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* Nombre */}
          <div className="login-field">
            <label htmlFor="nombre">Nombre completo</label>
            <input
              id="nombre"
              ref={nombreRef}
              type="text"
              placeholder="Tu nombre completo"
              required
            />
          </div>

          {/* Correo */}
          <div className="login-field">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              ref={correoRef}
              type="email"
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          {/* Teléfono */}
          <div className="login-field">
            <label htmlFor="telefono">Teléfono</label>
            <input
              id="telefono"
              ref={telefonoRef}
              type="tel"
              placeholder="Ej: 8888-8888"
              required
            />
          </div>

          {/* Dirección */}
          <div className="login-field">
            <label htmlFor="direccion">Dirección</label>
            <input
              id="direccion"
              ref={direccionRef}
              type="text"
              placeholder="Tu dirección"
              required
            />
          </div>

          {/* Contraseña */}
          <div className="login-field">
            <label htmlFor="contraseña">Nueva contraseña</label>
            <div className="login-pass-wrap">
              <input
                id="contraseña"
                ref={contraseñaRef}
                type={showPass ? "text" : "password"}
                placeholder="Deja en blanco para no cambiar"
              />
              <button
                type="button"
                className="login-toggle-pass"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? "👁" : "🔒"}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div className="login-field">
            <label htmlFor="confirmar">Confirmar contraseña</label>
            <div className="login-pass-wrap">
              <input
                id="confirmar"
                ref={confirmarRef}
                type={showConfirm ? "text" : "password"}
                placeholder="Repite la nueva contraseña"
              />
              <button
                type="button"
                className="login-toggle-pass"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? "👁" : "🔒"}
              </button>
            </div>
          </div>

          {/* Botones */}
          <div className="botones" style={{ marginTop: "1.5rem" }}>
            <button type="submit" className="btn-ingresar" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
            <button type="button" className="btn-registro" onClick={cancelar}>
              Cancelar
            </button>
          </div>

        </form>
      </div>

      {/* Modal éxito */}
      {modal === "exito" && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4 style={{ color: "#3a7d44" }}>¡Perfil actualizado!</h4>
            <p>Tus datos han sido actualizados correctamente.</p>
            <button className="btn-ingresar" onClick={modalExito}>Aceptar</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default ActualizarPerfil;