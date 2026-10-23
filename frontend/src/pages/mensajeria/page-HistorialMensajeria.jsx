import { useCallback, useEffect, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { getCourierHistory } from '../../services/pedidoService';

const dateTime = (value) => (value ? new Date(value).toLocaleString('es-CO') : 'No registrada');

export default function HistorialMensajeria() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHistory = useCallback(async () => {
    try {
      setError('');
      setHistory(await getCourierHistory());
    } catch (err) {
      setError(err.message || 'No se pudo cargar tu historial de Mensajería.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadHistory);
  }, [loadHistory]);

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Historial de Mensajería</h2>
            <p className="admin-sub">Actividades registradas para tu usuario y sus pedidos relacionados.</p>
          </div>
          <button type="button" className="btn-admin-editar" onClick={loadHistory} disabled={loading}>
            Actualizar
          </button>
        </div>

        {error && <div className="login-error" role="alert">{error}</div>}
        {loading ? (
          <EmptyState>Cargando historial...</EmptyState>
        ) : history.length === 0 ? (
          <EmptyState>Aún no hay actividades registradas para tu usuario.</EmptyState>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.map((event) => (
              <article className="admin-order-card" key={event.id}>
                <div className="admin-order-header">
                  <div>
                    <h3>Pedido #{event.idPedido} · {event.evento}</h3>
                    <p>{event.evento === 'Asignado a Mensajería' ? 'Fecha de asignación' : 'Fecha del evento'}: {dateTime(event.fecha)}</p>
                  </div>
                  {event.estadoEntrega && <StatusBadge tone={event.estadoEntrega === 'Entregado' ? 'success' : 'info'}>{event.estadoEntrega}</StatusBadge>}
                </div>
                <div className="admin-order-summary">
                  <p><strong>Dirección:</strong> {[event.direccion, event.ciudad].filter(Boolean).join(', ') || 'No registrada'}</p>
                  {event.fechaAsignacionActual && (
                    <p><strong>Asignación actual:</strong> {dateTime(event.fechaAsignacionActual)}</p>
                  )}
                  {event.mensajeroActual && (
                    <p><strong>Mensajero actualmente asignado:</strong> {event.mensajeroActual}</p>
                  )}
                  {event.estadoPedido && <p><strong>Estado del pedido:</strong> {event.estadoPedido}</p>}
                  {event.observacion && <p><strong>Observación:</strong> {event.observacion}</p>}
                </div>
                {event.productos.length > 0 && (
                  <details>
                    <summary>Productos del pedido ({event.productos.length})</summary>
                    <ul>
                      {event.productos.map((product) => (
                        <li key={product.idProducto}>
                          {product.nombre} · {product.cantidad} uds · Talla {product.talla || 'N/D'} · Color {product.color || 'N/D'}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
