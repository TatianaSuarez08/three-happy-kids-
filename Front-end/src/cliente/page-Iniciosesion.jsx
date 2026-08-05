import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/style.css";

function InicioSesion() {
  const correoRef = useRef(null);
  const contraseñaRef = useRef(null);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const cancelar = () => navigate("/Registro");
  const ingresar = () => navigate("/Home");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const correo = correoRef.current.value.trim();
    const contraseña = contraseñaRef.current.value;
    if (!correo) return setError("Ingresa tu correo electrónico.");
    if (!contraseña) return setError("Ingresa tu contraseña.");
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      ingresar();
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
        <p>Inicia sesión para continuar</p>
        </div>

        
        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          
          <div className="login-field">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              ref={correoRef}
              type="email"
              placeholder="correo@ejemplo.com"
            />
          </div>

         
          <div className="login-field">
            <label htmlFor="contraseña">Contraseña</label>
            <div className="login-pass-wrap">
              <input
                id="contraseña"
                ref={contraseñaRef}
                type={showPass ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
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

          <div className="login-forgot">
            <Link to="/RecuperarPass">¿Olvidaste tu contraseña?</Link>
          </div>

          {/* Botones */}
          <div className="botones">
            <button type="submit" className="btn-ingresar" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
            <button type="button" className="btn-registro" onClick={cancelar}>
              Registrarse
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default InicioSesion;