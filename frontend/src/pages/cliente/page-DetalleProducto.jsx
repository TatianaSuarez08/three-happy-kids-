import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useFavoritos } from "../../context/useFavoritos";
import { useCarrito } from "../../context/useCarrito";
import { getPublicProduct } from "../../services/productoService";
import { ProductImage, ProductImageCredits } from "../../components/ProductImage";


function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarFavorito, quitarFavorito, esFavorito } = useFavoritos();
  const { carrito, agregarAlCarrito } = useCarrito();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState(null);
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null);
  const [colorSeleccionado, setColorSeleccionado] = useState(null);
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const [mensajeCarrito, setMensajeCarrito] = useState("");
  const [errorCarrito, setErrorCarrito] = useState("");
  const [agregando, setAgregando] = useState(false);
  const agregandoRef = useRef(false);

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
  const tallas = producto.talla ? [{ id: producto.idTalla, nombre: producto.talla }] : [];
  const colores = producto.color ? [{ id: producto.idColor, nombre: producto.color }] : [];
  const requiereTalla = tallas.length > 0;
  const requiereColor = colores.length > 0;
  const seleccionActual = productoSeleccionadoId === producto.id;
  const lineaEnCarrito = carrito.find((linea) => Number(linea.id) === Number(producto.id));
  const cantidadEnCarrito = Number(lineaEnCarrito?.cantidad) || 0;
  const cantidadDisponible = Math.max(0, Number(producto.stock) - cantidadEnCarrito);
  const formatoPrecio = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const handleAgregarCarrito = async () => {
    if (agregandoRef.current) return;
    const especificacionesFaltantes = [];
    if (requiereTalla && (!seleccionActual || tallaSeleccionada !== producto.idTalla)) {
      especificacionesFaltantes.push("la talla");
    }
    if (requiereColor && (!seleccionActual || colorSeleccionado !== producto.idColor)) {
      especificacionesFaltantes.push("el color");
    }
    if (especificacionesFaltantes.length > 0) {
      setErrorCarrito(`Selecciona ${especificacionesFaltantes.join(" y ")} disponibles antes de agregar el producto.`);
      setMensajeCarrito("");
      return;
    }

    const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
    if (!storage.getItem("token")) {
      navigate("/login");
      return;
    }

    const cantidad = Number(cantidadSeleccionada);
    if (!Number.isSafeInteger(cantidad) || cantidad < 1 || cantidad > cantidadDisponible) {
      setErrorCarrito(`Selecciona una cantidad entre 1 y ${cantidadDisponible}.`);
      setMensajeCarrito("");
      return;
    }

    if (cantidadEnCarrito > 0) {
      const confirmarAgregar = window.confirm(
        `Ya agregaste ${cantidadEnCarrito} unidad(es) de "${producto.nombre}" a tu carrito. ¿Deseas agregar ${cantidad} más?`
      );
      if (!confirmarAgregar) return;
    }

    agregandoRef.current = true;
    setErrorCarrito("");
    setMensajeCarrito("");
    setAgregando(true);
    try {
      const carritoActualizado = await agregarAlCarrito(producto, cantidad);
      const lineaAgregada = carritoActualizado.find((linea) => Number(linea.id) === Number(producto.id));
      const variante = [
        requiereTalla ? `talla ${producto.talla}` : null,
        requiereColor ? `color ${producto.color}` : null,
      ].filter(Boolean).join(", ");
      const descripcionVariante = variante ? ` — ${variante}` : "";
      setMensajeCarrito(cantidadEnCarrito > 0
        ? `${producto.nombre}${descripcionVariante}: cantidad actualizada a ${lineaAgregada.cantidad} unidades.`
        : `${producto.nombre}${descripcionVariante}: se agregó ${cantidad} unidad(es) al carrito.`);
      setAgregado(true);
      setTimeout(() => setAgregado(false), 1500);
    } catch (error) {
      setErrorCarrito(error.message || "No se pudo agregar el producto al carrito.");
    } finally {
      agregandoRef.current = false;
      setAgregando(false);
    }
  };

  return (
    <div className="detalle-page">
      <div className="detalle-container">

        <button className="detalle-volver" onClick={() => navigate(-1)}>
          ← Volver
        </button>

        <div className="detalle-content">

          <ProductImage product={producto} className="detalle-img-wrap" imageClassName="detalle-img" />

          <div className="detalle-info">
            <h1 className="detalle-nombre">{producto.nombre}</h1>
            <span className="detalle-precio">{formatoPrecio.format(Number(producto.precioVenta) || 0)}</span>

            <p className="detalle-descripcion">{producto.descripcion}</p>
            <ProductImageCredits products={[producto]} />

            <div className="detalle-grupo">
              <span className="detalle-label">Tallas disponibles</span>
              <div className="detalle-tallas">
                {tallas.length ? tallas.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`detalle-talla${seleccionActual && tallaSeleccionada === t.id ? " seleccionada" : ""}`}
                    aria-pressed={seleccionActual && tallaSeleccionada === t.id}
                    disabled={Number(producto.stock) <= 0}
                    onClick={() => {
                      setProductoSeleccionadoId(producto.id);
                      setTallaSeleccionada((actual) => (
                        productoSeleccionadoId === producto.id && actual === t.id ? null : t.id
                      ));
                      setErrorCarrito("");
                      setMensajeCarrito("");
                    }}
                  >
                    {t.nombre}
                  </button>
                )) : <span className="detalle-stock">No aplica</span>}
              </div>
            </div>

            <div className="detalle-grupo">
              <span className="detalle-label">Colores</span>
              <div className="detalle-colores">
                {colores.length ? colores.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`detalle-color${seleccionActual && colorSeleccionado === c.id ? " seleccionado" : ""}`}
                    aria-pressed={seleccionActual && colorSeleccionado === c.id}
                    disabled={Number(producto.stock) <= 0}
                    onClick={() => {
                      setProductoSeleccionadoId(producto.id);
                      setColorSeleccionado((actual) => (
                        productoSeleccionadoId === producto.id && actual === c.id ? null : c.id
                      ));
                      setErrorCarrito("");
                      setMensajeCarrito("");
                    }}
                  >
                    {c.nombre}
                  </button>
                )) : <span className="detalle-stock">No aplica</span>}
              </div>
            </div>

            <div className="detalle-grupo">
              <span className="detalle-label">Stock disponible</span>
              <span className={`detalle-stock${Number(producto.stock) > 0 ? "" : " agotado"}`}>
                {Number(producto.stock) > 0
                  ? `${producto.stock} unidades${cantidadEnCarrito > 0 ? ` (${cantidadDisponible} disponibles para agregar)` : ""}`
                  : "Agotado"}
              </span>
            </div>

            <div className="detalle-grupo">
              <label className="detalle-label" htmlFor="cantidad-producto">Cantidad</label>
              <input
                id="cantidad-producto"
                className="detalle-cantidad-input"
                type="number"
                min="1"
                max={cantidadDisponible}
                step="1"
                inputMode="numeric"
                value={cantidadSeleccionada}
                onChange={(event) => {
                  setCantidadSeleccionada(event.target.value);
                  setErrorCarrito("");
                }}
                disabled={cantidadDisponible < 1}
                aria-describedby="cantidad-disponible"
              />
              <small id="cantidad-disponible" className="detalle-cantidad-ayuda">
                {cantidadDisponible > 0
                  ? `Puedes agregar hasta ${cantidadDisponible} unidad(es).`
                  : "Ya tienes todas las unidades disponibles de esta variante en el carrito."}
              </small>
            </div>

            <div className="detalle-botones">
              <button className="btn-ingresar" onClick={handleAgregarCarrito} disabled={agregando || cantidadDisponible < 1}>
                {cantidadDisponible < 1 ? "Sin existencias disponibles" : agregando ? "Agregando..." : agregado ? "✔ Agregado" : "🛍 Agregar al carrito"}
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
            {errorCarrito && <div className="login-error" role="alert">{errorCarrito}</div>}
            {mensajeCarrito && <div className="detalle-carrito-confirmacion" role="status">{mensajeCarrito}</div>}

          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalleProducto;