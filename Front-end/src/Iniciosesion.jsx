import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";


function InicioSesion() {
  // Referencias a los inputs (no controlados) para leer valores sin estado adicional
  const correoRef = useRef(null); // referencia al input de correo
  const contraseñaRef = useRef(null); // referencia al input de contraseña

  // Estados locales del componente
  const [showPass, setShowPass] = useState(false); // controla mostrar/ocultar contraseña
  const [error, setError] = useState(""); // mensaje de error para mostrar en la UI
  const [loading, setLoading] = useState(false); // indicador de envío
  const navigate = useNavigate(); // hook de react-router para navegación programática

  // Funciones de navegación rápidas
  const cancelar = () => navigate("/registro"); // ir a página de registro
  const ingresar = () => navigate("/"); // ruta por defecto tras login exitoso

  // Maneja el envío del formulario: valida campos, llama al backend y guarda token/user
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Lectura de valores desde las refs
    const correo = correoRef.current.value.trim();
    const contraseña = contraseñaRef.current.value;

    // Validaciones básicas en cliente
    if (!correo) return setError("Ingresa tu correo electrónico.");
    if (!contraseña) return setError("Ingresa tu contraseña.");

    setLoading(true);
    try {
      // URL del backend configurable mediante Vite env var
      const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

      // Petición POST a /login con JSON
      const res = await fetch(`${BACKEND}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: correo, password: contraseña }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en el login');

      // Almacenamiento de credenciales/tokens en localStorage (simple y persistente)
      // Nota: para mayor seguridad usar HttpOnly cookies en producción
      if (data.token) localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

      // Redirigir tras login exitoso
      ingresar();
    } catch {
      // Mensaje genérico en caso de error (no revelar detalles sensibles)
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Sección de logo/instrucción */}
        <div className="login-logo">
          <p>Inicia sesión para continuar</p>
        </div>

        {/* Mostrar error si existe */}
        {error && <div className="login-error">{error}</div>}

        {/* Formulario de inicio de sesión */}
        <form onSubmit={handleSubmit}>

          {/* Campo correo: input no controlado referenciado por `correoRef` */}
          <div className="login-field">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              ref={correoRef}
              type="email"
              placeholder="correo@ejemplo.com"
            />
          </div>

          {/* Campo contraseña con toggle para mostrar/ocultar */}
          <div className="login-field">
            <label htmlFor="contraseña">Contraseña</label>
            <div className="login-pass-wrap">
              <input
                id="contraseña"
                ref={contraseñaRef}
                type={showPass ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
              />
              {/* Botón para alternar visibilidad de la contraseña */}
              <button
                type="button"
                className="login-toggle-pass"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? "👁" : "🔒"}
              </button>
            </div>
          </div>

          {/* Enlace para recuperar contraseña */}
          <div className="login-forgot">
            <Link to="/recuperar-pass">¿Olvidaste tu contraseña?</Link>
          </div>

          {/* Botones: enviar formulario y navegar a registro */}
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