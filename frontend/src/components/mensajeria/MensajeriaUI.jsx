import { coloresEstado, styles } from "./mensajeriaData";

export function VistaMensajeria({ children }) {
  return (
    <div className="admin-page">
      <div className="admin-container">{children}</div>
    </div>
  );
}

export function Encabezado({ titulo, subtitulo }) {
  return <header className="admin-header mensajeria-encabezado"><div><h2 className="admin-titulo">{titulo}</h2><p className="admin-sub">{subtitulo}</p></div></header>;
}

export function Panel({ titulo, children }) {
  return <section className="mensajeria-panel"><div className="mensajeria-panel-body"><h2>{titulo}</h2>{children}</div></section>;
}

export function Estado({ estado }) {
  const [background, color] = coloresEstado[estado] || ["#f2f2f2", "#555"];
  const iconos = { Asignado: "bi-clipboard-check", Recogiendo: "bi-box-seam", "En camino": "bi-truck", Entregado: "bi-check-circle-fill", Fallido: "bi-exclamation-triangle-fill" };
  return <span className="status-badge" style={{ background, color }}><i className={`bi ${iconos[estado] || "bi-dot"}`} aria-hidden="true" /> {estado}</span>;
}

export function EntregaFila({ entrega, onClick }) {
  return <button onClick={onClick} style={styles.entregaFila}><i className="bi bi-box-seam icon-lg" aria-hidden="true" /><div style={{ textAlign: "left", flex: 1 }}><strong style={{ color: "#1a1a1a" }}>{entrega.id} - {entrega.cliente}</strong><small style={{ display: "block", color: "#888", marginTop: "5px" }}><i className="bi bi-geo-alt" aria-hidden="true" /> {entrega.direccion} · <i className="bi bi-clock" aria-hidden="true" /> {entrega.hora}</small></div><Estado estado={entrega.estado} /></button>;
}
