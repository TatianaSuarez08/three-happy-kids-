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

        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", overflow: "hidden", boxShadow: "0 8px 20px rgba(26, 26, 26, 0.04)", padding: "1.25rem 1.35rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <div>
              <h3 style={{ margin: 0, color: "#1a1a1a", fontSize: "18px" }}>Ruta de entregas</h3>
              <p style={{ margin: "5px 0 0", color: "#888", fontSize: "13px" }}>La ruta estará disponible cuando exista la información logística correspondiente.</p>
            </div>
          </div>

          <div style={{ borderRadius: "12px", background: "#fafafa", overflow: "hidden", border: "1px solid #e7e7e7", padding: "4rem 1rem", textAlign: "center", color: "#777" }}>
            No hay datos de ruta disponibles.
          </div>
        </div>
      </div>
    </div>
  );
}
