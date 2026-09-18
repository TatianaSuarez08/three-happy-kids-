import { useContext } from "react";
import { CarritoContext } from "./carrito-context";

export function useCarrito() {
  return useContext(CarritoContext);
}
