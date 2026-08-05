

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/style.css";

const productosEjemplo = [
  { id: 1, nombre: "Sudadera con body", precio: "$35.000", categoria: "Bebés", stock: 10, estado: "Activo" },
  { id: 2, nombre: "Retro jean", precio: "$58.000", categoria: "Niños", stock: 5, estado: "Activo" },
  { id: 3, nombre: "Conjunto bunny", precio: "$29.000", categoria: "Niñas", stock: 8, estado: "Activo" },
  { id: 4, nombre: "Sudadera los Angeles", precio: "$45.000", categoria: "Niños", stock: 3, estado: "Activo" },
  { id: 5, nombre: "Bermuda seleccion", precio: "$32.000", categoria: "Niños", stock: 12, estado: "Activo" },
  { id: 6, nombre: "Capibara canguro", precio: "$36.000", categoria: "Niños", stock: 7, estado: "Activo" },
  { id: 7, nombre: "Bermuda K-POP", precio: "$36.000", categoria: "Niñas", stock: 9, estado: "Activo" },
  { id: 8, nombre: "Sudadera montera", precio: "$39.000", categoria: "Niños", stock: 6, estado: "Activo" },
  { id: 9, nombre: "Sudadera mui mui", precio: "$31.000", categoria: "Niñas", stock: 11, estado: "Activo" },
  { id: 10, nombre: "Sudadera new york", precio: "$31.000", categoria: "Niños", stock: 8, estado: "Activo" },
];

function Productos() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState(productosEjemplo);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const eliminar = (id) => {
    setProductos((prev) => prev.filter((p) => p.id !== id));
    setModal(null);
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
              {productosFiltrados.length === 0 ? (
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
                      <span className="admin-badge activo">{p.estado}</span>
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