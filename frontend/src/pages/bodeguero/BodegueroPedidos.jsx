import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { getOrders } from '../../services/pedidoService';

const normalizeStatus = (value) => String(value || '').trim();

export default function BodegueroPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const pedidosList = await getOrders();
        const filtered = pedidosList.filter((pedido) => {
          const estado = normalizeStatus(pedido.estado).toLowerCase();
          return !['entregado', 'cancelado', 'anulada'].includes(estado);
        });

        setPedidos(filtered);
      } catch (err) {
        setError(err.message || 'No se pudieron cargar los pedidos.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const pedidosResumen = useMemo(
    () => pedidos.map((pedido) => ({
      ...pedido,
      productosList: Array.isArray(pedido.productos) ? pedido.productos : []
    })),
    [pedidos]
  );

  if (loading) {
    return (
      <div className="bodeguero-panel">
        <EmptyState>Cargando pedidos para preparación...</EmptyState>
      </div>
    );
  }

  return (
    <div className="bodeguero-section">
      {error && <div className="bodeguero-message error">{error}</div>}

      <section className="bodeguero-panel">
        <div className="bodeguero-panel-header">
          <h2>Pedidos pendientes</h2>
          <span className="bodeguero-pill">{pedidosResumen.length} en preparación</span>
        </div>

        {pedidosResumen.length === 0 ? (
          <EmptyState>No hay pedidos pendientes para preparar.</EmptyState>
        ) : (
          <div className="bodeguero-list">
            {pedidosResumen.map((pedido) => (
              <article key={pedido.id} className="bodeguero-item bodeguero-order-card">
                <div className="bodeguero-order-header">
                  <div>
                    <strong>Pedido #{pedido.id}</strong>
                    <small>{pedido.fecha}</small>
                  </div>
                  <StatusBadge tone={pedido.estado?.toLowerCase() === 'pendiente' ? 'warning' : 'success'}>
                    {pedido.estado || 'Pendiente'}
                  </StatusBadge>
                </div>

                <div className="bodeguero-list bodeguero-order-products">
                  {pedido.productosList.length === 0 ? (
                    <EmptyState>Sin productos asociados.</EmptyState>
                  ) : (
                    pedido.productosList.map((producto) => (
                      <div key={`${pedido.id}-${producto.nombre}`} className="bodeguero-item">
                        <div>
                          <strong>{producto.nombre}</strong>
                          <small>{producto.cantidad} uds</small>
                        </div>
                        <StatusBadge tone="success">Preparar</StatusBadge>
                      </div>
                    ))
                  )}
                </div>

                <div className="bodeguero-order-meta">
                  <span>Cliente: {pedido.cliente || 'No registrado'}</span>
                  <span>Ciudad: {pedido.ciudad || 'Sin ciudad'}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
