import { useEffect, useState } from "react";
import { CarritoContext } from "./carrito-context";
import { addCartItem, clearCart, getCart, removeCartItem, updateCartItem } from "../services/carritoService";

const haySesion = () => {
  const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
  const user = JSON.parse(storage.getItem("user") || storage.getItem("usuario") || "null");
  return Boolean(storage.getItem("token") && user?.id);
};

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    let activo = true;
    const sincronizar = async () => {
      if (!haySesion()) {
        setCarrito([]);
        return;
      }
      try {
        const datos = await getCart();
        if (activo) setCarrito(datos);
      } catch (error) {
        if (activo) setCarrito([]);
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

  const agregarAlCarrito = async (producto, cantidad = 1) => setCarrito(await addCartItem(producto.id, cantidad));
  const quitarDelCarrito = async (id) => setCarrito(await removeCartItem(id));
  const actualizarCantidad = async (id, cantidad) => {
    if (cantidad >= 1) setCarrito(await updateCartItem(id, cantidad));
  };
  const vaciarCarrito = async () => setCarrito(await clearCart());
  const total = carrito.reduce((acc, p) => {
    const precio = Number(p.precioVenta ?? p.precio) || 0;
    return acc + precio * p.cantidad;
  }, 0);
  const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0);

  return <CarritoContext.Provider value={{ carrito, agregarAlCarrito, quitarDelCarrito, actualizarCantidad, vaciarCarrito, total, totalItems }}>{children}</CarritoContext.Provider>;
}
