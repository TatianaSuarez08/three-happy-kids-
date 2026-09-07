import { entregasDemo, styles } from "./mensajeriaData";
import { Encabezado, EntregaFila, Panel, VistaMensajeria } from "./MensajeriaUI";

function Tarjeta({ titulo, valor, detalle, color = "#ff8c42" }) {
  return <div className="mensajeria-stat-card"><div className="mensajeria-stat-label">{titulo}</div><strong className="mensajeria-stat-value" style={{ color }}>{valor}</strong><small style={{ color: "#999" }}>{detalle}</small></div>;
}

export default function InicioMensajeria({ seleccionarEntrega, irARuta }) {
  return <VistaMensajeria>
    <Encabezado titulo="Buenos dias, mensajero" subtitulo="Este es el resumen de tu jornada de hoy." />
    <div className="mensajeria-stats-grid"><Tarjeta titulo="Pendientes" valor="8" detalle="Entregas asignadas" /><Tarjeta titulo="En curso" valor="3" detalle="Requieren atencion" color="#4a90d9" /><Tarjeta titulo="Completadas" valor="12" detalle="Durante esta semana" color="#3a7d44" /><Tarjeta titulo="Novedades" valor="1" detalle="Revisa las alertas" color="#e53935" /></div>
    <div className="mensajeria-columns">
      <Panel titulo="Proximas entregas">{entregasDemo.map((entrega) => <EntregaFila key={entrega.id} entrega={entrega} onClick={() => seleccionarEntrega(entrega)} />)}</Panel>
      <Panel titulo="Tu jornada"><div style={styles.listaInfo}><span>Turno actual</span><strong>8:00 a. m. - 5:00 p. m.</strong></div><div style={styles.listaInfo}><span>Ruta del dia</span><strong>12 de 15 paradas</strong></div><div style={styles.listaInfo}><span>Ganancias estimadas</span><strong style={{ color: "#3a7d44" }}>$180.000 COP</strong></div><button className="btn-admin-primary" onClick={irARuta}>Ver ruta completa</button></Panel>
    </div>
  </VistaMensajeria>;
}
