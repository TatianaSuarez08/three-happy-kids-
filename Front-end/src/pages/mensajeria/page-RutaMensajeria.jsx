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
              <p style={{ margin: "5px 0 0", color: "#888", fontSize: "13px" }}>12 de 15 paradas · turno 8:00 a. m. - 5:00 p. m.</p>
            </div>
            <span className="status-badge" style={{ background: "#fff8e0", color: "#b87800" }}>Activa</span>
          </div>

          <div style={{ position: "relative", height: "420px", borderRadius: "12px", background: "linear-gradient(135deg, #edf3f5 0%, #e7eef2 100%)", overflow: "hidden", border: "1px solid #e7e7e7" }}>
            <span style={{ position: "absolute", width: "28px", height: "28px", borderRadius: "50%", background: "#ff8c42", color: "#fff", display: "grid", placeItems: "center", fontSize: "12px", fontWeight: 700, boxShadow: "0 8px 16px rgba(255, 140, 66, 0.25)", top: "22%", left: "18%" }}>1</span>
            <span style={{ position: "absolute", width: "28px", height: "28px", borderRadius: "50%", background: "#ff8c42", color: "#fff", display: "grid", placeItems: "center", fontSize: "12px", fontWeight: 700, boxShadow: "0 8px 16px rgba(255, 140, 66, 0.25)", top: "45%", left: "56%" }}>2</span>
            <span style={{ position: "absolute", width: "28px", height: "28px", borderRadius: "50%", background: "#ff8c42", color: "#fff", display: "grid", placeItems: "center", fontSize: "12px", fontWeight: 700, boxShadow: "0 8px 16px rgba(255, 140, 66, 0.25)", top: "70%", left: "78%" }}>3</span>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeContent: "center", textAlign: "center", color: "#667", fontSize: "18px", lineHeight: 1.5 }}>
              Mapa de ruta<br />
              <small style={{ display: "block", color: "#7d7d7d", fontSize: "13px" }}>La integración de navegación estará disponible próximamente.</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
