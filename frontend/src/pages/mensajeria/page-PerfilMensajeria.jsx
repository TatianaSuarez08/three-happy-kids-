export default function PerfilMensajeria() {
  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Mi perfil</h2>
            <p className="admin-sub">Información del mensajero y configuración personal.</p>
          </div>
        </div>

        <div className="admin-surface-card admin-surface-card--plain">
          <p className="admin-empty-message">El perfil del mensajero estará disponible cuando exista un endpoint de perfil conectado.</p>
        </div>
      </div>
    </div>
  );
}
