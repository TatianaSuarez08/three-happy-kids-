import { createContext, useContext, useState, useEffect } from "react";

const FavoritosContext = createContext();

export function FavoritosProvider({ children }) {
  const [favoritos, setFavoritos] = useState(() => {
    const guardado = localStorage.getItem("favoritos");
    return guardado ? JSON.parse(guardado) : [];
  });

  useEffect(() => {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  }, [favoritos]);

  const agregarFavorito = (producto) => {
    setFavoritos((prev) => {
      if (prev.find((p) => p.id === producto.id)) return prev;
      return [...prev, producto];
    });
  };

  const quitarFavorito = (id) => {
    setFavoritos((prev) => prev.filter((p) => p.id !== id));
  };

  const esFavorito = (id) => favoritos.some((p) => p.id === id);

  return (
    <FavoritosContext.Provider value={{ favoritos, agregarFavorito, quitarFavorito, esFavorito }}>
      {children}
    </FavoritosContext.Provider>
  );
}

export function useFavoritos() {
  return useContext(FavoritosContext);
}