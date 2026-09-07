import { entregasDemo } from "./mensajeriaData";
import { Encabezado, EntregaFila, Panel, VistaMensajeria } from "./MensajeriaUI";

export default function HistorialMensajeria() {
  return <VistaMensajeria><Encabezado titulo="Historial" subtitulo="Consulta tus entregas anteriores." /><Panel titulo="Entregas recientes"><EntregaFila entrega={{ ...entregasDemo[0], id: "HK-1038", estado: "Entregado", hora: "Ayer, 4:20 p. m." }} /><EntregaFila entrega={{ ...entregasDemo[1], id: "HK-1032", estado: "Entregado", hora: "Ayer, 1:10 p. m." }} /></Panel></VistaMensajeria>;
}
