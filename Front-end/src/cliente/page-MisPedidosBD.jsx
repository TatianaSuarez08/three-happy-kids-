import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/style.css";

const estados = ["Todos", "Pendiente", "En camino", "Entregado", "Cancelado"];
const estadoColor = {
  Pendiente: { bg: "#fff8e0", color: "#f0a500", emoji: "⏳" },
  "En camino": { bg: "#e8f4ff", color: "#4a90d9", emoji: "🚚" },
  Entregado: { bg: "#eafbea", color: "#3a7d44", emoji: "✅" },
  Cancelado: { bg: "#fff0f0", color: "#e53935", emoji: "❌" },
};
const formatoPrecio = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  currencyDisplay: "code",
  maximumFractionDigits: 0,
});

function MisPedidos() {
  const navigate = useNavigate();
  const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [pedidoAbierto, setPedidoAbierto] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
        const response = await fetch(`${backend}/mis-pedidos`, {
          headers: { Authorization: `Bearer ${storage.getItem("token")}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudieron cargar tus pedidos");
        setPedidos(data.orders || []);
      } catch (err) {
        setError(err.message || "No se pudieron cargar tus pedidos");
      } finally {
        setLoading(false);
      }
    };

    cargarPedidos();
  }, [backend]);

  const pedidosFiltrados = pedidos.filter((pedido) => filtroEstado === "Todos" || pedido.estado === filtroEstado);
  const totalPedidos = pedidosFiltrados.reduce((total, pedido) => total + Number(pedido.total || 0), 0);
  const cantidadProductos = pedidosFiltrados.reduce((total, pedido) => total + pedido.productos.reduce((suma, producto) => suma + Number(producto.cantidad || 0), 0), 0);

  if (loading) {
    return <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "4rem", textAlign: "center", color: "#888" }}>Cargando mis pedidos...</div>;
  }

  return (
    <div className="carrito-page">
      <div className="carrito-container">
        <button onClick={() => navigate("/catalogo")} style={{ background: "none", border: "none", color: "#ff8c42", fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: "1rem" }}>
          ← Volver al catálogo
        </button>

        <h2 className="carrito-titulo">Mis pedidos</h2>
        {error && <div className="login-error">{error}</div>}

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {estados.map((estado) => (
            <button key={estado} type="button" onClick={() => setFiltroEstado(estado)} style={{ padding: "7px 14px", borderRadius: "20px", border: filtroEstado === estado ? "1px solid #ff8c42" : "1px solid #ddd", background: filtroEstado === estado ? "#ff8c42" : "#fff", color: filtroEstado === estado ? "#fff" : "#555", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
+              {estado === "Todos" ? estado : `${estadoColor[estado].emoji} ${estado}`}
            </button>
          ))}
        </div>

        {pedidos.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: "12px", padding: "4rem 2rem", textAlign: "center" }}>
            <span style={{ fontSize: "56px", display: "block", marginBottom: "1rem" }}>📦</span>
            <h3 style={{ color: "#1a1a1a", marginBottom: "8px" }}>Aún no tienes pedidos</h3>
            <p style={{ color: "#888", marginBottom: "1.5rem" }}>Cuando realices una compra aparecerá aquí.</p>
            <button onClick={() => navigate("/catalogo")} style={{ background: "#ff8c42", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", cursor: "pointer", fontWeight: 600 }}>Ver productos</button>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: "12px", padding: "3rem", textAlign: "center", color: "#888" }}>No tienes pedidos con este estado.</div>
        ) : (
          <div className="carrito-layout">
            <div className="carrito-lista">
              {pedidosFiltrados.map((pedido) => {
                const estado = estadoColor[pedido.estado] || estadoColor.Pendiente;
                const abierto = pedidoAbierto === pedido.id;
                return (
                  <div key={pedido.id} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", padding: "1rem" }}>
                    <button type="button" onClick={() => setPedidoAbierto(abierto ? null : pedido.id)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", border: 0, background: "transparent", padding: 0, cursor: "pointer", textAlign: "left" }}>
                      <div><strong style={{ fontSize: "14px", color: "#1a1a1a" }}>Pedido #{pedido.id}</strong><small style={{ display: "block", color: "#888", marginTop: "5px" }}>{pedido.fecha} · {pedido.productos.length} producto(s)</small></div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span className="admin-badge" style={{ background: estado.bg, color: estado.color }}>{estado.emoji} {pedido.estado}</span><span style={{ fontSize: "15px", fontWeight: 700, color: "#ff8c42", whiteSpace: "nowrap" }}>{formatoPrecio.format(Number(pedido.total) || 0)}</span><span>{abierto ? "▲" : "▼"}</span></div>
                    </button>
                    {abierto && <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #eee" }}>
                      {pedido.productos.map((producto) => <div key={`${pedido.id}-${producto.nombre}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ width: "52px", height: "52px", borderRadius: "8px", background: "#f5f5f5", display: "grid", placeItems: "center", fontSize: "24px" }}>📦</div><div><strong style={{ fontSize: "14px", color: "#1a1a1a" }}>{producto.nombre}</strong><small style={{ display: "block", color: "#888", marginTop: "4px" }}>Cantidad: {producto.cantidad}</small></div></div><strong style={{ color: "#ff8c42", whiteSpace: "nowrap" }}>{formatoPrecio.format(Number(producto.subtotal) || 0)}</strong></div>)}
                      <div style={{ marginTop: "1rem", fontSize: "13px", color: "#555" }}><p><strong>Entrega:</strong> {pedido.direccion || "Sin dirección"}{pedido.ciudad ? `, ${pedido.ciudad}` : ""}</p><p><strong>Pago:</strong> {pedido.pago || "Sin registrar"}</p></div>
                    </div>}
                  </div>
                );
              })}
            </div>

            <div className="carrito-resumen">
              <h3>Resumen de mis pedidos</h3>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#555", marginBottom: "10px" }}><span>Pedidos</span><span>{pedidosFiltrados.length}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#555", marginBottom: "12px" }}><span>Productos</span><span>{cantidadProductos}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 700, color: "#1a1a1a", paddingTop: "12px", borderTop: "1px solid #eee" }}><span>Total</span><span>{formatoPrecio.format(totalPedidos)}</span></div>
              <button onClick={() => navigate("/catalogo")} style={{ width: "100%", height: "44px", borderRadius: "8px", border: "none", background: "#ff8c42", color: "#fff", fontSize: "15px", fontWeight: 600, cursor: "pointer", marginTop: "1rem" }}>Seguir comprando</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MisPedidos;
