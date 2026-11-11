import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requestPasswordReset, resetPassword } from "../../services/authService";

function RecuperarPass() {
  const [token] = useState(() => new URLSearchParams(window.location.search).get("token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [confirmationEmailSent, setConfirmationEmailSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) window.history.replaceState(window.history.state, "", window.location.pathname);
  }, [token]);

  const submitRequest = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Escribe un correo electrónico válido.");
      return;
    }

    setLoading(true);
    try {
      const response = await requestPasswordReset(normalizedEmail);
      setNotice(response.message);
      setRequestSent(true);
    } catch (requestError) {
      setError(requestError.message || "No se pudo procesar la solicitud. Inténtalo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword({
        token,
        password,
        confirmar_password: confirmation
      });
      setNotice(response.message);
      setConfirmationEmailSent(Boolean(response.emailSent));
      setResetComplete(true);
      setPassword("");
      setConfirmation("");
    } catch (requestError) {
      setError(requestError.message || "No se pudo actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  const isResetFlow = Boolean(token);

  return (
    <main className="registro-page">
      <aside className="registro-intro">
        <div className="registro-intro-content">
          <div className="registro-brand-mark" aria-hidden="true">
            <i className="bi bi-stars" />
          </div>
          <p className="registro-eyebrow">THREE HAPPY KIDS</p>
          <h1>Tu cuenta, siempre segura.</h1>
          <p className="registro-intro-copy">
            {isResetFlow
              ? "Elige una nueva contraseña para volver a disfrutar de HappyKids."
              : "Te ayudaremos a recuperar el acceso a tu cuenta de forma segura."}
          </p>
          <div className="registro-benefit">
            <i className="bi bi-shield-check" aria-hidden="true" />
            <span>El enlace de recuperación vence y solo puede usarse una vez</span>
          </div>
        </div>
        <div className="registro-decoration registro-decoration-one" aria-hidden="true" />
        <div className="registro-decoration registro-decoration-two" aria-hidden="true" />
      </aside>

      <section className="registro-content" aria-labelledby="recuperacion-title">
        <div className="registro-form-shell auth-login-shell">
          <header className="registro-heading">
            <p className="registro-eyebrow">ACCESO A TU CUENTA</p>
            <h2 id="recuperacion-title">
              {isResetFlow ? "Crea una nueva contraseña" : "Recuperar contraseña"}
            </h2>
            <p>
              {isResetFlow
                ? "Ingresa y confirma tu nueva contraseña."
                : "Escribe el correo asociado a tu cuenta y te enviaremos un enlace de recuperación."}
            </p>
          </header>

          {error && <div className="registro-alert" role="alert">{error}</div>}
          {notice && <div className="registro-alert auth-recovery-status" role="status">{notice}</div>}

          {isResetFlow && !resetComplete && (
            <form onSubmit={submitReset} noValidate>
              <div className="registro-field">
                <label htmlFor="password-nueva">Nueva contraseña <span>*</span></label>
                <input
                  id="password-nueva"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                  disabled={loading}
                />
              </div>
              <div className="registro-field">
                <label htmlFor="password-confirmacion">Confirmar contraseña <span>*</span></label>
                <input
                  id="password-confirmacion"
                  type="password"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                  disabled={loading}
                />
              </div>
              <div className="registro-actions">
                <button type="submit" className="registro-submit" disabled={loading}>
                  {loading ? "Actualizando..." : "Actualizar contraseña"}
                </button>
              </div>
            </form>
          )}

          {!isResetFlow && !requestSent && (
            <form onSubmit={submitRequest} noValidate>
              <div className="registro-field">
                <label htmlFor="email-recuperacion">Correo electrónico <span>*</span></label>
                <input
                  id="email-recuperacion"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  maxLength={100}
                  required
                  disabled={loading}
                />
              </div>
              <div className="registro-actions">
                <button type="submit" className="registro-submit" disabled={loading}>
                  {loading ? "Procesando..." : "Enviar instrucciones"}
                </button>
              </div>
            </form>
          )}

          {resetComplete && (
            <div className="registro-actions">
              <p role="status">
                {confirmationEmailSent
                  ? "Te enviamos un correo para confirmar el cambio."
                  : "No pudimos enviar el correo de confirmación, pero tu contraseña ya fue actualizada."}
              </p>
              <button type="button" className="registro-submit" onClick={() => navigate("/login")}>
                Volver a iniciar sesión
              </button>
            </div>
          )}

          {requestSent && (
            <div className="registro-actions">
              <button type="button" className="registro-submit" onClick={() => navigate("/login")}>
                Volver a iniciar sesión
              </button>
            </div>
          )}

          {!resetComplete && !requestSent && (
            <div className="registro-actions">
              <p><Link to="/login">Volver a iniciar sesión</Link></p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default RecuperarPass;
