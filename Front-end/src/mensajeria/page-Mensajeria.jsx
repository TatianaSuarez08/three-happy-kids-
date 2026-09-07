import { useNavigate } from "react-router-dom";
import "../styles/style.css";
import InicioMensajeria from "./page-InicioMensajeria";
import { VistaMensajeria } from "./MensajeriaUI";

function Mensajeria() {
  const navigate = useNavigate();
  return <VistaMensajeria>
    <InicioMensajeria seleccionarEntrega={() => navigate("/mensajeria/entregas")} irARuta={() => navigate("/mensajeria/ruta")} />
  </VistaMensajeria>;
}

export default Mensajeria;
