import { useNavigate } from "react-router-dom";
import "../styles/style.css";
import { entregasDemo, coloresEstado } from "./mensajeriaData";
import InicioMensajeria from "./page-InicioMensajeria";

function Mensajeria({ seccion = "inicio" }) {
  const navigate = useNavigate();

  const renderSeccion = () => {
    switch (seccion) {
      case "entregas":
        return (
          <div className="mensajeria-dashboard">
            <div className="mensajeria-header-row">
              <div>
                <h2 className="mensajeria-title">Mis entregas</h2>
                <p className="mensajeria-subtitle">Consulta y organiza los pedidos asignados a tu ruta.</p>
              </div>
              <strong className="mensajeria-count">{entregasDemo.length} entrega(s)</strong>
            </div>

            <div className="mensajeria-lista">
              {entregasDemo.map((item) => {
                const estado = coloresEstado[item.estado] || ["#f5f5f5", "#555"];
                return (
                  <div key={item.id} className="mensajeria-entrega-card">
                    <div className="mensajeria-entrega-main">
                      <div>
                        <h3>Pedido #{item.id.replace("HK-", "")}</h3>
                        <p>{item.cliente} · {item.hora}</p>
                      </div>
                      <span className="mensajeria-badge" style={{ background: estado[0], color: estado[1] }}>{item.estado}</span>
                    </div>

                    <div className="mensajeria-entrega-body">
                      <div className="mensajeria-products">
                        <div className="mensajeria-product-row">
                          <span className="mensajeria-product-name">{item.paquete}</span>
                          <strong className="mensajeria-product-price">COP 144.000</strong>
                        </div>
                        <div className="mensajeria-product-row secondary">
                          <span className="mensajeria-product-name">{item.direccion}</span>
                          <strong className="mensajeria-product-price">COP 130.000</strong>
                        </div>
                      </div>

                      <aside className="mensajeria-resumen">
                        <h4>Detalle de {item.id}</h4>
                        <p><strong>Cliente:</strong> {item.cliente}</p>
                        <p><strong>Dirección:</strong> {item.direccion}</p>
                        <p><strong>Paquete:</strong> {item.paquete}</p>
                        <div className="mensajeria-total">
                          <span>Total</span>
                          <strong>COP 274.000</strong>
                        </div>
                      </aside>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "ruta":
        return (
          <div className="mensajeria-dashboard">
            <div className="mensajeria-header-row">
              <div>
                <h2 className="mensajeria-title">Ruta / Mapa</h2>
                <p className="mensajeria-subtitle">Vista general de tus paradas programadas.</p>
              </div>
            </div>

            <div className="mensajeria-entrega-card">
              <div className="mensajeria-entrega-main">
                <div>
                  <h3>Ruta de entregas</h3>
                  <p>12 de 15 paradas · turno 8:00 a. m. - 5:00 p. m.</p>
                </div>
                <span className="mensajeria-badge" style={{ background: "#fff8e0", color: "#b87800" }}>Activa</span>
              </div>

              <div className="mensajeria-ruta-map">
                <span className="ruta-punto punto-1">1</span>
                <span className="ruta-punto punto-2">2</span>
                <span className="ruta-punto punto-3">3</span>
                <div className="ruta-placeholder">Mapa de ruta<br /><small>La integración de navegación estará disponible próximamente.</small></div>
              </div>
            </div>
          </div>
        );

      case "evidencias":
        return (
          <div className="mensajeria-dashboard">
            <div className="mensajeria-header-row">
              <div>
                <h2 className="mensajeria-title">Evidencias</h2>
                <p className="mensajeria-subtitle">Adjunta comprobantes y capturas de entrega.</p>
              </div>
            </div>

            <div className="mensajeria-entrega-card">
              <div className="mensajeria-evidencia-box">
                <div>
                  <strong>No hay evidencias cargadas</strong>
                  <small>Sube fotos o comprobantes desde la entrega seleccionada.</small>
                </div>
              </div>
            </div>
          </div>
        );

      case "novedades":
        return (
          <div className="mensajeria-dashboard">
            <div className="mensajeria-header-row">
              <div>
                <h2 className="mensajeria-title">Novedades</h2>
                <p className="mensajeria-subtitle">Reportes y observaciones del día.</p>
              </div>
            </div>

            <div className="mensajeria-entrega-card">
              <div className="mensajeria-resumen" style={{ borderLeft: "none", paddingLeft: 0 }}>
                <p><strong>Sin novedades:</strong> no hay reportes pendientes.</p>
                <p><strong>Última actualización:</strong> hace 2 horas.</p>
              </div>
            </div>
          </div>
        );

      case "historial":
        return (
          <div className="mensajeria-dashboard">
            <div className="mensajeria-header-row">
              <div>
                <h2 className="mensajeria-title">Historial</h2>
                <p className="mensajeria-subtitle">Resumen de entregas completadas y fallidas.</p>
              </div>
            </div>

            <div className="mensajeria-entrega-card">
              <div className="mensajeria-resumen" style={{ borderLeft: "none", paddingLeft: 0 }}>
                <p><strong>Entregas completadas:</strong> 24</p>
                <p><strong>Fallidas:</strong> 2</p>
                <p><strong>Promedio:</strong> 96% de cumplimiento.</p>
              </div>
            </div>
          </div>
        );

      case "perfil":
        return (
          <div className="mensajeria-dashboard">
            <div className="mensajeria-header-row">
              <div>
                <h2 className="mensajeria-title">Mi perfil</h2>
                <p className="mensajeria-subtitle">Información del mensajero y configuración personal.</p>
              </div>
            </div>

            <div className="mensajeria-entrega-card">
              <div className="mensajeria-resumen" style={{ borderLeft: "none", paddingLeft: 0 }}>
                <p><strong>Nombre:</strong> Carlos López</p>
                <p><strong>Unidad:</strong> Moto - 208</p>
                <p><strong>Turno:</strong> 8:00 a. m. - 5:00 p. m.</p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <InicioMensajeria
            seleccionarEntrega={() => navigate("/mensajeria/entregas")}
            irARuta={() => navigate("/mensajeria/ruta")}
          />
        );
    }
  };

  return <div className="admin-page"><div className="admin-container">{renderSeccion()}</div></div>;
}

export default Mensajeria;
