import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../Context/CarritoContext";
import "../styles/style.css";

function ConfirmarCompra() {
  const { carrito, total, vaciarCarrito } = useCarrito();
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    direccion: "",
    ciudad: "",
    telefono: "",
    pago: "efectivo",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.direccion || !form.ciudad || !form.telefono) return;
    setModal("exito");
  };

  const modalExito = () => {
    vaciarCarrito();
    setModal(null);
    navigate("/");
  };

  if (carrito.length === 0) {
    navigate("/");
    return null;
  }

  return (
    <div className="carrito-page">
      <div className="carrito-container">
        <h2 className="carrito-titulo">Confirmar compra</h2>

        <div className="carrito-layout">

          {/* Formulario */}
          <div className="carrito-lista">
            <form onSubmit={handleSubmit}>

              <h3 className="confirmar-subtitulo">📍 Dirección de envío</h3>

              <div className="confirmar-field">
                <label>Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  placeholder="Ej: Calle 123 # 45-67"
                  value={form.direccion}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="confirmar-field">
                <label>Ciudad</label>
                <input
                  type="text"
                  name="ciudad"
                  placeholder="Ej: Bogotá"
                  value={form.ciudad}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="confirmar-field">
                <label>Teléfono de contacto</label>
                <input
                  type="tel"
                  name="telefono"
                  placeholder="Ej: 3001234567"
                  value={form.telefono}
                  onChange={handleChange}
                  required
                />
              </div>

              <h3 className="confirmar-subtitulo" style={{ marginTop: "1.5rem" }}>
                💳 Método de pago
              </h3>

              <div className="confirmar-metodos">
                {[
                  { id: "efectivo", label: "💵 Efectivo contra entrega" },
                  { id: "transferencia", label: "🏦 Transferencia bancaria" },
                  { id: "nequi", label: "📱 Nequi" },
                  { id: "daviplata", label: "📱 Daviplata" },
                ].map((m) => (
                  <label
                    key={m.id}
                    className={`confirmar-metodo ${form.pago === m.id ? "activo" : ""}`}
                  >
                    <input
                      type="radio"
                      name="pago"
                      value={m.id}
                      checked={form.pago === m.id}
                      onChange={handleChange}
                    />
                    {m.label}
                  </label>
                ))}
              </div>

              <div className="confirmar-botones">
                <button type="submit" className="btn-ingresar">
                  ✅ Realizar pedido
                </button>
                <button
                  type="button"
                  className="btn-registro"
                  onClick={() => navigate("/carrito")}
                >
                  ← Volver al carrito
                </button>
              </div>

            </form>
          </div>

          {/* Resumen */}
          <div className="carrito-resumen">
            <h3>Resumen del pedido</h3>
            {carrito.map((p) => (
              <div key={p.id} className="carrito-resumen-linea">
                <span>{p.nombre} x{p.cantidad}</span>
                <span>{p.precio}</span>
              </div>
            ))}
            <div className="carrito-resumen-linea">
              <span>Envío</span>
              <span style={{ color: "#3a7d44" }}>Gratis</span>
            </div>
            <div className="carrito-resumen-total">
              <span>Total</span>
              <span>${total.toLocaleString("es-CO")}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Modal éxito */}
      {modal === "exito" && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4 style={{ color: "#3a7d44" }}>¡Pedido realizado!</h4>
            <p>Tu pedido ha sido confirmado. Pronto nos pondremos en contacto contigo.</p>
            <button className="btn-ingresar" onClick={modalExito}>Aceptar</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default ConfirmarCompra;