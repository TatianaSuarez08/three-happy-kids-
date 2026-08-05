

import { useState } from "react";
import "../styles/style.css";

const inventarioEjemplo = [
  { id: 1, nombre: "Sudadera con body", categoria: "Bebés", talla: "S", color: "Negro", stock: 10, stockMin: 5, precio: "$35.000" },
  { id: 2, nombre: "Sudadera con body", categoria: "Bebés", talla: "M", color: "Blanco", stock: 3, stockMin: 5, precio: "$35.000" },
  { id: 3, nombre: "Retro jean", categoria: "Niños", talla: "4", color: "Azul", stock: 5, stockMin: 3, precio: "$58.000" },
  { id: 4, nombre: "Conjunto bunny", categoria: "Niñas", talla: "S", color: "Rosa", stock: 8, stockMin: 4, precio: "$29.000" },
  { id: 5, nombre: "Sudadera los Angeles", categoria: "Niños", talla: "M", color: "Gris", stock: 2, stockMin: 5, precio: "$45.000" },
  { id: 6, nombre: "Bermuda seleccion", categoria: "Niños", talla: "L", color: "Blanco", stock: 12, stockMin: 5, precio: "$32.000" },
  { id: 7, nombre: "Capibara canguro", categoria: "Niños", talla: "M", color: "Café", stock: 1, stockMin: 3, precio: "$36.000" },
  { id: 8, nombre: "Bermuda K-POP", categoria: "Niñas", talla: "S", color: "Salmón", stock: 9, stockMin: 4, precio: "$36.000" },
  { id: 9, nombre: "Sudadera montera", categoria: "Niños", talla: "L", color: "Negro", stock: 6, stockMin: 3, precio: "$39.000" },
  { id: 10, nombre: "Sudadera mui mui", categoria: "Niñas", talla: "M", color: "Rosa", stock: 11, stockMin: 5, precio: "$31.000" },
];

function Inventario() {
  const [inventario, setInventario] = useState(inventarioEjemplo);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [modal, setModal] = useState(null);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [nuevoStock, setNuevoStock] = useState("");

  const inventarioFiltrado = inventario.filter((item) => {
    const coincideBusqueda = item.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideFiltro =
      filtro === "todos" ||
      (filtro === "bajo" && item.stock <= item.stockMin) ||
      (filtro === "agotado" && item.stock === 0);
    return coincideBusqueda && coincideFiltro;
  });

  const actualizarStock = () => {
    if (!nuevoStock || isNaN(nuevoStock) || parseInt(nuevoStock) < 0) return;
    setInventario((prev) =>
      prev.map((item) =>
        item.id === itemSeleccionado.id ? { ...item, stock: parseInt(nuevoStock) } : item
      )
    );
    setModal(null);
    setNuevoStock("");
  };

  const abrirModal = (item) => {
    setItemSeleccionado(item);
    setNuevoStock(item.stock.toString());
    setModal("stock");
  };

  const stockBajo = inventario.filter((i) => i.stock <= i.stockMin).length;
  const agotados = inventario.filter((i) => i.stock === 0).length;

  return (
    <div className="admin-page">
      <div className="admin-container">

        {/* Header */}
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Inventario</h2>
            <p className="admin-sub">Controla el stock de todos los productos</p>
          </div>

          {/* Resumen */}
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ textAlign: "center", background: "#eafbea", padding: "10px 20px", borderRadius: "10px" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#3a7d44" }}>{inventario.length}</div>
              <div style={{ fontSize: "11px", color: "#3a7d44" }}>Total items</div>
            </div>
            <div style={{ textAlign: "center", background: "#fff8e0", padding: "10px 20px", borderRadius: "10px" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#f0a500" }}>{stockBajo}</div>
              <div style={{ fontSize: "11px", color: "#f0a500" }}>Stock bajo</div>
            </div>
            <div style={{ textAlign: "center", background: "#fff0f0", padding: "10px 20px", borderRadius: "10px" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#e53935" }}>{agotados}</div>
              <div style={{ fontSize: "11px", color: "#e53935" }}>Agotados</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
          {[
            { id: "todos", label: "Todos" },
            { id: "bajo", label: "⚠️ Stock bajo" },
            { id: "agotado", label: "❌ Agotados" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              style={{
                padding: "6px 16px",
                borderRadius: "20px",
                border: filtro === f.id ? "1px solid #ff8c42" : "1px solid #ddd",
                background: filtro === f.id ? "#ff8c42" : "#fff",
                color: filtro === f.id ? "#fff" : "#555",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {f.label}
            </button>
          ))}
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
                <th>Producto</th>
                <th>Categoría</th>
                <th>Talla</th>
                <th>Color</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inventarioFiltrado.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", color: "#888", padding: "2rem" }}>
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                inventarioFiltrado.map((item) => {
                  const estadoStock =
                    item.stock === 0 ? "agotado" :
                    item.stock <= item.stockMin ? "bajo" : "normal";

                  return (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td className="admin-tabla-nombre">{item.nombre}</td>
                      <td>{item.categoria}</td>
                      <td>{item.talla}</td>
                      <td>{item.color}</td>
                      <td>{item.precio}</td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: estadoStock === "agotado" ? "#e53935" : estadoStock === "bajo" ? "#f0a500" : "#3a7d44"
                        }}>
                          {item.stock} uds
                        </span>
                      </td>
                      <td>
                        <span
                          className="admin-badge"
                          style={{
                            background: estadoStock === "agotado" ? "#fff0f0" : estadoStock === "bajo" ? "#fff8e0" : "#eafbea",
                            color: estadoStock === "agotado" ? "#e53935" : estadoStock === "bajo" ? "#f0a500" : "#3a7d44",
                          }}
                        >
                          {estadoStock === "agotado" ? "❌ Agotado" : estadoStock === "bajo" ? "⚠️ Bajo" : "✅ Normal"}
                        </span>
                      </td>
                      <td>
                        <button className="btn-admin-editar" onClick={() => abrirModal(item)}>
                          📦 Actualizar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <p className="admin-contador">{inventarioFiltrado.length} item(s) encontrado(s)</p>

      </div>

      {/* Modal actualizar stock */}
      {modal === "stock" && itemSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4 style={{ color: "#1a1a1a" }}>📦 Actualizar stock</h4>
            <p style={{ marginBottom: "1rem" }}>
              <strong>{itemSeleccionado.nombre}</strong><br />
              Talla: {itemSeleccionado.talla} — Color: {itemSeleccionado.color}
            </p>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "13px", color: "#555", display: "block", marginBottom: "6px" }}>
                Nuevo stock
              </label>
              <input
                type="number"
                min="0"
                value={nuevoStock}
                onChange={(e) => setNuevoStock(e.target.value)}
                style={{ width: "100%", height: "42px", border: "1px solid #ddd", borderRadius: "8px", padding: "0 12px", fontSize: "14px", outline: "none" }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn-admin-primary"
                style={{ flex: 1, height: "44px", borderRadius: "8px" }}
                onClick={actualizarStock}
              >
                Guardar
              </button>
              <button
                className="btn-admin-cancelar"
                style={{ flex: 1, height: "44px", borderRadius: "8px" }}
                onClick={() => setModal(null)}
              >
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