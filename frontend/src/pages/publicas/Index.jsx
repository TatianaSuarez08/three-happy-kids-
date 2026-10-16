import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPublicProducts } from "../../services/productoService";
import ProductoCard from "../../components/ProductoCard";

const PRODUCTOS_POR_PAGINA = 20;

function Index() {
  const [searchParams] = useSearchParams();
  const busqueda = searchParams.get("buscar") || "";
  const [productos, setProductos] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PRODUCTOS_POR_PAGINA);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [hoverId, setHoverId] = useState(null);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const productosObtenidos = await getPublicProducts();
        setProductos(productosObtenidos);
        setVisibleCount(Math.min(PRODUCTOS_POR_PAGINA, productosObtenidos.length || PRODUCTOS_POR_PAGINA));
      } catch (err) {
        setError(err.message || "No se pudo conectar con la base de datos");
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  useEffect(() => {
    setVisibleCount(Math.min(PRODUCTOS_POR_PAGINA, productosFiltrados.length || PRODUCTOS_POR_PAGINA));
  }, [busqueda, productosFiltrados.length]);

  const productosVisibles = productosFiltrados.slice(0, visibleCount);
  const hayMasProductos = visibleCount < productosFiltrados.length;
  const formatoPrecio = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  return (
    <div className="page-hero">
      <section className="hk-banner">
        <div className="hk-banner-card">
          <h1 className="hk-banner-title">
            Bienvenido a HappyKids
          </h1>
          <p className="hk-banner-sub">
            Sudaderas, jeans, bermudas y mucho más para niñas y niños. Calidad y diseño en cada prenda, a los mejores precios.
          </p>
          <Link to="/catalogo" className="primary-cta">Ver colección</Link>
        </div>
      </section>

      <section className="hk-section">
        <h2 className="hk-section-title">Productos Recientes</h2>
        <p className="hk-section-subtitle">Los productos más recientes para tus pequeños</p>

        {cargando ? (
          <div className="page-empty-state">Cargando productos...</div>
        ) : error ? (
          <div className="page-empty-state page-empty-state--error">{error}</div>
        ) : productosFiltrados.length === 0 ? (
          <div className="page-empty-state">
            <span className="page-empty-state__emoji">😕</span>
            <p>No se encontraron productos para "<strong>{busqueda}</strong>"</p>
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

            {hayMasProductos && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="product-card-link"
                  onClick={() => setVisibleCount((prev) => Math.min(prev + PRODUCTOS_POR_PAGINA, productosFiltrados.length))}
                  style={{ maxWidth: "360px", width: "100%", cursor: "pointer" }}
                >
                  Mostrar más productos
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default Index;