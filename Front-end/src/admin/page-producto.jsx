import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Productos() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

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
        setError(err.message || "No se pudieron cargar los productos");
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, [backend]);

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const eliminar = async (id) => {
    setError("");

    try {
      const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
      const response = await fetch(`${backend}/productos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${storage.getItem("token")}` },
      });
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
            <h2 className="admin-titulo">Productos</h2>
            <p className="admin-sub">Gestiona todos los productos de la tienda</p>
          </div>
          <button className="btn-admin-primary" onClick={() => navigate("/admin/agregar-producto")}>
            + Agregar producto
          </button>
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
                <th>Nombre</th>
                <th>Precio</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "#888", padding: "2rem" }}>
                    Cargando productos...
                  </td>
                </tr>
              ) : productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "#888", padding: "2rem" }}>
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td className="admin-tabla-nombre">{p.nombre}</td>
                    <td>{p.precio}</td>
                    <td>{p.categoria}</td>
                    <td>
                      <span className={`admin-stock ${p.stock <= 3 ? "bajo" : ""}`}>
                        {p.stock} uds
                      </span>
                    </td>
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
                          ✏️ Editar
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
        <p className="admin-contador">{productosFiltrados.length} producto(s) encontrado(s)</p>

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

export default Productos;