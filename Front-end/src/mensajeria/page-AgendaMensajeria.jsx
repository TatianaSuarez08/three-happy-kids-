import { Encabezado, Panel, VistaMensajeria } from "./MensajeriaUI";

export default function AgendaMensajeria() {
  return <VistaMensajeria><Encabezado titulo="Agenda y turnos" subtitulo="Consulta tu horario y disponibilidad." /><Panel titulo="Turno asignado"><div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #eee" }}><span>Hoy</span><strong>8:00 a. m. - 5:00 p. m.</strong></div><div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #eee" }}><span>Entregas programadas</span><strong>15</strong></div><button style={{ marginTop: "12px", background: "#fff", color: "#555", border: "1px solid #ddd", borderRadius: "7px", padding: "10px 15px" }}>Solicitar cambio de turno</button></Panel></VistaMensajeria>;
}
