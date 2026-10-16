import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrders } from "../../services/pedidoService";
import "../../styles/style.css";
import Icon from "../../components/Icon";

const estados = ["Todos", "Pendiente", "En preparación", "Incidencia", "Por recoger", "En camino", "Entregado", "Cancelado"];
const estadoColor = {
  Pendiente: { bg: "#fff8e0", color: "#f0a500", icon: "clock" },
  "En preparación": { bg: "#e8f4ff", color: "#4a90d9", icon: "package" },
  Incidencia: { bg: "#fff0f0", color: "#e53935", icon: "x" },
  "Por recoger": { bg: "#fff8e0", color: "#b87800", icon: "package" },
  "En camino": { bg: "#e8f4ff", color: "#4a90d9", icon: "truck" },
  Entregado: { bg: "#eafbea", color: "#3a7d44", icon: "checkCircle" },
  Cancelado: { bg: "#fff0f0", color: "#e53935", icon: "x" },
};
const formatoPrecio = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  currencyDisplay: "code",
  maximumFractionDigits: 0,
});

function MisPedidos() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [pedidoAbierto, setPedidoAbierto] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        setPedidos(await getMyOrders());
      } catch (err) {
        setError(err.message || "No se pudieron cargar tus pedidos");
      } finally {
        setLoading(false);
      }
    };

    cargarPedidos();
  }, []);

  const pedidosFiltrados = pedidos.filter((pedido) => filtroEstado === "Todos" || pedido.estado === filtroEstado);
  const totalPedidos = pedidosFiltrados.reduce((total, pedido) => total + Number(pedido.total || 0), 0);
  const cantidadProductos = pedidosFiltrados.reduce((total, pedido) => total + pedido.productos.reduce((suma, producto) => suma + Number(producto.cantidad || 0), 0), 0);

  if (loading) {
    return <div className="page-empty-state page-empty-state--loading">Cargando mis pedidos...</div>;
  }

  return (
    <div className="carrito-page">
      <div className="carrito-container">
        <button className="back-link" onClick={() => navigate("/catalogo")}>
          <Icon name="arrowLeft" size={18} /> Volver al catálogo
        </button>

        <h2 className="carrito-titulo">Mis pedidos</h2>
        {error && <div className="login-error">{error}</div>}

        <div className="orders-filter-bar">
          {estados.map((estado) => (
            <button
              key={estado}
              type="button"
              onClick={() => setFiltroEstado(estado)}
              className={filtroEstado === estado ? "orders-filter-btn is-active" : "orders-filter-btn"}
            >
              {estado === "Todos" ? estado : <><Icon name={estadoColor[estado].icon} size={16} /> {estado}</>}
            </button>
          ))}
        </div>

        {pedidos.length === 0 ? (
          <div className="orders-empty-state">
            <span className="empty-page__icon empty-page__icon--accent"><Icon name="package" size={32} /></span>
            <h3 className="orders-empty-state__title">Aún no tienes pedidos</h3>
            <p className="orders-empty-state__text">Cuando realices una compra aparecerá aquí.</p>
            <button className="primary-action-button" onClick={() => navigate("/catalogo")}>Ver productos</button>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="orders-empty-state orders-empty-state--compact">No tienes pedidos con este estado.</div>
        ) : (
          <div className="carrito-layout">
            <div className="carrito-lista">
              {pedidosFiltrados.map((pedido) => {
                const estado = estadoColor[pedido.estado] || estadoColor.Pendiente;
                const abierto = pedidoAbierto === pedido.id;
                return (
                  <div key={pedido.id} className="orders-card">
                    <button type="button" className="orders-card__toggle" onClick={() => setPedidoAbierto(abierto ? null : pedido.id)}>
                      <div>
                        <strong className="orders-card__id">Pedido #{pedido.id}</strong>
                        <small className="orders-card__meta">{pedido.fecha} · {pedido.productos.length} producto(s)</small>
                      </div>
                      <div className="orders-card__summary">
                        <span className="status-badge" style={{ background: estado.bg, color: estado.color }}><Icon name={estado.icon} size={16} /> {pedido.estado}</span>
                        <span className="orders-card__amount">{formatoPrecio.format(Number(pedido.total) || 0)}</span>
                        <Icon name={abierto ? "arrowUp" : "arrowDown"} size={16} />
                      </div>
                    </button>
                    {abierto && <div className="orders-card__details">
                      {pedido.productos.map((producto) => (
                        <div key={`${pedido.id}-${producto.nombre}`} className="orders-card__product">
                          <div className="orders-card__product-main">
                            <div className="orders-card__product-icon"><Icon name="package" size={22} /></div>
                            <div>
                              <strong className="orders-card__product-name">{producto.nombre}</strong>
                              <small className="orders-card__product-qty">Cantidad: {producto.cantidad}</small>
                            </div>
                          </div>
                          <strong className="orders-card__product-total">{formatoPrecio.format(Number(producto.subtotal) || 0)}</strong>
                        </div>
                      ))}
                      <div className="orders-card__info"><p><strong>Entrega:</strong> {pedido.direccion || "Sin dirección"}{pedido.ciudad ? `, ${pedido.ciudad}` : ""}</p><p><strong>Pago:</strong> {pedido.pago || "Sin registrar"}</p></div>
                    </div>}
                  </div>
                );
              })}
            </div>

            <div className="carrito-resumen">
              <h3>Resumen de mis pedidos</h3>
              <div className="cart-summary__row"><span>Pedidos</span><span>{pedidosFiltrados.length}</span></div>
              <div className="cart-summary__row"><span>Productos</span><span>{cantidadProductos}</span></div>
              <div className="cart-summary__row cart-summary__row--total"><span>Total</span><span>{formatoPrecio.format(totalPedidos)}</span></div>
              <button className="cart-cta" onClick={() => navigate("/catalogo")}>Seguir comprando</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MisPedidos;
