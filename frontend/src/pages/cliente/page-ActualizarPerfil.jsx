import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, getSessionToken } from "../../services/httpClient";
import "../../styles/style.css";
import Icon from "../../components/Icon";

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
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [fotoPreview, setFotoPreview] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/me`, { headers: { Authorization: `Bearer ${getSessionToken()}` } })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudo cargar el perfil");
        setPerfil(data.user);
        nombreRef.current.value = data.user.nombre || "";
        correoRef.current.value = data.user.email || "";
        telefonoRef.current.value = data.user.telefono || "";
        if (data.user.esCliente && direccionRef.current) {
          direccionRef.current.value = data.user.direccion || "";
        }
      })
      .catch((err) => setError(err.message));
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

    const contraseña = contraseñaRef.current.value;
    const confirmar = confirmarRef.current.value;

    if (contraseña && contraseña !== confirmar) {
      return setError("Las contraseñas no coinciden.");
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nombre', nombreRef.current.value);
      formData.append('email', correoRef.current.value);
      formData.append('telefono', telefonoRef.current.value);
      if (contraseña) formData.append('password', contraseña);
      if (perfil?.esCliente) formData.append('direccion', direccionRef.current.value);
      if (fotoPerfil) formData.append('foto', fotoPerfil);

      const response = await fetch(`${API_BASE_URL}/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getSessionToken()}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo actualizar el perfil");

      const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
      const user = JSON.parse(storage.getItem("user") || storage.getItem("usuario") || "{}");
      const updatedUser = {
        ...user,
        nombre: nombreRef.current.value,
        email: correoRef.current.value,
        telefono: telefonoRef.current.value,
        fotoPerfil: data.user?.fotoPerfil || user.fotoPerfil || fotoPreview || perfil?.fotoPerfil || null,
      };
      storage.setItem("user", JSON.stringify(updatedUser));
      storage.setItem("usuario", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("happykids:session-changed"));
      setPerfil((current) => ({
        ...current,
        ...updatedUser,
        ...(current?.esCliente ? { direccion: direccionRef.current.value } : {}),
      }));
      if (data.user?.fotoPerfil) {
        setFotoPreview(`${API_BASE_URL}${data.user.fotoPerfil}`);
      }
      setModal("exito");
    } catch (err) {
      setError(err.message || "No se pudo actualizar. Intenta de nuevo.");
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
    <div className="login-page perfil-page">
      <div className="login-card perfil-card">

        <div className="login-logo perfil-heading">
          <div className="login-logo-icon">👤</div>
          <h1>Actualizar perfil</h1>
          <p>Modifica tus datos personales</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        {perfil && <div className="perfil-summary">
          <div className="perfil-avatar-wrap">
            <img className="perfil-avatar" src={fotoPreview || (perfil.fotoPerfil ? `${API_BASE_URL}${perfil.fotoPerfil}` : "")} alt="Foto de perfil" />
          </div>
          <div className="perfil-summary-info"><strong>{perfil.nombre}</strong><div>{perfil.email}</div><div>{perfil.telefono || "Sin teléfono registrado"}</div><div className="perfil-summary-meta"><span>{perfil.rol}</span><span>{perfil.estado}</span></div></div>
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
          {perfil?.esCliente && <div className="login-field">
            <label htmlFor="direccion">Dirección</label>
            <input
              id="direccion"
              ref={direccionRef}
              type="text"
              placeholder="Tu dirección"
              required
            />
          </div>}

          <div className="login-field perfil-field-full">
            <label htmlFor="foto">Foto de perfil</label>
            <div className="registro-foto-wrap">
              <input id="foto" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFotoChange} />
              {fotoPreview ? (
                <div className="registro-foto-preview">
                  <img src={fotoPreview} alt="Vista previa de la foto de perfil" />
                </div>
              ) : (
                <div className="registro-foto-empty">Sin imagen seleccionada</div>
              )}
            </div>
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
                <Icon name={showPass ? "eye" : "lock"} size={18} />
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
                <Icon name={showConfirm ? "eye" : "lock"} size={18} />
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