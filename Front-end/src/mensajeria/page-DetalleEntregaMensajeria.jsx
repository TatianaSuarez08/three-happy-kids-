import { Encabezado, Panel, VistaMensajeria } from "./MensajeriaUI";

export default function DetalleEntregaMensajeria() {
  return <VistaMensajeria><Encabezado titulo="Detalle de entrega" subtitulo="Consulta la informacion completa del pedido seleccionado." /><Panel titulo="Pedido HK-1048"><p><strong>Cliente:</strong> Laura Gomez</p><p><strong>Direccion:</strong> Cra. 18 #42-16</p><p><strong>Telefono:</strong> 300 000 0000</p><p><strong>Paquete:</strong> Ropa infantil</p><p><strong>Instrucciones:</strong> Entregar en porteria.</p><button className="btn-admin-primary">Iniciar entrega</button><button className="btn-admin-editar">Marcar como entregado</button></Panel></VistaMensajeria>;
}
