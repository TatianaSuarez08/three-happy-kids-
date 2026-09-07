import { Encabezado, Panel, VistaMensajeria } from "./MensajeriaUI";

export default function NotificacionesMensajeria() {
  return <VistaMensajeria><Encabezado titulo="Notificaciones" subtitulo="Mantente al dia con las novedades de tu operacion." /><Panel titulo="Novedades"><div style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}><strong>Nueva entrega asignada</strong><p style={{ color: "#777", margin: "5px 0 0", fontSize: "13px" }}>El pedido HK-1050 fue agregado a tu ruta.</p></div><div style={{ padding: "12px 0" }}><strong>Cambio de turno</strong><p style={{ color: "#777", margin: "5px 0 0", fontSize: "13px" }}>Tu turno de hoy termina a las 5:00 p. m.</p></div></Panel></VistaMensajeria>;
}
