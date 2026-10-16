import { useEffect, useRef, useState } from "react";
import Icon from "../../components/Icon";
import { API_BASE_URL } from "../../services/httpClient";
import { useNavigate } from "react-router-dom";

function Registro() {
  const nombreUsuarioRef = useRef(null);
  const primerNombreRef = useRef(null);
  const primerApellidoRef = useRef(null);
  const numeroDocumentoRef = useRef(null);
  const tipoDocumentoRef = useRef(null);
  const telefonoRef = useRef(null);
  const direccionRef = useRef(null);
  const ciudadRef = useRef(null);
  const correoRef = useRef(null);
  const fotoPerfilRef = useRef(null);
  const contraseñaRef = useRef(null);
  const confirmarRef = useRef(null);

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [fotoPreview, setFotoPreview] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/tipos-documento`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudieron cargar los tipos de documento");
        setTiposDocumento(data.documentTypes || []);
      })
      .catch((err) => setError(err.message || "No se pudieron cargar los tipos de documento"));
  }, []);

  const handleFotoChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setFotoPerfil(null);
      setFotoPreview("");
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('La imagen debe ser JPG, PNG o WEBP.');
      event.target.value = '';
      setFotoPerfil(null);
      setFotoPreview("");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen supera el tamaño permitido de 5 MB.');
      event.target.value = '';
      setFotoPerfil(null);
      setFotoPreview("");
      return;
    }

    setError('');
    setFotoPerfil(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Lectura de valores desde las refs
    const nombre_usuario = nombreUsuarioRef.current.value.trim();
    const primer_nombre = primerNombreRef.current.value.trim();
    const primer_apellido = primerApellidoRef.current.value.trim();
    const numero_documento = numeroDocumentoRef.current.value.trim();
    const id_tipo_documento = tipoDocumentoRef.current.value;
    const email = correoRef.current.value.trim();
    const password = contraseñaRef.current.value;
    const confirmar_password = confirmarRef.current.value;

    // Validaciones básicas en cliente
    if (!nombre_usuario) return setError("Ingresa tu nombre de usuario.");
    if (nombre_usuario.length < 3) return setError("El nombre de usuario debe tener al menos 3 caracteres.");
    if (!primer_nombre || !primer_apellido) return setError("Ingresa tu nombre y apellido.");
    if (!/^\d{6,19}$/.test(numero_documento)) return setError("El número de documento debe tener entre 6 y 19 dígitos.");
    if (!id_tipo_documento) return setError("Selecciona tu tipo de documento.");
    
    if (!email) return setError("Ingresa tu correo electrónico.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("El correo no es válido.");
    if (fotoPerfil && fotoPerfil.size > 5 * 1024 * 1024) return setError("La imagen supera el tamaño permitido de 5 MB.");
    
    if (!password) return setError("Ingresa tu contraseña.");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    
    if (password !== confirmar_password) return setError("Las contraseñas no coinciden.");

    setLoading(true);
    try {
      const BACKEND = API_BASE_URL;
      const formData = new FormData();
      formData.append('nombre_usuario', nombre_usuario);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('confirmar_password', confirmar_password);
      formData.append('primer_nombre', primer_nombre);
      formData.append('primer_apellido', primer_apellido);
      formData.append('numero_documento', numero_documento);
      formData.append('id_tipo_documento', id_tipo_documento);
      formData.append('telefono', telefonoRef.current.value.trim());
      formData.append('direccion', direccionRef.current.value.trim());
      formData.append('ciudad', ciudadRef.current.value.trim());
      if (fotoPerfil) {
        formData.append('foto', fotoPerfil);
      }

      const res = await fetch(`${BACKEND}/registro`, {
        method: 'POST',
        body: formData,
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

      const userSession = {
        ...data.user,
        roles: Array.isArray(data.user.roles) ? data.user.roles : [],
      };

      const storage = sessionStorage;
      storage.removeItem('token');
      storage.removeItem('user');
      storage.removeItem('usuario');
      storage.removeItem('userRoles');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('usuario');
      localStorage.removeItem('userRoles');
      storage.setItem('token', data.token);
      storage.setItem('user', JSON.stringify(userSession));
      storage.setItem('usuario', JSON.stringify(userSession));
      storage.setItem('userRoles', JSON.stringify(userSession.roles));
      window.dispatchEvent(new Event('happykids:session-changed'));

      // Limpiar formulario
      nombreUsuarioRef.current.value = '';
      primerNombreRef.current.value = '';
      primerApellidoRef.current.value = '';
      numeroDocumentoRef.current.value = '';
      tipoDocumentoRef.current.value = '';
      telefonoRef.current.value = '';
      direccionRef.current.value = '';
      ciudadRef.current.value = '';
      correoRef.current.value = '';
      if (fotoPerfilRef.current) fotoPerfilRef.current.value = '';
      setFotoPerfil(null);
      setFotoPreview('');
      contraseñaRef.current.value = '';
      confirmarRef.current.value = '';

      // Mostrar modal de éxito
      setModal("exito");
      
    } catch (err) {
      const mensaje = err instanceof TypeError
        ? 'No se pudo conectar con la API. Comprueba que esté iniciada.'
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
    <div className="login-page registro-page">
      <div className="login-card registro-card">

        <div className="login-logo">
          <p>Crea tu cuenta</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="registro-form">
          <section className="registro-section">
            <h3>Información personal</h3>
            <div className="registro-grid registro-grid--2">
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

              <div className="login-field">
                <label htmlFor="primer-nombre">Nombres</label>
                <input id="primer-nombre" ref={primerNombreRef} type="text" maxLength="50" required disabled={loading} autoComplete="given-name" />
              </div>

              <div className="login-field">
                <label htmlFor="primer-apellido">Apellidos</label>
                <input id="primer-apellido" ref={primerApellidoRef} type="text" maxLength="50" required disabled={loading} autoComplete="family-name" />
              </div>

              <div className="login-field">
                <label htmlFor="tipo-documento">Tipo de documento</label>
                <select id="tipo-documento" ref={tipoDocumentoRef} required disabled={loading || tiposDocumento.length === 0} defaultValue="">
                  <option value="">Selecciona una opción</option>
                  {tiposDocumento.map((tipo) => <option key={tipo.id} value={tipo.id}>{tipo.sigla} · {tipo.nombre_documento}</option>)}
                </select>
              </div>

              <div className="login-field registro-field-full">
                <label htmlFor="numero-documento">Número de documento</label>
                <input id="numero-documento" ref={numeroDocumentoRef} type="text" inputMode="numeric" pattern="[0-9]{6,19}" maxLength="19" required disabled={loading} autoComplete="off" />
              </div>
            </div>
          </section>

          <section className="registro-section">
            <h3>Información de contacto</h3>
            <div className="registro-grid registro-grid--2">
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

              <div className="login-field">
                <label htmlFor="telefono">Teléfono</label>
                <input id="telefono" ref={telefonoRef} type="tel" maxLength="20" disabled={loading} autoComplete="tel" />
              </div>

              <div className="login-field registro-field-full">
                <label htmlFor="foto-perfil">Foto de perfil</label>
                <div className="registro-foto-wrap">
                  <input
                    id="foto-perfil"
                    ref={fotoPerfilRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFotoChange}
                    disabled={loading}
                  />
                  {fotoPreview ? (
                    <div className="registro-foto-preview">
                      <img src={fotoPreview} alt="Vista previa de la foto de perfil" />
                    </div>
                  ) : (
                    <div className="registro-foto-empty">Sin imagen seleccionada</div>
                  )}
                </div>
              </div>

              <div className="login-field registro-field-full">
                <label htmlFor="direccion">Dirección</label>
                <input id="direccion" ref={direccionRef} type="text" maxLength="150" disabled={loading} autoComplete="street-address" />
              </div>

              <div className="login-field registro-field-full">
                <label htmlFor="ciudad">Ciudad</label>
                <input id="ciudad" ref={ciudadRef} type="text" maxLength="60" disabled={loading} autoComplete="address-level2" />
              </div>
            </div>
          </section>

          <section className="registro-section">
            <h3>Credenciales</h3>
            <div className="registro-grid registro-grid--2">
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
                    <Icon name={showPass ? "eye" : "lock"} size={18} />
                  </button>
                </div>
              </div>

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
                    <Icon name={showConfirm ? "eye" : "lock"} size={18} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <div className="botones registro-actions">
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