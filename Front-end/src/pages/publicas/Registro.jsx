import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function Registro() {
  const nombreUsuarioRef = useRef(null);
  const correoRef = useRef(null);
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

    // Lectura de valores desde las refs
    const nombre_usuario = nombreUsuarioRef.current.value.trim();
    const email = correoRef.current.value.trim();
    const password = contraseñaRef.current.value;
    const confirmar_password = confirmarRef.current.value;

    // Validaciones básicas en cliente
    if (!nombre_usuario) return setError("Ingresa tu nombre de usuario.");
    if (nombre_usuario.length < 3) return setError("El nombre de usuario debe tener al menos 3 caracteres.");
    
    if (!email) return setError("Ingresa tu correo electrónico.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("El correo no es válido.");
    
    if (!password) return setError("Ingresa tu contraseña.");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    
    if (password !== confirmar_password) return setError("Las contraseñas no coinciden.");

    setLoading(true);
    try {
      // URL del backend configurable mediante Vite env var
      const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

      // Petición POST a /registro con JSON
      const res = await fetch(`${BACKEND}/registro`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre_usuario, email, password, confirmar_password }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        throw new Error('El servidor respondió con un formato no válido. Revisa la consola del backend.');
      }
      
      if (!res.ok) {
        // Manejar diferentes códigos de error
        if (res.status === 409) {
          throw new Error('El email o nombre de usuario ya está registrado.');
        } else if (res.status === 400) {
          throw new Error(data.error || 'Datos inválidos.');
        } else if (res.status >= 500) {
          throw new Error(data.error || 'No se pudo crear la cuenta. Revisa la conexión con MySQL.');
        }
        throw new Error(data.error || `Error en el registro (${res.status}).`);
      }

      // Validar que la respuesta tenga los datos esperados
      if (!data.token || !data.user) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Almacenamiento de credenciales/tokens en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('usuario', JSON.stringify(data.user));
      localStorage.setItem('userRoles', JSON.stringify(data.user.roles || []));

      // Limpiar formulario
      nombreUsuarioRef.current.value = '';
      correoRef.current.value = '';
      contraseñaRef.current.value = '';
      confirmarRef.current.value = '';

      // Mostrar modal de éxito
      setModal("exito");
      
    } catch (err) {
      const mensaje = err instanceof TypeError
        ? 'No se pudo conectar con el backend. Comprueba que esté iniciado en http://localhost:3000.'
        : err.message || "Error al registrar. Intenta de nuevo.";
      setError(mensaje);
      console.error('Error en registro:', err);
    } finally {
      setLoading(false);
    }
  };

  const modalExito = () => {
    setModal(null);
    navigate("/cliente/catalogo"); // Redirigir al catálogo de cliente
  };

  const cancelar = () => navigate("/login");

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">
          <p>Crea tu cuenta</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* Nombre de usuario */}
          <div className="login-field">
            <label htmlFor="nombre">Nombre de usuario</label>
            <input
              id="nombre"
              ref={nombreUsuarioRef}
              type="text"
              placeholder="Ej: juan_perez"
              disabled={loading}
              autoComplete="username"
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
              disabled={loading}
              autoComplete="email"
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
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="login-toggle-pass"
                onClick={() => setShowPass(!showPass)}
                disabled={loading}
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
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="login-toggle-pass"
                onClick={() => setShowConfirm(!showConfirm)}
                disabled={loading}
              >
                {showConfirm ? "👁" : "🔒"}
              </button>
            </div>
          </div>

          {/* Botones */}
          <div className="botones">
            <button type="submit" className="btn-ingresar" disabled={loading}>
              {loading ? "Registrando..." : "Registrarse"}
            </button>
            <button type="button" className="btn-registro" onClick={cancelar} disabled={loading}>
              Volver al Login
            </button>
          </div>

        </form>
      </div>

      {/* Modal de éxito */}
      {modal === "exito" && (
        <div className="login-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="registro-exitoso-titulo">
          <div className="login-modal">
            <div className="login-modal-icon">✓</div>
            <h2 id="registro-exitoso-titulo">¡Registro exitoso!</h2>
            <p>Tu cuenta ha sido creada correctamente.</p>
            <button onClick={modalExito} className="btn-ingresar">
              Ir al catálogo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Registro;