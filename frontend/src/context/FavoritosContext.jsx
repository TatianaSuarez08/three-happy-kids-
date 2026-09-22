import { useEffect, useState } from "react";
import { FavoritosContext } from "./favoritos-context";
import { addFavorite, getFavorites, removeFavorite } from "../services/favoritoService";

const getSession = () => {
  const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
  const user = JSON.parse(storage.getItem("user") || storage.getItem("usuario") || "null");
  return storage.getItem("token") && user?.id ? user : null;
};

export function FavoritosProvider({ children }) {
  const [favoritos, setFavoritos] = useState([]);

  useEffect(() => {
    let activo = true;
    const sincronizar = async () => {
      if (!getSession()) {
        setFavoritos([]);
        return;
      }
      try {
        const datos = await getFavorites();
        if (activo) setFavoritos(datos);
      } catch (error) {
        if (activo) setFavoritos([]);
        console.error("No se pudieron cargar los favoritos:", error);
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

  const agregarFavorito = async (producto) => {
    const favorito = await addFavorite(producto.id);
    if (favorito) setFavoritos((prev) => prev.some((item) => item.id === favorito.id) ? prev : [...prev, favorito]);
  };
  const quitarFavorito = async (id) => {
    await removeFavorite(id);
    setFavoritos((prev) => prev.filter((p) => p.id !== id));
  };
  const esFavorito = (id) => favoritos.some((p) => p.id === id);

  return <FavoritosContext.Provider value={{ favoritos, agregarFavorito, quitarFavorito, esFavorito }}>{children}</FavoritosContext.Provider>;
}
