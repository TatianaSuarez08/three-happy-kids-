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

  return (
    <div className="pedidos-page">
      <div className="pedidos-container">

        <button className="pedidos-volver" onClick={() => navigate("/")}>
          ← Volver al inicio
        </button>

        <h2 className="pedidos-titulo">Mis pedidos</h2>
        <p className="pedidos-sub">Historial de todas tus compras</p>

        {pedidosEjemplo.length === 0 ? (
          <div className="pedidos-vacio">
            <span>📦</span>
            <h3>No tienes pedidos aún</h3>
            <p>Cuando realices una compra aparecerá aquí</p>
            <button className="btn-ingresar" style={{ width: "fit-content", padding: "0 2rem" }} onClick={() => navigate("/")}>
              Ver productos
            </button>
          </div>
        ) : (
          <div className="pedidos-lista">
            {pedidosEjemplo.map((pedido) => (
              <div key={pedido.id} className="pedido-card">
                <div className="pedido-header" onClick={() => setPedidoAbierto(pedidoAbierto === pedido.id ? null : pedido.id)}>
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