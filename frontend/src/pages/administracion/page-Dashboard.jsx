
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../styles/style.css";
import { getDashboard, getLogistica } from "../../services/dashboardService";

const estadoColor = {
  "Entregado": { bg: "#eafbea", color: "#3a7d44" },
  "En camino": { bg: "#e8f4ff", color: "#4a90d9" },
  "Pendiente": { bg: "#fff8e0", color: "#f0a500" },
  "Cancelado": { bg: "#fff0f0", color: "#e53935" },
};

const estadoEmoji = {
  "Entregado": "bi-check-circle-fill",
  "En camino": "bi-truck",
  "Pendiente": "bi-hourglass-split",
  "Cancelado": "bi-x-circle-fill",
};

function Dashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState({ stats: {}, recentOrders: [], lowStock: [] });
  const [logistica, setLogistica] = useState({ summary: {}, tasks: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const data = await getDashboard();

        setDashboard({ stats: data.stats || {}, recentOrders: data.recentOrders || [], lowStock: data.lowStock || [] });

        const dataLogistica = await getLogistica();
        setLogistica({ summary: dataLogistica.summary || {}, tasks: dataLogistica.tasks || [] });
      } catch (err) {
        setError(err.message || "No se pudo cargar el dashboard");
      } finally {
        setLoading(false);
      }
    };

    cargarDashboard();
  }, []);

  const stats = dashboard.stats;
  const pedidosRecientes = dashboard.recentOrders;
  const productosStockBajo = dashboard.lowStock;
  const formatoPrecio = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", currencyDisplay: "code", maximumFractionDigits: 0 });

  if (loading) return <div className="admin-page"><div className="admin-container">Cargando dashboard...</div></div>;

  return (
    <div className="admin-page">
      <div className="admin-container">

        {/* Header */}
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Dashboard</h2>
            <p className="admin-sub">Bienvenido al panel de administración de HappyKids</p>
          </div>
          <div style={{ fontSize: "13px", color: "#888" }}>
            📅 {new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>

        {error && <div className="login-error">{error}</div>}

        {/* Tarjetas de estadísticas */}
        <div className="admin-grid">
          {[
            { label: "Ventas totales", valor: formatoPrecio.format(Number(stats.totalVentas) || 0), icon: "bi-cash-coin", color: "#3a7d44", bg: "#eafbea" },
            { label: "Total pedidos", valor: stats.totalPedidos, icon: "bi-box-seam", color: "#4a90d9", bg: "#e8f4ff" },
            { label: "Clientes", valor: stats.totalClientes, icon: "bi-people-fill", color: "#ff8c42", bg: "#fff3e0" },
            { label: "Inventario", valor: stats.totalProductos, icon: "bi-tag-fill", color: "#7c3aed", bg: "#f5f0ff" },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-header">
                <span className="stat-label">{stat.label}</span>
                <span className="stat-icon" style={{ background: stat.bg }}><i className={`bi ${stat.icon}`} aria-hidden="true" /></span>
              </div>
              <div className="stat-value" style={{ color: stat.color }}>{stat.valor}</div>
            </div>
          ))}
        </div>

        {/* Estado de pedidos */}
        <div className="status-grid">
          {[
            { label: "Pendientes", valor: stats.pedidosPendientes, icon: "bi-hourglass-split", color: "#f0a500", bg: "#fff8e0" },
            { label: "En camino", valor: stats.pedidosEnCamino, icon: "bi-truck", color: "#4a90d9", bg: "#e8f4ff" },
            { label: "Entregados", valor: stats.pedidosEntregados, icon: "bi-check-circle-fill", color: "#3a7d44", bg: "#eafbea" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="status-card"
              style={{ background: stat.bg, borderColor: `${stat.color}30` }}
              onClick={() => navigate("/admin/pedidos")}
            >
              <span className="status-card-icon" style={{ background: `${stat.color}20` }}><i className={`bi ${stat.icon}`} aria-hidden="true" /></span>
              <div>
                <div className="status-card-value" style={{ color: stat.color }}>{stat.valor}</div>
                <div className="status-card-label" style={{ color: stat.color }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="content-grid">

          {/* Pedidos recientes */}
          <div className="section-panel">
            <div className="section-header">
              <h3 className="section-title">Pedidos recientes</h3>
              <button className="btn-link" onClick={() => navigate("/admin/pedidos")}>Ver todos →</button>
            </div>
            <div className="list-body">
              {pedidosRecientes.map((p) => (
                <div key={p.id} className="list-row">
                  <div className="list-main">
                    <strong>{p.cliente}</strong>
                    <small>{p.fecha}</small>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      className="status-badge"
                      style={{ background: estadoColor[p.estado].bg, color: estadoColor[p.estado].color }}
                    >
                      <i className={`bi ${estadoEmoji[p.estado]}`} aria-hidden="true" /> {p.estado}
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#ff8c42" }}>{formatoPrecio.format(Number(p.total) || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stock bajo */}
          <div className="section-panel">
            <div className="section-header">
              <h3 className="section-title"><i className="bi bi-exclamation-triangle-fill" aria-hidden="true" /> Stock bajo</h3>
              <button className="btn-link" onClick={() => navigate("/admin/inventario")}>Ver inventario →</button>
            </div>
            <div className="list-body">
              {productosStockBajo.map((p, i) => (
                <div key={i} className="list-row">
                  <div className="list-main">
                    <strong>{p.nombre}</strong>
                    <small>Talla: {p.talla}</small>
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: p.stock <= 2 ? "#e53935" : "#f0a500" }}>
                    {p.stock} uds
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Cadena operativa */}
        <div style={{ marginTop: "2rem", background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 12px 30px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem", flexWrap: "wrap" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a", margin: 0 }}><i className="bi bi-box-seam" aria-hidden="true" /> Cadena operativa</h3>
            <button className="btn-link" onClick={() => navigate("/admin/pedidos")}>Ver pedidos →</button>
          </div>

          <div className="mini-stat">
            {[
              { label: "Pedidos pendientes", value: logistica.summary.pedidosPendientes ?? 0, color: "#ff8c42" },
              { label: "Entregas pendientes", value: logistica.summary.entregasPendientes ?? 0, color: "#4a90d9" },
              { label: "Stock bajo", value: logistica.summary.productosBajoStock ?? 0, color: "#e53935" },
              { label: "Activos", value: logistica.summary.pedidosActivos ?? 0, color: "#3a7d44" },
            ].map((item) => (
              <div key={item.label} className="mini-item">
                <span className="mini-item-label">{item.label}</span>
                <strong className="mini-item-value" style={{ color: item.color }}>{item.value}</strong>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "1rem" }}>
            {logistica.tasks.length === 0 ? (
              <div className="empty-state">No hay tareas operativas pendientes.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {logistica.tasks.map((task) => (
                  <div key={`${task.idPedido}-${task.cliente}`} style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", background: "#fff7f2", border: "1px solid #f2e5dd", borderRadius: "8px", padding: "10px 12px" }}>
                    <div>
                      <strong style={{ display: "block", color: "#1a1a1a" }}>Pedido #{task.idPedido}</strong>
                      <small style={{ color: "#555" }}>{task.cliente} · {task.ciudad || "Sin ciudad"}</small>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <small style={{ display: "block", color: "#666" }}>{task.estadoEntrega || "Pendiente"}</small>
                      <strong style={{ color: "#ff8c42" }}>{task.cantidadProductos || 0} prod.</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Accesos rápidos */}
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a", marginBottom: "1rem" }}>Accesos rápidos</h3>
          <div className="quick-grid">
            {[
              { label: "Usuarios", icon: "bi-people-fill", ruta: "/admin/usuarios" },
              { label: "Pedidos", icon: "bi-box-seam", ruta: "/admin/pedidos" },
              { label: "Inventario", icon: "bi-clipboard-check", ruta: "/admin/inventario" },
            ].map((acc) => (
              <button key={acc.label} className="quick-button" onClick={() => navigate(acc.ruta)}>
                <i className={`bi ${acc.icon}`} aria-hidden="true" />
                <strong>{acc.label}</strong>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;