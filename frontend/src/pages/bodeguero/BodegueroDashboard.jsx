import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { getAllMovements } from '../../services/inventarioService';
import { getOrdersForPreparation, getPreparedOrders } from '../../services/pedidoService';
import { getProducts } from '../../services/productoService';

export default function BodegueroDashboard() {
  const [productos, setProductos] = useState([]);
  const [preparationOrders, setPreparationOrders] = useState([]);
  const [shippingOrders, setShippingOrders] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productosList, preparationList, shippingList] = await Promise.all([
          getProducts(),
          getOrdersForPreparation(),
          getPreparedOrders()
        ]);

        setProductos(productosList);
        setPreparationOrders(preparationList);
        setShippingOrders(shippingList);
        const movimientos = await getAllMovements(productosList.slice(0, 5));
        setMovimientos(movimientos.slice(0, 6));
      } catch (err) {
        setError(err.message || 'No se pudo cargar el resumen operativo.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const summary = useMemo(() => {
    const totalProductos = productos.length;
    const stockBajo = productos.filter((producto) => Number(producto.stock) > 0 && Number(producto.stock) <= Number(producto.stockMin || 0)).length;
    const agotados = productos.filter((producto) => Number(producto.stock) === 0).length;
    const estadosPreparacion = preparationOrders.reduce((counts, order) => {
      counts[order.estadoBodega] = (counts[order.estadoBodega] || 0) + 1;
      return counts;
    }, {});
    const listosParaEnvio = shippingOrders.filter((order) => order.estadoBodega === 'Listo para envío').length;
    const asignadosAMensajeria = shippingOrders.filter((order) => order.estadoBodega === 'Asignado a Mensajería').length;

    return {
      totalProductos,
      stockBajo,
      agotados,
      pendientesPreparacion: estadosPreparacion['Pendiente de preparación'] || 0,
      enPreparacion: estadosPreparacion['En preparación'] || 0,
      incidencias: estadosPreparacion.Incidencia || 0,
      listosParaEnvio,
      asignadosAMensajeria,
      enCamino: shippingOrders.filter((order) => order.estadoBodega === 'En camino').length,
      entregados: shippingOrders.filter((order) => order.estadoBodega === 'Entregado').length
    };
  }, [productos, preparationOrders, shippingOrders]);

  if (loading) {
    return (
      <div className="bodeguero-panel">
        <EmptyState>Cargando resumen operativo...</EmptyState>
      </div>
    );
  }

  return (
    <div className="bodeguero-section">
      {error && <div className="bodeguero-message error">{error}</div>}

      <section className="bodeguero-grid">
        <article className="bodeguero-card">
          <span className="label">Productos</span>
          <span className="value">{summary.totalProductos}</span>
          <div className="meta">Total activados en inventario</div>
        </article>

        <article className="bodeguero-card warning">
          <span className="label">Stock bajo</span>
          <span className="value">{summary.stockBajo}</span>
          <div className="meta">Productos que requieren revisión</div>
        </article>

        <article className="bodeguero-card">
          <span className="label">Agotados</span>
          <span className="value">{summary.agotados}</span>
          <div className="meta">Sin disponibilidad</div>
        </article>

      </section>

      <section className="bodeguero-panel">
        <div className="bodeguero-panel-header">
          <h2>Estado de preparación y envío</h2>
        </div>
        <section className="bodeguero-grid">
          <article className="bodeguero-card">
            <span className="label">Pendientes</span>
            <span className="value">{summary.pendientesPreparacion}</span>
            <div className="meta">Por preparar</div>
          </article>
          <article className="bodeguero-card">
            <span className="label">En preparación</span>
            <span className="value">{summary.enPreparacion}</span>
            <div className="meta">Alistamientos iniciados</div>
          </article>
          <article className="bodeguero-card warning">
            <span className="label">Incidencias</span>
            <span className="value">{summary.incidencias}</span>
            <div className="meta">Pedidos con faltantes</div>
          </article>
          <article className="bodeguero-card">
            <span className="label">Listos para envío</span>
            <span className="value">{summary.listosParaEnvio}</span>
            <div className="meta">Disponibles para Mensajería</div>
          </article>
          <article className="bodeguero-card">
            <span className="label">Asignados</span>
            <span className="value">{summary.asignadosAMensajeria}</span>
            <div className="meta">En seguimiento de Mensajería</div>
          </article>
          <article className="bodeguero-card">
            <span className="label">En camino</span>
            <span className="value">{summary.enCamino}</span>
            <div className="meta">Entregas en curso</div>
          </article>
          <article className="bodeguero-card">
            <span className="label">Entregados</span>
            <span className="value">{summary.entregados}</span>
            <div className="meta">Entregas completadas</div>
          </article>
        </section>
      </section>

      <section className="bodeguero-panel">
        <div className="bodeguero-panel-header">
          <h2>Movimientos recientes</h2>
        </div>

        {movimientos.length === 0 ? (
          <EmptyState>No hay movimientos recientes registrados.</EmptyState>
        ) : (
          <div className="bodeguero-list">
            {movimientos.map((movimiento) => (
              <div key={`${movimiento.id}-${movimiento.nombreProducto}`} className="bodeguero-item">
                <div>
                  <strong>{movimiento.nombreProducto || 'Producto'}</strong>
                  <small>
                    {movimiento.tipo} · {movimiento.cantidad} uds · {new Date(movimiento.fecha_movimiento).toLocaleString('es-CL')}
                  </small>
                </div>
                <StatusBadge tone={movimiento.delta > 0 ? 'success' : 'warning'}>
                  {movimiento.delta > 0 ? '+' : ''}{movimiento.delta}
                </StatusBadge>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
