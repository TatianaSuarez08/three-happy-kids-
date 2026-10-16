import { useCallback, useEffect, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { getBodegaIssues, respondToBodegaIssue } from '../../services/pedidoService';
import '../../styles/admin.css';

const statuses = ['Pendiente', 'En revisión', 'Resuelto', 'Rechazado'];

const formatDateTime = (value) => {
  if (!value) return 'Fecha no registrada';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

export default function NovedadesBodega() {
  const [issues, setIssues] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const loadIssues = useCallback(async () => getBodegaIssues(), []);

  useEffect(() => {
    let active = true;
    loadIssues()
      .then((data) => {
        if (active) setIssues(data);
      })
      .catch((err) => {
        if (active) setError(err.message || 'No se pudieron cargar las novedades.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadIssues]);

  const refresh = async () => {
    setRefreshing(true);
    setError('');
    try {
      setIssues(await loadIssues());
    } catch (err) {
      setError(err.message || 'No se pudieron actualizar las novedades.');
    } finally {
      setRefreshing(false);
    }
  };

  const updateDraft = (id, field, value) => {
    setDrafts((current) => ({
      ...current,
      [id]: {
        estado: current[id]?.estado || 'En revisión',
        respuesta: current[id]?.respuesta || '',
        ...current[id],
        [field]: value
      }
    }));
  };

  const saveResponse = async (issue) => {
    const draft = drafts[issue.id] || {
      estado: issue.estado === 'Pendiente' ? 'En revisión' : issue.estado,
      respuesta: issue.respuestaAdministracion || ''
    };
    if (!draft.respuesta.trim() || savingId !== null) return;
    setSavingId(issue.id);
    setError('');
    setFeedback('');
    try {
      await respondToBodegaIssue(issue.id, {
        estado: draft.estado,
        respuesta: draft.respuesta
      });
      setFeedback(`Se actualizó la novedad del pedido #${issue.idPedido}.`);
      setIssues(await loadIssues());
    } catch (err) {
      setError(err.message || 'No se pudo guardar la respuesta.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container" style={{ maxWidth: '1100px' }}>
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Novedades de Bodega</h2>
            <p className="admin-sub">Revisa faltantes y responde al bodeguero responsable.</p>
          </div>
          <div className="admin-issue-toolbar">
            <strong>{issues.filter((issue) => issue.estado !== 'Resuelto').length} pendiente(s)</strong>
            <button type="button" className="btn-admin-editar" onClick={refresh} disabled={refreshing}>
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>

        {error && <div className="login-error" role="alert">{error}</div>}
        {feedback && <div className="admin-issue-feedback" role="status">{feedback}</div>}
        {loading ? (
          <EmptyState>Cargando novedades de Bodega...</EmptyState>
        ) : issues.length === 0 ? (
          <EmptyState>No hay novedades reportadas por Bodega.</EmptyState>
        ) : (
          <div className="admin-issue-list">
            {issues.map((issue) => {
              const draft = drafts[issue.id] || {
                estado: issue.estado === 'Pendiente' ? 'En revisión' : issue.estado,
                respuesta: issue.respuestaAdministracion || ''
              };
              return (
                <article key={issue.id} className="admin-order-card">
                  <div className="admin-order-header">
                    <div>
                      <h3>Pedido #{issue.idPedido} · {issue.producto}</h3>
                      <p>{issue.cliente} · Reportado por {issue.bodeguero} · {formatDateTime(issue.fechaReporte)}</p>
                    </div>
                    <StatusBadge tone={issue.estado === 'Resuelto' ? 'success' : 'warning'}>{issue.estado}</StatusBadge>
                  </div>
                  <div className="admin-order-incident">
                    <strong>{issue.tipo}</strong>
                    <p>{issue.descripcion}</p>
                  </div>
                  {issue.estado !== 'Resuelto' && (
                    <div className="admin-issue-response">
                      <label>
                        Estado del reporte
                        <select value={draft.estado} onChange={(event) => updateDraft(issue.id, 'estado', event.target.value)}>
                          {statuses.filter((status) => status !== 'Pendiente').map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Respuesta o instrucción para Bodega
                        <textarea
                          rows="3"
                          maxLength="1000"
                          value={draft.respuesta}
                          onChange={(event) => updateDraft(issue.id, 'respuesta', event.target.value)}
                          placeholder="Indica cómo proceder o qué debe verificarse."
                        />
                      </label>
                      <button
                        type="button"
                        className="btn-admin-editar"
                        disabled={savingId !== null || !draft.respuesta.trim()}
                        onClick={() => saveResponse(issue)}
                      >
                        {savingId === issue.id ? 'Guardando...' : 'Guardar respuesta'}
                      </button>
                    </div>
                  )}
                  {issue.respuestaAdministracion && (
                    <div className="admin-issue-reply">
                      <strong>Respuesta de {issue.administrador || 'Administración'}</strong>
                      <small>{formatDateTime(issue.fechaRespuesta)}</small>
                      <p>{issue.respuestaAdministracion}</p>
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
