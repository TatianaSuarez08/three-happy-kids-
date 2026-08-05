

import { useState } from "react";
import "../styles/style.css";

const pedidosEjemplo = [
  {
    id: 1,
    cliente: "Ana López",
    correo: "ana@correo.com",
    telefono: "3001234567",
    fecha: "2026-07-01",
    estado: "Entregado",
    total: "$35.000",
    direccion: "Calle 123 # 45-67, Bogotá",
    pago: "Efectivo",
    productos: [
      { nombre: "Sudadera con body", cantidad: 1, precio: "$35.000" }
    ]
  },
  {
    id: 2,
    cliente: "Carlos Ramírez",
    correo: "carlos@correo.com",
    telefono: "3009876543",
    fecha: "2026-07-10",
    estado: "En camino",
    total: "$87.000",
    direccion: "Carrera 45 # 12-34, Medellín",
    pago: "Nequi",
    productos: [
      { nombre: "Retro jean", cantidad: 1, precio: "$58.000" },
      { nombre: "Conjunto bunny", cantidad: 1, precio: "$29.000" }
    ]
  },
  {
    id: 3,
    cliente: "María García",
    correo: "maria@correo.com",
    telefono: "3005551234",
    fecha: "2026-07-25",
    estado: "Pendiente",
    total: "$36.000",
    direccion: "Avenida 68 # 23-45, Cali",
    pago: "Transferencia",
    productos: [
      { nombre: "Capibara canguro", cantidad: 1, precio: "$36.000" }
    ]
  },
  {
    id: 4,
    cliente: "Luis Martínez",
    correo: "luis@correo.com",
    telefono: "3002222222",
    fecha: "2026-07-28",
    estado: "Pendiente",
    total: "$70.000",
    direccion: "Calle 50 # 30-20, Barranquilla",
    pago: "Daviplata",
    productos: [
      { nombre: "Bermuda K-POP", cantidad: 2, precio: "$72.000" }
    ]
  },
];

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

const estados = ["Pendiente", "En camino", "Entregado", "Cancelado"];

function Pedidos() {
  const [pedidos, setPedidos] = useState(pedidosEjemplo);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [pedidoAbierto, setPedidoAbierto] = useState(null);
  const [modal, setModal] = useState(null);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");

  const pedidosFiltrados = pedidos.filter((p) => {
    const coincideBusqueda =
      p.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.correo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === "todos" || p.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  const cambiarEstado = () => {
    setPedidos((prev) =>
      prev.map((p) =>
        p.id === pedidoSeleccionado.id ? { ...p, estado: nuevoEstado } : p
      )
    );
    setModal(null);
  };

  const confirmarCambio = (pedido, estado) => {
    setPedidoSeleccionado(pedido);
    setNuevoEstado(estado);
    setModal("cambiar");
  };

  return (
    <div className="admin-page">
      <div className="admin-container">

        {/* Header */}
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Pedidos</h2>
            <p className="admin-sub">Gestiona todos los pedidos de la tienda</p>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            {["Pendiente", "En camino", "Entregado"].map((e) => (
              <div key={e} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, color: estadoColor[e].color }}>
                  {pedidos.filter((p) => p.estado === e).length}
                </div>
                <div style={{ fontSize: "11px", color: "#888" }}>{e}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "1rem", flexWrap: "wrap" }}>
          {["todos", ...estados].map((e) => (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              style={{
                padding: "6px 16px",
                borderRadius: "20px",
                border: filtroEstado === e ? "1px solid #ff8c42" : "1px solid #ddd",
                background: filtroEstado === e ? "#ff8c42" : "#fff",
                color: filtroEstado === e ? "#fff" : "#555",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {e === "todos" ? "Todos" : `${estadoEmoji[e]} ${e}`}
            </button>
          ))}
        </div>

        {/* Búsqueda */}
        <div className="admin-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Buscar por cliente o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Lista de pedidos */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {pedidosFiltrados.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#888", background: "#fff", borderRadius: "12px", border: "1px solid #eee" }}>
              No se encontraron pedidos
            </div>
          ) : (
            pedidosFiltrados.map((p) => (
              <div key={p.id} className="admin-tabla-wrap">

                {/* Header del pedido */}
                <div
                  style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", borderBottom: pedidoAbierto === p.id ? "1px solid #eee" : "none" }}
                  onClick={() => setPedidoAbierto(pedidoAbierto === p.id ? null : p.id)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a" }}>
                        Pedido #{p.id} — {p.cliente}
                      </div>
                      <div style={{ fontSize: "12px", color: "#888" }}>{p.fecha} · {p.correo}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span
                      className="admin-badge"
                      style={{ background: estadoColor[p.estado].bg, color: estadoColor[p.estado].color }}
                    >
                      {estadoEmoji[p.estado]} {p.estado}
                    </span>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "#ff8c42" }}>{p.total}</span>
                    <span style={{ fontSize: "12px", color: "#888" }}>{pedidoAbierto === p.id ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* Detalle del pedido */}
                {pedidoAbierto === p.id && (
                  <div style={{ padding: "1.25rem", background: "#fafafa" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                      <div>
                        <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>DIRECCIÓN</p>
                        <p style={{ fontSize: "14px", color: "#444" }}>📍 {p.direccion}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>MÉTODO DE PAGO</p>
                        <p style={{ fontSize: "14px", color: "#444" }}>💳 {p.pago}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>TELÉFONO</p>
                        <p style={{ fontSize: "14px", color: "#444" }}>📞 {p.telefono}</p>
                      </div>
                    </div>

                    {/* Productos */}
                    <p style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>PRODUCTOS</p>
                    {p.productos.map((prod, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#444", padding: "6px 0", borderBottom: "1px solid #eee" }}>
                        <span>{prod.nombre} x{prod.cantidad}</span>
                        <span>{prod.precio}</span>
                      </div>
                    ))}

                    {/* Cambiar estado */}
                    <div style={{ marginTop: "1rem" }}>
                      <p style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>CAMBIAR ESTADO</p>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {estados.filter((e) => e !== p.estado).map((e) => (
                          <button
                            key={e}
                            onClick={() => confirmarCambio(p, e)}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "8px",
                              border: `1px solid ${estadoColor[e].color}`,
                              background: estadoColor[e].bg,
                              color: estadoColor[e].color,
                              fontSize: "13px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            {estadoEmoji[e]} {e}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <p className="admin-contador">{pedidosFiltrados.length} pedido(s) encontrado(s)</p>

      </div>

      {/* Modal cambiar estado */}
      {modal === "cambiar" && pedidoSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4 style={{ color: estadoColor[nuevoEstado].color }}>
              {estadoEmoji[nuevoEstado]} Cambiar estado
            </h4>
            <p>
              ¿Cambiar el pedido #{pedidoSeleccionado.id} de <strong>{pedidoSeleccionado.estado}</strong> a <strong>{nuevoEstado}</strong>?
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                style={{ flex: 1, height: "44px", borderRadius: "8px", background: estadoColor[nuevoEstado].bg, color: estadoColor[nuevoEstado].color, border: `1px solid ${estadoColor[nuevoEstado].color}`, fontWeight: 600, cursor: "pointer" }}
                onClick={cambiarEstado}
              >
                Sí, cambiar
              </button>
              <button
                className="btn-admin-cancelar"
                style={{ flex: 1, height: "44px", borderRadius: "8px" }}
                onClick={() => setModal(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Pedidos;