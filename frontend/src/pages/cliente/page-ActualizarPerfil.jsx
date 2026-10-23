import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../services/httpClient";
import { getMyProfile, updateMyProfilePhoto } from "../../services/usuarioService";

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
  const [perfil, setPerfil] = useState(null);
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getMyProfile()
      .then((data) => setPerfil(data.user))
      .catch((err) => setError(err.message));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const nombre = nombreRef.current.value.trim();
    const correo = correoRef.current.value.trim().toLowerCase();
    const telefono = telefonoRef.current.value.trim();
    const direccion = direccionRef.current.value.trim();
    const contraseña = contraseñaRef.current.value;
    const confirmar = confirmarRef.current.value;

    if (nombre.length > 50 || !/^[\p{L}\p{M}]+(?:[ .'-][\p{L}\p{M}]+)*$/u.test(nombre)) {
      return setError("Ingresa un nombre válido con letras, espacios, apóstrofes o guiones.");
    }
    if (correo.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return setError("Ingresa un correo electrónico válido.");
    }
    if (!/^[0-9]{10}$/.test(telefono)) {
      return setError("El teléfono debe tener exactamente 10 números, sin espacios ni símbolos.");
    }
    if (!direccion || direccion.length > 150) {
      return setError("Ingresa una dirección de hasta 150 caracteres.");
    }
    if (contraseña || confirmar) {
      if (!contraseña || !confirmar) {
        return setError("Ingresa y confirma la nueva contraseña.");
      }
      if (contraseña.length < 6) {
        return setError("La contraseña debe tener al menos 6 caracteres.");
      }
    }
    if (contraseña && contraseña !== confirmar) {
      return setError("Las contraseñas no coinciden.");
    }

    setLoading(true);
    try {
      if (fotoSeleccionada) {
        const data = await updateMyProfilePhoto(fotoSeleccionada);
        setPerfil((actual) => ({ ...actual, fotoPerfil: data.fotoPerfil }));
        setFotoSeleccionada(null);
      }
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

  const seleccionarFoto = (event) => {
    const archivo = event.target.files?.[0] || null;
    setFotoSeleccionada(archivo);
    setVistaPrevia(archivo ? URL.createObjectURL(archivo) : "");
  };

  return (
    <div className="login-page perfil-page">
      <div className="login-card perfil-card">

        <div className="login-logo perfil-heading">
          <div className="login-logo-icon"><i className="bi bi-person-circle" aria-hidden="true" /></div>
          <h1>Actualizar perfil</h1>
          <p>Modifica tus datos personales</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        {perfil && <div className="perfil-summary">
          <div className="perfil-avatar-wrap">
            <img className="perfil-avatar" src={vistaPrevia || (perfil.fotoPerfil ? `${API_BASE_URL}${perfil.fotoPerfil}` : null)} alt="Foto de perfil" />
          </div>
          <div className="perfil-summary-info"><strong>{perfil.nombre}</strong><div>{perfil.email}</div><div>{perfil.telefono || "Sin teléfono registrado"}</div><div className="perfil-summary-meta"><span>{perfil.rol}</span><span>{perfil.estado}</span></div><label className="perfil-photo-picker">Cambiar foto<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={seleccionarFoto} /></label></div>
        </div>}

        <form className="perfil-form" onSubmit={handleSubmit}>

          {/* Nombre */}
          <div className="login-field">
            <label htmlFor="nombre">Nombre completo</label>
            <input
              id="nombre"
              ref={nombreRef}
              type="text"
              placeholder="Tu nombre completo"
              maxLength={50}
              pattern="[\p{L}\p{M} .'-]+"
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
              maxLength={100}
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
              placeholder="Ej: 3001234567"
              pattern="[0-9]{10}"
              maxLength={10}
              inputMode="tel"
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
              maxLength={150}
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
                minLength={6}
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
                minLength={6}
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
          <div className="botones perfil-actions">
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