import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import "./styles/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FavoritosProvider } from "./Context/FavoritosContext";
import { CarritoProvider } from "./Context/CarritoContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CarritoProvider>
      <FavoritosProvider>
        <App />
      </FavoritosProvider>
    </CarritoProvider>
  </React.StrictMode>
);
