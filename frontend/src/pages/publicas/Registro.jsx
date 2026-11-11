import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDocumentTypes, register } from "../../services/authService";

const initialForm = {
  nombre_usuario: "",
  email: "",
  primer_nombre: "",
  primer_apellido: "",
  id_tipo_documento: "",
  numero_documento: "",
  telefono: "",
  ciudad: "",
  direccion: "",
  password: "",
  confirmar_password: "",
};

function Registro() {
  const [form, setForm] = useState(initialForm);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [documentTypesError, setDocumentTypesError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    getDocumentTypes()
      .then((data) => {
        if (!active) return;
        const availableTypes = Array.isArray(data.documentTypes) ? data.documentTypes : [];
        setDocumentTypes(availableTypes);
        if (availableTypes.length === 0) {
          setDocumentTypesError("No hay tipos de documento activos para completar el registro.");
        }
      })
      .catch((requestError) => {
        if (active) {
          setDocumentTypesError(requestError.message || "No se pudieron cargar los tipos de documento.");
        }
      })
      .finally(() => {
        if (active) setLoadingDocumentTypes(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setEmailSent(false);

    const nombreUsuario = form.nombre_usuario.trim();
    const email = form.email.trim().toLowerCase();
    const primerNombre = form.primer_nombre.trim();
    const primerApellido = form.primer_apellido.trim();
    const numeroDocumento = form.numero_documento.trim();
    const password = form.password;
    const confirmarPassword = form.confirmar_password;

    if (!nombreUsuario || !email || !primerNombre || !primerApellido || !numeroDocumento
      || !form.id_tipo_documento || !password || !confirmarPassword) {
      setError("Completa todos los campos obligatorios para continuar.");
      return;
    }

    if (nombreUsuario.length < 3 || nombreUsuario.length > 50
      || !/^[\p{L}\p{M}][\p{L}\p{M} .'_-]{2,49}$/u.test(nombreUsuario)) {
      setError("El usuario debe tener entre 3 y 50 caracteres y usar solo letras, espacios, puntos, guiones o apóstrofes.");
      return;
    }

    if (email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Escribe un correo electrónico válido.");
      return;
    }

    const personNamePattern = /^[\p{L}\p{M}][\p{L}\p{M} '-]{0,49}$/u;
    if (!personNamePattern.test(primerNombre) || !personNamePattern.test(primerApellido)) {
      setError("El nombre y apellido deben tener hasta 50 caracteres y no incluir números.");
      return;
    }

    if (!/^\d{1,19}$/.test(numeroDocumento)
      || BigInt(numeroDocumento) > 9223372036854775807n) {
      setError("El documento debe contener solo dígitos y tener un número válido.");
      return;
    }

    if (form.telefono.trim().length > 20 || form.direccion.trim().length > 150
      || form.ciudad.trim().length > 60) {
      setError("El teléfono, dirección o ciudad supera la longitud permitida.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const data = await register({
        ...form,
        nombre_usuario: nombreUsuario,
        email,
        primer_nombre: primerNombre,
        primer_apellido: primerApellido,
        numero_documento: numeroDocumento,
        id_tipo_documento: Number(form.id_tipo_documento),
        telefono: form.telefono.trim(),
        ciudad: form.ciudad.trim(),
        direccion: form.direccion.trim(),
      });
      setEmailSent(Boolean(data.emailSent));

      if (!data.token || !data.user) {
        throw new Error("El servidor no devolvió los datos esperados para iniciar sesión.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("usuario", JSON.stringify(data.user));
      localStorage.setItem("userRoles", JSON.stringify(data.user.roles || []));
      window.dispatchEvent(new Event("happykids:session-changed"));
      setForm(initialForm);
      setModal(true);
    } catch (requestError) {
      const message = requestError instanceof TypeError
        ? "No se pudo conectar con el servidor. Inténtalo de nuevo en unos momentos."
        : requestError.message || "No se pudo completar el registro. Inténtalo de nuevo.";
      setError(message);
      console.error("Error en registro:", requestError);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setModal(false);
    navigate("/cliente/catalogo");
  };

  return (
    <main className="registro-page">
      <aside className="registro-intro">
        <div className="registro-intro-content">
          <div className="registro-brand-mark" aria-hidden="true">
            <i className="bi bi-stars" />
          </div>
          <p className="registro-eyebrow">THREE HAPPY KIDS</p>
          <h1>Un mundo feliz empieza contigo.</h1>
          <p className="registro-intro-copy">
            Crea tu cuenta para descubrir prendas especiales, guardar tus favoritos y seguir tus pedidos en un solo lugar.
          </p>
          <div className="registro-benefit">
            <i className="bi bi-heart-fill" aria-hidden="true" />
            <span>Una experiencia hecha para tu familia</span>
          </div>
        </div>
        <div className="registro-decoration registro-decoration-one" aria-hidden="true" />
        <div className="registro-decoration registro-decoration-two" aria-hidden="true" />
      </aside>

      <section className="registro-content" aria-labelledby="registro-title">
        <div className="registro-form-shell">
          <header className="registro-heading">
            <p className="registro-eyebrow">ÚNETE A NUESTRA COMUNIDAD</p>
            <h2 id="registro-title">Crea tu cuenta</h2>
            <p>Completa tus datos para empezar. Los campos con * son obligatorios.</p>
          </header>

          {error && <div className="registro-alert" role="alert">{error}</div>}
          {documentTypesError && (
            <div className="registro-alert" role="alert">{documentTypesError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="registro-fields">
              <div className="registro-field">
                <label htmlFor="nombre_usuario">Nombre de usuario <span>*</span></label>
                <input
                  id="nombre_usuario"
                  name="nombre_usuario"
                  value={form.nombre_usuario}
                  onChange={handleChange}
                  placeholder="Ej. juan_perez"
                  autoComplete="username"
                  minLength={3}
                  maxLength={50}
                  required
                  disabled={loading}
                />
              </div>

              <div className="registro-field">
                <label htmlFor="email">Correo electrónico <span>*</span></label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  maxLength={100}
                  required
                  disabled={loading}
                />
              </div>

              <div className="registro-field">
                <label htmlFor="primer_nombre">Nombre <span>*</span></label>
                <input
                  id="primer_nombre"
                  name="primer_nombre"
                  value={form.primer_nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  autoComplete="given-name"
                  maxLength={50}
                  required
                  disabled={loading}
                />
              </div>

              <div className="registro-field">
                <label htmlFor="primer_apellido">Apellido <span>*</span></label>
                <input
                  id="primer_apellido"
                  name="primer_apellido"
                  value={form.primer_apellido}
                  onChange={handleChange}
                  placeholder="Tu apellido"
                  autoComplete="family-name"
                  maxLength={50}
                  required
                  disabled={loading}
                />
              </div>

              <div className="registro-field">
                <label htmlFor="id_tipo_documento">Tipo de documento <span>*</span></label>
                <select
                  id="id_tipo_documento"
                  name="id_tipo_documento"
                  value={form.id_tipo_documento}
                  onChange={handleChange}
                  required
                  disabled={loading || loadingDocumentTypes || documentTypes.length === 0}
                >
                  <option value="">
                    {loadingDocumentTypes ? "Cargando tipos..." : "Selecciona una opción"}
                  </option>
                  {documentTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.nombre} ({type.sigla})</option>
                  ))}
                </select>
              </div>

              <div className="registro-field">
                <label htmlFor="numero_documento">Número de documento <span>*</span></label>
                <input
                  id="numero_documento"
                  name="numero_documento"
                  type="text"
                  inputMode="numeric"
                  value={form.numero_documento}
                  onChange={handleChange}
                  placeholder="Solo números"
                  autoComplete="off"
                  maxLength={19}
                  required
                  disabled={loading}
                />
              </div>

              <div className="registro-field">
                <label htmlFor="telefono">Teléfono <small>(opcional)</small></label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="Tu número de contacto"
                  autoComplete="tel"
                  maxLength={20}
                  disabled={loading}
                />
              </div>

              <div className="registro-field">
                <label htmlFor="ciudad">Ciudad <small>(opcional)</small></label>
                <input
                  id="ciudad"
                  name="ciudad"
                  value={form.ciudad}
                  onChange={handleChange}
                  placeholder="Tu ciudad"
                  autoComplete="address-level2"
                  maxLength={60}
                  disabled={loading}
                />
              </div>

              <div className="registro-field registro-field-wide">
                <label htmlFor="direccion">Dirección <small>(opcional)</small></label>
                <input
                  id="direccion"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Calle, carrera, número..."
                  autoComplete="street-address"
                  maxLength={150}
                  disabled={loading}
                />
              </div>

              <div className="registro-field">
                <label htmlFor="password">Contraseña <span>*</span></label>
                <div className="registro-password">
                  <input
                    id="password"
                    name="password"
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="registro-password-toggle"
                    onClick={() => setShowPass((visible) => !visible)}
                    aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                    disabled={loading}
                  >
                    <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="registro-field">
                <label htmlFor="confirmar_password">Confirmar contraseña <span>*</span></label>
                <div className="registro-password">
                  <input
                    id="confirmar_password"
                    name="confirmar_password"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmar_password}
                    onChange={handleChange}
                    placeholder="Escríbela de nuevo"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="registro-password-toggle"
                    onClick={() => setShowConfirm((visible) => !visible)}
                    aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                    disabled={loading}
                  >
                    <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            <div className="registro-actions">
              <button
                type="submit"
                className="registro-submit"
                disabled={loading || loadingDocumentTypes || documentTypes.length === 0}
              >
                {loading ? "Creando tu cuenta..." : "Crear cuenta"}
                {!loading && <i className="bi bi-arrow-right" aria-hidden="true" />}
              </button>
              <p>¿Ya tienes una cuenta? <button type="button" onClick={() => navigate("/login")} disabled={loading}>Inicia sesión</button></p>
            </div>
          </form>
        </div>
      </section>

      {modal && (
        <div className="login-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="registro-exitoso-titulo">
          <div className="login-modal">
            <div className="login-modal-icon">✓</div>
            <h2 id="registro-exitoso-titulo">¡Registro exitoso!</h2>
            <p>
              {emailSent
                ? "Tu cuenta está lista. Te enviamos un correo de bienvenida con información para acceder a HappyKids."
                : "Tu cuenta está lista, pero no pudimos enviar el correo de bienvenida. Ya puedes acceder a HappyKids."}
            </p>
            <button type="button" onClick={handleSuccess} className="btn-ingresar">
              Ir al catálogo
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Registro;
