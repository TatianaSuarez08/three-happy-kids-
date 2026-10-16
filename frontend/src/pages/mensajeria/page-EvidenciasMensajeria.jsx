import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../../components/Icon';
import StatusBadge from '../../components/StatusBadge';
import {
  confirmDelivery,
  getDeliveryEvidence,
  getDeliveryEvidenceImage,
  getMyDeliveries
} from '../../services/logisticaService';

const defaultImageLimit = 5 * 1024 * 1024;
const configuredImageLimit = Number(import.meta.env.VITE_DELIVERY_IMAGE_MAX_BYTES);
const imageLimit = Number.isSafeInteger(configuredImageLimit) && configuredImageLimit >= 1024
  ? configuredImageLimit
  : defaultImageLimit;
const supportedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export default function EvidenciasMensajeria() {
  const [searchParams] = useSearchParams();
  const requestedOrderId = searchParams.get('pedido') || '';
  const [deliveries, setDeliveries] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [evidenceResult, setEvidenceResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;

    getMyDeliveries()
      .then((orders) => {
        if (!active) return;
        setDeliveries(orders);
        const requested = requestedOrderId
          ? orders.find((order) => String(order.id) === requestedOrderId)
          : null;
        const selected = requested || orders.find((order) => (order.estadoEntrega || order.estado) === 'En camino');
        setSelectedId(selected ? String(selected.id) : '');
        if (requestedOrderId && !requested) {
          setError('El pedido no está asignado a tu usuario.');
        }
      })
      .catch((err) => {
        if (active) setError(err.message || 'No se pudieron consultar tus pedidos.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [requestedOrderId]);

  const selectedDelivery = useMemo(
    () => deliveries.find((delivery) => String(delivery.id) === selectedId) || null,
    [deliveries, selectedId]
  );
  const selectedStatus = selectedDelivery?.estadoEntrega || selectedDelivery?.estado;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (selectedStatus !== 'Entregado' || !selectedDelivery) return undefined;

    let active = true;
    const imageUrls = [];
    getDeliveryEvidence(selectedDelivery.id)
      .then(async (items) => {
        const images = await Promise.all(items.map(async (item) => {
          const image = await getDeliveryEvidenceImage(item.id);
          const imageUrl = URL.createObjectURL(image);
          imageUrls.push(imageUrl);
          return { ...item, imageUrl };
        }));
        if (active) {
          setEvidenceResult({ orderId: selectedDelivery.id, items: images });
          setError('');
        }
        else imageUrls.forEach((url) => URL.revokeObjectURL(url));
      })
      .catch((err) => {
        imageUrls.forEach((url) => URL.revokeObjectURL(url));
        imageUrls.length = 0;
        if (active) {
          setEvidenceResult({ orderId: selectedDelivery.id, items: [] });
          setError(err.message || 'No se pudieron cargar las evidencias de este pedido.');
        }
      });

    return () => {
      active = false;
      imageUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedDelivery, selectedStatus]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    event.target.value = '';
    setError('');
    setSuccess('');
    if (!selectedFile) return;
    if (!supportedImageTypes.has(selectedFile.type)) {
      setFile(null);
      setPreviewUrl('');
      setError('Selecciona una imagen JPEG, PNG o WebP.');
      return;
    }
    if (selectedFile.size > imageLimit) {
      setFile(null);
      setPreviewUrl('');
      setError(`La imagen supera el límite de ${(imageLimit / (1024 * 1024)).toFixed(0)} MB.`);
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const cancelSelection = () => {
    setFile(null);
    setPreviewUrl('');
    setError('');
    setSuccess('');
  };

  const submitEvidence = async (event) => {
    event.preventDefault();
    if (!selectedDelivery || selectedStatus !== 'En camino' || !file || uploading) return;
    if (!window.confirm(`¿Confirmas que el pedido #${selectedDelivery.id} fue entregado y deseas guardar esta evidencia?`)) {
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const result = await confirmDelivery(selectedDelivery.id, file);
      setDeliveries((current) => current.map((delivery) => (
        String(delivery.id) === selectedId
          ? { ...delivery, estado: 'Entregado', estadoEntrega: 'Entregado' }
          : delivery
      )));
      setFile(null);
      setSuccess(result?.message || 'Entrega confirmada y evidencia guardada.');
    } catch (err) {
      setError(err.message || 'No se pudo confirmar la entrega.');
    } finally {
      setUploading(false);
    }
  };

  const availableOrders = deliveries.filter(
    (delivery) => (delivery.estadoEntrega || delivery.estado) === 'En camino'
  );

  return (
    <div className="admin-page mensajeria-module">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Confirmación de entrega</h2>
            <p className="admin-sub">Adjunta una fotografía para confirmar la entrega del pedido asignado.</p>
          </div>
        </div>

        {success && <div className="mensajeria-feedback is-success" role="status">{success}</div>}
        {error && <div className="mensajeria-feedback is-error" role="alert">{error}</div>}

        {loading ? (
          <div className="delivery-empty-state" role="status">Cargando tus pedidos...</div>
        ) : (
          <section className="delivery-card mensajeria-evidence-card">
            <label className="admin-form-field mensajeria-evidence-select">
              <span>Pedido asignado</span>
              <select
                value={selectedId}
                onChange={(event) => {
                  setSelectedId(event.target.value);
                  setFile(null);
                  setPreviewUrl('');
                  setError('');
                  setSuccess('');
                }}
                aria-label="Seleccionar pedido asignado"
              >
                <option value="">Selecciona un pedido...</option>
                {deliveries.map((delivery) => (
                  <option key={delivery.id} value={delivery.id}>
                    Pedido #{delivery.id} · {delivery.estadoEntrega || delivery.estado}
                  </option>
                ))}
              </select>
            </label>

            {selectedDelivery ? (
              <>
                <div className="delivery-card__header">
                  <div>
                    <h3 className="delivery-card__title">Pedido #{selectedDelivery.id}</h3>
                    <p className="delivery-card__meta">{selectedDelivery.cliente || 'Cliente no registrado'}</p>
                  </div>
                  <StatusBadge tone={selectedStatus === 'Entregado' ? 'success' : 'info'}>
                    {selectedStatus}
                  </StatusBadge>
                </div>
                <div className="mensajeria-order-information">
                  <p><strong>Dirección:</strong> {selectedDelivery.direccion || 'Dirección no registrada'}{selectedDelivery.ciudad ? `, ${selectedDelivery.ciudad}` : ''}</p>
                  <p><strong>Asignado:</strong> {selectedDelivery.fechaAsignacion || 'No disponible'}</p>
                </div>

                {selectedStatus === 'En camino' ? (
                  <form className="mensajeria-evidence-form" onSubmit={submitEvidence}>
                    <label className="admin-form-field">
                      <span>Fotografía de entrega</span>
                      <input
                        className="admin-form-file"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        disabled={uploading}
                        aria-describedby="delivery-evidence-help"
                      />
                      <small id="delivery-evidence-help">
                        JPEG, PNG o WebP. Máximo {(imageLimit / (1024 * 1024)).toFixed(0)} MB.
                      </small>
                    </label>
                    {previewUrl && (
                      <div className="mensajeria-evidence-preview">
                        <img src={previewUrl} alt="Vista previa de la fotografía de entrega seleccionada" />
                      </div>
                    )}
                    <div className="admin-form-actions">
                      {file && (
                        <button type="button" className="btn-admin-cancelar" onClick={cancelSelection} disabled={uploading}>
                          Cancelar selección
                        </button>
                      )}
                      <button type="submit" className="btn-admin-primary" disabled={!file || uploading}>
                        <Icon name="camera" size={16} />
                        {uploading ? 'Guardando evidencia...' : 'Confirmar entrega'}
                      </button>
                    </div>
                  </form>
                ) : selectedStatus === 'Entregado' ? (
                  <div className="mensajeria-evidence-gallery" aria-live="polite">
                    <h4>Evidencias registradas</h4>
                    {evidenceResult?.orderId !== selectedDelivery.id ? (
                      <p role="status">Cargando evidencias...</p>
                    ) : evidenceResult.items.length ? (
                      evidenceResult.items.map((item) => (
                        <figure key={item.id}>
                          <img src={item.imageUrl} alt={`Evidencia de entrega del pedido ${selectedDelivery.id}`} />
                          <figcaption>
                            Confirmada: {item.confirmedAt ? new Date(item.confirmedAt).toLocaleString('es-CO') : 'Fecha no disponible'}
                          </figcaption>
                        </figure>
                      ))
                    ) : (
                      <p>No hay fotografías de evidencia registradas para este pedido.</p>
                    )}
                  </div>
                ) : (
                  <div className="mensajeria-feedback" role="status">
                    Este pedido todavía no está En camino y no se puede confirmar como entregado.
                  </div>
                )}
              </>
            ) : (
              <div className="delivery-empty-state">
                {availableOrders.length
                  ? 'Selecciona un pedido En camino para adjuntar su evidencia.'
                  : <>No tienes pedidos En camino. Consulta <Link to="/mensajeria/entregas">Mis pedidos</Link>.</>}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
