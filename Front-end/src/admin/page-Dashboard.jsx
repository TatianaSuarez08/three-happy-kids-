
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/style.css";

const estadoColor = {
  "Entregado": { bg: "#eafbea", color: "#3a7d44" },
  "En camino": { bg: "#e8f4ff", color: "#4a90d9" },
  "Pendiente": { bg: "#fff8e0", color: "#f0a500" },
  "Cancelado": { bg: "#fff0f0", color: "#e53935" },
};

const estadoEmoji = {
  "Entregado": "✅",
  "En camino": "🚚",
  "Pendiente": "⏳",
  "Cancelado": "❌",
};

function Dashboard() {
  const navigate = useNavigate();
  const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const [dashboard, setDashboard] = useState({ stats: {}, recentOrders: [], lowStock: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
        const response = await fetch(`${backend}/dashboard`, {
          headers: { Authorization: `Bearer ${storage.getItem("token")}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudo cargar el dashboard");
        setDashboard({ stats: data.stats || {}, recentOrders: data.recentOrders || [], lowStock: data.lowStock || [] });
      } catch (err) {
        setError(err.message || "No se pudo cargar el dashboard");
      } finally {
        setLoading(false);
      }
    };

    cargarDashboard();
  }, [backend]);

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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Ventas totales", valor: formatoPrecio.format(Number(stats.totalVentas) || 0), emoji: "💰", color: "#3a7d44", bg: "#eafbea" },
            { label: "Total pedidos", valor: stats.totalPedidos, emoji: "📦", color: "#4a90d9", bg: "#e8f4ff" },
            { label: "Clientes", valor: stats.totalClientes, emoji: "👥", color: "#ff8c42", bg: "#fff3e0" },
            { label: "Inventario", valor: stats.totalProductos, emoji: "👕", color: "#7c3aed", bg: "#f5f0ff" },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "13px", color: "#888" }}>{stat.label}</span>
                <span style={{ fontSize: "24px", background: stat.bg, padding: "6px", borderRadius: "8px" }}>{stat.emoji}</span>
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: stat.color }}>{stat.valor}</div>
            </div>
          ))}
        </div>

        {/* Estado de pedidos */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Pendientes", valor: stats.pedidosPendientes, emoji: "⏳", color: "#f0a500", bg: "#fff8e0" },
            { label: "En camino", valor: stats.pedidosEnCamino, emoji: "🚚", color: "#4a90d9", bg: "#e8f4ff" },
            { label: "Entregados", valor: stats.pedidosEntregados, emoji: "✅", color: "#3a7d44", bg: "#eafbea" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{ background: stat.bg, border: `1px solid ${stat.color}30`, borderRadius: "12px", padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer" }}
              onClick={() => navigate("/admin/pedidos")}
            >
              <span style={{ fontSize: "32px" }}>{stat.emoji}</span>
              <div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: stat.color }}>{stat.valor}</div>
                <div style={{ fontSize: "13px", color: stat.color }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

          {/* Pedidos recientes */}
          <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Pedidos recientes</h3>
              <button
                style={{ background: "none", border: "none", color: "#ff8c42", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                onClick={() => navigate("/admin/pedidos")}
              >
                Ver todos →
              </button>
            </div>
            <div>
              {pedidosRecientes.map((p) => (
                <div key={p.id} style={{ padding: "12px 1.25rem", borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>{p.cliente}</div>
                    <div style={{ fontSize: "12px", color: "#888" }}>{p.fecha}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      className="admin-badge"
                      style={{ background: estadoColor[p.estado].bg, color: estadoColor[p.estado].color }}
                    >
                      {estadoEmoji[p.estado]} {p.estado}
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#ff8c42" }}>{formatoPrecio.format(Number(p.total) || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stock bajo */}
          <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>⚠️ Stock bajo</h3>
              <button
                style={{ background: "none", border: "none", color: "#ff8c42", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                onClick={() => navigate("/admin/inventario")}
              >
                Ver inventario →
              </button>
            </div>
            <div>
              {productosStockBajo.map((p, i) => (
                <div key={i} style={{ padding: "12px 1.25rem", borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>{p.nombre}</div>
                    <div style={{ fontSize: "12px", color: "#888" }}>Talla: {p.talla}</div>
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: p.stock <= 2 ? "#e53935" : "#f0a500" }}>
                    {p.stock} uds
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Accesos rápidos */}
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a", marginBottom: "1rem" }}>Accesos rápidos</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
            {[
              { label: "Usuarios", emoji: "👥", ruta: "/admin/usuarios" },
              { label: "Pedidos", emoji: "📦", ruta: "/admin/pedidos" },
              { label: "Inventario", emoji: "📋", ruta: "/admin/inventario" },
            ].map((acc) => (
              <button
                key={acc.label}
                onClick={() => navigate(acc.ruta)}
                style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "1.25rem", cursor: "pointer", transition: "box-shadow 0.15s, transform 0.15s", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(255,140,66,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
              >
                <span style={{ fontSize: "32px" }}>{acc.emoji}</span>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#444" }}>{acc.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;