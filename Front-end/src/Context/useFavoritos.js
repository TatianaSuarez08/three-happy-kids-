import { useContext } from "react";
import { FavoritosContext } from "./favoritos-context";

export function useFavoritos() {
  return useContext(FavoritosContext);
}
