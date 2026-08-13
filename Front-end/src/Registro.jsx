import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function Registro() {
  const nombreRef = useRef(null);
  const apellidoRef = useRef(null);
  const correoRef = useRef(null);
  const telefonoRef = useRef(null);
  const contraseñaRef = useRef(null);
  const confirmarRef = useRef(null);

  const [showPass, setShowPass] = useState(false);
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

    if (contraseña !== confirmar) {
      return setError("Las contraseñas no coinciden.");
    }

    if (contraseña.length < 6) {
      return setError("La contraseña debe tener al menos 6 caracteres.");
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setModal("exito");
    } catch {
      setError("No se pudo registrar. Intenta de nuevo.");
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
          <div className="login-logo-icon">🧒</div>
          <h1>HappyKids</h1>
          <p>Crea tu cuenta</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* Nombre */}
          <div className="login-field">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              ref={nombreRef}
              type="text"
              placeholder="Tu nombre"
              required
            />
          </div>

          {/* Apellido */}
          <div className="login-field">
            <label htmlFor="apellido">Apellido</label>
            <input
              id="apellido"
              ref={apellidoRef}
              type="text"
              placeholder="Tu apellido"
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

          {/* Contraseña */}
          <div className="login-field">
            <label htmlFor="contraseña">Contraseña</label>
            <div className="login-pass-wrap">
              <input
                id="contraseña"
                ref={contraseñaRef}
                type={showPass ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                required
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
                placeholder="Repite tu contraseña"
                required
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
              {loading ? "Registrando..." : "Registrarse"}
            </button>
            <button type="button" className="btn-registro" onClick={cancelar}>
              Ya tengo cuenta
            </button>
          </div>

        </form>
      </div>

      {/* Modal éxito */}
      {modal === "exito" && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4 style={{ color: "#3a7d44" }}>¡Registro exitoso!</h4>
            <p>Tu cuenta ha sido creada correctamente.</p>
            <button className="btn-ingresar" onClick={modalExito}>Iniciar sesión</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Registro;