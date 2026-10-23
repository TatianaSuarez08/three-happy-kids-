import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { getEmployeeActivity } from '../../services/inventarioService';
import { getAvailableWarehouseOrders, getMyWarehouseOrders } from '../../services/pedidoService';
import { getProducts } from '../../services/productoService';

const normalizeStatus = (value) => String(value || '').trim();

export default function BodegueroDashboard() {
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productosList, available, assigned, activityResult] = await Promise.all([
          getProducts(),
          getAvailableWarehouseOrders(),
          getMyWarehouseOrders(),
          getEmployeeActivity()
        ]);

        setProductos(productosList);
        setPedidos([...available, ...assigned]);
        setMovimientos(activityResult.activity.slice(0, 6));
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
    const pedidosPendientes = pedidos.filter((pedido) => {
      const estadoPreparacion = normalizeStatus(pedido.estadoPreparacion).toLowerCase();
      const estadoFactura = normalizeStatus(pedido.estadoFactura).toLowerCase();
      const estadoEntrega = normalizeStatus(pedido.estadoEntrega).toLowerCase();
      return estadoPreparacion !== 'listo para despacho'
        && !['entregado', 'cancelado', 'anulada'].includes(estadoFactura)
        && !['entregado', 'cancelado'].includes(estadoEntrega);
    }).length;

    return { totalProductos, stockBajo, agotados, pedidosPendientes };
  }, [productos, pedidos]);

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

        <article className="bodeguero-card">
          <span className="label">Pedidos</span>
          <span className="value">{summary.pedidosPendientes}</span>
          <div className="meta">Pendientes de preparación</div>
        </article>
      </section>

      <section className="bodeguero-panel">
        <div className="bodeguero-panel-header">
          <h2>Mi actividad reciente</h2>
        </div>

        {movimientos.length === 0 ? (
          <EmptyState>No hay movimientos recientes registrados.</EmptyState>
        ) : (
          <div className="bodeguero-list">
            {movimientos.map((movimiento) => (
              <div key={movimiento.id} className="bodeguero-item">
                <div>
                  <strong>
                    {movimiento.categoria === 'Pedido' && movimiento.pedidoId
                      ? `Pedido #${movimiento.pedidoId}`
                      : movimiento.producto || movimiento.categoria}
                  </strong>
                  <small>
                    {movimiento.evento}
                    {movimiento.descripcion ? ` · ${movimiento.descripcion}` : ''}
                    {' · '}{new Date(movimiento.fecha).toLocaleString('es-CO')}
                  </small>
                </div>
                {movimiento.cantidad !== null && movimiento.cantidad !== undefined && (
                  <StatusBadge tone={movimiento.cantidad > 0 ? 'success' : 'warning'}>
                    {movimiento.cantidad > 0 ? '+' : ''}{movimiento.cantidad}
                  </StatusBadge>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
