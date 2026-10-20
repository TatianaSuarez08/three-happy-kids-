export default function NovedadesMensajeria() {
  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Novedades</h2>
            <p className="admin-sub">Reportes y observaciones del día.</p>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", boxShadow: "0 8px 20px rgba(26, 26, 26, 0.04)", padding: "1.25rem" }}>
          <p style={{ margin: 0, color: "#777", fontSize: "13px" }}>No hay información de novedades disponible.</p>
        </div>
      </div>
    </div>
  );
}
