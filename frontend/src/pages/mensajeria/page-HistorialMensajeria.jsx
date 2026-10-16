import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { getMyDeliveries } from '../../services/logisticaService';

const HistorialMensajeria = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getMyDeliveries()
      .then((orders) => {
        if (active) setDeliveries(orders);
      })
      .catch((err) => {
        if (active) setError(err.message || 'No se pudo cargar el historial de entregas.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const completedDeliveries = deliveries.filter(
    (delivery) => (delivery.estadoEntrega || delivery.estado) === 'Entregado'
  );

  return (
    <div className="admin-page mensajeria-module">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Historial</h2>
            <p className="admin-sub">Pedidos entregados por tu usuario mensajero y sus evidencias.</p>
          </div>
          <strong className="admin-contador">{completedDeliveries.length} entrega(s)</strong>
        </div>

        {error && <div className="mensajeria-feedback is-error" role="alert">{error}</div>}
        {loading ? (
          <div className="delivery-empty-state" role="status">Cargando historial...</div>
        ) : completedDeliveries.length === 0 ? (
          <div className="delivery-empty-state">Todavía no tienes entregas completadas.</div>
        ) : (
          <div className="delivery-list">
            {completedDeliveries.map((delivery) => (
              <article key={delivery.id} className="delivery-card">
                <div className="delivery-card__header">
                  <div>
                    <h3 className="delivery-card__title">Pedido #{delivery.id}</h3>
                    <p className="delivery-card__meta">{delivery.cliente || 'Cliente no registrado'} · {delivery.fecha || 'Fecha no disponible'}</p>
                  </div>
                  <StatusBadge tone="success">Entregado</StatusBadge>
                </div>
                <div className="mensajeria-order-information">
                  <p><strong>Dirección:</strong> {delivery.direccion || 'Dirección no registrada'}{delivery.ciudad ? `, ${delivery.ciudad}` : ''}</p>
                  <p><strong>Asignado:</strong> {delivery.fechaAsignacion || 'Fecha no disponible'}</p>
                </div>
                <div className="admin-logistics-footer mensajeria-order-actions">
                  <span>Consulta la evidencia fotográfica registrada.</span>
                  <Link
                    className="btn-admin-primary mensajeria-link-button"
                    to={`/mensajeria/evidencias?pedido=${encodeURIComponent(delivery.id)}`}
                  >
                    Ver evidencia
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialMensajeria;
