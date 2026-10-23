import { useCallback, useEffect, useRef, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import {
  getDeliveryEvidenceObjectUrl,
  getMyCourierOrders,
  releaseCourierOrder,
  updateCourierOrderStatus,
  uploadDeliveryEvidence
} from '../../services/pedidoService';

const badgeTone = (status) => (
  status === 'Entregado' ? 'success'
    : ['Entrega fallida', 'Novedad'].includes(status) ? 'warning'
      : 'info'
);

export default function EntregasMensajeria() {
  const [orders, setOrders] = useState([]);
  const [evidenceUrls, setEvidenceUrls] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const evidenceUrlsRef = useRef({});
  const previewUrlsRef = useRef({});

  useEffect(() => {
    evidenceUrlsRef.current = evidenceUrls;
  }, [evidenceUrls]);

  useEffect(() => {
    previewUrlsRef.current = previewUrls;
  }, [previewUrls]);

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await getMyCourierOrders());
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar tus entregas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const fetchOrders = async () => {
      try {
        const result = await getMyCourierOrders();
        if (!active) return;
        setOrders(result);
        setError('');
      } catch (err) {
        if (active) setError(err.message || 'No se pudieron cargar tus entregas.');
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

  useEffect(() => {
    let active = true;
    const loadEvidence = async () => {
      const withEvidence = orders.filter((order) => order.evidencia && !evidenceUrls[order.id]);
      if (!withEvidence.length) return;
      const results = await Promise.all(withEvidence.map(async (order) => {
        try {
          return [order.id, await getDeliveryEvidenceObjectUrl(order.id)];
        } catch (err) {
          return [order.id, null, err];
        }
      }));
      if (!active) {
        results.forEach(([, url]) => url && URL.revokeObjectURL(url));
        return;
      }
      setEvidenceUrls((previous) => ({
        ...previous,
        ...Object.fromEntries(results.filter(([, url]) => url).map(([id, url]) => [id, url]))
      }));
      const failed = results.find(([, url]) => !url);
      if (failed) setError(failed[2]?.message || 'No se pudo cargar una fotografía de evidencia.');
    };
    loadEvidence();
    return () => { active = false; };
  }, [orders, evidenceUrls]);

  useEffect(() => () => {
    Object.values(evidenceUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
    Object.values(previewUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const setFile = (orderId, file) => {
    const previousPreview = previewUrls[orderId];
    if (previousPreview) URL.revokeObjectURL(previousPreview);
    if (!file) {
      setSelectedFiles((previous) => ({ ...previous, [orderId]: null }));
      setPreviewUrls((previous) => {
        const next = { ...previous };
        delete next[orderId];
        return next;
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSelectedFiles((previous) => ({ ...previous, [orderId]: null }));
      setPreviewUrls((previous) => {
        const next = { ...previous };
        delete next[orderId];
        return next;
      });
      setError('La fotografía no puede superar 5 MB.');
      return;
    }
    setError('');
    setSelectedFiles((previous) => ({ ...previous, [orderId]: file }));
    setPreviewUrls((previous) => ({ ...previous, [orderId]: URL.createObjectURL(file) }));
  };

  const saveEvidence = async (orderId) => {
    const file = selectedFiles[orderId];
    if (!file) {
      setError('Selecciona una fotografía antes de guardar la evidencia.');
      return;
    }
    setSavingId(orderId);
    setError('');
    setMessage('');
    try {
      await uploadDeliveryEvidence(orderId, file);
      setMessage(`Evidencia del pedido #${orderId} guardada correctamente.`);
      setSelectedFiles((previous) => ({ ...previous, [orderId]: null }));
      await loadOrders();
    } catch (err) {
      setError(err.message || 'No se pudo guardar la fotografía.');
    } finally {
      setSavingId(null);
    }
  };

  const changeStatus = async (order, status) => {
    let observation = '';
    if (status === 'Entrega fallida') {
      observation = window.prompt('Describe el motivo de la entrega fallida:') || '';
      if (!observation.trim()) return;
    }
    setSavingId(order.id);
    setError('');
    setMessage('');
    try {
      await updateCourierOrderStatus(order.id, status, observation);
      setMessage(`El pedido #${order.id} ahora está en estado ${status}.`);
      await loadOrders();
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el estado.');
    } finally {
      setSavingId(null);
    }
  };

  const releaseAssignment = async (order) => {
    if (!window.confirm(`¿Deseas liberar la asignación del pedido #${order.id}? El pedido no se cancelará y volverá a estar disponible para Mensajería.`)) {
      return;
    }
    setSavingId(order.id);
    setError('');
    setMessage('');
    try {
      await releaseCourierOrder(order.id);
      setMessage(`La asignación del pedido #${order.id} se liberó. El pedido sigue activo y volvió a estar disponible.`);
      await loadOrders();
    } catch (err) {
      setError(err.message || 'No se pudo liberar la asignación.');
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
            <h2 className="admin-titulo">Mis entregas</h2>
            <p className="admin-sub">Pedidos asignados a tu usuario, con seguimiento y evidencia.</p>
          </div>
          <strong className="admin-contador">{orders.length} entrega(s)</strong>
        </div>

        {error && <div className="login-error" role="alert">{error}</div>}
        {message && <div className="bodeguero-message" role="status">{message}</div>}
        {loading ? (
          <EmptyState>Cargando tus entregas...</EmptyState>
        ) : orders.length === 0 ? (
          <EmptyState>No tienes entregas asignadas.</EmptyState>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map((order) => (
              <article key={order.id} className="admin-order-card">
                <div className="admin-order-header">
                  <div>
                    <h3>Pedido #{order.id}</h3>
                    <p>{order.cliente} · Compra {order.fecha} · Asignación {new Date(order.fechaAsignacionMensajero).toLocaleString('es-CO')}</p>
                  </div>
                  <StatusBadge tone={badgeTone(order.estadoEntrega)}>{order.estadoEntrega}</StatusBadge>
                </div>
                <div className="admin-order-summary">
                  <p><strong>Dirección:</strong> {order.direccion || 'No registrada'}, {order.ciudad || 'Sin ciudad'}</p>
                  <p><strong>Teléfono:</strong> {order.telefono || 'No registrado'}</p>
                  <p><strong>Preparación:</strong> {order.estadoPreparacion} · {order.fechaPreparacion || 'Sin fecha'}</p>
                </div>

                <h4>Productos</h4>
                <ul>
                  {order.productos.map((product) => (
                    <li key={product.idProducto}>
                      {product.nombre} · {product.cantidad} uds · Talla {product.talla || 'N/D'} · Color {product.color || 'N/D'}
                    </li>
                  ))}
                </ul>

                {order.novedades?.length > 0 && (
                  <section>
                    <h4>Novedades</h4>
                    {order.novedades.map((novelty) => (
                      <p key={novelty.id}>{novelty.tipo}: {novelty.descripcion} · {novelty.estado}</p>
                    ))}
                  </section>
                )}

                <details>
                  <summary>Historial del pedido</summary>
                  <ul>
                    {order.historial.map((event) => (
                      <li key={event.id}>
                        {event.evento} · {event.usuario} · {new Date(event.fecha).toLocaleString('es-CO')}
                        {event.observacion ? ` · ${event.observacion}` : ''}
                      </li>
                    ))}
                  </ul>
                </details>

                {evidenceUrls[order.id] && (
                  <figure>
                    <img src={evidenceUrls[order.id]} alt={`Evidencia de entrega del pedido ${order.id}`} style={{ maxWidth: '100%', maxHeight: 320 }} />
                    <figcaption>Evidencia guardada: {new Date(order.fechaEvidencia).toLocaleString('es-CO')}</figcaption>
                  </figure>
                )}

                {order.estadoEntrega !== 'Entregado' && !order.evidencia && (
                  <section>
                    <h4>Evidencia fotográfica</h4>
                    <label>
                      Tomar o seleccionar imagen (JPEG, PNG o WebP; máximo 5 MB)
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        capture="environment"
                        onChange={(event) => setFile(order.id, event.target.files?.[0])}
                      />
                    </label>
                    {previewUrls[order.id] && (
                      <img src={previewUrls[order.id]} alt="Vista previa de la evidencia seleccionada" style={{ display: 'block', maxWidth: '100%', maxHeight: 320, marginTop: 12 }} />
                    )}
                    <button type="button" className="btn-admin-primary" disabled={savingId === order.id || !selectedFiles[order.id]} onClick={() => saveEvidence(order.id)}>
                      {savingId === order.id ? 'Guardando...' : 'Guardar evidencia'}
                    </button>
                  </section>
                )}

                <div className="admin-order-action">
                  {order.estadoEntrega === 'Asignado' && !order.evidencia && (
                    <button
                      type="button"
                      className="btn-admin-editar"
                      disabled={savingId === order.id}
                      onClick={() => releaseAssignment(order)}
                    >
                      {savingId === order.id ? 'Liberando...' : 'Cancelar asignación'}
                    </button>
                  )}
                  {order.estadoEntrega === 'Asignado' && (
                    <button type="button" className="btn-admin-primary" disabled={savingId === order.id} onClick={() => changeStatus(order, 'En camino')}>
                      Iniciar recorrido
                    </button>
                  )}
                  {order.estadoEntrega === 'En camino' && (
                    <>
                      <button
                        type="button"
                        className="btn-admin-primary"
                        disabled={savingId === order.id || !order.evidencia}
                        title={!order.evidencia ? 'Primero guarda una fotografía de evidencia' : ''}
                        onClick={() => changeStatus(order, 'Entregado')}
                      >
                        Marcar como entregado
                      </button>
                      <button type="button" className="btn-admin-editar" disabled={savingId === order.id} onClick={() => changeStatus(order, 'Entrega fallida')}>
                        Registrar entrega fallida
                      </button>
                    </>
                  )}
                  {order.estadoEntrega === 'Entrega fallida' && (
                    <button type="button" className="btn-admin-primary" disabled={savingId === order.id} onClick={() => changeStatus(order, 'En camino')}>
                      Reintentar entrega
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
