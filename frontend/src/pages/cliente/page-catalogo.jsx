import { useSearchParams } from "react-router-dom";
import PublicProductList from "../../components/PublicProductList";

function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoria = searchParams.get("categoria");
  const busquedaActiva = searchParams.get("buscar") || "";

  const limpiarFiltros = () => {
    setSearchParams({});
  };

  return (
    <main className="hk-catalog">
      <div className="hk-catalog__container">
        <header className="hk-catalog__header">
          <div>
            <p className="hk-catalog__eyebrow">HappyKids · Colección</p>
            <h1 className="hk-catalog__title">Catálogo</h1>
            <p className="hk-catalog__description">
              Encuentra prendas para cada día. Explora los productos disponibles y sus detalles.
            </p>
          </div>
          {(categoria || busquedaActiva) && (
            <div className="hk-catalog__active-filters" aria-live="polite">
              {categoria && <span className="hk-catalog__filter-chip">Categoría seleccionada</span>}
              {busquedaActiva && (
                <span className="hk-catalog__filter-chip">
                  Búsqueda: <strong>{busquedaActiva}</strong>
                </span>
              )}
              <button className="hk-btn hk-btn--secondary" type="button" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            </div>
          )}
        </header>

        <section className="hk-catalog__results" aria-label="Productos disponibles">
        <PublicProductList />
        </section>
      </div>
    </main>
  );
}

export default Catalogo;