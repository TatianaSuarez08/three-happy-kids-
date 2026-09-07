import { Encabezado, Panel, VistaMensajeria } from "./MensajeriaUI";

export default function EvidenciasMensajeria() {
  return <VistaMensajeria><Encabezado titulo="Evidencias" subtitulo="Registra la confirmacion visual de tus entregas." /><Panel titulo="Evidencia del pedido HK-1048"><div style={{ border: "2px dashed #ddd", borderRadius: "10px", padding: "2rem", textAlign: "center", color: "#888" }}>Foto del paquete, firma y codigo OTP<br /><small>La carga de archivos se habilitara en una proxima version.</small></div><p style={{ color: "#777" }}>Fecha y hora: Pendiente</p><p style={{ color: "#777" }}>Persona que recibe: Pendiente</p></Panel></VistaMensajeria>;
}
