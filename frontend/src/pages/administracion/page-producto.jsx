import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, removeProduct } from "../../services/productoService";
import { createInventoryMovement, getInventoryHistory } from "../../services/inventarioService";

function Inventario() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [modal, setModal] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [movimiento, setMovimiento] = useState({ tipo: "entrada", cantidad: "", motivo: "", referencia: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const formatoPrecio = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    const cargarProductos = async () => {
      setLoading(true);
      setError("");

      try {
        setProductos(await getProducts());
      } catch (err) {
        setError(err.message || "No se pudo cargar el inventario");
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const stock = Number(p.stock) || 0;
    const stockMin = Number(p.stockMin) || 0;
    const coincideFiltro =
      filtro === "todos" ||
      (filtro === "bajo" && stock > 0 && stock <= stockMin) ||
      (filtro === "agotado" && stock === 0);

    return coincideBusqueda && coincideFiltro;
  });

  const stockBajo = productos.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= Number(p.stockMin)).length;
  const agotados = productos.filter((p) => Number(p.stock) === 0).length;

  const eliminar = async (id) => {
    setError("");

    try {
      await removeProduct(id);
      setProductos((prev) => prev.filter((p) => p.id !== id));
      setModal(null);
    } catch (err) {
      setError(err.message || "No se pudo desactivar el producto");
    }
  };

  const confirmarEliminar = (producto) => {
    setProductoSeleccionado(producto);
    setModal("eliminar");
  };

  const abrirHistorial = async (producto) => {
    setProductoSeleccionado(producto);
    setHistorial([]);
    setLoadingHistorial(true);
    setModal("historial");

    try {
      setHistorial(await getInventoryHistory(producto.id));
    } catch (err) {
      setError(err.message || "No se pudo cargar el historial");
      setHistorial([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const guardarMovimiento = async () => {
    if (!productoSeleccionado) return;

    const cantidad = Number(movimiento.cantidad);
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      setError("La cantidad debe ser mayor a cero");
      return;
    }

    try {
      await createInventoryMovement({
          productId: productoSeleccionado.id,
          tipo: movimiento.tipo,
          cantidad,
          motivo: movimiento.motivo || "Ajuste manual",
          referencia: movimiento.referencia || null
      });

      setModal(null);
      setMovimiento({ tipo: "entrada", cantidad: "", motivo: "", referencia: "" });
      setError("");
      window.location.reload();
    } catch (err) {
      setError(err.message || "No se pudo registrar el movimiento");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">

        {/* Header */}
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Inventario</h2>
            <p className="admin-sub">Gestiona productos, existencias y estado</p>
          </div>
          <button className="btn-admin-primary" onClick={() => navigate("/admin/agregar-producto")}>
            + Agregar al inventario
          </button>
        </div>

        <div className="admin-toolbar">
          {[
            { id: "todos", label: `Todos (${productos.length})` },
            { id: "bajo", label: `Stock bajo (${stockBajo})` },
            { id: "agotado", label: `Agotados (${agotados})` },
          ].map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              className={`admin-pill ${filtro === opcion.id ? 'active' : ''}`}
              onClick={() => setFiltro(opcion.id)}
            >
              {opcion.label}
            </button>
          ))}
        </div>

        {/* Búsqueda */}
        {error && <div className="login-error">{error}</div>}

        <div className="admin-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Tabla */}
        <div className="admin-tabla-wrap">
          <table className="admin-tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Precio</th>
                <th>Categoría</th>
                <th>Talla</th>
                <th>Color</th>
                <th>Stock</th>
                <th>Mínimo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", color: "#888", padding: "2rem" }}>
                    Cargando productos...
                  </td>
                </tr>
              ) : productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", color: "#888", padding: "2rem" }}>
                    No se encontraron productos en el inventario
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((p, indice) => (
                  <tr key={p.id}>
                    <td>{indice + 1}</td>
                    <td className="admin-tabla-nombre">{p.nombre}</td>
                    <td>{formatoPrecio.format(Number(p.precio) || 0)}</td>
                    <td>{p.categoria}</td>
                    <td>{p.talla}</td>
                    <td>{p.color}</td>
                    <td>
                      <span className={`admin-stock ${Number(p.stock) <= Number(p.stockMin) ? "bajo" : ""}`}>
                        {p.stock} uds
                      </span>
                    </td>
                    <td>{p.stockMin} uds</td>
                    <td>
                      <span className={p.estado === "Activo" ? "status-badge is-active" : "status-badge is-inactive"}>
                        {p.estado}
                      </span>
                    </td>
                    <td>
                      <div className="admin-acciones">
                        <button
                          className="btn-admin-editar"
                          onClick={() => navigate(`/admin/editar-producto/${p.id}`)}
                        >
                          <i className="bi bi-box-seam" aria-hidden="true" /> Actualizar stock
                        </button>
                        <button
                          className="btn-admin-editar"
                          onClick={() => abrirHistorial(p)}
                        >
                          🧾 Historial
                        </button>
                        <button
                          className="btn-admin-eliminar"
                          onClick={() => confirmarEliminar(p)}
                        >
                          🗑 Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Contador */}
        <p className="admin-contador">{productosFiltrados.length} producto(s) en inventario</p>

      </div>

      {/* Modal eliminar */}
      {modal === "eliminar" && productoSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4 style={{ color: "#e53935" }}>¿Eliminar producto?</h4>
            <p>¿Estás seguro de eliminar <strong>{productoSeleccionado.nombre}</strong>? Esta acción no se puede deshacer.</p>
            <div className="admin-modal-actions">
              <button className="btn-admin-eliminar" style={{ flex: 1, height: "44px", borderRadius: "8px" }} onClick={() => eliminar(productoSeleccionado.id)}>
                Sí, eliminar
              </button>
              <button className="btn-admin-cancelar" style={{ flex: 1, height: "44px", borderRadius: "8px" }} onClick={() => setModal(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === "historial" && productoSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: "720px", width: "90%" }}>
            <h4>Historial de inventario · {productoSeleccionado.nombre}</h4>
            <div className="bodega-movimiento-form">
              <select value={movimiento.tipo} onChange={(e) => setMovimiento((prev) => ({ ...prev, tipo: e.target.value }))}>
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="ajuste">Ajuste</option>
              </select>
              <input type="number" min="1" placeholder="Cantidad" value={movimiento.cantidad} onChange={(e) => setMovimiento((prev) => ({ ...prev, cantidad: e.target.value }))} />
              <input type="text" className="full" placeholder="Motivo" value={movimiento.motivo} onChange={(e) => setMovimiento((prev) => ({ ...prev, motivo: e.target.value }))} />
              <input type="text" className="full" placeholder="Referencia" value={movimiento.referencia} onChange={(e) => setMovimiento((prev) => ({ ...prev, referencia: e.target.value }))} />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginBottom: "1rem" }}>
              <button className="btn-admin-primary" onClick={guardarMovimiento}>Guardar movimiento</button>
              <button className="btn-admin-cancelar" onClick={() => { setModal(null); setMovimiento({ tipo: "entrada", cantidad: "", motivo: "", referencia: "" }); }}>Cerrar</button>
            </div>

            <div className="bodega-historial-shell">
              {loadingHistorial ? (
                <div style={{ padding: "1rem", color: "#666" }}>Cargando historial...</div>
              ) : historial.length === 0 ? (
                <div style={{ padding: "1rem", color: "#666" }}>No hay movimientos registrados.</div>
              ) : (
                <table className="bodega-historial-table">
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      <th>Tipo</th>
                      <th>Cantidad</th>
                      <th>Motivo</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((item) => (
                      <tr key={item.id}>
                        <td style={{ textTransform: "capitalize" }}>{item.tipo}</td>
                        <td>{item.delta > 0 ? `+${item.delta}` : item.delta} uds</td>
                        <td>{item.motivo || item.referencia || "Ajuste manual"}</td>
                        <td>{new Date(item.fecha_movimiento).toLocaleString('es-CL')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Inventario;