import { useNavigate } from "react-router-dom";
import { useCarrito } from "../../context/useCarrito";
import { API_BASE_URL } from "../../services/httpClient";

function Carrito() {
  const navigate = useNavigate();
  const { carrito, total, quitarDelCarrito, actualizarCantidad, vaciarCarrito } = useCarrito();
  const formatoPrecio = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  if (carrito.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "2rem 1rem" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", textAlign: "center", padding: "4rem" }}>
          <span style={{ fontSize: "64px", display: "block", marginBottom: "1rem" }}>🛒</span>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.5rem" }}>Tu carrito está vacío</h2>
          <p style={{ color: "#888", marginBottom: "1.5rem" }}>Agrega productos para continuar</p>
          <button onClick={() => navigate("/")} style={{ background: "#ff8c42", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", cursor: "pointer", fontWeight: 600, fontSize: "15px" }}>
            Ver productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a1a", marginBottom: "1.5rem" }}>Mi carrito</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>

          {/* Lista */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {carrito.map((p) => (
              <div key={p.id} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", padding: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                  <img
                    src={p.imagen_producto || p.imagen
                      ? `${API_BASE_URL}${(p.imagen_producto || p.imagen).startsWith("/assets/") ? (p.imagen_producto || p.imagen) : `/assets/productos/${p.imagen_producto || p.imagen}`}`
                      : ""}
                    alt={p.nombre}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>{p.nombre}</div>
                  <div style={{ fontSize: "15px", color: "#ff8c42", fontWeight: 700, margin: "4px 0" }}>{formatoPrecio.format(Number(p.precioVenta ?? p.precio) || 0)}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button onClick={() => actualizarCantidad(p.id, p.cantidad - 1)} disabled={p.cantidad <= 1} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "1px solid #ddd", background: "#f5f5f5", cursor: p.cantidad <= 1 ? "not-allowed" : "pointer", fontSize: "16px" }}>−</button>
                    <span style={{ fontWeight: 600 }}>{p.cantidad}</span>
                    <button onClick={() => actualizarCantidad(p.id, p.cantidad + 1)} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "1px solid #ddd", background: "#f5f5f5", cursor: "pointer", fontSize: "16px" }}>+</button>
                  </div>
                </div>
                <button onClick={() => quitarDelCarrito(p.id)} style={{ background: "none", border: "none", color: "#aaa", fontSize: "16px", cursor: "pointer" }}>✕</button>
              </div>
            ))}

            <button onClick={vaciarCarrito} style={{ background: "none", border: "1px solid #ddd", borderRadius: "8px", padding: "8px 16px", color: "#888", fontSize: "13px", cursor: "pointer", width: "fit-content" }}>
              🗑 Vaciar carrito
            </button>
          </div>

          {/* Resumen */}
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", padding: "1.5rem", position: "sticky", top: "80px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a", marginBottom: "1rem", paddingBottom: "12px", borderBottom: "1px solid #eee" }}>Resumen del pedido</h3>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#555", marginBottom: "8px" }}>
              <span>Productos ({carrito.length})</span>
              <span>{formatoPrecio.format(total)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#555", marginBottom: "12px" }}>
              <span>Envío</span>
              <span style={{ color: "#3a7d44" }}>Gratis</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 700, color: "#1a1a1a", paddingTop: "12px", borderTop: "1px solid #eee", marginBottom: "1rem" }}>
              <span>Total</span>
              <span>{formatoPrecio.format(total)}</span>
            </div>
            <button onClick={() => navigate("/confirmar-compra")} style={{ width: "100%", height: "44px", borderRadius: "8px", border: "none", background: "#ff8c42", color: "#fff", fontSize: "15px", fontWeight: 600, cursor: "pointer", marginBottom: "10px" }}>
              Confirmar compra →
            </button>
            <button onClick={() => navigate("/")} style={{ width: "100%", height: "44px", borderRadius: "8px", border: "1px solid #ddd", background: "transparent", color: "#444", fontSize: "15px", fontWeight: 500, cursor: "pointer" }}>
              Seguir comprando
            </button>
            <button onClick={() => navigate("/mis-pedidos")} style={{ width: "100%", height: "44px", borderRadius: "8px", border: "1px solid #ddd", background: "transparent", color: "#444", fontSize: "15px", fontWeight: 500, cursor: "pointer", marginTop: "10px" }}>
              Ver mis pedidos
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Carrito;