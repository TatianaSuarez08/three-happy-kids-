import { useCallback, useEffect, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import {
  assignCourierOrder,
  getAvailableCourierOrders
} from '../../services/pedidoService';

export default function InicioMensajeria() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await getAvailableCourierOrders());
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los pedidos listos para entrega.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const fetchOrders = async () => {
      try {
        const result = await getAvailableCourierOrders();
        if (!active) return;
        setOrders(result);
        setError('');
      } catch (err) {
        if (active) setError(err.message || 'No se pudieron cargar los pedidos listos para entrega.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchOrders();
    const refreshInterval = window.setInterval(fetchOrders, 15000);
    return () => {
      active = false;
      window.clearInterval(refreshInterval);
    };
  }, []);

  const assignOrder = async (orderId) => {
    setSavingId(orderId);
    setError('');
    setMessage('');
    try {
      await assignCourierOrder(orderId);
      setMessage(`El pedido #${orderId} quedó asignado a tus entregas.`);
      await loadOrders();
    } catch (err) {
      setError(err.message || 'No se pudo asignar el pedido.');
      await loadOrders();
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Pedidos listos para despacho</h2>
            <p className="admin-sub">Solo aparecen pedidos preparados y sin mensajero asignado.</p>
          </div>
          <strong className="admin-contador">{orders.length} disponible(s)</strong>
        </div>

        {error && <div className="login-error" role="alert">{error}</div>}
        {message && <div className="bodeguero-message" role="status">{message}</div>}
        {loading ? (
          <EmptyState>Cargando pedidos disponibles...</EmptyState>
        ) : orders.length === 0 ? (
          <EmptyState>No hay pedidos listos para despacho.</EmptyState>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map((order) => (
              <article key={order.id} className="admin-order-card">
                <div className="admin-order-header">
                  <div>
                    <h3>Pedido #{order.id}</h3>
                    <p>{order.cliente} · Compra {order.fecha} · Preparado {order.fechaPreparacion || 'sin fecha'}</p>
                  </div>
                  <StatusBadge tone="success">Listo para despacho</StatusBadge>
                </div>
                <div className="admin-order-summary">
                  <p><strong>Dirección:</strong> {order.direccion || 'No registrada'}, {order.ciudad || 'Sin ciudad'}</p>
                  <p><strong>Teléfono:</strong> {order.telefono || 'No registrado'}</p>
                </div>
                <details>
                  <summary>Ver productos y novedades</summary>
                  <ul>
                    {order.productos.map((product) => (
                      <li key={product.idProducto}>
                        {product.nombre} · {product.cantidad} uds · Talla {product.talla || 'N/D'} · Color {product.color || 'N/D'}
                      </li>
                    ))}
                  </ul>
                  {order.novedades?.map((novelty) => (
                    <p key={novelty.id}>{novelty.tipo}: {novelty.descripcion}</p>
                  ))}
                  <h4>Historial</h4>
                  <ul>
                    {order.historial.map((event) => (
                      <li key={event.id}>{event.evento} · {event.usuario} · {new Date(event.fecha).toLocaleString('es-CO')}</li>
                    ))}
                  </ul>
                </details>
                <button
                  type="button"
                  className="btn-admin-primary"
                  disabled={savingId === order.id}
                  onClick={() => assignOrder(order.id)}
                >
                  {savingId === order.id ? 'Asignando...' : 'Asignarme entrega'}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
