import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import "./styles/style.css";
import "./styles/admin.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { FavoritosProvider } from "./context/FavoritosContext";
import { CarritoProvider } from "./context/CarritoContext";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./styles/app.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <CarritoProvider>
        <FavoritosProvider>
          <App />
        </FavoritosProvider>
      </CarritoProvider>
    </ThemeProvider>
  </React.StrictMode>
);
