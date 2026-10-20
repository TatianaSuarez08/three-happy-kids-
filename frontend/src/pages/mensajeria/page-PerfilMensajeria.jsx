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

        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", boxShadow: "0 8px 20px rgba(26, 26, 26, 0.04)", padding: "1.25rem" }}>
          <p style={{ margin: 0, color: "#777", fontSize: "13px" }}>El perfil del mensajero estará disponible cuando exista un endpoint de perfil conectado.</p>
        </div>
      </div>
    </div>
  );
}
