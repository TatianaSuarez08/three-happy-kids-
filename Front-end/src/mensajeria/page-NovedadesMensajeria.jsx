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
          <p style={{ margin: "0 0 8px", color: "#555", fontSize: "13px" }}><strong>Sin novedades:</strong> no hay reportes pendientes.</p>
          <p style={{ margin: 0, color: "#555", fontSize: "13px" }}><strong>Última actualización:</strong> hace 2 horas.</p>
        </div>
      </div>
    </div>
  );
}
