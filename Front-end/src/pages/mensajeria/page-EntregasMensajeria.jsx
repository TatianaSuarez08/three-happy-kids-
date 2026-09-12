import { entregasDemo, coloresEstado } from "../../components/mensajeria/mensajeriaData";

export default function EntregasMensajeria() {
  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Mis entregas</h2>
            <p className="admin-sub">Consulta y organiza los pedidos asignados a tu ruta.</p>
          </div>
          <strong className="admin-contador">{entregasDemo.length} entrega(s)</strong>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {entregasDemo.map((item) => {
            const estado = coloresEstado[item.estado] || ["#f5f5f5", "#555"];

            return (
              <div key={item.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", overflow: "hidden", boxShadow: "0 8px 20px rgba(26, 26, 26, 0.04)", padding: "1.25rem 1.35rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                  <div>
                    <h3 style={{ margin: 0, color: "#1a1a1a", fontSize: "18px" }}>Pedido #{item.id.replace("HK-", "")}</h3>
                    <p style={{ margin: "5px 0 0", color: "#888", fontSize: "13px" }}>{item.cliente} · {item.hora}</p>
                  </div>
                  <span className="status-badge" style={{ background: estado[0], color: estado[1] }}>{item.estado}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 280px", gap: "1.5rem", alignItems: "start" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: "13px 16px", border: "1px solid #eee", borderRadius: "8px", background: "#fafafa" }}>
                      <span style={{ color: "#1a1a1a", fontWeight: 600, fontSize: "14px" }}>{item.paquete}</span>
                      <strong style={{ color: "#ff8c42", fontSize: "15px" }}>COP 144.000</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: "13px 16px", border: "1px solid #eee", borderRadius: "8px", background: "#fff" }}>
                      <span style={{ color: "#1a1a1a", fontWeight: 600, fontSize: "14px" }}>{item.direccion}</span>
                      <strong style={{ color: "#ff8c42", fontSize: "15px" }}>COP 130.000</strong>
                    </div>
                  </div>

                  <aside style={{ borderLeft: "1px solid #eee", paddingLeft: "1.25rem" }}>
                    <h4 style={{ margin: "0 0 1rem", paddingBottom: "10px", borderBottom: "1px solid #eee", fontSize: "15px", color: "#1a1a1a" }}>Detalle de {item.id}</h4>
                    <p style={{ margin: "0 0 8px", color: "#555", fontSize: "13px" }}><strong>Cliente:</strong> {item.cliente}</p>
                    <p style={{ margin: "0 0 8px", color: "#555", fontSize: "13px" }}><strong>Dirección:</strong> {item.direccion}</p>
                    <p style={{ margin: "0 0 8px", color: "#555", fontSize: "13px" }}><strong>Paquete:</strong> {item.paquete}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eee", marginTop: "1rem", paddingTop: "1rem", color: "#1a1a1a", fontSize: "15px", fontWeight: 700 }}>
                      <span>Total</span>
                      <strong>COP 274.000</strong>
                    </div>
                  </aside>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
