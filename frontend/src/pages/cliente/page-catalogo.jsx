import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPublicProducts } from "../../services/productoService";
import { API_BASE_URL } from "../../services/httpClient";
import "../../styles/style.css";

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const formatoPrecio = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setProductos(await getPublicProducts());
      } catch (err) {
        setError(err.message || "Base de datos no disponible.");
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  return (
    <div className="home-page">

      <section className="home-section" style={{ paddingTop: "2rem" }}>
        {cargando ? (
          <div className="home-no-results">
            <p>Esperando datos del servidor...</p>
          </div>
        ) : error ? (
          <div className="home-no-results">
            <p>{error}</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="home-no-results">
            <span>😕</span>
            <p>No hay productos disponibles.</p>
          </div>
        ) : (
          <div className="home-productos">
            {productos.map((p) => (
              <div key={p.id} className="home-producto-card">
                <div className="home-producto-img">
                  <img
                    src={p.imagen_producto
                      ? `${API_BASE_URL}${p.imagen_producto.startsWith("/assets/") ? p.imagen_producto : `/assets/productos/${p.imagen_producto}`}`
                      : ""}
                    alt={p.nombre}
                  />
                </div>
                <div className="home-producto-info">
                  <span className="home-producto-nombre">{p.nombre}</span>
                  <span className="home-producto-precio">{formatoPrecio.format(Number(p.precio) || 0)}</span>
                  <Link to={`/producto/${p.id}`} className="home-producto-btn">
                    Ver producto
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

export default Catalogo;