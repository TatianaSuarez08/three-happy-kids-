import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/style.css";

const pedidosEjemplo = [
  {
    id: 1,
    fecha: "2026-07-01",
    estado: "Entregado",
    total: "$35.000",
    productos: [
      { nombre: "Sudadera con body", cantidad: 1, precio: "$35.000" }
    ]
  },
  {
    id: 2,
    fecha: "2026-07-10",
    estado: "En camino",
    total: "$87.000",
    productos: [
      { nombre: "Retro jean", cantidad: 1, precio: "$58.000" },
      { nombre: "Conjunto bunny", cantidad: 1, precio: "$29.000" }
    ]
  },
  {
    id: 3,
    fecha: "2026-07-25",
    estado: "Pendiente",
    total: "$36.000",
    productos: [
      { nombre: "Capibara canguro", cantidad: 1, precio: "$36.000" }
    ]
  },
];

const estadoColor = {
  "Entregado": "#3a7d44",
  "En camino": "#4a90d9",
  "Pendiente": "#f0a500",
  "Cancelado": "#e53935",
};

const estadoEmoji = {
  "Entregado": "✅",
  "En camino": "🚚",
  "Pendiente": "⏳",
  "Cancelado": "❌",
};

function MisPedidos() {
  const navigate = useNavigate();
  const [pedidoAbierto, setPedidoAbierto] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  const pedidosFiltrados = pedidosEjemplo.filter(
    (pedido) => filtroEstado === "Todos" || pedido.estado === filtroEstado
  );

  const cantidadPorEstado = (estado) =>
    pedidosEjemplo.filter((pedido) => pedido.estado === estado).length;

  return (
    <div className="pedidos-page">
      <div className="pedidos-container">

        <button className="pedidos-volver" onClick={() => navigate("/cliente/catalogo")}>
          ← Volver al catálogo
        </button>

        <div className="pedidos-heading">
          <div>
            <h2 className="pedidos-titulo">Mis pedidos</h2>
            <p className="pedidos-sub">Consulta el estado y el detalle de tus compras</p>
          </div>
          <span className="pedidos-total-count">{pedidosEjemplo.length} pedidos</span>
        </div>

        <div className="pedidos-resumen" aria-label="Resumen de pedidos">
          {["Todos", "Pendiente", "En camino", "Entregado"].map((estado) => (
            <button
              key={estado}
              className={`pedido-resumen-item ${filtroEstado === estado ? "seleccionado" : ""}`}
              onClick={() => setFiltroEstado(estado)}
            >
              <span>{estado === "Todos" ? pedidosEjemplo.length : cantidadPorEstado(estado)}</span>
              <small>{estado}</small>
            </button>
          ))}
        </div>

        {pedidosEjemplo.length === 0 ? (
          <div className="pedidos-vacio">
            <span>📦</span>
            <h3>No tienes pedidos aún</h3>
            <p>Cuando realices una compra aparecerá aquí</p>
            <button className="btn-ingresar" style={{ width: "fit-content", padding: "0 2rem" }} onClick={() => navigate("/")}>
              Ver productos
            </button>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
            <div className="pedidos-vacio pedidos-vacio-filtro">
              <span>⌕</span>
              <h3>No hay pedidos con este estado</h3>
              <p>Prueba seleccionando otro filtro.</p>
            </div>
          ) : (
          <div className="pedidos-lista">
            {pedidosFiltrados.map((pedido) => (
              <div key={pedido.id} className="pedido-card">
                <div
                  className="pedido-header"
                  role="button"
                  tabIndex="0"
                  onClick={() => setPedidoAbierto(pedidoAbierto === pedido.id ? null : pedido.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setPedidoAbierto(pedidoAbierto === pedido.id ? null : pedido.id);
                    }
                  }}
                >
                  <div className="pedido-header-info">
                    <span className="pedido-numero">Pedido #{pedido.id}</span>
                    <span className="pedido-fecha">{pedido.fecha}</span>
                  </div>
                  <div className="pedido-header-right">
                    <span
                      className="pedido-estado"
                      style={{ color: estadoColor[pedido.estado], background: `${estadoColor[pedido.estado]}18` }}
                    >
                      {estadoEmoji[pedido.estado]} {pedido.estado}
                    </span>
                    <span className="pedido-total">{pedido.total}</span>
                    <span className="pedido-chevron">
                      {pedidoAbierto === pedido.id ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {pedidoAbierto === pedido.id && (
                  <div className="pedido-detalle">
                    <h4>Productos</h4>
                    {pedido.productos.map((p, i) => (
                      <div key={i} className="pedido-producto">
                        <span>{p.nombre} x{p.cantidad}</span>
                        <span>{p.precio}</span>
                      </div>
                    ))}
                    <div className="pedido-detalle-total">
                      <span>Total</span>
                      <span>{pedido.total}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          )}
      </div>
    </div>
  );
}

export default MisPedidos;