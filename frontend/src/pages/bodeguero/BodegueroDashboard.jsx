import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { getAllMovements } from '../../services/inventarioService';
import { getOrders } from '../../services/pedidoService';
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
        const [productosList, pedidosList] = await Promise.all([getProducts(), getOrders()]);

        setProductos(productosList);
        setPedidos(pedidosList);
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
    const pedidosPendientes = pedidos.filter((pedido) => {
      const estado = normalizeStatus(pedido.estado).toLowerCase();
      return estado && !['entregado', 'cancelado', 'anulada'].includes(estado);
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
