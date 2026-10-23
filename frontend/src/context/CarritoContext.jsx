import { useEffect, useRef, useState } from "react";
import { CarritoContext } from "./carrito-context";
import { addCartItem, clearCart, getCart, removeCartItem, updateCartItem } from "../services/carritoService";

const haySesion = () => {
  const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
  const user = JSON.parse(storage.getItem("user") || storage.getItem("usuario") || "null");
  return Boolean(storage.getItem("token") && user?.id);
};

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState([]);
  const operacionesCarrito = useRef(Promise.resolve());
  const versionCarrito = useRef(0);

  useEffect(() => {
    let activo = true;
    const sincronizar = async () => {
      const versionSolicitud = versionCarrito.current;
      if (!haySesion()) {
        setCarrito([]);
        return;
      }
      try {
        const datos = await getCart();
        if (activo && versionSolicitud === versionCarrito.current) setCarrito(datos);
      } catch (error) {
        if (activo && versionSolicitud === versionCarrito.current) setCarrito([]);
        console.error("No se pudo cargar el carrito:", error);
      }
    };
    const cambiarSesion = () => sincronizar();
    sincronizar();
    window.addEventListener("storage", cambiarSesion);
    window.addEventListener("happykids:session-changed", cambiarSesion);
    return () => {
      activo = false;
      window.removeEventListener("storage", cambiarSesion);
      window.removeEventListener("happykids:session-changed", cambiarSesion);
    };
  }, []);

  const ejecutarOperacion = (operacion) => {
    versionCarrito.current += 1;
    const resultado = operacionesCarrito.current.then(operacion);
    operacionesCarrito.current = resultado.catch(() => {});
    return resultado;
  };

  const agregarAlCarrito = (producto, cantidad = 1) => ejecutarOperacion(async () => {
    const carritoActualizado = await addCartItem(producto.id, cantidad);
    setCarrito(carritoActualizado);
    return carritoActualizado;
  });

  const quitarDelCarrito = (id) => ejecutarOperacion(async () => {
    const carritoActualizado = await removeCartItem(id);
    setCarrito(carritoActualizado);
    return carritoActualizado;
  });

  const actualizarCantidad = (id, cantidad) => {
    if (cantidad < 1) return Promise.resolve(carrito);
    return ejecutarOperacion(async () => {
      const carritoActualizado = await updateCartItem(id, cantidad);
      setCarrito(carritoActualizado);
      return carritoActualizado;
    });
  };

  const vaciarCarrito = () => ejecutarOperacion(async () => {
    const carritoActualizado = await clearCart();
    setCarrito(carritoActualizado);
    return carritoActualizado;
  });
  const total = carrito.reduce((acc, p) => {
    const precio = Number(p.precioVenta ?? p.precio) || 0;
    return acc + precio * p.cantidad;
  }, 0);
  const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0);

  return <CarritoContext.Provider value={{ carrito, agregarAlCarrito, quitarDelCarrito, actualizarCantidad, vaciarCarrito, total, totalItems }}>{children}</CarritoContext.Provider>;
}
