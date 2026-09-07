import { Encabezado, Panel, VistaMensajeria } from "./MensajeriaUI";

export default function RutaMensajeria() {
    return (
    <VistaMensajeria>
                <Encabezado titulo="🗺️ Ruta / Mapa" subtitulo="Vista general de tus paradas programadas." />
        <Panel titulo="Ruta de entregas">
            <div style={{ height: "430px", borderRadius: "10px", background: "#e9eef0", position: "relative", overflow: "hidden" }}>
                <span style={{ position: "absolute", top: "22%", left: "18%", background: "#ff8c42", color: "#fff", borderRadius: "50%", padding: "7px 11px" }}>1</span>
                <span style={{ position: "absolute", top: "45%", left: "54%", background: "#ff8c42", color: "#fff", borderRadius: "50%", padding: "7px 11px" }}>2</span>
                <span style={{ position: "absolute", top: "70%", left: "78%", background: "#ff8c42", color: "#fff", borderRadius: "50%", padding: "7px 11px" }}>3</span>
                <div style={{ position: "absolute", inset: 0, display: "grid", placeContent: "center", textAlign: "center", color: "#667", fontSize: "18px" }}>Mapa de ruta<br /><small>La integracion de navegacion estara disponible proximamente.</small></div>
            </div>
        </Panel>
    </VistaMensajeria>
    );
}
