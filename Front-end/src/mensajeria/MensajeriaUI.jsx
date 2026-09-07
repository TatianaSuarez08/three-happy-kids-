import { coloresEstado, styles } from "./mensajeriaData";

export function VistaMensajeria({ children }) {
  return <div className="admin-page mensajeria-page"><div className="admin-container mensajeria-vista">{children}</div></div>;
}

export function Encabezado({ titulo, subtitulo }) {
  return <header className="admin-header mensajeria-encabezado"><div><h2 className="admin-titulo">{titulo}</h2><p className="admin-sub">{subtitulo}</p></div></header>;
}

export function Panel({ titulo, children }) {
  return <section className="mensajeria-panel"><div className="mensajeria-panel-body"><h2>{titulo}</h2>{children}</div></section>;
}

export function Estado({ estado }) {
  const [background, color] = coloresEstado[estado] || ["#f2f2f2", "#555"];
  const iconos = { Asignado: "📋", Recogiendo: "📦", "En camino": "🚚", Entregado: "✅", Fallido: "⚠️" };
  return <span className="admin-badge" style={{ background, color }}>{iconos[estado] || "•"} {estado}</span>;
}

export function EntregaFila({ entrega, onClick }) {
  return <button onClick={onClick} style={styles.entregaFila}><span style={{ fontSize: "22px" }} aria-hidden="true">📦</span><div style={{ textAlign: "left", flex: 1 }}><strong style={{ color: "#1a1a1a" }}>{entrega.id} - {entrega.cliente}</strong><small style={{ display: "block", color: "#888", marginTop: "5px" }}>📍 {entrega.direccion} · 🕒 {entrega.hora}</small></div><Estado estado={entrega.estado} /></button>;
}
