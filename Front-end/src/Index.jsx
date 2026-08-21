import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

function Index() {
  const [searchParams] = useSearchParams();
  const busqueda = searchParams.get("buscar") || "";
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [hoverBtn, setHoverBtn] = useState(null);
  const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const response = await fetch(`${backend}/productos-publicos`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "No se pudieron cargar los productos");
        }

        setProductos(data.products || []);
      } catch (err) {
        setError(err.message || "No se pudo conectar con la base de datos");
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, [backend]);

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );
  const formatoPrecio = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

      <style>{`
        .hk-banner { padding: 4rem 1.5rem 3rem; max-width: 1100px; margin: 0 auto; }
        .hk-banner-title { font-size: 40px; }
        .hk-productos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }

        @media (max-width: 640px) {
          .hk-banner { padding: 2rem 1rem 1.5rem; }
          .hk-banner-title { font-size: 28px; }
          .hk-banner-sub { font-size: 14px; }
          .hk-productos-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .hk-section { padding: 0 1rem 2.5rem !important; }
        }

        @media (max-width: 380px) {
          .hk-productos-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Banner */}
      <section className="hk-banner">
        <div style={{ maxWidth: "520px" }}>
          <h1 className="hk-banner-title" style={{ fontWeight: 700, letterSpacing: "-0.5px", color: "#1a1a1a", margin: "0 0 8px" }}>
            Bienvenido a HappyKids
          </h1>
          <p className="hk-banner-sub" style={{ fontSize: "16px", color: "#8a8a8a", fontWeight: 400, lineHeight: 1.5, margin: 0 }}>
            Sudaderas, jeans, bermudas y mucho más para niñas y niños. Calidad y diseño en cada prenda, a los mejores precios.
          </p>
        </div>
      </section>

      {/* Productos */}
      <section className="hk-section" style={{ padding: "0 1.5rem 4rem", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 4px" }}>
          Productos Recientes
        </h2>
        <p style={{ fontSize: "14px", color: "#8a8a8a", fontWeight: 400, margin: "0 0 1.5rem" }}>
          Los productos más recientes para tus pequeños
        </p>

        {cargando ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#8a8a8a" }}>
            Cargando productos...
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#a32d2d" }}>
            {error}
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#8a8a8a" }}>
            <span style={{ fontSize: "40px", display: "block", marginBottom: "12px" }}>😕</span>
            <p>No se encontraron productos para "<strong>{busqueda}</strong>"</p>
          </div>
        ) : (
          <div className="hk-productos-grid">
            {productosFiltrados.map((p) => (
              <div
                key={p.id}
                style={{
                  background: "#fff",
                  border: "1px solid #eeeeee",
                  borderRadius: "8px",
                  overflow: "hidden",
                  transition: "border-color 0.2s ease",
                }}
              >
                <div style={{ aspectRatio: "1 / 1", overflow: "hidden" }}>
                  <img
                    src={p.imagen_producto
                      ? `${backend}${p.imagen_producto.startsWith("/assets/") ? p.imagen_producto : `/assets/productos/${p.imagen_producto}`}`
                      : ""}
                    alt={p.nombre}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ padding: "14px 16px 18px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#1a1a1a", display: "block", marginBottom: "4px" }}>
                    {p.nombre}
                  </span>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "#ff8c42", display: "block", marginBottom: "14px" }}>
                    {formatoPrecio.format(Number(p.precio) || 0)}
                  </span>
                  <Link
                    to={`/producto/${p.id}`}
                    onMouseEnter={() => setHoverBtn(p.id)}
                    onMouseLeave={() => setHoverBtn(null)}
                    style={{
                      display: "block",
                      textAlign: "center",
                      border: `1px solid ${hoverBtn === p.id ? "#ff8c42" : "#eeeeee"}`,
                      color: hoverBtn === p.id ? "#ff8c42" : "#1a1a1a",
                      borderRadius: "6px",
                      padding: "9px 0",
                      fontWeight: 500,
                      fontSize: "13px",
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                    }}
                  >
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

export default Index;