import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

import img1 from "../assets/productos/producto1.jpg";
import img2 from "../assets/productos/producto2.jpg";
import img3 from "../assets/productos/producto3.jpg";
import img4 from "../assets/productos/producto4.jpg";
import img5 from "../assets/productos/producto5.jpg";
import img6 from "../assets/productos/producto6.jpg";
import img7 from "../assets/productos/producto7.jpg";
import img8 from "../assets/productos/producto8.jpg";
import img9 from "../assets/productos/producto9.jpg";
import img10 from "../assets/productos/producto10.jpg";

const todos = [
  { id: 1, nombre: "Sudadera con body", precio: "$35.000", img: img1, categoria: "niña" },
  { id: 2, nombre: "Retro jean", precio: "$58.000", img: img2, categoria: "ninos" },
  { id: 3, nombre: "Conjunto bunny", precio: "$29.000", img: img3, categoria: "ninas" },
  { id: 4, nombre: "Sudadera los Angeles", precio: "$45.000", img: img4, categoria: "ninos" },
  { id: 5, nombre: "Bermuda seleccion", precio: "$32.000", img: img5, categoria: "ninos" },
  { id: 6, nombre: "Capibara canguro", precio: "$36.000", img: img6, categoria: "ninos" },
  { id: 7, nombre: "Bermuda K-POP", precio: "$36.000", img: img7, categoria: "ninas" },
  { id: 8, nombre: "Sudadera montera con cremallera", precio: "$39.000", img: img8, categoria: "ninos" },
  { id: 9, nombre: "Sudadera mui mui", precio: "$31.000", img: img9, categoria: "ninas" },
  { id: 10, nombre: "Sudadera new york", precio: "$31.000", img: img10, categoria: "ninos" },
];

function Index() {
  const [searchParams] = useSearchParams();
  const [busqueda, setBusqueda] = useState(searchParams.get("buscar") || "");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user") || localStorage.getItem("usuario");
    const userRolesJson = localStorage.getItem("userRoles");
    const user = userJson ? JSON.parse(userJson) : null;
    const roles = user?.roles || (userRolesJson ? JSON.parse(userRolesJson) : []);
    const normalizadas = (Array.isArray(roles) ? roles : []).map((rol) => String(rol).trim().toLowerCase());
    const esAdmin = normalizadas.some((rol) => rol === "administrador" || rol === "admin");

    if (!token || !esAdmin) {
      navigate("/no-autorizado", { replace: true });
      return;
    }

    setBusqueda(searchParams.get("buscar") || "");
  }, [navigate, searchParams]);

  const productos = todos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const [hoverBtn, setHoverBtn] = useState(null);

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

      <style>{`
        .hk-banner { padding: 4rem 1.5rem 3rem; max-width: 1100px; margin: 0 auto; }
        .hk-banner-title { font-size: 40px; }
        .hk-productos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }

        @media (max-width: 640px) {
          .hk-banner { padding: 2rem 1rem 1.5rem; }
          .hk-banner-title { font-size: 28px; }
          .hk-banner-sub { font-size: 14px; }
          .hk-productos-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .hk-section { padding: 0 1rem 2.5rem !important; }
        }

        @media (max-width: 380px) {
          .hk-productos-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Banner */}
      <section className="hk-banner">
        <div style={{ maxWidth: "520px" }}>
          <h1 className="hk-banner-title" style={{ fontWeight: 700, letterSpacing: "-0.5px", color: "#1a1a1a", margin: "0 0 8px" }}>
            Bienvenido a HappyKids
          </h1>
          <p className="hk-banner-sub" style={{ fontSize: "16px", color: "#8a8a8a", fontWeight: 400, lineHeight: 1.5, margin: 0 }}>
            Sudaderas, jeans, bermudas y mucho más para niñas y niños. Calidad y diseño en cada prenda, a los mejores precios.
          </p>
        </div>
      </section>

      {/* Productos */}
      <section className="hk-section" style={{ padding: "0 1.5rem 4rem", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 4px" }}>
          Productos Recientes
        </h2>
        <p style={{ fontSize: "14px", color: "#8a8a8a", fontWeight: 400, margin: "0 0 1.5rem" }}>
          Los productos más recientes para tus pequeños
        </p>

        {productos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#8a8a8a" }}>
            <span style={{ fontSize: "40px", display: "block", marginBottom: "12px" }}>😕</span>
            <p>No se encontraron productos para "<strong>{busqueda}</strong>"</p>
          </div>
        ) : (
          <div className="hk-productos-grid">
            {productos.map((p) => (
              <div
                key={p.id}
                style={{
                  background: "#fff",
                  border: "1px solid #eeeeee",
                  borderRadius: "8px",
                  overflow: "hidden",
                  transition: "border-color 0.2s ease",
                }}
              >
                <div style={{ aspectRatio: "1 / 1", overflow: "hidden" }}>
                  <img
                    src={p.img}
                    alt={p.nombre}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ padding: "14px 16px 18px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#1a1a1a", display: "block", marginBottom: "4px" }}>
                    {p.nombre}
                  </span>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "#ff8c42", display: "block", marginBottom: "14px" }}>
                    {p.precio}
                  </span>
                  <Link
                    to={`/producto/${p.id}`}
                    onMouseEnter={() => setHoverBtn(p.id)}
                    onMouseLeave={() => setHoverBtn(null)}
                    style={{
                      display: "block",
                      textAlign: "center",
                      border: `1px solid ${hoverBtn === p.id ? "#ff8c42" : "#eeeeee"}`,
                      color: hoverBtn === p.id ? "#ff8c42" : "#1a1a1a",
                      borderRadius: "6px",
                      padding: "9px 0",
                      fontWeight: 500,
                      fontSize: "13px",
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Ver producto
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

export default Index;