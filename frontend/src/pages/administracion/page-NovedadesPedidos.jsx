import { useCallback, useEffect, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { getOrderNovelties, resolveOrderNovelty } from '../../services/pedidoService';

export default function NovedadesPedidos() {
  const [novelties, setNovelties] = useState([]);
  const [decisions, setDecisions] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadNovelties = useCallback(async () => {
    try {
      setNovelties(await getOrderNovelties());
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las novedades.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const fetchNovelties = async () => {
      try {
        const result = await getOrderNovelties();
        if (!active) return;
        setNovelties(result);
        setError('');
      } catch (err) {
        if (active) setError(err.message || 'No se pudieron cargar las novedades.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchNovelties();
    const refreshInterval = window.setInterval(fetchNovelties, 15000);
    return () => {
      active = false;
      window.clearInterval(refreshInterval);
    };
  }, []);

  const resolve = async (novelty) => {
    const decision = (decisions[novelty.id] || '').trim();
    if (!decision) {
      setError('Registra la decisión administrativa antes de cerrar la novedad.');
      return;
    }
    setSavingId(novelty.id);
    setError('');
    setMessage('');
    try {
      await resolveOrderNovelty(novelty.id, decision);
      setMessage(novelty.idCompra
        ? `Novedad de la compra #${novelty.idCompra} resuelta.`
        : `Novedad del pedido #${novelty.idPedido} resuelta. Bodega debe verificar nuevamente los productos antes del despacho.`);
      await loadNovelties();
    } catch (err) {
      setError(err.message || 'No se pudo resolver la novedad.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Novedades de pedidos e inventario</h2>
            <p className="admin-sub">Revisa reportes de Bodega y Mensajería y deja registrada cada decisión.</p>
          </div>
          <strong className="admin-contador">{novelties.filter((item) => item.estado === 'Pendiente').length} pendiente(s)</strong>
        </div>

        {error && <div className="login-error" role="alert">{error}</div>}
        {message && <div className="bodeguero-message" role="status">{message}</div>}
        {loading ? (
          <EmptyState>Cargando novedades...</EmptyState>
        ) : novelties.length === 0 ? (
          <EmptyState>No hay novedades registradas.</EmptyState>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {novelties.map((novelty) => (
              <article className="admin-order-card" key={novelty.id}>
                <div className="admin-order-header">
                  <div>
                    <h3>
                      {novelty.idCompra
                        ? `Compra #${novelty.idCompra} · ${novelty.proveedor}`
                        : `Pedido #${novelty.idPedido} · ${novelty.producto || 'Novedad de entrega'}`}
                    </h3>
                    <p>
                      {novelty.idCompra ? 'Recepción de compra' : novelty.cliente}
                      {' · '}{novelty.etapa} · {new Date(novelty.fecha).toLocaleString('es-CO')}
                    </p>
                  </div>
                  <StatusBadge tone={novelty.estado === 'Pendiente' ? 'warning' : 'success'}>{novelty.estado}</StatusBadge>
                </div>
                <p><strong>Tipo:</strong> {novelty.tipo}</p>
                {novelty.idCompra && novelty.producto && (
                  <p>
                    <strong>Producto:</strong> {novelty.producto}
                    {novelty.cantidad ? ` · ${novelty.cantidad} unidad(es)` : ''}
                  </p>
                )}
                <p><strong>Descripción:</strong> {novelty.descripcion}</p>
                <p><strong>Reportado por:</strong> {novelty.reportadoPor}</p>
                {novelty.decision && <p><strong>Decisión:</strong> {novelty.decision} · {novelty.resueltoPor || ''}</p>}
                {novelty.estado === 'Pendiente' && (
                  <div>
                    <label htmlFor={`decision-${novelty.id}`}>Decisión / acción autorizada por Administración</label>
                    <textarea
                      id={`decision-${novelty.id}`}
                      maxLength={1000}
                      value={decisions[novelty.id] || ''}
                      onChange={(event) => setDecisions((previous) => ({ ...previous, [novelty.id]: event.target.value }))}
                    />
                    <button type="button" className="btn-admin-primary" disabled={savingId === novelty.id} onClick={() => resolve(novelty)}>
                      {savingId === novelty.id ? 'Guardando...' : 'Registrar decisión y resolver'}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
