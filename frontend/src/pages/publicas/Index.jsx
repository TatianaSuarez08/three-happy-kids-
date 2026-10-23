import { Link } from "react-router-dom";
import PublicProductList from "../../components/PublicProductList";

function Index() {
  return (
    <main className="hk-home">
      <section className="hk-banner">
        <div className="hk-banner-card">
          <p className="hk-banner-kicker">Moda infantil para cada día</p>
          <h1 className="hk-banner-title">
            Bienvenido a HappyKids
          </h1>
          <p className="hk-banner-sub">
            Sudaderas, jeans, bermudas y mucho más para niñas y niños. Calidad y diseño en cada prenda, a los mejores precios.
          </p>
          <Link to="/catalogo" className="hk-btn hk-btn--primary">Ver colección</Link>
        </div>
      </section>

      <section className="hk-section">
        <div className="hk-section-heading">
          <h2>Productos disponibles</h2>
          <p>
          Explora los productos disponibles para tus pequeños
          </p>
        </div>
        <PublicProductList vista="inicio" />
      </section>
    </main>
  );
}

export default Index;