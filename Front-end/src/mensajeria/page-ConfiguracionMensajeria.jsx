import { Encabezado, Panel, VistaMensajeria } from "./MensajeriaUI";

export default function ConfiguracionMensajeria() {
  return <VistaMensajeria><Encabezado titulo="Configuracion" subtitulo="Administra tus preferencias de trabajo." /><Panel titulo="Preferencias"><div style={{ display: "flex", justifyContent: "space-between", padding: "13px 0", borderBottom: "1px solid #eee", color: "#777" }}><span>Recibir notificaciones</span><input type="checkbox" defaultChecked /></div><div style={{ display: "flex", justifyContent: "space-between", padding: "13px 0", color: "#777" }}><span>Disponibilidad</span><strong style={{ color: "#3a7d44" }}>Activo</strong></div><button style={{ background: "#fff", color: "#555", border: "1px solid #ddd", borderRadius: "7px", padding: "10px 15px", cursor: "pointer" }}>Cambiar contrasena</button></Panel></VistaMensajeria>;
}
