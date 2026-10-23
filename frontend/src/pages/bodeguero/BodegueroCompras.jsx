import { useCallback, useEffect, useRef, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { getPurchasesForReceipt, receivePurchase } from '../../services/inventarioService';

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

const noveltyTypes = ['Faltante', 'Sobrante', 'Dañado', 'Talla incorrecta', 'Color incorrecto', 'Otra novedad'];

export default function BodegueroCompras() {
  const [purchases, setPurchases] = useState([]);
  const [receiptLines, setReceiptLines] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [message, setMessage] = useState('');
  const receiptRequest = useRef(null);

  const loadPurchases = useCallback(async () => {
    try {
      setError('');
      setPurchases(await getPurchasesForReceipt());
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las compras registradas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadPurchases);
  }, [loadPurchases]);

  const updateReceiptLine = (detailId, field, value) => {
    setReceiptLines((previous) => ({
      ...previous,
      [detailId]: { ...previous[detailId], [field]: value }
    }));
    setValidationErrors((previous) => ({ ...previous, [detailId]: '' }));
  };

  const registerReceipt = async (purchase) => {
    setValidationErrors({});
    const lineErrors = {};
    const productos = [];
    const novedades = [];

    purchase.productos.forEach((product) => {
      const entry = receiptLines[product.idDetalle] || {};
      const quantity = entry.cantidad === '' || entry.cantidad === undefined ? 0 : Number(entry.cantidad);
      const noveltyQuantity = entry.cantidadNovedad === '' || entry.cantidadNovedad === undefined
        ? 0
        : Number(entry.cantidadNovedad);
      const pending = Number(product.cantidadPendiente);

      if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > pending) {
        lineErrors[product.idDetalle] = `Indica un entero entre 0 y ${pending}.`;
        return;
      }
      if (quantity > 0) productos.push({ idDetalle: product.idDetalle, cantidad: quantity });

      const hasNoveltyInput = entry.tipoNovedad || entry.cantidadNovedad || entry.descripcion;
      if (hasNoveltyInput && (
        !entry.tipoNovedad
        || !Number.isSafeInteger(noveltyQuantity)
        || noveltyQuantity <= 0
        || !entry.descripcion?.trim()
      )) {
        lineErrors[product.idDetalle] = 'Completa tipo, cantidad y descripción de la novedad.';
        return;
      }
      if (entry.tipoNovedad) {
        if (entry.tipoNovedad === 'Dañado' && noveltyQuantity > quantity) {
          lineErrors[product.idDetalle] = 'Las unidades dañadas no pueden superar las recibidas.';
          return;
        }
        novedades.push({
          idDetalle: product.idDetalle,
          tipo: entry.tipoNovedad,
          cantidad: noveltyQuantity,
          descripcion: entry.descripcion.trim()
        });
      }
    });

    if (Object.keys(lineErrors).length) {
      setValidationErrors(lineErrors);
      setError('Corrige las cantidades o los datos de las novedades señaladas.');
      return;
    }
    if (!productos.length && !novedades.length) {
      setError('Registra unidades recibidas o al menos una novedad para continuar.');
      return;
    }
    if (!window.confirm(`¿Confirmas la recepción y las novedades indicadas para la compra #${purchase.id}?`)) {
      return;
    }

    const payload = JSON.stringify({ productos, novedades });
    if (receiptRequest.current?.purchaseId !== purchase.id || receiptRequest.current?.payload !== payload) {
      receiptRequest.current = { purchaseId: purchase.id, payload, key: window.crypto.randomUUID() };
    }

    setSavingId(purchase.id);
    setError('');
    setMessage('');
    try {
      const result = await receivePurchase(purchase.id, productos, novedades, receiptRequest.current.key);
      receiptRequest.current = null;
      setReceiptLines((previous) => {
        const next = { ...previous };
        purchase.productos.forEach((product) => delete next[product.idDetalle]);
        return next;
      });
      setMessage(result.estado === 'Recibida'
        ? `La compra #${purchase.id} se recibió completamente.`
        : result.novedadesPendientes
          ? `La recepción de la compra #${purchase.id} quedó registrada; Administración debe revisar las novedades.`
          : `La recepción parcial de la compra #${purchase.id} quedó registrada.`);
      await loadPurchases();
    } catch (err) {
      setError(err.message || 'No se pudo registrar la recepción.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="bodeguero-section">
      {error && <div className="bodeguero-message error" role="alert">{error}</div>}
      {message && <div className="bodeguero-message success" role="status">{message}</div>}

      {loading ? (
        <section className="bodeguero-panel"><EmptyState>Cargando compras...</EmptyState></section>
      ) : purchases.length === 0 ? (
        <section className="bodeguero-panel">
          <EmptyState>No hay compras registradas para consultar.</EmptyState>
        </section>
      ) : purchases.map((purchase) => {
        const isClosed = ['Recibida', 'Cancelada'].includes(purchase.estado);
        const hasPendingItems = purchase.productos.some((product) => Number(product.cantidadPendiente) > 0);

        return (
          <section className="bodeguero-panel" key={purchase.id}>
            <div className="bodeguero-panel-header">
              <div>
                <h2>Compra #{purchase.id} · {purchase.proveedor}</h2>
                <small>
                  {new Date(purchase.fecha).toLocaleDateString('es-CO')} · {currency.format(Number(purchase.total) || 0)}
                </small>
              </div>
              <StatusBadge tone={purchase.estado === 'Recibida' ? 'success' : purchase.estado === 'Cancelada' ? 'danger' : 'warning'}>
                {purchase.estado}
              </StatusBadge>
            </div>

            {purchase.productos.length === 0 ? (
              <EmptyState>Esta compra no tiene productos detallados.</EmptyState>
            ) : (
              <>
                <div className="bodeguero-table-wrap">
                  <table className="bodeguero-table">
                    <thead>
                      <tr>
                        <th>Producto y variante</th>
                        <th>Comprado</th>
                        <th>Recibido anteriormente</th>
                        <th>Pendiente</th>
                        <th>Recibir ahora</th>
                        <th>Novedad (opcional)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchase.productos.map((product) => {
                        const entry = receiptLines[product.idDetalle] || {};
                        const pending = Number(product.cantidadPendiente);
                        const quantity = Number(entry.cantidad || 0);
                        return (
                          <tr key={product.idDetalle}>
                            <td>
                              <strong>{product.nombre}</strong>
                              <small>Talla: {product.talla} · Color: {product.color}</small>
                            </td>
                            <td>{product.cantidadSolicitada} uds</td>
                            <td>{product.cantidadRecibida} uds</td>
                            <td>{pending} uds</td>
                            <td>
                              <label className="bodeguero-receipt-field">
                                <span>Unidades recibidas</span>
                                <input
                                  type="number"
                                  min="0"
                                  max={pending}
                                  step="1"
                                  value={entry.cantidad || ''}
                                  disabled={isClosed || pending <= 0 || savingId === purchase.id}
                                  onChange={(event) => updateReceiptLine(product.idDetalle, 'cantidad', event.target.value)}
                                />
                              </label>
                              {validationErrors[product.idDetalle] && (
                                <small className="bodeguero-field-error">{validationErrors[product.idDetalle]}</small>
                              )}
                              {quantity > 0 && <small>Total tras confirmar: {product.cantidadRecibida + quantity} uds</small>}
                            </td>
                            <td>
                              <label className="bodeguero-receipt-field">
                                <span>Tipo</span>
                                <select
                                  value={entry.tipoNovedad || ''}
                                  disabled={isClosed || savingId === purchase.id}
                                  onChange={(event) => updateReceiptLine(product.idDetalle, 'tipoNovedad', event.target.value)}
                                >
                                  <option value="">Sin novedad</option>
                                  {noveltyTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                                </select>
                              </label>
                              {entry.tipoNovedad && (
                                <>
                                  <label className="bodeguero-receipt-field">
                                    <span>Unidades afectadas</span>
                                    <input
                                      type="number"
                                      min="1"
                                      max={['Dañado', 'Talla incorrecta', 'Color incorrecto'].includes(entry.tipoNovedad) ? quantity : undefined}
                                      step="1"
                                      value={entry.cantidadNovedad || ''}
                                      disabled={isClosed || savingId === purchase.id}
                                      onChange={(event) => updateReceiptLine(product.idDetalle, 'cantidadNovedad', event.target.value)}
                                    />
                                  </label>
                                  <label className="bodeguero-receipt-field">
                                    <span>Descripción</span>
                                    <textarea
                                      maxLength={1000}
                                      value={entry.descripcion || ''}
                                      disabled={isClosed || savingId === purchase.id}
                                      onChange={(event) => updateReceiptLine(product.idDetalle, 'descripcion', event.target.value)}
                                    />
                                  </label>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {!isClosed && (hasPendingItems || purchase.productos.length > 0) && (
                  <div className="bodeguero-actions bodeguero-form-actions">
                    <button
                      type="button"
                      className="bodeguero-button"
                      disabled={savingId === purchase.id}
                      onClick={() => registerReceipt(purchase)}
                    >
                      {savingId === purchase.id ? 'Registrando...' : 'Confirmar recepción'}
                    </button>
                  </div>
                )}
              </>
            )}

            {purchase.recepciones.length > 0 && (
              <details className="bodeguero-receipt-history">
                <summary>Historial de recepciones ({purchase.recepciones.length})</summary>
                <div className="bodeguero-list">
                  {purchase.recepciones.map((receipt) => (
                    <article className="bodeguero-item bodeguero-receipt-history-item" key={receipt.id}>
                      <div>
                        <strong>Recepción #{receipt.id} · {receipt.empleado}</strong>
                        <small>{new Date(receipt.fecha).toLocaleString('es-CO')}</small>
                        {receipt.productos.map((product) => (
                          <small key={`${receipt.id}-${product.idDetalle}`}>
                            {product.nombre} · Talla {product.talla} · Color {product.color}: {product.cantidadRecibida} recibidas
                            {product.cantidadDanada > 0 ? `, ${product.cantidadDanada} dañadas` : ''}
                          </small>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </details>
            )}

            {purchase.novedades.length > 0 && (
              <details className="bodeguero-receipt-history">
                <summary>Novedades reportadas ({purchase.novedades.length})</summary>
                <div className="bodeguero-list">
                  {purchase.novedades.map((novelty) => (
                    <article className="bodeguero-item bodeguero-receipt-history-item" key={novelty.id}>
                      <div>
                        <strong>{novelty.tipo} · {novelty.producto} · {novelty.estado}</strong>
                        <small>
                          {novelty.cantidad} unidades · {novelty.talla} · {novelty.color} · {novelty.reportadoPor}
                          {' · '}{new Date(novelty.fecha).toLocaleString('es-CO')}
                        </small>
                        <small>{novelty.descripcion}</small>
                        {novelty.decision && <small>Decisión: {novelty.decision} · {novelty.resueltoPor}</small>}
                      </div>
                    </article>
                  ))}
                </div>
              </details>
            )}
          </section>
        );
      })}
    </div>
  );
}
