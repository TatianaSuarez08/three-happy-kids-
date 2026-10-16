import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyDeliveries } from '../../services/logisticaService';
import { updateOrderStatus } from '../../services/pedidoService';
import Icon from '../../components/Icon';
import StatusBadge from '../../components/StatusBadge';

const deliveryStatuses = ['Todos', 'Por recoger', 'En camino', 'Entregado'];

const formatDateTime = (value) => {
  if (!value) return 'No disponible';
  const date = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const badgeTone = (status) => {
  if (status === 'Entregado') return 'success';
  if (status === 'En camino') return 'info';
  return 'warning';
};

export default function EntregasMensajeria() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [updatingId, setUpdatingId] = useState(null);

  const refreshDeliveries = useCallback(async () => {
    const ownDeliveries = await getMyDeliveries();
    setDeliveries(ownDeliveries);
  }, []);

  useEffect(() => {
    const loadDeliveries = async () => {
      try {
        await refreshDeliveries();
      } catch (err) {
        setError(err.message || 'No se pudieron cargar tus pedidos asignados.');
      } finally {
        setLoading(false);
      }
    };

    loadDeliveries();
  }, [refreshDeliveries]);

  const filteredDeliveries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return deliveries.filter((delivery) => {
      const status = delivery.estadoEntrega || delivery.estado;
      const matchesSearch = !query || String(delivery.id).includes(query);
      const matchesFilter = filter === 'Todos' || status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [deliveries, filter, search]);

  const startDelivery = async (delivery) => {
    setError('');
    setSuccess('');
    setUpdatingId(delivery.id);
    try {
      const result = await updateOrderStatus(delivery.id, 'En camino');
      setDeliveries((current) => current.map((item) => (
        item.id === delivery.id ? { ...item, estado: 'En camino', estadoEntrega: 'En camino' } : item
      )));
      setSuccess(result?.message || `El pedido #${delivery.id} está ahora En camino.`);
      try {
        await refreshDeliveries();
      } catch (refreshError) {
        setError(`El estado se actualizó, pero no se pudo recargar la lista: ${refreshError.message || 'Error del servidor.'}`);
      }
    } catch (err) {
      setError(err.message || 'No se pudo iniciar la entrega.');
      try {
        await refreshDeliveries();
      } catch (refreshError) {
        setError(`${err.message || 'No se pudo iniciar la entrega.'} Tampoco se pudo actualizar la lista: ${refreshError.message || 'Error del servidor.'}`);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-page mensajeria-module">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Mis pedidos</h2>
            <p className="admin-sub">Pedidos asignados a tu usuario mensajero.</p>
          </div>
          <strong className="admin-contador">{filteredDeliveries.length} pedido(s)</strong>
        </div>

        {success && <div className="mensajeria-feedback is-success" role="status">{success}</div>}
        {error && <div className="mensajeria-feedback is-error" role="alert">{error}</div>}

        <div className="admin-search mensajeria-search">
          <Icon name="search" size={18} />
          <input
            type="search"
            aria-label="Buscar mis pedidos por número"
            placeholder="Buscar por número de pedido..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="admin-toolbar" role="group" aria-label="Filtrar mis pedidos por estado">
          {deliveryStatuses.map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={filter === status}
              onClick={() => setFilter(status)}
              className={`admin-pill${filter === status ? ' active' : ''}`}
            >
              {status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="delivery-empty-state" role="status">Cargando tus pedidos...</div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="delivery-empty-state">
            {deliveries.length ? 'No tienes pedidos que coincidan con estos filtros.' : 'No tienes pedidos asignados.'}
          </div>
        ) : (
          <div className="delivery-list">
            {filteredDeliveries.map((delivery) => {
              const status = delivery.estadoEntrega || delivery.estado;
              return (
                <article key={delivery.id} className="delivery-card">
                  <div className="delivery-card__header">
                    <div>
                      <h3 className="delivery-card__title">Pedido #{delivery.id}</h3>
                      <p className="delivery-card__meta">{delivery.cliente || 'Cliente no registrado'} · {delivery.fecha || 'Fecha no registrada'}</p>
                    </div>
                    <StatusBadge tone={badgeTone(status)}>{status}</StatusBadge>
                  </div>

                  <div className="mensajeria-order-information">
                    <p><strong>Dirección:</strong> {delivery.direccion || 'Dirección no registrada'}{delivery.ciudad ? `, ${delivery.ciudad}` : ''}</p>
                    <p><strong>Asignado:</strong> {formatDateTime(delivery.fechaAsignacion)}</p>
                  </div>

                  <details className="mensajeria-order-details">
                    <summary>Ver detalle del pedido</summary>
                    <p><strong>Cliente:</strong> {delivery.cliente || 'No registrado'}</p>
                    <p><strong>Pedido creado:</strong> {delivery.fecha || 'Fecha no registrada'}</p>
                    <ul>
                      {(delivery.productos || []).map((product) => (
                        <li key={`${delivery.id}-${product.nombre}`}>
                          {product.nombre} · {product.cantidad} unidad(es)
                        </li>
                      ))}
                    </ul>
                  </details>

                  {status === 'Por recoger' && (
                    <div className="admin-logistics-footer mensajeria-order-actions">
                      <span>Inicia el trayecto cuando hayas recogido el pedido.</span>
                      <button
                        type="button"
                        className="btn-admin-primary"
                        disabled={updatingId !== null}
                        onClick={() => startDelivery(delivery)}
                      >
                        <Icon name="truck" size={16} />
                        {updatingId === delivery.id ? 'Actualizando...' : 'Iniciar entrega'}
                      </button>
                    </div>
                  )}

                  {status === 'En camino' && (
                    <div className="admin-logistics-footer mensajeria-order-actions">
                      <span>La entrega se completa después de adjuntar una evidencia.</span>
                      <Link
                        className="btn-admin-primary mensajeria-link-button"
                        to={`/mensajeria/evidencias?pedido=${encodeURIComponent(delivery.id)}`}
                      >
                        <Icon name="camera" size={16} /> Ir a confirmación
                      </Link>
                    </div>
                  )}

                  {status === 'Entregado' && (
                    <div className="admin-logistics-footer mensajeria-order-actions">
                      <span>Consulta la fotografía asociada a esta entrega.</span>
                      <Link
                        className="btn-admin-primary mensajeria-link-button"
                        to={`/mensajeria/evidencias?pedido=${encodeURIComponent(delivery.id)}`}
                      >
                        <Icon name="camera" size={16} /> Ver evidencia
                      </Link>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
