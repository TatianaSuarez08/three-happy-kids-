import { createContext, useContext, useState, useEffect } from "react";

const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem("carrito");
    return guardado ? JSON.parse(guardado) : [];
  });

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  const agregarAlCarrito = (producto, cantidad = 1) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.id === producto.id);
      if (existe) {
        return prev.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + cantidad } : p
        );
      }
      return [...prev, { ...producto, cantidad }];
    });
  };

  const quitarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((p) => p.id !== id));
  };

  const actualizarCantidad = (id, cantidad) => {
    if (cantidad < 1) return;
    setCarrito((prev) =>
      prev.map((p) => (p.id === id ? { ...p, cantidad } : p))
    );
  };

  const vaciarCarrito = () => setCarrito([]);

  const total = carrito.reduce((acc, p) => {
    const precio = parseInt(p.precio.replace(/\$|\./g, ""));
    return acc + precio * p.cantidad;
  }, 0);

  const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0);

  return (
    <CarritoContext.Provider value={{ carrito, agregarAlCarrito, quitarDelCarrito, actualizarCantidad, vaciarCarrito, total, totalItems }}>
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  return useContext(CarritoContext);
}