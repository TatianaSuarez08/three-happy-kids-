import { useCallback, useEffect, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { getMyCourierOrders } from '../../services/pedidoService';

const addressFor = (order) => [order.direccion, order.ciudad].filter(Boolean).join(', ');

const directionsUrlFor = (order) => {
  const address = addressFor(order).trim();
  if (!address || !order.direccion?.trim() || !order.ciudad?.trim()) return null;

  const params = new URLSearchParams({
    api: '1',
    destination: address,
    travelmode: 'driving'
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

export default function RutaMensajeria() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await getMyCourierOrders());
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar tus destinos asignados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const assignedOrders = await getMyCourierOrders();
        if (active) {
          setOrders(assignedOrders);
          setError('');
        }
      } catch (err) {
        if (active) setError(err.message || 'No se pudieron cargar tus destinos asignados.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void refresh();
    const interval = window.setInterval(refresh, 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Ruta / Mapa</h2>
            <p className="admin-sub">Consulta cada destino real en Google Maps. La ruta se abrirá en una pestaña nueva.</p>
          </div>
          <button type="button" className="btn-admin-editar" onClick={loadOrders} disabled={loading}>
            Actualizar
          </button>
        </div>

        {error && <div className="login-error" role="alert">{error}</div>}
        {loading ? (
          <EmptyState>Cargando pedidos asignados...</EmptyState>
        ) : orders.length === 0 ? (
          <EmptyState>No tienes envíos asignados para mostrar en el mapa.</EmptyState>
        ) : (
          <section className="admin-order-card">
            {orders.map((order) => (
              <article className="admin-order-card" key={order.id} style={{ marginBottom: '0.75rem' }}>
                <div className="admin-order-header">
                  <div>
                    <h3>Pedido #{order.id}</h3>
                    <p><strong>Destino:</strong> {addressFor(order) || 'Dirección no registrada'}</p>
                    {!directionsUrlFor(order) && (
                      <small role="status">
                        Este pedido no tiene una dirección de entrega completa. Revisa los datos antes de abrir la ruta.
                      </small>
                    )}
                  </div>
                  <StatusBadge tone={order.estadoEntrega === 'Entregado' ? 'success' : 'info'}>
                    {order.estadoEntrega}
                  </StatusBadge>
                </div>
                {directionsUrlFor(order) && (
                  <a
                    className="btn-admin-primary"
                    href={directionsUrlFor(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ver ruta del pedido ${order.id} en Google Maps`}
                  >
                    Ver ruta en Google Maps
                  </a>
                )}
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
