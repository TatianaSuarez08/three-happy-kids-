import { useCallback, useEffect, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import { ProductImage, ProductImageCredits } from '../../components/ProductImage';
import StatusBadge from '../../components/StatusBadge';
import {
  assignWarehouseOrder,
  getAvailableWarehouseOrders,
  getMyWarehouseOrders,
  releaseWarehouseOrder,
  submitOrderPreparation
} from '../../services/pedidoService';

const issueTypes = [
  'No encontrado',
  'Dañado',
  'Referencia incorrecta',
  'Talla incorrecta',
  'Color incorrecto',
  'Otra novedad'
];

const initialChecklist = (order) => order.productos.map((product) => {
  const preparation = order.preparacion?.find((line) => line.idProducto === product.idProducto);
  const novelty = order.novedades?.find((line) => line.idProducto === product.idProducto && line.etapa === 'Bodega');
  return {
    idProducto: product.idProducto,
    encontrado: preparation ? Boolean(preparation.encontrado) : !novelty,
    tipoNovedad: novelty?.tipo || '',
    descripcion: preparation?.observacion || novelty?.descripcion || ''
  };
});

export default function BodegueroPedidos() {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [checklists, setChecklists] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadOrders = useCallback(async () => {
    try {
      const [available, assigned] = await Promise.all([
        getAvailableWarehouseOrders(),
        getMyWarehouseOrders()
      ]);
      setError('');
      setAvailableOrders(available);
      setAssignedOrders(assigned);
      setChecklists((previous) => {
        const next = { ...previous };
        assigned.forEach((order) => {
          if (!next[order.id]) next[order.id] = initialChecklist(order);
        });
        return next;
      });
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los pedidos de Bodega.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const fetchOrders = async () => {
      try {
        const [available, assigned] = await Promise.all([
          getAvailableWarehouseOrders(),
          getMyWarehouseOrders()
        ]);
        if (!active) return;
        setError('');
        setAvailableOrders(available);
        setAssignedOrders(assigned);
        setChecklists((previous) => {
          const next = { ...previous };
          assigned.forEach((order) => {
            if (!next[order.id]) next[order.id] = initialChecklist(order);
          });
          return next;
        });
      } catch (err) {
        if (active) setError(err.message || 'No se pudieron cargar los pedidos de Bodega.');
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
      await assignWarehouseOrder(orderId);
      setMessage(`El pedido #${orderId} quedó asignado a tu usuario.`);
      await loadOrders();
    } catch (err) {
      setError(err.message || 'No se pudo asignar el pedido.');
      await loadOrders();
    } finally {
      setSavingId(null);
    }
  };

  const releaseOrder = async (orderId) => {
    if (!window.confirm(`¿Deseas no asignar el pedido #${orderId}? Volverá a estar disponible para Bodega.`)) {
      return;
    }
    setSavingId(orderId);
    setError('');
    setMessage('');
    try {
      await releaseWarehouseOrder(orderId);
      setMessage(`El pedido #${orderId} quedó disponible nuevamente.`);
      await loadOrders();
    } catch (err) {
      setError(err.message || 'No se pudo liberar el pedido.');
      await loadOrders();
    } finally {
      setSavingId(null);
    }
  };

  const changeChecklist = (order, productId, changes) => {
    const current = checklists[order.id] || initialChecklist(order);
    setChecklists((previous) => ({
      ...previous,
      [order.id]: current.map((line) => (
        line.idProducto === productId
          ? {
            ...line,
            ...changes,
            ...(changes.encontrado ? { tipoNovedad: '', descripcion: '' } : {})
          }
          : line
      ))
    }));
  };

  const submitChecklist = async (order) => {
    setSavingId(order.id);
    setError('');
    setMessage('');
    try {
      const result = await submitOrderPreparation(order.id, checklists[order.id] || initialChecklist(order));
      setMessage(result.estadoPreparacion === 'Listo para despacho'
        ? `El pedido #${order.id} está listo para despacho.`
        : `Se registraron novedades para el pedido #${order.id}; Administración debe revisarlas.`);
      await loadOrders();
    } catch (err) {
      setError(err.message || 'No se pudo guardar la preparación.');
    } finally {
      setSavingId(null);
    }
  };

  const renderProducts = (order) => (
    <div className="bodeguero-list bodeguero-order-products">
      {order.productos.map((product) => (
        <div key={`${order.id}-${product.idProducto}`} className="bodeguero-item">
          <ProductImage
            product={product}
            className="bodeguero-order-product-image-container"
            imageClassName="bodeguero-order-product-image"
          />
          <div>
            <strong>{product.nombre}</strong>
            <small>
              {product.cantidad} uds · Talla: {product.talla || 'No registrada'} · Color: {product.color || 'No registrado'} · Stock disponible: {product.stockDisponible} uds
            </small>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bodeguero-section">
      {error && <div className="bodeguero-message error" role="alert">{error}</div>}
      {message && <div className="bodeguero-message" role="status">{message}</div>}

      <section className="bodeguero-panel">
        <div className="bodeguero-panel-header">
          <h2>Pedidos disponibles</h2>
          <span className="bodeguero-pill">{availableOrders.length} sin asignar</span>
        </div>
        {loading ? (
          <EmptyState>Cargando pedidos disponibles...</EmptyState>
        ) : availableOrders.length === 0 ? (
          <EmptyState>No hay pedidos pendientes para preparar.</EmptyState>
        ) : (
          <div className="bodeguero-list">
            {availableOrders.map((order) => (
              <article key={order.id} className="bodeguero-item bodeguero-order-card">
                <div className="bodeguero-order-header">
                  <div>
                    <strong>Pedido #{order.id}</strong>
                    <small>{order.fecha} · {order.cliente}</small>
                  </div>
                  <StatusBadge tone="warning">Pendiente de preparación</StatusBadge>
                </div>
                <div className="bodeguero-order-meta">
                  <span>Teléfono: {order.telefono || 'No registrado'}</span>
                  <span>Entrega: {order.direccion || 'Sin dirección'}, {order.ciudad || 'Sin ciudad'}</span>
                </div>
                <details>
                  <summary>Consultar productos y detalle</summary>
                  {renderProducts(order)}
                </details>
                <button type="button" className="btn-admin-primary" disabled={savingId === order.id} onClick={() => assignOrder(order.id)}>
                  {savingId === order.id ? 'Asignando...' : 'Asignarme pedido'}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="bodeguero-panel">
        <div className="bodeguero-panel-header">
          <h2>Mis pedidos asignados</h2>
          <span className="bodeguero-pill">{assignedOrders.length} activos</span>
        </div>
        {loading ? (
          <EmptyState>Cargando tus pedidos...</EmptyState>
        ) : assignedOrders.length === 0 ? (
          <EmptyState>Aún no tienes pedidos asignados.</EmptyState>
        ) : (
          <div className="bodeguero-list">
            {assignedOrders.map((order) => {
              const checklist = checklists[order.id] || initialChecklist(order);
              return (
                <article key={order.id} className="bodeguero-item bodeguero-order-card">
                  <div className="bodeguero-order-header">
                    <div>
                      <strong>Pedido #{order.id}</strong>
                      <small>{order.fecha} · {order.cliente}</small>
                    </div>
                    <StatusBadge tone={order.estadoPreparacion === 'Novedad' ? 'warning' : 'success'}>
                      {order.estadoPreparacion}
                    </StatusBadge>
                  </div>
                  <div className="bodeguero-order-meta">
                    <span>Responsable: {order.bodeguero || 'No identificado'}</span>
                    <span>Asignado: {new Date(order.fechaAsignacionBodega).toLocaleString('es-CO')}</span>
                    <span>{order.direccion || 'Sin dirección'}, {order.ciudad || 'Sin ciudad'}</span>
                  </div>
                  {order.estadoPreparacion === 'Asignado' && (
                    <button
                      type="button"
                      className="bodeguero-button-secondary"
                      disabled={savingId === order.id}
                      onClick={() => releaseOrder(order.id)}
                    >
                      {savingId === order.id ? 'Cancelando...' : 'No asignar pedido'}
                    </button>
                  )}
                  {order.novedades?.length > 0 && (
                    <div className="bodeguero-message">
                      {order.novedades.map((novelty) => (
                        <p key={novelty.id}>
                          {novelty.tipo}: {novelty.descripcion} · {novelty.estado}
                          {novelty.decision ? ` · Decisión: ${novelty.decision}` : ''}
                        </p>
                      ))}
                    </div>
                  )}
                  <details>
                    <summary>Historial del pedido</summary>
                    <ul>
                      {order.historial.map((entry) => (
                        <li key={entry.id}>
                          {entry.evento} · {entry.usuario} · {new Date(entry.fecha).toLocaleString('es-CO')}
                          {entry.observacion ? ` · ${entry.observacion}` : ''}
                        </li>
                      ))}
                    </ul>
                  </details>
                  <div className="bodeguero-list bodeguero-order-products">
                    {order.productos.map((product) => {
                      const line = checklist.find((item) => item.idProducto === product.idProducto)
                        || { idProducto: product.idProducto, encontrado: true, tipoNovedad: '', descripcion: '' };
                      return (
                        <div key={`${order.id}-${product.idProducto}`} className="bodeguero-item">
                          <ProductImage
                            product={product}
                            className="bodeguero-order-product-image-container"
                            imageClassName="bodeguero-order-product-image"
                          />
                          <div>
                            <strong>{product.nombre}</strong>
                            <small>
                              Solicitadas: {product.cantidad} · Talla: {product.talla || 'No registrada'} · Color: {product.color || 'No registrado'} · Stock disponible: {product.stockDisponible} uds
                            </small>
                            <label>
                              <input
                                type="checkbox"
                                checked={line.encontrado}
                                onChange={(event) => changeChecklist(order, product.idProducto, { encontrado: event.target.checked })}
                              />
                              {' '}Producto encontrado y verificado
                            </label>
                            {!line.encontrado && (
                              <div>
                                <label>
                                  Tipo de novedad
                                  <select value={line.tipoNovedad} onChange={(event) => changeChecklist(order, product.idProducto, { tipoNovedad: event.target.value })}>
                                    <option value="">Selecciona una opción</option>
                                    {issueTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                                  </select>
                                </label>
                                <label>
                                  Descripción
                                  <textarea
                                    maxLength={1000}
                                    value={line.descripcion}
                                    onChange={(event) => changeChecklist(order, product.idProducto, { descripcion: event.target.value })}
                                  />
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button type="button" className="btn-admin-primary" disabled={savingId === order.id} onClick={() => submitChecklist(order)}>
                    {savingId === order.id ? 'Guardando...' : 'Guardar verificación'}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <ProductImageCredits
        products={[...availableOrders, ...assignedOrders].flatMap((order) => order.productos)}
      />
    </div>
  );
}
