import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getPublicProducts } from "../services/productoService";
import { ProductImage, ProductImageCredits } from "./ProductImage";

function PublicProductList({ vista = "catalogo" }) {
  const [searchParams] = useSearchParams();
  const categoria = vista === "catalogo" ? searchParams.get("categoria") || "" : "";
  const busqueda = (searchParams.get("buscar") || "").trim().toLocaleLowerCase("es");
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intentos, setIntentos] = useState(0);
  const formatoPrecio = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    let vigente = true;
    const cargarProductos = async () => {
      setCargando(true);
      setError("");
      try {
        const resultados = await getPublicProducts(categoria ? { categoria } : {});
        if (vigente) setProductos(resultados);
      } catch (err) {
        if (vigente) {
          setError(
            err instanceof TypeError
              ? "No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo."
              : err.message || "No se pudieron cargar los productos."
          );
        }
      } finally {
        if (vigente) setCargando(false);
      }
    };

    cargarProductos();
    return () => { vigente = false; };
  }, [categoria, intentos]);

  const productosFiltrados = useMemo(
    () => productos.filter((producto) => String(producto.nombre || "").toLocaleLowerCase("es").includes(busqueda)),
    [productos, busqueda]
  );
  const productosMostrados = vista === "inicio" ? productosFiltrados.slice(0, 6) : productosFiltrados;

  if (cargando) {
    return (
      <div className={`hk-product-state hk-product-state--${vista}`} role="status">
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`hk-product-state hk-product-state--${vista} hk-product-state--error`} role="alert">
        <p>{error}</p>
        <button
          className="hk-btn hk-btn--secondary"
          type="button"
          onClick={() => setIntentos((actual) => actual + 1)}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (productosFiltrados.length === 0) {
    return (
      <div className={`hk-product-state hk-product-state--${vista}`}>
        <p>
          {vista === "inicio"
            ? <>No se encontraron productos para "<strong>{searchParams.get("buscar") || ""}</strong>"</>
            : busqueda
              ? "No se encontraron productos con esa búsqueda."
              : "No hay productos disponibles."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={`public-product-grid public-product-grid--${vista}`}>
        {productosMostrados.map((producto) => {
          const precio = Number(producto.precio);
          const precioDisponible = producto.precio !== null
            && producto.precio !== undefined
            && String(producto.precio).trim() !== ""
            && Number.isFinite(precio)
            && precio >= 0;
          return (
            <article key={producto.id} className="hk-card hk-card--product home-producto-card">
              <ProductImage product={producto} className="home-producto-img" />
              <div className="home-producto-info">
                <span className="home-producto-nombre">
                  {producto.nombre}
                </span>
                {vista === "catalogo" && (producto.talla || producto.color) && (
                  <span className="home-producto-variante">
                    {[producto.talla && `Talla ${producto.talla}`, producto.color && `Color ${producto.color}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                )}
                <span className="home-producto-precio">
                  {precioDisponible
                    ? formatoPrecio.format(precio)
                    : "Precio no disponible"}
                </span>
                {Number(producto.stock) <= 0 && <span className="home-producto-agotado">Agotado</span>}
                <Link to={`/producto/${producto.id}`} className="hk-btn hk-btn--secondary home-producto-btn">
                  Ver producto
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      {vista === "inicio" && (
        <Link to="/catalogo" className="hk-btn hk-btn--secondary public-product-more">
          Ver más
        </Link>
      )}
      <ProductImageCredits products={productosMostrados} />
    </>
  );
}

export default PublicProductList;
