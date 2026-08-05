import { useNavigate } from "react-router-dom";

function Favoritos() {
  const navigate = useNavigate();
  const favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]");

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "1rem" }}>Mis favoritos</h2>

        {favoritos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
            <span style={{ fontSize: "48px", display: "block", marginBottom: "1rem" }}>♡</span>
            <p>No tienes productos en favoritos.</p>
            <button onClick={() => navigate("/")} style={{ marginTop: "1rem", background: "#ff8c42", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", cursor: "pointer", fontWeight: 600 }}>
              Ver productos
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            {favoritos.map((p) => (
              <div key={p.id} style={{ background: "#fff", borderRadius: "14px", border: "1px solid #eee", overflow: "hidden" }}>
                <div style={{ height: "200px", overflow: "hidden" }}>
                  <img src={p.img} alt={p.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: "1rem" }}>
                  <div style={{ fontWeight: 600, color: "#1a1a1a", marginBottom: "4px" }}>{p.nombre}</div>
                  <div style={{ color: "#ff8c42", fontWeight: 700, marginBottom: "8px" }}>{p.precio}</div>
                  <button onClick={() => navigate(`/producto/${p.id}`)} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ff8c42", background: "none", color: "#ff8c42", cursor: "pointer", fontWeight: 600 }}>
                    Ver producto
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Favoritos;