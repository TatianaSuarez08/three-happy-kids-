import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useFavoritos } from "../Context/FavoritosContext";
import { useCarrito } from "../Context/CarritoContext";

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

const productos = [
  { id: 1, nombre: "Sudadera con body", 
    precio: "$35.000", 
    img: img1, 
    descripcion: "Cómoda sudadera con body incluido, perfecta para los más pequeños.", 
    tallas: ["2", "4", "6","8"], 
    colores: ["Negro y Blanco"], 
    stock: 10 },

  { id: 2, 
    nombre: "Retro jean", 
    precio: "$58.000", 
    img: img2, 
    descripcion: "Jean estilo retro con corte recto, ideal para combinar con cualquier outfit.", 
    tallas: ["4", "6", "8", "10"], 
    colores: ["Azul", "Gris"], 
    stock: 5 },

  { id: 3, 
    nombre: "Conjunto bunny", 
    precio: "$29.000", 
    img: img3, 
    descripcion: "Conjunto temático bunny, suave y cómodo para el día a día.", 
    tallas: ["4", "6", "8", "10"], 
    colores: ["Rosa", "Blanco"], 
    stock: 8 },

  { id: 4, 
    nombre: "Sudadera los Angeles", 
    precio: "$45.000", 
    img: img4, 
    descripcion: "Sudadera estampada Los Angeles, tela de algodón premium.", 
    tallas: ["4", "6", "8", "10", "12"], 
    colores: ["Gris", "Rosado", "Morado"], 
    stock: 3 },

  { id: 5, 
    nombre: "Bermuda seleccion", 
    precio: "$32.000", 
    img: img5, 
    descripcion: "Bermuda deportiva de la selección, ideal para actividades al aire libre.", 
    tallas: ["4", "6", "8", "10"], 
    colores: ["Blanco"], 
    stock: 12 },

  { id: 6, 
    nombre: "Capibara canguro", 
    precio: "$36.000", 
    img: img6, 
    descripcion: "Camiseta básica con logo estampado, tela 100% algodón.", 
    tallas: ["4", "6", "8", "10", "12", "14", "16"], 
    colores: ["Azul", "Negro", "Rojo", "Chocolate"], 
    stock: 15 },

  { id: 7, 
    nombre: "Bermuda K-POP", 
    precio: "$20.000", 
    img: img7, 
    descripcion: "Bermuda con diseño K-POP, tela 100% algodón.", 
    tallas: ["4", "6", "8", "10"], 
    colores: ["Verde", "Beige"], 
    stock: 7 },

  { id: 8, 
    nombre: "Sudadera montera con cremallera", 
    precio: "$39.000", 
    img: img8, 
    descripcion: "Sudadera montera con cremallera, tela de burda, ideal para el invierno.", 
    tallas: ["2", "4", "6", "8", "10", "12", "14", "16"], 
    colores: ["Lila", "Cielo","Camel","Rosado"], 
    stock: 6 },

  { id: 9, 
    nombre: "Sudadera mui mui", 
    precio: "$31.000", 
    img: img9, 
    descripcion: "Sudadera con estilo de mariposa ,tela burda .", 
    tallas: ["2","4","6","8","10","12","14","16"], 
    colores: ["Rosa", "Salmon","Cielo menta","Lila"], 
    stock: 20 },

  { id: 10, 
    nombre: "Sudadera new york", 
    precio: "$31.000", 
    img: img10, 
    descripcion: "Sudadera New York en tela burdeos, cómoda y abrigada con estampado urbano, ideal para el día a día.",
    tallas: ["2","4","6","8","10","12","14","16"], 
    colores: ["Rosa", "Salmon","lila"], 
    stock: 9 },
];

function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarFavorito, quitarFavorito, esFavorito } = useFavoritos();
  const { agregarAlCarrito } = useCarrito();
  const producto = productos.find((p) => p.id === parseInt(id));

  const [tallaSeleccionada, setTallaSeleccionada] = useState(null);
  const [colorSeleccionado, setColorSeleccionado] = useState(null);
  const [agregado, setAgregado] = useState(false);

  if (!producto) {
    return (
      <div className="detalle-page">
        <div className="detalle-notfound">
          <span>😕</span>
          <p>Producto no encontrado.</p>
          <button className="btn-ingresar" onClick={() => navigate("/")}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  const favoritoActivo = esFavorito(producto.id);

  const handleAgregarCarrito = () => {
    const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
    if (!storage.getItem("token")) {
      navigate("/login");
      return;
    }

    agregarAlCarrito({
      ...producto,
      talla: tallaSeleccionada,
      color: colorSeleccionado,
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1500);
  };

  return (
    <div className="detalle-page">
      <div className="detalle-container">

        <button className="detalle-volver" onClick={() => navigate(-1)}>
          ← Volver
        </button>

        <div className="detalle-content">

          <div className="detalle-img-wrap">
            <img src={producto.img} alt={producto.nombre} className="detalle-img" />
          </div>

          <div className="detalle-info">
            <h1 className="detalle-nombre">{producto.nombre}</h1>
            <span className="detalle-precio">{producto.precio}</span>

            <p className="detalle-descripcion">{producto.descripcion}</p>

            <div className="detalle-grupo">
              <span className="detalle-label">Tallas disponibles</span>
              <div className="detalle-tallas">
                {producto.tallas.map((t) => (
                  <span
                    key={t}
                    className="detalle-talla"
                    onClick={() => setTallaSeleccionada(t)}
                    style={{
                      cursor: "pointer",
                      border: tallaSeleccionada === t ? "2px solid #ff8c42" : "1px solid #ccc",
                      background: tallaSeleccionada === t ? "#ff8c42" : "#fff",
                      color: tallaSeleccionada === t ? "#fff" : "#333",
                      fontWeight: tallaSeleccionada === t ? 700 : 400,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="detalle-grupo">
              <span className="detalle-label">Colores</span>
              <div className="detalle-colores">
                {producto.colores.map((c) => (
                  <span
                    key={c}
                    className="detalle-color"
                    onClick={() => setColorSeleccionado(c)}
                    style={{
                      cursor: "pointer",
                      border: colorSeleccionado === c ? "2px solid #ff8c42" : "1px solid #ccc",
                      background: colorSeleccionado === c ? "#ff8c42" : "#fff",
                      color: colorSeleccionado === c ? "#fff" : "#333",
                      fontWeight: colorSeleccionado === c ? 700 : 400,
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="detalle-grupo">
              <span className="detalle-label">Stock disponible</span>
              <span className="detalle-stock">{producto.stock} unidades</span>
            </div>

            <div className="detalle-botones">
              <button className="btn-ingresar" onClick={handleAgregarCarrito}>
                {agregado ? "✔ Agregado" : "🛍 Agregar al carrito"}
              </button>
              <button
                className={favoritoActivo ? "btn-favorito-activo" : "btn-registro"}
                onClick={() => {
                  const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
                  if (!storage.getItem("token")) {
                    navigate("/login");
                    return;
                  }
                  favoritoActivo ? quitarFavorito(producto.id) : agregarFavorito(producto);
                }}
              >
                {favoritoActivo ? "❤️ En favoritos" : "♡ Agregar a favoritos"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalleProducto;