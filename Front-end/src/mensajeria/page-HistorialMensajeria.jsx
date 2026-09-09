export default function HistorialMensajeria() {
  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Historial</h2>
            <p className="admin-sub">Resumen de entregas completadas y fallidas.</p>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", boxShadow: "0 8px 20px rgba(26, 26, 26, 0.04)", padding: "1.25rem" }}>
          <p style={{ margin: "0 0 8px", color: "#555", fontSize: "13px" }}><strong>Entregas completadas:</strong> 24</p>
          <p style={{ margin: "0 0 8px", color: "#555", fontSize: "13px" }}><strong>Fallidas:</strong> 2</p>
          <p style={{ margin: 0, color: "#555", fontSize: "13px" }}><strong>Promedio:</strong> 96% de cumplimiento.</p>
        </div>
      </div>
    </div>
  );
}
