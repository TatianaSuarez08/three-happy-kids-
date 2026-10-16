const NovedadesMensajeria = () => {
  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Novedades</h2>
            <p className="admin-sub">Reportes y observaciones del día.</p>
          </div>
        </div>

        <div className="admin-surface-card admin-surface-card--plain">
          <p className="admin-empty-message">No hay información de novedades disponible.</p>
        </div>
      </div>
    </div>
  );
};

export default NovedadesMensajeria;
