export default function RutaMensajeria() {
  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Ruta / Mapa</h2>
            <p className="admin-sub">Vista general de tus paradas programadas.</p>
          </div>
        </div>

        <div className="admin-route-panel">
          <div className="admin-route-header">
            <div>
              <h3>Ruta de entregas</h3>
              <p>La ruta estará disponible cuando exista la información logística correspondiente.</p>
            </div>
          </div>

          <div className="admin-route-empty">
            No hay datos de ruta disponibles.
          </div>
        </div>
      </div>
    </div>
  );
}
