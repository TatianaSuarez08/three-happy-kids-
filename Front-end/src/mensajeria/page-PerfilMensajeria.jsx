import { Encabezado, Panel, VistaMensajeria } from "./MensajeriaUI";

export default function PerfilMensajeria() {
    return (
    <VistaMensajeria>
                <Encabezado titulo="👤 Mi perfil" subtitulo="Informacion personal y del vehiculo." />
        <Panel titulo="Datos del mensajero">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#ff8c42", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: "20px" }}>MG</div>
                <div>
                    <h3 style={{ margin: 0 }}>Mensajero HappyKids</h3>
                    <p style={{ color: "#888", margin: "5px 0" }}>mensajero@example.com</p>
                    <p style={{ color: "#555", margin: 0 }}>Motocicleta - Disponible</p>
                </div>
            </div>
        </Panel>
    </VistaMensajeria>
    );
}
