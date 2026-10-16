import { useEffect, useState } from "react";
import { CarritoContext } from "./carrito-context";

const obtenerIdentidadSesion = () => {
  const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
  const user = JSON.parse(storage.getItem("user") || storage.getItem("usuario") || "null");
  return user?.id ? String(user.id) : null;
};

const obtenerClaveCarrito = (identidad) => identidad ? `carrito_usuario_${identidad}` : "carrito_sin_sesion";

export function CarritoProvider({ children }) {
  const [identidadSesion, setIdentidadSesion] = useState(obtenerIdentidadSesion);
  const [carrito, setCarrito] = useState(() => {
    const identidad = obtenerIdentidadSesion();
    const clave = obtenerClaveCarrito(identidad);
    const guardado = localStorage.getItem(clave);

    if (identidad && !guardado) {
      const carritoAnterior = localStorage.getItem("carrito");
      if (carritoAnterior) {
        localStorage.setItem(clave, carritoAnterior);
        localStorage.removeItem("carrito");
        return JSON.parse(carritoAnterior);
      }
    }

    return guardado ? JSON.parse(guardado) : [];
  });

  useEffect(() => {
    const cambiarSesion = () => {
      const identidad = obtenerIdentidadSesion();
      const guardado = localStorage.getItem(obtenerClaveCarrito(identidad));
      setIdentidadSesion(identidad);
      setCarrito(guardado ? JSON.parse(guardado) : []);
    };
    window.addEventListener("storage", cambiarSesion);
    window.addEventListener("happykids:session-changed", cambiarSesion);
    return () => {
      window.removeEventListener("storage", cambiarSesion);
      window.removeEventListener("happykids:session-changed", cambiarSesion);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(obtenerClaveCarrito(identidadSesion), JSON.stringify(carrito));
  }, [carrito, identidadSesion]);
  const agregarAlCarrito = (producto, cantidad = 1) => setCarrito((prev) => { const existe = prev.find((p) => p.id === producto.id); return existe ? prev.map((p) => p.id === producto.id ? { ...p, cantidad: p.cantidad + cantidad } : p) : [...prev, { ...producto, cantidad }]; });
  const quitarDelCarrito = (id) => setCarrito((prev) => prev.filter((p) => p.id !== id));
  const actualizarCantidad = (id, cantidad) => { if (cantidad >= 1) setCarrito((prev) => prev.map((p) => p.id === id ? { ...p, cantidad } : p)); };
  const vaciarCarrito = () => setCarrito([]);
  const total = carrito.reduce((acc, p) => {
    const precio = Number(p.precioVenta ?? p.precio) || 0;
    return acc + precio * p.cantidad;
  }, 0);
  const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0);

  return <CarritoContext.Provider value={{ carrito, agregarAlCarrito, quitarDelCarrito, actualizarCantidad, vaciarCarrito, total, totalItems }}>{children}</CarritoContext.Provider>;
}
