import { useState } from "react";
import { entregasDemo, coloresEstado } from "./mensajeriaData";

const estados = ["Asignado", "Recogiendo", "En camino", "Entregado", "Cancelado"];
const estadoColor = {
  Asignado: { bg: "#fff8e0", color: "#f0a500", emoji: "📋" },
  Recogiendo: { bg: "#e8f4ff", color: "#4a90d9", emoji: "📦" },
  "En camino": { bg: "#e8f4ff", color: "#4a90d9", emoji: "🚚" },
  Entregado: { bg: "#eafbea", color: "#3a7d44", emoji: "✅" },
  Cancelado: { bg: "#fff0f0", color: "#e53935", emoji: "❌" },
};

function InicioMensajeria() {
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const entregasFiltradas = entregasDemo.filter((entrega) => {
    const texto = busqueda.toLowerCase();
    const coincideBusqueda = entrega.cliente.toLowerCase().includes(texto)
      || entrega.direccion.toLowerCase().includes(texto)
      || String(entrega.id).toLowerCase().includes(texto);

    return coincideBusqueda && (filtroEstado === "todos" || entrega.estado === filtroEstado);
  });

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Pedidos</h2>
            <p className="admin-sub">Pedidos activos y recorridos del día</p>
          </div>
          <strong className="admin-contador">{entregasFiltradas.length} pedido(s)</strong>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "1rem" }}>
          {["todos", ...estados].map((estado) => (
            <button
              key={estado}
              type="button"
              onClick={() => setFiltroEstado(estado)}
              style={{
                padding: "7px 14px",
                borderRadius: "20px",
                border: filtroEstado === estado ? "1px solid #ff8c42" : "1px solid #ddd",
                background: filtroEstado === estado ? "#ff8c42" : "#fff",
                color: filtroEstado === estado ? "#fff" : "#555",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              {estado === "todos" ? "Todos" : `${estadoColor[estado].emoji} ${estado}`}
            </button>
          ))}
        </div>

        <div className="admin-search">
          <span aria-hidden="true">🔍</span>
          <input
            type="text"
            placeholder="Buscar por cliente, dirección o número..."
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </div>

        {entregasFiltradas.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", padding: "3rem", textAlign: "center", color: "#888" }}>
            No se encontraron entregas
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {entregasFiltradas.map((entrega) => {
              const estado = coloresEstado[entrega.estado] || ["#f5f5f5", "#555"];
              const estadoTexto = estadoColor[entrega.estado] || estadoColor.Asignado;

              return (
                <section key={entrega.id} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", padding: "1.25rem", boxShadow: "0 8px 20px rgba(26,26,26,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                    <div>
                      <h3 style={{ fontSize: "16px", color: "#1a1a1a", margin: 0 }}>Pedido #{entrega.id.replace("HK-", "")}</h3>
                      <p style={{ color: "#888", fontSize: "13px", margin: "5px 0 0" }}>{entrega.cliente} · {entrega.hora}</p>
                    </div>
                    <span className="admin-badge" style={{ background: estado[0], color: estado[1] }}>
                      {estadoTexto.emoji} {entrega.estado}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 280px", gap: "1.5rem", alignItems: "start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: "12px", background: "#fafafa", border: "1px solid #eee", borderRadius: "8px" }}>
                        <div>
                          <strong style={{ color: "#1a1a1a", fontSize: "14px" }}>{entrega.paquete}</strong>
                          <small style={{ display: "block", color: "#888", marginTop: "4px" }}>Cantidad: 2</small>
                        </div>
                        <strong style={{ color: "#ff8c42", whiteSpace: "nowrap" }}>COP 144.000</strong>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: "12px", background: "#fff", border: "1px solid #eee", borderRadius: "8px" }}>
                        <div>
                          <strong style={{ color: "#1a1a1a", fontSize: "14px" }}>{entrega.cliente}</strong>
                          <small style={{ display: "block", color: "#888", marginTop: "4px" }}>Cantidad: 2</small>
                        </div>
                        <strong style={{ color: "#ff8c42", whiteSpace: "nowrap" }}>COP 130.000</strong>
                      </div>
                    </div>

                    <aside style={{ borderLeft: "1px solid #eee", paddingLeft: "1.25rem" }}>
                      <h4 style={{ fontSize: "15px", color: "#1a1a1a", margin: "0 0 1rem", paddingBottom: "10px", borderBottom: "1px solid #eee" }}>Resumen del pedido</h4>
                      <p style={{ fontSize: "13px", color: "#555", margin: "0 0 8px" }}><strong>Cliente:</strong> {entrega.cliente}</p>
                      <p style={{ fontSize: "13px", color: "#555", margin: "0 0 8px" }}><strong>Correo:</strong> {entrega.cliente.toLowerCase().replace(/\s+/g, ".")}@gmail.com</p>
                      <p style={{ fontSize: "13px", color: "#555", margin: "0 0 8px" }}><strong>Entrega:</strong> {entrega.direccion}</p>
                      <p style={{ fontSize: "13px", color: "#555", margin: "0 0 8px" }}><strong>Pago:</strong> Tarjeta</p>
                      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #eee", marginTop: "1rem", paddingTop: "1rem", fontSize: "18px", fontWeight: 700, color: "#1a1a1a" }}>
                        <span>Total</span>
                        <span>COP 274.000</span>
                      </div>
                    </aside>
                  </div>

                  <div style={{ borderTop: "1px solid #eee", marginTop: "1.25rem", paddingTop: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13px", color: "#888" }}>Cambiar estado del pedido</span>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {estados.filter((opcion) => opcion !== entrega.estado).map((opcion) => (
                        <button key={opcion} type="button" className="btn-admin-editar" style={{ fontSize: "12px", padding: "6px 12px" }}>
                          {estadoColor[opcion].emoji} {opcion}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


export default InicioMensajeria;
