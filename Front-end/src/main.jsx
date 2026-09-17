import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import "./styles/style.css";
import "./styles/admin.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { FavoritosProvider } from "./Context/FavoritosContext";
import { CarritoProvider } from "./Context/CarritoContext";
import { ThemeProvider } from "./Context/ThemeContext.jsx";
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
