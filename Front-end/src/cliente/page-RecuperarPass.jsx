import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/style.css";

function RecuperarPass() {
  const emailRef = useRef(null);
  const codValRef = useRef(null);
  const navigate = useNavigate();

  const [emailBloq, setEmailBloq] = useState(false);
  const [mostrarValida, setMostrarValida] = useState(false);
  const [modal, setModal] = useState(null);

  const correoValida = (e) => {
    e.preventDefault();
    setEmailBloq(true);
    setModal("enviado");
  };

  const modalExito = () => {
    setModal(null);
    setMostrarValida(true);
  };

  const validaCod = () => {
    const ingresado = parseInt(codValRef.current.value);
    if (!codValRef.current.value) {
      setModal("advertencia");
      return;
    }
    if (ingresado === 123456) {
      setModal("validado");
    } else {
      setModal("advertencia");
    }
  };

  const modalAdvertencia = () => setModal(null);

  const modalIngresa = () => {
    setModal(null);
    navigate("/");
  };

  const cancelar = () => navigate("/");

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">
          <div className="login-logo-icon">🔑</div>
          <h1>Recuperar contraseña</h1>
          <p>Te enviaremos un código a tu correo</p>
        </div>

        {/* Formulario correo */}
        <form onSubmit={correoValida}>
          <div className="login-field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              ref={emailRef}
              placeholder="correo@ejemplo.com"
              readOnly={emailBloq}
              required
            />
          </div>
          <div className="botones" style={{ marginTop: "1rem" }}>
            <button type="submit" className="btn-ingresar" disabled={emailBloq}>
              {emailBloq ? "Código enviado" : "Enviar código"}
            </button>
          </div>
        </form>

        {/* Formulario validación */}
        {mostrarValida && (
          <form style={{ marginTop: "1.5rem" }} onSubmit={(e) => e.preventDefault()}>
            <p style={{ fontSize: "13px", color: "#888", marginBottom: "1rem" }}>
              Ingresa el código de validación que llegó a tu correo.
            </p>
            <div className="login-field">
              <label htmlFor="cod">Código de validación</label>
              <input
                type="number"
                id="cod"
                ref={codValRef}
                placeholder="123456"
              />
            </div>
            <div className="botones" style={{ marginTop: "1rem" }}>
              <button type="button" className="btn-ingresar" onClick={validaCod}>
                Validar código
              </button>
              <button type="button" className="btn-registro" onClick={cancelar}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {!mostrarValida && (
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <button className="btn-registro" onClick={cancelar}>
              Volver al inicio de sesión
            </button>
          </div>
        )}
      </div>

      {/* Modal: código enviado */}
      {modal === "enviado" && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4 style={{ color: "#3a7d44" }}>¡Código enviado!</h4>
            <p>Revisa tu bandeja de entrada. Hemos enviado un código de validación.</p>
            <button className="btn-ingresar" onClick={modalExito}>Aceptar</button>
          </div>
        </div>
      )}

      {/* Modal: advertencia */}
      {modal === "advertencia" && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4 style={{ color: "#b8860b" }}>¡Advertencia!</h4>
            <p>El código ingresado es incorrecto o está vacío. Intenta de nuevo.</p>
            <button className="btn-ingresar" onClick={modalAdvertencia}>Aceptar</button>
          </div>
        </div>
      )}

      {/* Modal: validado */}
      {modal === "validado" && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4 style={{ color: "#3a7d44" }}>¡Validado!</h4>
            <p>El código ha sido validado correctamente.</p>
            <button className="btn-ingresar" onClick={modalIngresa}>Continuar</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default RecuperarPass;