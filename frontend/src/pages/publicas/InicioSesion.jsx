import { useRef, useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/authService";

function InicioSesion() {
  // Referencias a los inputs (no controlados) para leer valores sin estado adicional
  const correoRef = useRef(null); // referencia al input de correo
  const contraseñaRef = useRef(null); // referencia al input de contraseña

  // Estados locales del componente
  const [showPass, setShowPass] = useState(false); // controla mostrar/ocultar contraseña
  const [recordarme, setRecordarme] = useState(false); // decide si la sesión permanece al cerrar la pestaña
  const [error, setError] = useState(""); // mensaje de error para mostrar en la UI
  const [loading, setLoading] = useState(false); // indicador de envío
  const navigate = useNavigate(); // hook de react-router para navegación programática

  const normalizarRoles = useCallback((roles = []) => {
    if (!Array.isArray(roles)) return [];

    return roles.flatMap((rol) => {
      if (rol == null) return [];
      const valor = String(rol).trim().toLowerCase();
      if (valor === 'admin') return ['administrador'];
      if (valor === 'administrador') return ['administrador'];
      if (valor === 'cliente') return ['cliente'];
      return [valor];
    });
  }, []);

  // Redirigir según el rol del usuario
  const redirigirPorRol = useCallback((roles) => {
    const rolesNormalizados = normalizarRoles(roles);

    if (rolesNormalizados.includes('administrador')) {
      navigate("/admin/dashboard");
    } else if (rolesNormalizados.includes('bodeguero')) {
      navigate("/bodeguero");
    } else if (rolesNormalizados.includes('mensajero')) {
      navigate("/mensajeria");
    } else if (rolesNormalizados.includes('cliente')) {
      navigate("/cliente/catalogo");
    } else {
      navigate("/");
    }
  }, [navigate, normalizarRoles]);

  // Verificar si ya existe sesión activa al volver a la pantalla de login
  useEffect(() => {
    const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
    const token = storage.getItem('token');
    const userJson = storage.getItem('user');

    if (!token || !userJson) return;

    try {
      const user = JSON.parse(userJson);
      redirigirPorRol(user.roles);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('usuario');
      localStorage.removeItem('userRoles');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('usuario');
      sessionStorage.removeItem('userRoles');
    }
  }, [redirigirPorRol]);

  // Funciones de navegación rápidas
  const cancelar = () => navigate("/registro"); // ir a página de registro
  
  // Maneja el envío del formulario: valida campos, llama al backend y guarda token/user
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Lectura de valores desde las refs
    const correo = correoRef.current.value.trim().toLowerCase();
    const contraseña = contraseñaRef.current.value;

    // Validaciones básicas en cliente
    if (!correo) return setError("Ingresa tu correo electrónico.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return setError("El correo no es válido.");
    if (!contraseña) return setError("Ingresa tu contraseña.");
    if (contraseña.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");

    setLoading(true);
    try {
      const data = await login({ email: correo, password: contraseña });
      
      // Validar que la respuesta tenga los datos esperados
      if (!data.token || !data.user) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Almacenamiento de credenciales/tokens en localStorage (simple y persistente)
      // Nota: para mayor seguridad usar HttpOnly cookies en producción
      const userSession = {
        ...data.user,
        roles: Array.isArray(data.user.roles) ? data.user.roles : [],
      };

      const storage = recordarme ? localStorage : sessionStorage;
      const otherStorage = recordarme ? sessionStorage : localStorage;

      otherStorage.removeItem('token');
      otherStorage.removeItem('user');
      otherStorage.removeItem('usuario');
      otherStorage.removeItem('userRoles');
      storage.setItem('token', data.token);
      storage.setItem('user', JSON.stringify(userSession));
      storage.setItem('usuario', JSON.stringify(userSession));
      storage.setItem('userRoles', JSON.stringify(userSession.roles));
      window.dispatchEvent(new Event('happykids:session-changed'));

      // Limpiar formulario
      correoRef.current.value = '';
      contraseñaRef.current.value = '';

      // Redirigir según rol
      redirigirPorRol(userSession.roles);
      
    } catch (err) {
      // Mensaje de error específico
      setError(err.message || "Correo o contraseña incorrectos.");
      console.error('Error en login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="registro-page auth-login-page">
      <aside className="registro-intro">
        <div className="registro-intro-content">
          <div className="registro-brand-mark" aria-hidden="true">
            <i className="bi bi-stars" />
          </div>
          <p className="registro-eyebrow">THREE HAPPY KIDS</p>
          <h1>Qué bueno tenerte de vuelta.</h1>
          <p className="registro-intro-copy">
            Inicia sesión para encontrar tus favoritos y seguir disfrutando cada momento con tu familia.
          </p>
          <div className="registro-benefit">
            <i className="bi bi-heart-fill" aria-hidden="true" />
            <span>Tu espacio feliz, siempre cerca</span>
          </div>
        </div>
        <div className="registro-decoration registro-decoration-one" aria-hidden="true" />
        <div className="registro-decoration registro-decoration-two" aria-hidden="true" />
      </aside>

      <section className="registro-content auth-login-content" aria-labelledby="login-title">
        <div className="registro-form-shell auth-login-shell">
          <header className="registro-heading">
            <p className="registro-eyebrow">BIENVENIDO DE NUEVO</p>
            <h2 id="login-title">Inicia sesión</h2>
            <p>Ingresa a tu cuenta para continuar.</p>
          </header>

          {error && <div className="registro-alert" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>

          {/* Campo correo: input no controlado referenciado por `correoRef` */}
          <div className="login-field">
            <label htmlFor="correo">Correo electrónico <span>*</span></label>
            <input
              id="correo"
              ref={correoRef}
              type="email"
              placeholder="correo@ejemplo.com"
              required
              maxLength={100}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* Campo contraseña con toggle para mostrar/ocultar */}
          <div className="login-field">
            <label htmlFor="contraseña">Contraseña <span>*</span></label>
            <div className="login-pass-wrap">
              <input
                id="contraseña"
                ref={contraseñaRef}
                type={showPass ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                required
                minLength={6}
                disabled={loading}
                autoComplete="current-password"
              />
              {/* Botón para alternar visibilidad de la contraseña */}
              <button
                type="button"
                className="login-toggle-pass"
                onClick={() => setShowPass(!showPass)}
                disabled={loading}
                aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true" />
              </button>
            </div>
          </div>

          <label className="login-remember">
            <input
              type="checkbox"
              checked={recordarme}
              onChange={(e) => setRecordarme(e.target.checked)}
              disabled={loading}
            />
            Recordarme en este dispositivo
          </label>

          <div className="auth-login-links">
            <Link to="/recuperar-pass">¿Olvidaste tu contraseña?</Link>
          </div>

          <div className="registro-actions">
            <button type="submit" className="registro-submit" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
              {!loading && <i className="bi bi-arrow-right" aria-hidden="true" />}
            </button>
            <p>¿Aún no tienes una cuenta? <button type="button" onClick={cancelar} disabled={loading}>Regístrate</button></p>
          </div>

          </form>
        </div>
      </section>
    </main>
  );
}

export default InicioSesion;
               