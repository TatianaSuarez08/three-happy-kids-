import { useEffect, useRef, useState } from "react";
import EmptyState from "../../components/EmptyState";
import { getDeliveryEvidenceObjectUrl, getOrders } from "../../services/pedidoService";

const estados = ["Pendiente", "En camino", "Entrega fallida", "Entregado", "Cancelado"];
const estadoColor = {
  Pendiente: { icon: "bi-hourglass-split", className: "status-warning" },
  "En camino": { icon: "bi-truck", className: "status-info" },
  "Entrega fallida": { icon: "bi-exclamation-triangle-fill", className: "status-danger" },
  Entregado: { icon: "bi-check-circle-fill", className: "status-success" },
  Cancelado: { icon: "bi-x-circle-fill", className: "status-danger" },
};
const formatoPrecio = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  currencyDisplay: "code",
  maximumFractionDigits: 0,
});

function EvidencePreview({ orderId }) {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const imageUrlRef = useRef('');

  useEffect(() => () => {
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
  }, []);

  const loadEvidence = async () => {
    setLoading(true);
    setError('');
    try {
      const nextUrl = await getDeliveryEvidenceObjectUrl(orderId);
      if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
      imageUrlRef.current = nextUrl;
      setImageUrl(nextUrl);
    } catch (err) {
      setError(err.message || 'No se pudo consultar la evidencia.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!imageUrl && (
        <button type="button" className="btn-admin-editar" onClick={loadEvidence} disabled={loading}>
          {loading ? 'Cargando evidencia...' : 'Consultar evidencia'}
        </button>
      )}
      {error && <p role="alert">{error}</p>}
      {imageUrl && <img src={imageUrl} alt={`Evidencia de entrega del pedido ${orderId}`} style={{ display: 'block', maxWidth: '100%', maxHeight: 320, marginTop: 12 }} />}
    </div>
  );
}

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
              {estado === "todos" ? "Todos" : <><i className={`bi ${estadoColor[estado].icon}`} aria-hidden="true" /> {estado}</>}
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
                    <span className={`status-badge ${estado.className}`}><i className={`bi ${estado.icon}`} aria-hidden="true" /> {pedido.estado}</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 280px", gap: "1.5rem", alignItems: "start" }}>
                    <div className="admin-order-products">
                      {pedido.productos.map((producto) => (
                        <div key={`${pedido.id}-${producto.nombre}`} className="admin-order-product">
                          <div><strong style={{ color: "#1a1a1a", fontSize: "14px" }}>{producto.nombre}</strong><small style={{ display: "block", color: "#888", marginTop: "4px" }}>Cantidad: {producto.cantidad} · Talla: {producto.talla || "N/D"} · Color: {producto.color || "N/D"}</small></div>
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
                      <p style={{ fontSize: "13px", color: "#555", margin: "0 0 8px" }}><strong>Preparación:</strong> {pedido.estadoPreparacion || "Pendiente"} · <strong>Entrega:</strong> {pedido.estadoEntrega || pedido.estado}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #eee", marginTop: "1rem", paddingTop: "1rem", fontSize: "18px", fontWeight: 700, color: "#1a1a1a" }}><span>Total</span><span>{formatoPrecio.format(Number(pedido.total) || 0)}</span></div>
                    </aside>
                  </div>

                  <div className="admin-order-action">
                    <h4 style={{ margin: 0 }}>Trazabilidad de actividades</h4>
                    {pedido.historial.length === 0 ? (
                      <p>No hay acciones históricas registradas para este pedido.</p>
                    ) : (
                      <ul>
                        {pedido.historial.map((event) => (
                          <li key={event.id}>
                            <strong>{event.evento}</strong>
                            {' · '}{event.usuario} ({event.rol})
                            {' · '}{new Date(event.fecha).toLocaleString("es-CO")}
                            {event.observacion ? ` · ${event.observacion}` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                    {pedido.fechaEntrega && (
                      <p><strong>Fecha de entrega registrada:</strong> {new Date(pedido.fechaEntrega).toLocaleDateString("es-CO")}</p>
                    )}
                  </div>
                  {pedido.evidencia && (
                    <section>
                      <h4>Evidencia de entrega</h4>
                      <p>Guardada {pedido.fechaEvidencia ? new Date(pedido.fechaEvidencia).toLocaleString("es-CO") : ""}</p>
                      <EvidencePreview orderId={pedido.id} />
                    </section>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

export default Pedidos;
