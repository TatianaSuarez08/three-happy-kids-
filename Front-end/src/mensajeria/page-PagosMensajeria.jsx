import { Encabezado, Panel, VistaMensajeria } from "./MensajeriaUI";

export default function PagosMensajeria() {
    return (
    <VistaMensajeria>
                <Encabezado titulo="💰 Pagos y liquidaciones" subtitulo="Resumen visual de tus entregas y ganancias." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <Panel titulo="Entregas realizadas">
                <strong style={{ fontSize: "26px", color: "#3a7d44" }}>42</strong>
            </Panel>
            <Panel titulo="Bonificaciones">
                <strong style={{ fontSize: "26px", color: "#ff8c42" }}>$35.000</strong>
            </Panel>
            <Panel titulo="Total generado">
                <strong style={{ fontSize: "26px", color: "#4a90d9" }}>$480.000</strong>
            </Panel>
        </div>
        <Panel titulo="Liquidaciones anteriores">
            <p style={{ color: "#777" }}>No hay liquidaciones registradas en esta vista de demostracion.</p>
        </Panel>
    </VistaMensajeria>
    );
}
