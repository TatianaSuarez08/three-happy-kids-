import { tonoPorEstado } from "./mensajeriaData";

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
  return <section className="hk-card mensajeria-panel"><div className="mensajeria-panel-body"><h2>{titulo}</h2>{children}</div></section>;
}

export function Estado({ estado }) {
  const tone = tonoPorEstado[estado] || "info";
  const iconos = { Asignado: "bi-clipboard-check", Recogiendo: "bi-box-seam", "En camino": "bi-truck", Entregado: "bi-check-circle-fill", Fallido: "bi-exclamation-triangle-fill" };
  return <span className={`status-badge is-${tone}`}><i className={`bi ${iconos[estado] || "bi-dot"}`} aria-hidden="true" /> {estado}</span>;
}

export function EntregaFila({ entrega, onClick }) {
  return (
    <button className="messaging-delivery-row" onClick={onClick}>
      <i className="bi bi-box-seam icon-lg" aria-hidden="true" />
      <span className="messaging-delivery-main">
        <strong>{entrega.id} - {entrega.cliente}</strong>
        <small>
          <i className="bi bi-geo-alt" aria-hidden="true" /> {entrega.direccion}
          {" · "}
          <i className="bi bi-clock" aria-hidden="true" /> {entrega.hora}
        </small>
      </span>
      <Estado estado={entrega.estado} />
    </button>
  );
}
