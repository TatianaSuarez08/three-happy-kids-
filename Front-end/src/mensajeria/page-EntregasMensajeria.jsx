import { useState } from "react";
import { entregasDemo, styles } from "./mensajeriaData";
import { Encabezado, EntregaFila, Panel, VistaMensajeria } from "./MensajeriaUI";

export default function EntregasMensajeria({ entregaInicial }) {
  const [entrega, setEntrega] = useState(entregaInicial || entregasDemo[0]);
  return <VistaMensajeria>
    <Encabezado titulo="Mis entregas" subtitulo="Consulta y organiza los pedidos asignados a tu ruta." />
    <div style={{ display: "flex", gap: "10px", marginBottom: "1rem", flexWrap: "wrap" }}>{["Todas", "Asignado", "Recogiendo", "En camino", "Entregado"].map((filtro) => <button key={filtro} className="btn-admin-editar">{filtro}</button>)}</div>
    <Panel titulo={`${entregasDemo.length} entregas de hoy`}>{entregasDemo.map((item) => <EntregaFila key={item.id} entrega={item} onClick={() => setEntrega(item)} />)}</Panel>
    <Panel titulo={`Detalle de ${entrega.id}`}><div style={styles.dosColumnas}><div><p><strong>Cliente:</strong> {entrega.cliente}</p><p><strong>Direccion:</strong> {entrega.direccion}</p><p><strong>Paquete:</strong> {entrega.paquete}</p></div><div><button className="btn-admin-primary">Iniciar entrega</button><button className="btn-admin-cancelar">Reportar novedad</button><div style={{ marginTop: "12px", color: "#888", fontSize: "13px" }}>Evidencia de entrega: pendiente</div></div></div></Panel>
  </VistaMensajeria>;
}
