import { useEffect, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { getAllMovements } from '../../services/inventarioService';
import { getProducts } from '../../services/productoService';

export default function BodegueroMovimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMovements = async () => {
      try {
        const products = await getProducts();
        setMovimientos(await getAllMovements(products));
      } catch (err) {
        setError(err.message || 'No se pudo cargar el historial de movimientos.');
      } finally {
        setLoading(false);
      }
    };

    loadMovements();
  }, []);

  if (loading) {
    return (
      <div className="bodeguero-panel">
        <EmptyState>Cargando movimientos de inventario...</EmptyState>
      </div>
    );
  }

  return (
    <div className="bodeguero-section">
      {error && <div className="bodeguero-message error">{error}</div>}

      <section className="bodeguero-panel">
        <div className="bodeguero-panel-header">
          <h2>Historial de movimientos</h2>
          <span className="bodeguero-pill">{movimientos.length} registros</span>
        </div>

        {movimientos.length === 0 ? (
          <EmptyState>No hay movimientos registrados.</EmptyState>
        ) : (
          <div className="bodeguero-table-wrap">
            <table className="bodeguero-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Motivo</th>
                  <th>Usuario</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((movimiento) => (
                  <tr key={`${movimiento.id}-${movimiento.nombreProducto}`}>
                    <td>{movimiento.nombreProducto || 'Producto'}</td>
                    <td><StatusBadge type={movimiento.tipo}>{movimiento.tipo}</StatusBadge></td>
                    <td>{movimiento.delta > 0 ? `+${movimiento.delta}` : movimiento.delta} uds</td>
                    <td>{movimiento.motivo || movimiento.referencia || 'Ajuste'}</td>
                    <td>{movimiento.usuario || 'Sistema'}</td>
                    <td>{new Date(movimiento.fecha_movimiento).toLocaleString('es-CL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
