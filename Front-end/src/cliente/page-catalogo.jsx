import { Link } from "react-router-dom";
import { useState } from "react";
import "../styles/style.css";
import img1 from "../assets/productos/producto1.jpg";
import img2 from "../assets/productos/producto2.jpg";
import img3 from "../assets/productos/producto3.jpg";
import img4 from "../assets/productos/producto4.jpg";
import img5 from "../assets/productos/producto5.jpg";
import img6 from "../assets/productos/producto6.jpg";
import img7 from "../assets/productos/producto7.jpg";
import img8 from "../assets/productos/producto8.jpg";
import img9 from "../assets/productos/producto9.jpg";
import img10 from "../assets/productos/producto10.jpg";

const todos = [
  { id: 1, nombre: "Sudadera con body", precio: "$35.000", img: img1, categoria: "niña" },
  { id: 2, nombre: "Retro jean", precio: "$58.000", img: img2, categoria: "ninos" },
  { id: 3, nombre: "Conjunto bunny", precio: "$29.000", img: img3, categoria: "ninas" },
  { id: 4, nombre: "Sudadera los Angeles", precio: "$45.000", img: img4, categoria: "ninos" },
  { id: 5, nombre: "Bermuda seleccion", precio: "$32.000", img: img5, categoria: "ninos" },
  { id: 6, nombre: "Capibara canguro", precio: "$36.000", img: img6, categoria: "ninos" },
  { id: 7, nombre: "Bermuda K-POP", precio: "$36.000", img: img7, categoria: "ninas" },
  { id: 8, nombre: "Sudadera montera con cremallera", precio: "$39.000", img: img8, categoria: "ninos" },
  { id: 9, nombre: "Sudadera mui mui", precio: "$31.000", img: img9, categoria: "ninas" },
  { id: 10, nombre: "Sudadera new york", precio: "$31.000", img: img10, categoria: "ninos" },
];

const categorias = [
  { id: "todos", nombre: "Todos" },
  { id: "ninas", nombre: "Niñas" },
  { id: "ninos", nombre: "Niños" },
];

function Catalogo() {
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const productos = todos.filter((p) => {
    const coincideCategoria = filtro === "todos" || p.categoria === filtro;
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  return (
    <div className="home-page">

      <section className="home-section" style={{ paddingTop: "2rem" }}>
        <h2 className="home-section-title">Catálogo</h2>
        <p className="home-section-sub">Explora todos nuestros productos</p>
      </section>

      <section className="home-section">
        <div className="home-search-wrap">
          <span className="home-search-icon">🔍</span>
          <input
            type="text"
            className="home-search-input"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button className="home-search-clear" onClick={() => setBusqueda("")}>✕</button>
          )}
        </div>
      </section>

      <section className="home-section">
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFiltro(cat.id)}
              style={{
                padding: "8px 20px",
                borderRadius: "20px",
                border: filtro === cat.id ? "1px solid #ff8c42" : "1px solid #ddd",
                background: filtro === cat.id ? "#ff8c42" : "#fff",
                color: filtro === cat.id ? "#fff" : "#555",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </section>

      <section className="home-section">
        <p className="home-section-sub">{productos.length} producto(s) encontrado(s)</p>

        {productos.length === 0 ? (
          <div className="home-no-results">
            <span>😕</span>
            <p>No se encontraron productos.</p>
          </div>
        ) : (
          <div className="home-productos">
            {productos.map((p) => (
              <div key={p.id} className="home-producto-card">
                <div className="home-producto-img">
                  <img src={p.img} alt={p.nombre} />
                </div>
                <div className="home-producto-info">
                  <span className="home-producto-nombre">{p.nombre}</span>
                  <span className="home-producto-precio">{p.precio}</span>
                  <Link to={`/producto/${p.id}`} className="home-producto-btn">
                    Ver producto
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

export default Catalogo;