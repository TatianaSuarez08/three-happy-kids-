import { useEffect, useState } from "react";
import { getLogistica } from "../../services/logisticaService";

const coloresEstado = {
  Pendiente: ["#fff8e0", "#b87800"],
  "En camino": ["#e9f5ff", "#2774a8"],
  Entregado: ["#eafbea", "#3a7d44"],
  Cancelado: ["#fff0f0", "#c62828"],
};

export default function EntregasMensajeria() {
  const [entregas, setEntregas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarEntregas = async () => {
      try {
        const data = await getLogistica();
        setEntregas(data.tasks);
      } catch (err) {
        setError(err.message || "Base de datos no disponible.");
      } finally {
        setCargando(false);
      }
    };

    cargarEntregas();
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Mis entregas</h2>
            <p className="admin-sub">Consulta y organiza los pedidos asignados a tu ruta.</p>
          </div>
          <strong className="admin-contador">{entregas.length} entrega(s)</strong>
        </div>

        {cargando ? (
          <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "3rem", textAlign: "center", color: "#888" }}>
            Esperando datos del servidor...
          </div>
        ) : error ? (
          <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "3rem", textAlign: "center", color: "#a32d2d" }}>
            {error}
          </div>
        ) : entregas.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "3rem", textAlign: "center", color: "#888" }}>
            No hay entregas disponibles.
          </div>
        ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {entregas.map((item) => {
            const estado = coloresEstado[item.estadoEntrega] || ["#f5f5f5", "#555"];

            return (
              <div key={item.idPedido} style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", overflow: "hidden", boxShadow: "0 8px 20px rgba(26, 26, 26, 0.04)", padding: "1.25rem 1.35rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                  <div>
                    <h3 style={{ margin: 0, color: "#1a1a1a", fontSize: "18px" }}>Pedido #{item.idPedido}</h3>
                    <p style={{ margin: "5px 0 0", color: "#888", fontSize: "13px" }}>{item.cliente} · {item.fecha}</p>
                  </div>
                  <span className="status-badge" style={{ background: estado[0], color: estado[1] }}>{item.estadoEntrega}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 280px", gap: "1.5rem", alignItems: "start" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: "13px 16px", border: "1px solid #eee", borderRadius: "8px", background: "#fafafa" }}>
                      <span style={{ color: "#1a1a1a", fontWeight: 600, fontSize: "14px" }}>Productos del pedido ({item.cantidadProductos})</span>
                      <strong style={{ color: "#ff8c42", fontSize: "15px" }}>{Number(item.total || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: "13px 16px", border: "1px solid #eee", borderRadius: "8px", background: "#fff" }}>
                      <span style={{ color: "#1a1a1a", fontWeight: 600, fontSize: "14px" }}>{item.direccion || "Dirección no registrada"}</span>
                      <strong style={{ color: "#777", fontSize: "15px" }}>{item.ciudad || "Ciudad no registrada"}</strong>
                    </div>
                  </div>

                  <aside style={{ borderLeft: "1px solid #eee", paddingLeft: "1.25rem" }}>
                    <h4 style={{ margin: "0 0 1rem", paddingBottom: "10px", borderBottom: "1px solid #eee", fontSize: "15px", color: "#1a1a1a" }}>Detalle del pedido #{item.idPedido}</h4>
                    <p style={{ margin: "0 0 8px", color: "#555", fontSize: "13px" }}><strong>Cliente:</strong> {item.cliente}</p>
                    <p style={{ margin: "0 0 8px", color: "#555", fontSize: "13px" }}><strong>Dirección:</strong> {item.direccion || "No registrada"}</p>
                    <p style={{ margin: "0 0 8px", color: "#555", fontSize: "13px" }}><strong>Ciudad:</strong> {item.ciudad || "No registrada"}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eee", marginTop: "1rem", paddingTop: "1rem", color: "#1a1a1a", fontSize: "15px", fontWeight: 700 }}>
                      <span>Total</span>
                      <strong>{Number(item.total || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })}</strong>
                    </div>
                  </aside>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
