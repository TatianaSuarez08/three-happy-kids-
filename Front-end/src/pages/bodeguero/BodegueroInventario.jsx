import { useCallback, useEffect, useMemo, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { getProducts } from '../../services/productoService';
import { createInventoryMovement, getInventoryHistory } from '../../services/inventarioService';

export default function BodegueroInventario() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [movement, setMovement] = useState({ tipo: 'entrada', cantidad: '', motivo: '', referencia: '' });

  const cargarProductos = useCallback(async () => {
    try {
      setProductos(await getProducts());
    } catch (err) {
      setError(err.message || 'No se pudo cargar el inventario.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // La carga asíncrona actualiza el estado cuando responde la API.
    void Promise.resolve().then(cargarProductos);
  }, [cargarProductos]);

  const productosFiltrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    if (!query) return productos;
    return productos.filter((producto) => String(producto.nombre || '').toLowerCase().includes(query));
  }, [busqueda, productos]);

  const abrirHistorial = async (producto) => {
    try {
      setSelectedProduct(producto);
      setLoadingHistorial(true);
      setError('');
      setHistorial(await getInventoryHistory(producto.id));
    } catch (err) {
      setError(err.message || 'No se pudo cargar el historial.');
      setHistorial([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const guardarMovimiento = async () => {
    if (!selectedProduct) return;

    const cantidad = Number(movement.cantidad);
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      setError('La cantidad debe ser mayor a cero.');
      return;
    }

    try {
      setError('');
      await createInventoryMovement({
          productId: selectedProduct.id,
          tipo: movement.tipo,
          cantidad,
          motivo: movement.motivo || 'Ajuste de inventario',
          referencia: movement.referencia || null
      });

      setSuccess('Movimiento registrado correctamente.');
      setMovement({ tipo: 'entrada', cantidad: '', motivo: '', referencia: '' });
      setSelectedProduct(null);
      setHistorial([]);
      await cargarProductos();
    } catch (err) {
      setError(err.message || 'No se pudo registrar el movimiento.');
    }
  };

  if (loading) {
    return (
      <div className="bodeguero-panel">
        <EmptyState>Cargando inventario...</EmptyState>
      </div>
    );
  }

  return (
    <div className="bodeguero-section">
      {error && <div className="bodeguero-message error">{error}</div>}
      {success && <div className="bodeguero-message success">{success}</div>}

      <section className="bodeguero-panel">
        <div className="bodeguero-panel-header">
          <h2>Inventario disponible</h2>
          <span className="bodeguero-pill">{productosFiltrados.length} productos</span>
        </div>

        <div className="bodeguero-search">
          <span aria-hidden="true">🔎</span>
          <input
            type="text"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar producto por nombre..."
          />
        </div>

        <div className="bodeguero-table-wrap">
          <table className="bodeguero-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Stock</th>
                <th>Mínimo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <EmptyState>No se encontraron productos para esta búsqueda.</EmptyState>
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((producto) => {
                  const stock = Number(producto.stock || 0);
                  const min = Number(producto.stockMin || 0);
                  const isLow = stock > 0 && stock <= min;
                  const isOut = stock === 0;

                  return (
                    <tr key={producto.id}>
                      <td>
                        <strong>{producto.nombre}</strong>
                      </td>
                      <td>
                        <StatusBadge tone={isOut ? 'danger' : isLow ? 'warning' : 'success'}>
                          {stock} uds
                        </StatusBadge>
                      </td>
                      <td>{min} uds</td>
                      <td>
                        <StatusBadge tone={isOut ? 'danger' : isLow ? 'warning' : 'success'}>
                          {isOut ? 'Agotado' : isLow ? 'Bajo' : 'Normal'}
                        </StatusBadge>
                      </td>
                      <td>
                        <div className="bodeguero-actions">
                          <button className="bodeguero-button-secondary" type="button" onClick={() => abrirHistorial(producto)}>
                            Historial
                          </button>
                          <button className="bodeguero-button" type="button" onClick={() => { setSelectedProduct(producto); setMovement({ tipo: 'entrada', cantidad: '', motivo: '', referencia: '' }); }}>
                            Registrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedProduct && (
        <section className="bodeguero-panel">
          <div className="bodeguero-panel-header">
            <h3>Registrar movimiento · {selectedProduct.nombre}</h3>
          </div>

          <div className="bodeguero-form">
            <label>
              Tipo
              <select value={movement.tipo} onChange={(event) => setMovement({ ...movement, tipo: event.target.value })}>
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="ajuste">Ajuste</option>
              </select>
            </label>

            <label>
              Cantidad
              <input
                type="number"
                min="1"
                value={movement.cantidad}
                onChange={(event) => setMovement({ ...movement, cantidad: event.target.value })}
                placeholder="Ej. 12"
              />
            </label>

            <label className="full">
              Motivo
              <input
                type="text"
                value={movement.motivo}
                onChange={(event) => setMovement({ ...movement, motivo: event.target.value })}
                placeholder="Ej. Compra, devolución, ajuste de conteo"
              />
            </label>

            <label className="full">
              Referencia
              <input
                type="text"
                value={movement.referencia}
                onChange={(event) => setMovement({ ...movement, referencia: event.target.value })}
                placeholder="Opcional"
              />
            </label>
          </div>

          <div className="bodeguero-actions bodeguero-form-actions">
            <button type="button" className="bodeguero-button" onClick={guardarMovimiento}>Guardar movimiento</button>
            <button type="button" className="bodeguero-button-secondary" onClick={() => setSelectedProduct(null)}>
              Cancelar
            </button>
          </div>
        </section>
      )}

      {selectedProduct && (
        <section className="bodeguero-panel">
          <div className="bodeguero-panel-header">
            <h3>Historial · {selectedProduct.nombre}</h3>
          </div>

          {loadingHistorial ? (
            <EmptyState>Cargando historial...</EmptyState>
          ) : historial.length === 0 ? (
            <EmptyState>No hay movimientos registrados para este producto.</EmptyState>
          ) : (
            <div className="bodeguero-table-wrap">
              <table className="bodeguero-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Motivo</th>
                    <th>Usuario</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((item) => (
                    <tr key={item.id}>
                        <td><StatusBadge type={item.tipo}>{item.tipo}</StatusBadge></td>
                      <td>{item.delta > 0 ? `+${item.delta}` : item.delta} uds</td>
                      <td>{item.motivo || item.referencia || 'Ajuste'}</td>
                      <td>{item.usuario || 'Sistema'}</td>
                      <td>{new Date(item.fecha_movimiento).toLocaleString('es-CL')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
