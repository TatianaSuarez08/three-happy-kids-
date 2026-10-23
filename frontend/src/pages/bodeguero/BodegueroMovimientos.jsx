import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { createActivityReport, getEmployeeActivity } from '../../services/inventarioService';

const roles = ['Administrador', 'Cliente', 'Bodeguero', 'Mensajero'];
const categories = ['Inventario', 'Pedido', 'Recepción'];

export default function BodegueroMovimientos() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin/');
  const [activity, setActivity] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [reports, setReports] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const [filters, setFilters] = useState({ rol: '', categoria: '', evento: '', desde: '', hasta: '' });
  const [reportTarget, setReportTarget] = useState(null);
  const [reportForm, setReportForm] = useState({ motivo: '', descripcion: '' });
  const [savingReport, setSavingReport] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadActivity = useCallback(async () => {
    setLoading(true);
    try {
      setError('');
      const result = await getEmployeeActivity(
        isAdmin && employeeId ? employeeId : null,
        isAdmin ? filters : {}
      );
      setActivity(result.activity);
      if (isAdmin) {
        setEmployees(result.employees);
        setReports(result.reports);
      }
    } catch (err) {
      setError(err.message || 'No se pudo cargar el historial de actividad.');
    } finally {
      setLoading(false);
    }
  }, [employeeId, filters, isAdmin]);

  useEffect(() => {
    void Promise.resolve().then(loadActivity);
  }, [loadActivity]);

  const updateFilter = (key, value) => setFilters((previous) => ({ ...previous, [key]: value }));

  const submitReport = async (event) => {
    event.preventDefault();
    if (!reportTarget) return;
    setSavingReport(true);
    setError('');
    setMessage('');
    try {
      await createActivityReport({
        usuarioId: reportTarget.usuarioId,
        rol: reportTarget.rol.split(',')[0].trim(),
        actividadId: reportTarget.id,
        motivo: reportForm.motivo,
        descripcion: reportForm.descripcion
      });
      setReportTarget(null);
      setReportForm({ motivo: '', descripcion: '' });
      setMessage('El reporte se registró sin modificar la actividad original.');
      await loadActivity();
    } catch (err) {
      setError(err.message || 'No se pudo registrar el reporte.');
    } finally {
      setSavingReport(false);
    }
  };

  return (
    <div className={isAdmin ? 'bodeguero-shell' : undefined}>
      <div className="bodeguero-section">
        {error && <div className="bodeguero-message error" role="alert">{error}</div>}
        {message && <div className="bodeguero-message success" role="status">{message}</div>}

        <section className="bodeguero-panel">
          <div className="bodeguero-panel-header">
            <h2>{isAdmin ? 'Actividad de empleados y usuarios' : 'Mi historial de actividad'}</h2>
            <span className="bodeguero-pill">{activity.length} registros</span>
          </div>

          {isAdmin && (
            <div className="admin-toolbar">
              <label className="bodeguero-employee-filter">
                Empleado o usuario
                <select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}>
                  <option value="">Todos los usuarios</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.nombre} · {employee.roles}
                    </option>
                  ))}
                </select>
              </label>
              <label className="bodeguero-employee-filter">
                Rol
                <select value={filters.rol} onChange={(event) => updateFilter('rol', event.target.value)}>
                  <option value="">Todos los roles</option>
                  {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </label>
              <label className="bodeguero-employee-filter">
                Área
                <select value={filters.categoria} onChange={(event) => updateFilter('categoria', event.target.value)}>
                  <option value="">Todas las áreas</option>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label className="bodeguero-employee-filter">
                Tipo de actividad
                <input
                  value={filters.evento}
                  maxLength={80}
                  onChange={(event) => updateFilter('evento', event.target.value)}
                  placeholder="Buscar tipo"
                />
              </label>
              <label className="bodeguero-employee-filter">
                Desde
                <input type="date" value={filters.desde} onChange={(event) => updateFilter('desde', event.target.value)} />
              </label>
              <label className="bodeguero-employee-filter">
                Hasta
                <input type="date" value={filters.hasta} onChange={(event) => updateFilter('hasta', event.target.value)} />
              </label>
            </div>
          )}

          {loading ? (
            <EmptyState>Cargando historial de actividad...</EmptyState>
          ) : activity.length === 0 ? (
            <EmptyState>No hay actividad registrada para este filtro.</EmptyState>
          ) : (
            <div className="bodeguero-table-wrap">
              <table className="bodeguero-table">
                <thead>
                  <tr>
                    {isAdmin && <><th>Usuario</th><th>Rol</th></>}
                    <th>Área</th>
                    <th>Actividad</th>
                    <th>Detalle</th>
                    <th>Fecha</th>
                    {isAdmin && <th>Reporte</th>}
                  </tr>
                </thead>
                <tbody>
                  {activity.map((entry) => (
                    <tr key={entry.id}>
                      {isAdmin && <><td>{entry.usuario}</td><td>{entry.rol || 'Sin rol'}</td></>}
                      <td><StatusBadge>{entry.categoria}</StatusBadge></td>
                      <td>{entry.evento}{entry.pedidoId ? ` · Pedido #${entry.pedidoId}` : ''}</td>
                      <td>
                        {entry.producto ? `${entry.producto} · ` : ''}
                        {entry.descripcion || 'Sin detalle'}
                        {entry.cantidad !== null && entry.cantidad !== undefined
                          ? ` · ${Number(entry.cantidad) > 0 ? '+' : ''}${entry.cantidad} uds`
                          : ''}
                      </td>
                      <td>{new Date(entry.fecha).toLocaleString('es-CO')}</td>
                      {isAdmin && (
                        <td>
                          <button
                            type="button"
                            className="btn-admin-editar"
                            disabled={!entry.usuarioId || !entry.rol || entry.rol === 'Sin rol'}
                            onClick={() => {
                              setReportTarget(entry);
                              setReportForm({ motivo: '', descripcion: '' });
                            }}
                          >
                            Reportar
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {isAdmin && reportTarget && (
          <section className="bodeguero-panel" aria-labelledby="admin-report-title">
            <div className="bodeguero-panel-header">
              <h2 id="admin-report-title">Reportar actividad de {reportTarget.usuario}</h2>
              <button type="button" className="btn-admin-cancelar" onClick={() => setReportTarget(null)}>Cancelar</button>
            </div>
            <p>{reportTarget.evento}{reportTarget.pedidoId ? ` · Pedido #${reportTarget.pedidoId}` : ''} · {new Date(reportTarget.fecha).toLocaleString('es-CO')}</p>
            <form onSubmit={submitReport}>
              <label className="bodeguero-employee-filter">
                Motivo
                <input
                  value={reportForm.motivo}
                  maxLength={150}
                  required
                  onChange={(event) => setReportForm((previous) => ({ ...previous, motivo: event.target.value }))}
                />
              </label>
              <label className="bodeguero-employee-filter">
                Descripción
                <textarea
                  value={reportForm.descripcion}
                  maxLength={1000}
                  required
                  onChange={(event) => setReportForm((previous) => ({ ...previous, descripcion: event.target.value }))}
                />
              </label>
              <button type="submit" className="btn-admin-primary" disabled={savingReport}>
                {savingReport ? 'Guardando...' : 'Guardar reporte'}
              </button>
            </form>
          </section>
        )}

        {isAdmin && (
          <section className="bodeguero-panel">
            <div className="bodeguero-panel-header">
              <h2>Reportes administrativos</h2>
              <span className="bodeguero-pill">{reports.filter((report) => report.estado === 'Pendiente').length} pendientes</span>
            </div>
            {reports.length === 0 ? (
              <EmptyState>No hay reportes administrativos registrados.</EmptyState>
            ) : (
              <div className="bodeguero-table-wrap">
                <table className="bodeguero-table">
                  <thead>
                    <tr><th>Usuario</th><th>Rol</th><th>Actividad</th><th>Motivo</th><th>Descripción</th><th>Administrador</th><th>Fecha</th><th>Estado</th></tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <td>{report.reportadoPor}</td>
                        <td>{report.rol}</td>
                        <td>{report.actividadId}{report.pedidoId ? ` · Pedido #${report.pedidoId}` : ''}</td>
                        <td>{report.motivo}</td>
                        <td>{report.descripcion}</td>
                        <td>{report.administrador}</td>
                        <td>{new Date(report.fecha).toLocaleString('es-CO')}</td>
                        <td><StatusBadge tone={report.estado === 'Pendiente' ? 'warning' : 'info'}>{report.estado}</StatusBadge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
