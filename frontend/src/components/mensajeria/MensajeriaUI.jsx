import { coloresEstado, styles } from "./mensajeriaData";
import Icon from "../Icon";

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
  const iconos = { Asignado: "receipt", Recogiendo: "package", "En camino": "truck", Entregado: "checkCircle", Fallido: "warning" };
  return <span className="status-badge" style={{ background, color }}><Icon name={iconos[estado] || "info"} size={16} /> {estado}</span>;
}

export function EntregaFila({ entrega, onClick }) {
  return <button onClick={onClick} style={styles.entregaFila}><Icon name="package" size={22} /><div style={{ textAlign: "left", flex: 1 }}><strong style={{ color: "#1a1a1a" }}>{entrega.id} - {entrega.cliente}</strong><small style={{ display: "block", color: "#888", marginTop: "5px" }}><Icon name="mapPin" size={14} /> {entrega.direccion} · <Icon name="clock" size={14} /> {entrega.hora}</small></div><Estado estado={entrega.estado} /></button>;
}
