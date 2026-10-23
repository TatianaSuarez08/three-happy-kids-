import { useCallback, useEffect, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import {
  createPurchase,
  getPurchaseCreationOptions,
  getPurchasesForReceipt
} from '../../services/inventarioService';

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

export default function Compras() {
  const [options, setOptions] = useState({ proveedores: [], productos: [] });
  const [purchases, setPurchases] = useState([]);
  const [providerId, setProviderId] = useState('');
  const [lines, setLines] = useState([{ productoId: '', cantidad: '' }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [creationOptions, purchaseRows] = await Promise.all([
        getPurchaseCreationOptions(),
        getPurchasesForReceipt()
      ]);
      setOptions(creationOptions);
      setPurchases(purchaseRows);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar proveedores, productos y compras.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, [loadData]);

  const updateLine = (index, field, value) => {
    setLines((previous) => previous.map((line, lineIndex) => (
      lineIndex === index ? { ...line, [field]: value } : line
    )));
  };

  const savePurchase = async (event) => {
    event.preventDefault();
    const selectedLines = lines.map((line) => ({
      productoId: Number(line.productoId),
      cantidad: Number(line.cantidad)
    }));
    if (!Number(providerId) || selectedLines.some((line) => (
      !Number.isSafeInteger(line.productoId)
      || line.productoId <= 0
      || !Number.isSafeInteger(line.cantidad)
      || line.cantidad <= 0
    )) || new Set(selectedLines.map((line) => line.productoId)).size !== selectedLines.length) {
      setError('Selecciona un proveedor y productos únicos con cantidades enteras mayores a cero.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');
    try {
      const result = await createPurchase(Number(providerId), selectedLines);
      setMessage(`Compra #${result.purchase.id} registrada correctamente; Bodega ya puede recibirla.`);
      setProviderId('');
      setLines([{ productoId: '', cantidad: '' }]);
      await loadData();
    } catch (err) {
      setError(err.message || 'No se pudo registrar la compra.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <div>
            <h2 className="admin-titulo">Compras de abastecimiento</h2>
            <p className="admin-sub">Registra compras para que Bodega gestione su recepción real.</p>
          </div>
        </header>

        {error && <div className="login-error" role="alert">{error}</div>}
        {message && <div className="bodeguero-message success" role="status">{message}</div>}

        <section className="hk-card admin-order-card">
          <h3>Registrar compra</h3>
          <form className="hk-form admin-purchase-form" onSubmit={savePurchase}>
            <label className="hk-field">
              Proveedor
              <select value={providerId} onChange={(event) => setProviderId(event.target.value)} required>
                <option value="">Selecciona un proveedor</option>
                {options.proveedores.map((provider) => (
                  <option key={provider.id} value={provider.id}>{provider.nombre}</option>
                ))}
              </select>
            </label>

            {lines.map((line, index) => {
              const selectedIds = new Set(lines.map((item) => Number(item.productoId)).filter(Boolean));
              return (
                <div className="admin-purchase-line" key={`line-${index}`}>
                  <label className="hk-field">
                    Producto y variante
                    <select
                      value={line.productoId}
                      onChange={(event) => updateLine(index, 'productoId', event.target.value)}
                      required
                    >
                      <option value="">Selecciona un producto</option>
                      {options.productos
                        .filter((product) => !selectedIds.has(Number(product.id)) || Number(line.productoId) === Number(product.id))
                        .map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.nombre} · Talla {product.talla} · Color {product.color} · Compra {currency.format(Number(product.precioCompra))}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label className="hk-field">
                    Cantidad comprada
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={line.cantidad}
                      onChange={(event) => updateLine(index, 'cantidad', event.target.value)}
                      required
                    />
                  </label>
                  {lines.length > 1 && (
                    <button
                      type="button"
                      className="hk-btn hk-btn--secondary bodeguero-button-secondary"
                      onClick={() => setLines((previous) => previous.filter((_, lineIndex) => lineIndex !== index))}
                    >
                      Quitar producto
                    </button>
                  )}
                </div>
              );
            })}

            <div className="bodeguero-actions">
              <button
                type="button"
                className="hk-btn hk-btn--secondary bodeguero-button-secondary"
                onClick={() => setLines((previous) => [...previous, { productoId: '', cantidad: '' }])}
              >
                Agregar producto
              </button>
              <button type="submit" className="hk-btn hk-btn--primary btn-admin-primary" disabled={saving || loading}>
                {saving ? 'Registrando...' : 'Registrar compra'}
              </button>
            </div>
            {options.proveedores.length === 0 && (
              <p className="admin-sub">No hay proveedores activos registrados. Activa o registra un proveedor antes de crear compras.</p>
            )}
          </form>
        </section>

        <section className="hk-card admin-order-card">
          <div className="admin-header">
            <div>
              <h3 className="admin-titulo">Compras registradas</h3>
              <p className="admin-sub">Consulta el avance de recepción sin modificar existencias.</p>
            </div>
            <strong className="admin-contador">{purchases.length} compra(s)</strong>
          </div>

          {loading ? (
            <EmptyState>Cargando compras...</EmptyState>
          ) : purchases.length === 0 ? (
            <EmptyState>No hay compras registradas.</EmptyState>
          ) : (
            <div className="bodeguero-list">
              {purchases.map((purchase) => (
                <article className="bodeguero-item bodeguero-order-card" key={purchase.id}>
                  <div className="bodeguero-order-header">
                    <div>
                      <strong>Compra #{purchase.id} · {purchase.proveedor}</strong>
                      <small>{new Date(purchase.fecha).toLocaleDateString('es-CO')} · {currency.format(Number(purchase.total) || 0)}</small>
                    </div>
                    <StatusBadge tone={purchase.estado === 'Recibida' ? 'success' : purchase.estado === 'Cancelada' ? 'danger' : 'warning'}>
                      {purchase.estado}
                    </StatusBadge>
                  </div>
                  <details>
                    <summary>Detalle de compra y recepción</summary>
                    <div className="bodeguero-list">
                      {purchase.productos.map((product) => (
                        <div className="bodeguero-item" key={product.idDetalle}>
                          <div>
                            <strong>{product.nombre} · Talla {product.talla} · Color {product.color}</strong>
                            <small>
                              Compradas: {product.cantidadSolicitada} · Recibidas: {product.cantidadRecibida} · Pendientes: {product.cantidadPendiente}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
