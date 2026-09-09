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
          <p style={{ margin: "0 0 8px", color: "#555", fontSize: "13px" }}><strong>Nombre:</strong> Carlos López</p>
          <p style={{ margin: "0 0 8px", color: "#555", fontSize: "13px" }}><strong>Unidad:</strong> Moto - 208</p>
          <p style={{ margin: 0, color: "#555", fontSize: "13px" }}><strong>Turno:</strong> 8:00 a. m. - 5:00 p. m.</p>
        </div>
      </div>
    </div>
  );
}
