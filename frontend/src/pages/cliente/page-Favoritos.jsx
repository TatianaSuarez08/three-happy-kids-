import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";

function Favoritos() {
  const navigate = useNavigate();
  const favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]");

  return (
    <div className="favorites-shell">
      <div className="favorites-container">
        <h2 className="favorites-title">Mis favoritos</h2>

        {favoritos.length === 0 ? (
          <div className="empty-page__container empty-page__container--center">
            <span className="empty-page__icon empty-page__icon--accent"><Icon name="heart" size={32} /></span>
            <p className="empty-page__text">No tienes productos en favoritos.</p>
            <button className="primary-action-button" onClick={() => navigate("/")}>
              Ver productos
            </button>
          </div>
        ) : (
          <div className="favorites-grid">
            {favoritos.map((p) => (
              <div key={p.id} className="favorite-card">
                <div className="favorite-card__image">
                  <img src={p.img} alt={p.nombre} />
                </div>
                <div className="favorite-card__content">
                  <div className="favorite-card__title">{p.nombre}</div>
                  <div className="favorite-card__price">{p.precio}</div>
                  <button className="favorite-card__button" onClick={() => navigate(`/producto/${p.id}`)}>
                    Ver producto
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Favoritos;