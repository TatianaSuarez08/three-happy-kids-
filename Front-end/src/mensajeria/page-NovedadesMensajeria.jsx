import { Encabezado, Panel, VistaMensajeria } from "./MensajeriaUI";

export default function NovedadesMensajeria() {
  return 
    <VistaMensajeria>
        <Encabezado titulo="Novedades e incidencias" subtitulo="Reporta situaciones que impidan completar una entrega." />
        <Panel titulo="Registrar novedad">
            <select style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "7px" }} defaultValue="">
                <option value="" disabled>Selecciona el tipo de novedad</option>
                <option>Cliente ausente</option>
                <option>Direccion incorrecta</option>
                <option>Paquete danado</option>
                <option>No se pudo contactar al cliente</option>
            </select>
            <textarea placeholder="Describe lo ocurrido" style={{ width: "100%", minHeight: "120px", marginTop: "12px", padding: "10px", border: "1px solid #ddd", borderRadius: "7px" }} />
            <button style={{ marginTop: "12px", background: "#ff8c42", color: "#fff", border: 0, borderRadius: "7px", padding: "10px 15px" }}>Guardar reporte</button>
        </Panel>
    </VistaMensajeria>;
}
