import { useRef, useState, useEffect } from "react";
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

  // Verificar si ya existe sesión activa
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      // Si ya hay sesión, redirigir según el rol
      const userData = JSON.parse(user);
      redirigirPorRol(userData.roles);
    }
  }, []);

  const normalizarRoles = (roles = []) => {
    if (!Array.isArray(roles)) return [];

    return roles.flatMap((rol) => {
      if (rol == null) return [];
      const valor = String(rol).trim().toLowerCase();
      if (valor === 'admin') return ['administrador'];
      if (valor === 'administrador') return ['administrador'];
      if (valor === 'cliente') return ['cliente'];
      return [valor];
    });
  };

  // Redirigir según el rol del usuario
  const redirigirPorRol = (roles) => {
    const rolesNormalizados = normalizarRoles(roles);

    if (rolesNormalizados.includes('administrador')) {
      navigate("/admin/dashboard");
    } else if (rolesNormalizados.includes('cliente')) {
      navigate("/cliente/catalogo");
    } else {
      navigate("/");
    }
  };

  // Funciones de navegación rápidas
  const cancelar = () => navigate("/registro"); // ir a página de registro
  
  // Maneja el envío del formulario: valida campos, llama al backend y guarda token/user
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Lectura de valores desde las refs
    const correo = correoRef.current.value.trim();
    const contraseña = contraseñaRef.current.value;

    // Validaciones básicas en cliente
    if (!correo) return setError("Ingresa tu correo electrónico.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return setError("El correo no es válido.");
    if (!contraseña) return setError("Ingresa tu contraseña.");
    if (contraseña.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");

    setLoading(true);
    try {
      // URL del backend configurable mediante Vite env var
      const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

      // Petición POST a /login con JSON
      const res = await fetch(`${BACKEND}/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: correo, password: contraseña }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        // Manejar diferentes códigos de error
        if (res.status === 403) {
          throw new Error('El usuario está inactivo. Contacta al administrador.');
        } else if (res.status === 401) {
          throw new Error('Correo o contraseña incorrectos.');
        } else if (res.status === 400) {
          throw new Error(data.error || 'Datos inválidos.');
        }
        throw new Error(data.error || 'Error en el login');
      }

      // Validar que la respuesta tenga los datos esperados
      if (!data.token || !data.user) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Almacenamiento de credenciales/tokens en localStorage (simple y persistente)
      // Nota: para mayor seguridad usar HttpOnly cookies en producción
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('usuario', JSON.stringify(data.user));
      localStorage.setItem('userRoles', JSON.stringify(data.user.roles || []));

      // Limpiar formulario
      correoRef.current.value = '';
      contraseñaRef.current.value = '';

      // Redirigir según rol
      redirigirPorRol(data.user.roles);
      
    } catch (err) {
      // Mensaje de error específico
      setError(err.message || "Correo o contraseña incorrectos.");
      console.error('Error en login:', err);
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
              disabled={loading}
              autoComplete="email"
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
                disabled={loading}
                autoComplete="current-password"
              />
              {/* Botón para alternar visibilidad de la contraseña */}
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

          {/* Enlace para recuperar contraseña */}
          <div className="login-forgot">
            <Link to="/recuperar-pass">¿Olvidaste tu contraseña?</Link>
          </div>

          {/* Botones: enviar formulario y navegar a registro */}
          <div className="botones">
            <button type="submit" className="btn-ingresar" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
            <button type="button" className="btn-registro" onClick={cancelar} disabled={loading}>
              Registrarse
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default InicioSesion;
               