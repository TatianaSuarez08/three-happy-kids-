import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Inventario() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [modal, setModal] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
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
        const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
        const token = storage.getItem("token");
        const response = await fetch(`${backend}/productos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "No se pudieron cargar los productos");
        }

        setProductos(data.products || []);
      } catch (err) {
        setError(err.message || "No se pudo cargar el inventario");
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, [backend]);

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
      const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
      const response = await fetch(`${backend}/productos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${storage.getItem("token")}` },
      });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(`El backend no devolvió JSON en ${backend}/productos/${id}. Reinicia el backend en el puerto 3000.`);
      }
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "No se pudo desactivar el producto");

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

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "1rem" }}>
          {[
            { id: "todos", label: `Todos (${productos.length})` },
            { id: "bajo", label: `Stock bajo (${stockBajo})` },
            { id: "agotado", label: `Agotados (${agotados})` },
          ].map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              onClick={() => setFiltro(opcion.id)}
              style={{
                padding: "7px 14px",
                borderRadius: "20px",
                border: filtro === opcion.id ? "1px solid #ff8c42" : "1px solid #ddd",
                background: filtro === opcion.id ? "#ff8c42" : "#fff",
                color: filtro === opcion.id ? "#fff" : "#555",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
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
                      <span className={`admin-badge ${p.estado === "Activo" ? "activo" : "inactivo"}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td>
                      <div className="admin-acciones">
                        <button
                          className="btn-admin-editar"
                          onClick={() => navigate(`/admin/editar-producto/${p.id}`)}
                        >
                          📦 Actualizar stock
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
            <div style={{ display: "flex", gap: "10px" }}>
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

    </div>
  );
}

export default Inventario;