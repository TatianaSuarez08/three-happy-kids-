import { useNavigate } from "react-router-dom";
import { useCarrito } from "../../Context/useCarrito";
import { API_BASE_URL } from "../../services/httpClient";
import Icon from "../../components/Icon";

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
      <div className="empty-page">
        <div className="empty-page__container empty-page__container--center">
          <span className="empty-page__icon empty-page__icon--accent"><Icon name="cart" size={32} /></span>
          <h2 className="empty-page__title">Tu carrito está vacío</h2>
          <p className="empty-page__text">Agrega productos para continuar</p>
          <button className="primary-action-button" onClick={() => navigate("/")}>
            Ver productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="empty-page">
      <div className="cart-shell">
        <h2 className="cart-title">Mi carrito</h2>

        <div className="cart-layout">
          <div className="cart-list">
            {carrito.map((p) => (
              <div key={p.id} className="cart-item">
                <div className="cart-item__image">
                  <img
                    src={p.imagen_producto || p.imagen
                      ? `${API_BASE_URL}${(p.imagen_producto || p.imagen).startsWith("/assets/") ? (p.imagen_producto || p.imagen) : `/assets/productos/${p.imagen_producto || p.imagen}`}`
                      : ""}
                    alt={p.nombre}
                  />
                </div>
                <div className="cart-item__content">
                  <div className="cart-item__title">{p.nombre}</div>
                  <div className="cart-item__price">{formatoPrecio.format(Number(p.precioVenta ?? p.precio) || 0)}</div>
                  <div className="quantity-controls">
                    <button className="qty-button" onClick={() => actualizarCantidad(p.id, p.cantidad - 1)} disabled={p.cantidad <= 1}>−</button>
                    <span className="qty-value">{p.cantidad}</span>
                    <button className="qty-button" onClick={() => actualizarCantidad(p.id, p.cantidad + 1)}>+</button>
                  </div>
                </div>
                <button className="cart-remove-button" onClick={() => quitarDelCarrito(p.id)}>✕</button>
              </div>
            ))}

            <button className="cart-clear-button" onClick={vaciarCarrito}>
              <Icon name="trash" size={16} /> Vaciar carrito
            </button>
          </div>

          <aside className="cart-summary">
            <h3 className="cart-summary__title">Resumen del pedido</h3>
            <div className="cart-summary__row">
              <span>Productos ({carrito.length})</span>
              <span>{formatoPrecio.format(total)}</span>
            </div>
            <div className="cart-summary__row">
              <span>Envío</span>
              <span className="cart-summary__status">Gratis</span>
            </div>
            <div className="cart-summary__row cart-summary__row--total">
              <span>Total</span>
              <span>{formatoPrecio.format(total)}</span>
            </div>
            <button className="cart-cta" onClick={() => navigate("/confirmar-compra")}>
              Confirmar compra →
            </button>
            <button className="cart-secondary" onClick={() => navigate("/")}>
              Seguir comprando
            </button>
            <button className="cart-secondary" onClick={() => navigate("/mis-pedidos")}>
              Ver mis pedidos
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Carrito;