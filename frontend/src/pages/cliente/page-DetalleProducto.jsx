import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFavoritos } from "../../context/useFavoritos";
import { useCarrito } from "../../context/useCarrito";
import { getPublicProduct } from "../../services/productoService";
import { API_BASE_URL } from "../../services/httpClient";

import "../../styles/style.css";

function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarFavorito, quitarFavorito, esFavorito } = useFavoritos();
  const { agregarAlCarrito } = useCarrito();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [tallaSeleccionada, setTallaSeleccionada] = useState(null);
  const [colorSeleccionado, setColorSeleccionado] = useState(null);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        setProducto(await getPublicProduct(id));
      } catch (err) {
        setError(err.message || "No se pudo consultar el producto.");
      } finally {
        setCargando(false);
      }
    };

    cargarProducto();
  }, [id]);

  if (cargando) {
    return <div className="detalle-page"><div className="detalle-notfound"><p>Cargando producto...</p></div></div>;
  }

  if (error || !producto) {
    return (
      <div className="detalle-page">
        <div className="detalle-notfound">
          <span>😕</span>
          <p>{error || "Producto no encontrado."}</p>
          <button className="btn-ingresar" onClick={() => navigate("/")}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  const favoritoActivo = esFavorito(producto.id);
  const tallas = producto.talla ? [producto.talla] : [];
  const colores = producto.color ? [producto.color] : [];
  const imagen = producto.imagen
    ? `${API_BASE_URL}${producto.imagen.startsWith("/assets/") ? producto.imagen : `/assets/productos/${producto.imagen}`}`
    : "";
  const formatoPrecio = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

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
            <img src={imagen} alt={producto.nombre} className="detalle-img" />
          </div>

          <div className="detalle-info">
            <h1 className="detalle-nombre">{producto.nombre}</h1>
            <span className="detalle-precio">{formatoPrecio.format(Number(producto.precioVenta) || 0)}</span>

            <p className="detalle-descripcion">{producto.descripcion}</p>

            <div className="detalle-grupo">
              <span className="detalle-label">Tallas disponibles</span>
              <div className="detalle-tallas">
                {tallas.map((t) => (
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
                {colores.map((c) => (
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