import { Link } from "react-router-dom";
import { API_BASE_URL } from "../services/httpClient";

function ProductoCard({ producto, formatoPrecio, hoverId, setHoverId }) {
  const isHovered = hoverId === producto.id;

  return (
    <div key={producto.id} className="product-card">
      <div className="product-card-image">
        <img
          src={producto.imagen_producto
            ? `${API_BASE_URL}${producto.imagen_producto.startsWith("/assets/") ? producto.imagen_producto : `/assets/productos/${producto.imagen_producto}`}`
            : ""}
          alt={producto.nombre}
        />
      </div>
      <div className="product-card-body">
        <span className="product-card-name">{producto.nombre}</span>
        <span className="product-card-price">{formatoPrecio.format(Number(producto.precio) || 0)}</span>
        <Link
          to={`/producto/${producto.id}`}
          onMouseEnter={() => setHoverId(producto.id)}
          onMouseLeave={() => setHoverId(null)}
          className={isHovered ? "product-card-link is-hovered" : "product-card-link"}
        >
          Ver producto
        </Link>
      </div>
    </div>
  );
}

export default ProductoCard;
