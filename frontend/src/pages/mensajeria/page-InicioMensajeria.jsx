import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { assignDelivery, getAvailableDeliveries } from '../../services/logisticaService';
import Icon from '../../components/Icon';
import StatusBadge from '../../components/StatusBadge';

const formatDate = (value) => {
  if (!value) return 'Fecha no registrada';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(date);
};

export default function InicioMensajeria() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [assigningId, setAssigningId] = useState(null);

  const refreshDeliveries = useCallback(async () => {
    const available = await getAvailableDeliveries();
    setDeliveries(available);
  }, []);

  useEffect(() => {
    const loadDeliveries = async () => {
      try {
        await refreshDeliveries();
      } catch (err) {
        setError(err.message || 'No se pudieron cargar los pedidos disponibles.');
      } finally {
        setLoading(false);
      }
    };

    loadDeliveries();
  }, [refreshDeliveries]);

  const filteredDeliveries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return deliveries.filter((delivery) => {
      const matchesQuery = !query
        || String(delivery.id).includes(query)
        || String(delivery.cliente || '').toLowerCase().includes(query)
        || String(delivery.direccion || '').toLowerCase().includes(query)
        || String(delivery.ciudad || '').toLowerCase().includes(query);
      const matchesStatus = filter === 'Todos' || (delivery.estadoEntrega || delivery.estado) === filter;
      return matchesQuery && matchesStatus;
    });
  }, [deliveries, filter, search]);

  const assignOrder = async (delivery) => {
    const confirmed = window.confirm(`¿Deseas asignar el pedido #${delivery.id} a tu ruta?`);
    if (!confirmed) return;

    setError('');
    setSuccess('');
    setAssigningId(delivery.id);
    try {
      const result = await assignDelivery(delivery.id);
      setDeliveries((current) => current.filter((item) => item.id !== delivery.id));
      setSuccess(result?.message || `El pedido #${delivery.id} quedó asignado a tu ruta.`);
    } catch (err) {
      setError(err.message || 'No se pudo asignar el pedido.');
      try {
        await refreshDeliveries();
      } catch (refreshError) {
        setError(`${err.message || 'No se pudo asignar el pedido.'} Tampoco se pudo actualizar la lista: ${refreshError.message || 'Error del servidor.'}`);
      }
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="admin-page mensajeria-module">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Pedidos disponibles</h2>
            <p className="admin-sub">Pedidos preparados por Bodega que puedes asignar a tu ruta.</p>
          </div>
          <strong className="admin-contador">{filteredDeliveries.length} pedido(s)</strong>
        </div>

        {success && <div className="mensajeria-feedback is-success" role="status">{success} <Link to="/mensajeria/entregas">Ver mis pedidos</Link></div>}
        {error && <div className="mensajeria-feedback is-error" role="alert">{error}</div>}

        <div className="admin-search mensajeria-search">
          <Icon name="search" size={18} />
          <input
            type="search"
            aria-label="Buscar pedidos disponibles por número, cliente o dirección"
            placeholder="Buscar por pedido, cliente o dirección..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="admin-toolbar" role="group" aria-label="Filtrar pedidos disponibles por estado">
          {['Todos', 'Por recoger'].map((status) => (
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
          <div className="delivery-empty-state" role="status">Cargando pedidos disponibles...</div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="delivery-empty-state">
            {deliveries.length
              ? 'No hay pedidos que coincidan con la búsqueda.'
              : 'No hay pedidos listos para asignar. Los pedidos recién creados aparecerán aquí después de que Bodega los marque como preparados.'}
          </div>
        ) : (
          <div className="delivery-list">
            {filteredDeliveries.map((delivery) => (
              <article key={delivery.id} className="delivery-card">
                <div className="delivery-card__header">
                  <div>
                    <h3 className="delivery-card__title">Pedido #{delivery.id}</h3>
                    <p className="delivery-card__meta">{formatDate(delivery.fecha)}</p>
                  </div>
                  <StatusBadge tone="warning">
                    <Icon name="package" size={15} /> {delivery.estadoEntrega || delivery.estado || 'Por recoger'}
                  </StatusBadge>
                </div>

                <div className="mensajeria-order-information">
                  <p><strong>Cliente:</strong> {delivery.cliente || 'No registrado'}</p>
                  <p><strong>Dirección:</strong> {delivery.direccion || 'Dirección no registrada'}{delivery.ciudad ? `, ${delivery.ciudad}` : ''}</p>
                  <p><strong>Recogida:</strong> Pedido preparado por Bodega</p>
                  <p><strong>Productos:</strong> {delivery.productos?.length || 0}</p>
                </div>

                <div className="admin-logistics-footer mensajeria-order-actions">
                  <span>La asignación queda vinculada a tu sesión.</span>
                  <button
                    type="button"
                    className="btn-admin-primary"
                    disabled={assigningId !== null}
                    onClick={() => assignOrder(delivery)}
                  >
                    <Icon name="truck" size={16} />
                    {assigningId === delivery.id ? 'Asignando...' : 'Asignarme pedido'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
