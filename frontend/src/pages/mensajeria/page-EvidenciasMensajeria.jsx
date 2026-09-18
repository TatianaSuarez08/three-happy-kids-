export default function EvidenciasMensajeria() {
  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Evidencias</h2>
            <p className="admin-sub">Adjunta comprobantes y capturas de entrega.</p>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", boxShadow: "0 8px 20px rgba(26, 26, 26, 0.04)", padding: "1.25rem" }}>
          <div style={{ border: "2px dashed #ddd", borderRadius: "12px", background: "#fafafa", padding: "2rem", textAlign: "center", color: "#888", minHeight: "150px", display: "grid", placeItems: "center" }}>
            <div>
              <strong>No hay evidencias cargadas</strong>
              <small style={{ display: "block", marginTop: "8px", color: "#9a9a9a" }}>Sube fotos o comprobantes desde la entrega seleccionada.</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
