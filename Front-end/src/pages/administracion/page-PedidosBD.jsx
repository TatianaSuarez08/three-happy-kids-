import { useEffect, useState } from "react";
import "../../styles/style.css";
import EmptyState from "../../components/EmptyState";
import { getOrders, updateOrderStatus } from "../../services/pedidoService";

const estados = ["Pendiente", "En camino", "Entregado", "Cancelado"];
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

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [estadoNuevo, setEstadoNuevo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        setPedidos(await getOrders());
      } catch (err) {
        setError(err.message || "No se pudieron cargar los pedidos");
      } finally {
        setLoading(false);
      }
    };

    cargarPedidos();
  }, []);

  const actualizarEstado = async () => {
    if (!pedidoSeleccionado || !estadoNuevo) return;
    setGuardando(true);
    setError("");
    try {
      await updateOrderStatus(pedidoSeleccionado.id, estadoNuevo);
      setPedidos((prev) => prev.map((pedido) => (
        pedido.id === pedidoSeleccionado.id ? { ...pedido, estado: estadoNuevo } : pedido
      )));
      setPedidoSeleccionado(null);
      setEstadoNuevo("");
    } catch (err) {
      setError(err.message || "No se pudo actualizar el pedido");
    } finally {
      setGuardando(false);
    }
  };

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const texto = busqueda.toLowerCase();
    const coincideBusqueda = pedido.cliente.toLowerCase().includes(texto)
      || pedido.correo.toLowerCase().includes(texto)
      || String(pedido.id).includes(texto);
    return coincideBusqueda && (filtroEstado === "todos" || pedido.estado === filtroEstado);
  });

  return (
    <div className="admin-page">
      <div className="admin-container" style={{ maxWidth: "1100px" }}>
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Pedidos</h2>
            <p className="admin-sub">Pedidos reales registrados en la base de datos</p>
          </div>
          <strong style={{ color: "#555" }}>{pedidosFiltrados.length} pedido(s)</strong>
        </div>

        {error && <div className="login-error">{error}</div>}

        <div className="admin-toolbar">
          {["todos", ...estados].map((estado) => (
            <button key={estado} type="button" onClick={() => setFiltroEstado(estado)} className={`admin-pill ${filtroEstado === estado ? "active" : ""}`}>
              {estado === "todos" ? "Todos" : `${estadoColor[estado].emoji} ${estado}`}
            </button>
          ))}
        </div>

        <div className="admin-search" style={{ marginBottom: "1.5rem" }}>
          <span>🔍</span>
          <input type="text" placeholder="Buscar por cliente, correo o número..." value={busqueda} onChange={(event) => setBusqueda(event.target.value)} />
        </div>

        {loading ? (
          <EmptyState>Cargando pedidos...</EmptyState>
        ) : pedidosFiltrados.length === 0 ? (
          <EmptyState>No se encontraron pedidos</EmptyState>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {pedidosFiltrados.map((pedido) => {
              const estado = estadoColor[pedido.estado] || estadoColor.Pendiente;
              return (
                <section key={pedido.id} className="admin-order-card">
                  <div className="admin-order-header">
                    <div>
                      <h3 style={{ fontSize: "16px", color: "#1a1a1a", margin: 0 }}>Pedido #{pedido.id}</h3>
                      <p style={{ color: "#888", fontSize: "13px", margin: "5px 0 0" }}>{pedido.cliente} · {pedido.fecha}</p>
                    </div>
                    <span className="status-badge" style={{ background: estado.bg, color: estado.color }}>{estado.emoji} {pedido.estado}</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 280px", gap: "1.5rem", alignItems: "start" }}>
                    <div className="admin-order-products">
                      {pedido.productos.map((producto) => (
                        <div key={`${pedido.id}-${producto.nombre}`} className="admin-order-product">
                          <div><strong style={{ color: "#1a1a1a", fontSize: "14px" }}>{producto.nombre}</strong><small style={{ display: "block", color: "#888", marginTop: "4px" }}>Cantidad: {producto.cantidad}</small></div>
                          <strong style={{ color: "#ff8c42", whiteSpace: "nowrap" }}>{formatoPrecio.format(Number(producto.subtotal) || 0)}</strong>
                        </div>
                      ))}
                    </div>

                    <aside className="admin-order-summary">
                      <h4 style={{ fontSize: "15px", color: "#1a1a1a", margin: "0 0 1rem", paddingBottom: "10px", borderBottom: "1px solid #eee" }}>Resumen del pedido</h4>
                      <p style={{ fontSize: "13px", color: "#555", margin: "0 0 8px" }}><strong>Cliente:</strong> {pedido.cliente}</p>
                      <p style={{ fontSize: "13px", color: "#555", margin: "0 0 8px" }}><strong>Correo:</strong> {pedido.correo}</p>
                      <p style={{ fontSize: "13px", color: "#555", margin: "0 0 8px" }}><strong>Entrega:</strong> {pedido.direccion || "Sin dirección"}{pedido.ciudad ? `, ${pedido.ciudad}` : ""}</p>
                      <p style={{ fontSize: "13px", color: "#555", margin: "0 0 8px" }}><strong>Pago:</strong> {pedido.pago || "Sin registrar"}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #eee", marginTop: "1rem", paddingTop: "1rem", fontSize: "18px", fontWeight: 700, color: "#1a1a1a" }}><span>Total</span><span>{formatoPrecio.format(Number(pedido.total) || 0)}</span></div>
                    </aside>
                  </div>

                  <div className="admin-order-action">
                    <span style={{ fontSize: "13px", color: "#888" }}>Cambiar estado del pedido</span>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {estados.filter((opcion) => opcion !== pedido.estado).map((opcion) => (
                        <button key={opcion} type="button" className="btn-admin-editar" onClick={() => { setPedidoSeleccionado(pedido); setEstadoNuevo(opcion); }}>
                          {estadoColor[opcion].emoji} {opcion}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {pedidoSeleccionado && <div className="modal-overlay"><div className="modal-box"><h4>Actualizar pedido</h4><p>¿Cambiar el pedido #{pedidoSeleccionado.id} a <strong>{estadoNuevo}</strong>?</p><div className="admin-modal-actions"><button className="btn-admin-primary" style={{ height: "44px" }} onClick={actualizarEstado} disabled={guardando}>{guardando ? "Guardando..." : "Sí, cambiar"}</button><button className="btn-admin-cancelar" style={{ height: "44px" }} onClick={() => setPedidoSeleccionado(null)}>Cancelar</button></div></div></div>}
    </div>
  );
}

export default Pedidos;
