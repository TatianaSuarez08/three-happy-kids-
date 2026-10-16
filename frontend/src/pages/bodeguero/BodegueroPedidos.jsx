import { useCallback, useEffect, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import {
  getOrdersForPreparation,
  getBodegaOrderIssues,
  getOrderOperationHistory,
  getPreparedOrders,
  getPreparationHistory,
  markOrderPrepared,
  startOrderPreparation
} from '../../services/pedidoService';

const operationLabels = {
  PedidoCreado: 'Pedido creado',
  PreparacionIniciada: 'Preparación iniciada',
  AlistamientoIncompleto: 'Alistamiento incompleto',
  AlistamientoCompleto: 'Alistamiento completado',
  PedidoLiberado: 'Pedido liberado a Mensajería',
  PedidoAsignado: 'Pedido asignado a Mensajería',
  PedidoReasignado: 'Pedido reasignado',
  PedidoCancelado: 'Pedido cancelado',
  EntregaConfirmada: 'Entrega confirmada',
  EstadoActualizado: 'Estado actualizado'
};

const formatDate = (value) => {
  if (!value) return 'Fecha no registrada';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(date);
};

const formatDateTime = (value) => {
  if (!value) return 'Fecha no registrada';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

export default function BodegueroPedidos({ section = 'preparacion' }) {
  const isShipping = section === 'envio';
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [preparandoId, setPreparandoId] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [preparationLines, setPreparationLines] = useState([]);
  const [history, setHistory] = useState([]);
  const [operationHistory, setOperationHistory] = useState([]);
  const [issueHistory, setIssueHistory] = useState([]);
  const [historyOrderId, setHistoryOrderId] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [worklistFilter, setWorklistFilter] = useState('Disponibles');

  const loadOrders = useCallback(
    () => (isShipping ? getPreparedOrders() : getOrdersForPreparation()),
    [isShipping]
  );

  useEffect(() => {
    let active = true;
    loadOrders()
      .then((orders) => {
        if (active) setPedidos(orders);
      })
      .catch((err) => {
        if (active) setError(err.message || 'No se pudieron cargar los pedidos.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadOrders]);

  const refreshOrders = useCallback(async () => {
    setRefreshing(true);
    setError('');
    try {
      setPedidos(await loadOrders());
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los pedidos.');
    } finally {
      setRefreshing(false);
    }
  }, [loadOrders]);

  const beginPreparation = async (order) => {
    if (preparandoId !== null || editingOrderId !== null) return;
    setError('');
    setFeedback(null);
    setPreparandoId(order.id);
    setLoadingHistory(true);
    setHistory([]);
    setOperationHistory([]);
    setIssueHistory([]);
    try {
      await startOrderPreparation(order.id);
      setEditingOrderId(order.id);
      setHistoryOrderId(order.id);
      setWorklistFilter('Mis pedidos por preparar');
      setPedidos((current) => current.map((item) => (
        Number(item.id) === Number(order.id)
          ? { ...item, estadoBodega: 'En preparación' }
          : item
      )));
      setPreparationLines((order.productos || []).map((product) => ({
        idProducto: Number(product.idProducto),
        encontrado: false,
        tipoNovedad: 'No encontrado',
        descripcion: ''
      })));
      const [attemptsResult, operationsResult, issueResult] = await Promise.allSettled([
        getPreparationHistory(order.id),
        getOrderOperationHistory(order.id),
        getBodegaOrderIssues(order.id)
      ]);
      if (attemptsResult.status === 'fulfilled') {
        setHistory(attemptsResult.value);
        const latestAttempt = attemptsResult.value[0];
        const previousLines = new Map(
          (latestAttempt?.productos || []).map((line) => [
            Number(line.idProducto),
            Number(line.cantidadPreparada) === Number(line.cantidadSolicitada)
          ])
        );
        setPreparationLines((order.productos || []).map((product) => ({
          idProducto: Number(product.idProducto),
          encontrado: previousLines.get(Number(product.idProducto)) || false,
          tipoNovedad: 'No encontrado',
          descripcion: ''
        })));
      }
      if (operationsResult.status === 'fulfilled') setOperationHistory(operationsResult.value);
      if (issueResult.status === 'fulfilled') {
        setIssueHistory(issueResult.value);
        const issuesByProduct = new Map(
          issueResult.value.map((issue) => [Number(issue.idProducto), issue])
        );
        setPreparationLines((current) => current.map((line) => {
          const issue = issuesByProduct.get(line.idProducto);
          return line.encontrado || !issue
            ? line
            : {
              ...line,
              tipoNovedad: issue.tipo,
              descripcion: issue.descripcion
            };
        }));
      }
      await refreshOrders();
      const failedHistory = [attemptsResult, operationsResult, issueResult].find((result) => result.status === 'rejected');
      if (failedHistory) {
        setError(`La preparación inició, pero no se pudo cargar todo el historial: ${failedHistory.reason.message}`);
      }
    } catch (err) {
      setError(err.message || 'No se pudo iniciar la preparación.');
    } finally {
      setLoadingHistory(false);
      setPreparandoId(null);
    }
  };

  const updatePreparationLine = (productId, update) => {
    setPreparationLines((current) => current.map((line) => (
      line.idProducto === Number(productId)
        ? { ...line, ...update }
        : line
    )));
  };

  const submitPreparation = async (order, ready) => {
    if (preparandoId !== null) return;
    const uncheckedLines = preparationLines.filter((line) => !line.encontrado);
    if (ready && uncheckedLines.length > 0) {
      setError('Marca como encontrados todos los productos antes de confirmar el pedido listo.');
      return;
    }
    if (!ready && (!uncheckedLines.length || uncheckedLines.some((line) => !line.descripcion.trim()))) {
      setError('Selecciona el producto faltante y describe cada novedad antes de reportarla.');
      return;
    }
    const confirmation = ready
      ? `¿Confirmas que el pedido #${order.id} está completo y listo para envío?`
      : `¿Enviar a Administración el reporte del pedido #${order.id}?`;
    if (!window.confirm(confirmation)) return;

    setError('');
    setFeedback(null);
    setPreparandoId(order.id);
    try {
      const result = await markOrderPrepared(order.id, {
        productos: preparationLines
      });

      if (result.complete) {
        setPedidos((current) => current.filter((item) => Number(item.id) !== Number(order.id)));
        setEditingOrderId(null);
        setPreparationLines([]);
        await refreshOrders();
        setFeedback({ type: 'success', message: result.message });
        return;
      }

      setPedidos((current) => current.map((item) => (
        Number(item.id) === Number(order.id)
          ? {
            ...item,
            estadoBodega: 'Incidencia',
            incidencia: result.novedades.map((issue) => `${issue.producto} (${issue.tipo}): ${issue.descripcion}`).join('; ')
          }
          : item
      )));
      setFeedback({
        type: 'warning',
        message: result.message
      });
      setEditingOrderId(null);
      setPreparationLines([]);
      try {
        const [attempts, operations, issues] = await Promise.all([
          getPreparationHistory(order.id),
          getOrderOperationHistory(order.id),
          getBodegaOrderIssues(order.id)
        ]);
        setHistory(attempts);
        setOperationHistory(operations);
        setIssueHistory(issues);
        setHistoryOrderId(order.id);
      } catch (historyError) {
        setError(`El alistamiento sí se registró, pero no se pudo actualizar su historial: ${historyError.message}`);
      }
    } catch (err) {
      setError(err.message || 'No se pudo registrar el alistamiento.');
    } finally {
      setPreparandoId(null);
    }
  };

  const cancelPreparation = () => {
    setEditingOrderId(null);
    setPreparationLines([]);
    setHistory([]);
    setOperationHistory([]);
    setIssueHistory([]);
    setHistoryOrderId(null);
    setError('');
    setFeedback(null);
  };

  const toggleHistory = async (order) => {
    if (Number(historyOrderId) === Number(order.id)) {
      setHistoryOrderId(null);
      return;
    }

    setHistoryOrderId(order.id);
    setLoadingHistory(true);
    setError('');
    try {
      const [attempts, operations, issues] = await Promise.all([
        getPreparationHistory(order.id),
        getOrderOperationHistory(order.id),
        getBodegaOrderIssues(order.id)
      ]);
      setHistory(attempts);
      setOperationHistory(operations);
      setIssueHistory(issues);
    } catch (err) {
      setHistory([]);
      setOperationHistory([]);
      setIssueHistory([]);
      setError(err.message || 'No se pudo consultar el historial de alistamiento.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const statusOptions = isShipping
    ? ['Todos', 'Listo para envío', 'Asignado a Mensajería', 'En camino', 'Entregado']
    : ['Todos', 'Pendiente de preparación', 'Seleccionado por Bodega', 'En preparación', 'Incidencia'];
  const visibleOrders = pedidos.filter((order) => {
    const matchesWorklist = worklistFilter === 'Disponibles'
      ? !order.idBodeguero
      : worklistFilter === 'Mis pedidos por preparar'
        ? order.seleccionadoPorMi
        : Boolean(order.idBodeguero) && !order.seleccionadoPorMi;
    return matchesWorklist && (statusFilter === 'Todos' || order.estadoBodega === statusFilter);
  });

  if (loading) {
    return (
      <div className="bodeguero-panel">
        <EmptyState>{isShipping ? 'Cargando pedidos para envío...' : 'Cargando pedidos para alistamiento...'}</EmptyState>
      </div>
    );
  }

  return (
    <div className="bodeguero-section">
      {error && <div className="bodeguero-message error" role="alert">{error}</div>}
      {feedback && (
        <div className={`bodeguero-message ${feedback.type}`} role="status">
          {feedback.message}
        </div>
      )}

      <section className="bodeguero-panel">
        <div className="bodeguero-panel-header">
          <h2>{isShipping ? 'Envío y seguimiento' : 'Pedidos disponibles y preparación'}</h2>
          <div className="bodeguero-actions">
            <span className="bodeguero-pill">{visibleOrders.length} pedido(s)</span>
            <button type="button" className="bodeguero-button-secondary" onClick={refreshOrders} disabled={refreshing}>
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>

        {!isShipping && (
          <div className="bodeguero-actions" role="group" aria-label="Pedidos disponibles o asignados a mí">
            {['Disponibles', 'Mis pedidos por preparar', 'Pedidos ocupados'].map((filter) => (
              <button
                key={filter}
                type="button"
                className={`bodeguero-button-secondary${worklistFilter === filter ? ' active' : ''}`}
                aria-pressed={worklistFilter === filter}
                onClick={() => setWorklistFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        )}

        <div className="bodeguero-actions" role="group" aria-label="Filtrar pedidos por estado">
          {statusOptions.map((status) => (
            <button
              key={status}
              type="button"
              className={`bodeguero-button-secondary${statusFilter === status ? ' active' : ''}`}
              aria-pressed={statusFilter === status}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {visibleOrders.length === 0 ? (
          <EmptyState>
            {pedidos.length > 0
              ? 'No hay pedidos que coincidan con el estado seleccionado.'
              : isShipping
              ? 'No hay pedidos liberados ni envíos en seguimiento.'
              : worklistFilter === 'Disponibles'
                ? 'No hay pedidos disponibles para seleccionar.'
                : worklistFilter === 'Pedidos ocupados'
                  ? 'No hay pedidos seleccionados por otros bodegueros.'
                  : 'No tienes pedidos seleccionados para preparar.'}
          </EmptyState>
        ) : (
          <div className="bodeguero-list">
            {visibleOrders.map((pedido) => {
              const lines = Array.isArray(pedido.productos) ? pedido.productos : [];
              const isEditing = Number(editingOrderId) === Number(pedido.id);
              return (
                <article key={pedido.id} className="bodeguero-item bodeguero-order-card">
                  <div className="bodeguero-order-header">
                    <div>
                      <strong>Pedido #{pedido.id}</strong>
                      <small>{formatDate(pedido.fecha)} · {pedido.cliente || 'Cliente no registrado'}</small>
                    </div>
                    <StatusBadge tone={
                      ['Incidencia', 'Pendiente de preparación'].includes(pedido.estadoBodega)
                        ? 'warning'
                        : ['Asignado a Mensajería', 'En preparación', 'Seleccionado por Bodega'].includes(pedido.estadoBodega)
                          ? 'info'
                          : 'success'
                    }>
                      {pedido.estadoBodega || pedido.estadoEnvio || 'Pendiente de preparación'}
                    </StatusBadge>
                  </div>
                  {!isShipping && pedido.idBodeguero && (
                    <div className="bodeguero-message warning" role="status">
                      Pedido seleccionado por {pedido.seleccionadoPorMi ? 'ti' : pedido.bodeguero || 'otro bodeguero'}.
                    </div>
                  )}

                  <div className="bodeguero-list bodeguero-order-products">
                    {lines.length === 0 ? (
                      <EmptyState>El pedido no tiene productos y no se puede liberar.</EmptyState>
                    ) : lines.map((product) => {
                      const checkLine = preparationLines.find(
                        (line) => line.idProducto === Number(product.idProducto)
                      );
                      return (
                        <div key={`${pedido.id}-${product.idProducto}`} className="bodeguero-item">
                          <div className="bodeguero-pick-product">
                            <strong>{product.nombre}</strong>
                            <small>
                              {[product.talla && `Talla ${product.talla}`, product.color && `Color ${product.color}`].filter(Boolean).join(' · ') || 'Variante no especificada'}
                            </small>
                            <small>Cantidad solicitada: {product.cantidad}</small>
                            {isEditing && checkLine && (
                              <div className="bodeguero-checklist">
                                <label>
                                  <input
                                    type="checkbox"
                                    checked={checkLine.encontrado}
                                    onChange={(event) => updatePreparationLine(product.idProducto, {
                                      encontrado: event.target.checked,
                                      tipoNovedad: event.target.checked ? '' : 'No encontrado',
                                      descripcion: event.target.checked ? '' : checkLine.descripcion
                                    })}
                                    disabled={preparandoId !== null}
                                  />
                                  Producto encontrado y verificado
                                </label>
                                {!checkLine.encontrado && (
                                  <div className="bodeguero-issue-fields">
                                    <label className="bodeguero-pick-field">
                                      Tipo de novedad
                                      <select
                                        value={checkLine.tipoNovedad}
                                        onChange={(event) => updatePreparationLine(product.idProducto, { tipoNovedad: event.target.value })}
                                        disabled={preparandoId !== null}
                                      >
                                        {['No encontrado', 'Dañado', 'Referencia incorrecta', 'Talla incorrecta', 'Color incorrecto', 'Otra novedad'].map((type) => (
                                          <option key={type} value={type}>{type}</option>
                                        ))}
                                      </select>
                                    </label>
                                    <label className="bodeguero-pick-field">
                                      Descripción para Administración
                                      <textarea
                                        rows="2"
                                        maxLength="1000"
                                        value={checkLine.descripcion}
                                        onChange={(event) => updatePreparationLine(product.idProducto, { descripcion: event.target.value })}
                                        disabled={preparandoId !== null}
                                      />
                                    </label>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {isShipping
                            ? <StatusBadge tone={pedido.mensajeroAsignado ? 'info' : 'success'}>
                              {pedido.mensajeroAsignado ? 'Asignado' : 'Listo para Mensajería'}
                            </StatusBadge>
                            : <StatusBadge tone={pedido.estadoBodega === 'Incidencia' ? 'warning' : 'info'}>
                              {pedido.estadoBodega === 'Incidencia' ? 'Revisar incidencia' : pedido.estadoBodega}
                            </StatusBadge>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="bodeguero-order-meta">
                    <span>Productos: {lines.length}</span>
                    <span>Dirección: {pedido.direccion || 'No registrada'}{pedido.ciudad ? `, ${pedido.ciudad}` : ''}</span>
                    {!isShipping && pedido.incidencia && (
                      <div className="bodeguero-message warning" role="status">
                        Incidencia anterior: {pedido.incidencia}
                      </div>
                    )}
                    {isShipping ? (
                      <>
                        <div className="bodeguero-preparation-history">
                          <strong>Resumen del alistamiento</strong>
                          <small>{pedido.resumenAlistamiento}</small>
                          <small>Preparado: {formatDateTime(pedido.fechaPreparacion)} · Responsable: {pedido.responsablePreparacion}</small>
                          {pedido.observacionesPreparacion && <small>Observaciones: {pedido.observacionesPreparacion}</small>}
                          {pedido.mensajeroAsignado ? (
                            <small>
                              Mensajero: {pedido.mensajeroAsignado} · Asignación: {formatDateTime(pedido.fechaAsignacion)}
                            </small>
                          ) : (
                            <small>Disponible para asignación desde el Inicio de Mensajería.</small>
                          )}
                        </div>
                        <div className="bodeguero-actions">
                          <button
                            type="button"
                            className="bodeguero-button-secondary"
                            onClick={() => toggleHistory(pedido)}
                          >
                            {Number(historyOrderId) === Number(pedido.id) ? 'Ocultar historial' : 'Ver historial'}
                          </button>
                        </div>
                      </>
                    ) : !isEditing ? (
                      pedido.idBodeguero && !pedido.seleccionadoPorMi ? (
                        <small>Este pedido está ocupado por {pedido.bodeguero || 'otro bodeguero'}.</small>
                      ) : (
                        <button
                          type="button"
                          className="btn-admin-editar"
                          disabled={!lines.length || preparandoId !== null || editingOrderId !== null}
                          aria-expanded={isEditing}
                          onClick={() => beginPreparation(pedido)}
                        >
                          {preparandoId === pedido.id
                            ? 'Seleccionando...'
                            : pedido.seleccionadoPorMi
                              ? 'Continuar preparación'
                              : 'Seleccionar pedido para alistar'}
                        </button>
                      )
                    ) : (
                      <div className="bodeguero-form">
                        <p className="full">Marca los productos encontrados. Para cada producto sin marcar, selecciona el tipo de novedad y describe el problema.</p>
                        <div className="bodeguero-actions full">
                          <button
                            type="button"
                            className="btn-admin-editar"
                            disabled={preparandoId !== null || preparationLines.some((line) => !line.encontrado)}
                            onClick={() => submitPreparation(pedido, true)}
                          >
                            {preparandoId === pedido.id ? 'Registrando...' : 'Confirmar pedido listo'}
                          </button>
                          <button
                            type="button"
                            className="bodeguero-button-secondary"
                            disabled={preparandoId !== null
                              || !preparationLines.some((line) => !line.encontrado)
                              || preparationLines.some((line) => !line.encontrado && !line.descripcion.trim())}
                            onClick={() => submitPreparation(pedido, false)}
                          >
                            Guardar verificaciones y reportar novedades
                          </button>
                          <button type="button" className="bodeguero-button-secondary" disabled={preparandoId !== null} onClick={cancelPreparation}>
                            Cerrar formulario
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {(isEditing || (isShipping && Number(historyOrderId) === Number(pedido.id))) && (
                    <div className="bodeguero-preparation-history">
                      <strong>Novedades y respuestas de Administración</strong>
                      {issueHistory.length === 0 ? (
                        <small>No hay novedades reportadas para este pedido.</small>
                      ) : issueHistory.map((issue) => (
                        <div key={`issue-${issue.id}`} className="bodeguero-issue-history">
                          <small>{formatDateTime(issue.fechaReporte)} · {issue.producto} · {issue.tipo} · {issue.estado}</small>
                          <small>{issue.descripcion}</small>
                          {issue.respuestaAdministracion && (
                            <small>
                              Respuesta de {issue.administrador || 'Administración'} ({formatDateTime(issue.fechaRespuesta)}): {issue.respuestaAdministracion}
                            </small>
                          )}
                        </div>
                      ))}
                      <strong>Historial de operaciones</strong>
                      {loadingHistory ? (
                        <small role="status">Cargando historial...</small>
                      ) : operationHistory.length === 0 ? (
                        <small>No hay operaciones registradas.</small>
                      ) : operationHistory.map((event) => (
                        <div key={`event-${event.id}`}>
                          <small>
                            {formatDateTime(event.fechaHora)} · {operationLabels[event.operacion] || event.operacion} · {event.responsable}
                            {event.estadoAnterior || event.estadoNuevo
                              ? ` · ${event.estadoAnterior || '—'} → ${event.estadoNuevo || '—'}`
                              : ''}
                            {event.observaciones ? ` · ${event.observaciones}` : ''}
                          </small>
                        </div>
                      ))}
                      <strong>Historial de preparación y reportes</strong>
                      {loadingHistory ? (
                        <small role="status">Cargando historial...</small>
                      ) : history.length === 0 ? (
                        <small>No hay intentos registrados.</small>
                      ) : history.map((attempt) => (
                        <div key={attempt.id}>
                          <small>
                            {new Date(attempt.fechaHora).toLocaleString('es-CO')} · {attempt.usuario} · {attempt.resultado}
                            {attempt.observaciones ? ` · ${attempt.observaciones}` : ''}
                          </small>
                          {attempt.productos?.map((product) => (
                            <small key={`${attempt.id}-${product.idProducto}`}>
                              {product.nombre}: {Number(product.cantidadPreparada) === Number(product.cantidadSolicitada) ? 'Encontrado' : 'Novedad reportada'}
                              {product.observaciones ? ` · ${product.observaciones}` : ''}
                            </small>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {!isShipping && (
                    <p className="bodeguero-stock-note">
                      La existencia actual ya refleja el descuento realizado al crear el pedido. El alistamiento verifica cantidades físicas y no vuelve a descontar inventario.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
