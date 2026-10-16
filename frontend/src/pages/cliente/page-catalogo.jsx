import { useEffect, useState } from "react";
import { getPublicProducts } from "../../services/productoService";
import ProductoCard from "../../components/ProductoCard";
import "../../styles/style.css";

const PRODUCTOS_POR_PAGINA = 20;

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PRODUCTOS_POR_PAGINA);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [hoverId, setHoverId] = useState(null);
  const formatoPrecio = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const productosObtenidos = await getPublicProducts();
        setProductos(productosObtenidos);
        setVisibleCount(Math.min(PRODUCTOS_POR_PAGINA, productosObtenidos.length || PRODUCTOS_POR_PAGINA));
      } catch (err) {
        setError(err.message || "Base de datos no disponible.");
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  const productosVisibles = productos.slice(0, visibleCount);
  const hayMasProductos = visibleCount < productos.length;

  return (
    <div className="page-hero">
      <section className="hk-section" style={{ paddingTop: "2rem" }}>
        {cargando ? (
          <div className="page-empty-state">Esperando datos del servidor...</div>
        ) : error ? (
          <div className="page-empty-state page-empty-state--error">{error}</div>
        ) : productos.length === 0 ? (
          <div className="page-empty-state">
            <span className="page-empty-state__emoji">😕</span>
            <p>No hay productos disponibles.</p>
          </div>
        ) : (
          <>
            <div className="hk-productos-grid">
              {productosVisibles.map((p) => (
                <ProductoCard
                  key={p.id}
                  producto={p}
                  formatoPrecio={formatoPrecio}
                  hoverId={hoverId}
                  setHoverId={setHoverId}
                />
              ))}
            </div>

            {hayMasProductos ? (
              <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="product-card-link"
                  onClick={() => setVisibleCount((prev) => Math.min(prev + PRODUCTOS_POR_PAGINA, productos.length))}
                  style={{ maxWidth: "360px", width: "100%", cursor: "pointer" }}
                >
                  Mostrar más productos
                </button>
              </div>
            ) : (
              <div className="page-empty-state" style={{ paddingTop: "1.5rem", paddingBottom: "0.75rem" }}>
                <p>Has visto todos los productos.</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default Catalogo;