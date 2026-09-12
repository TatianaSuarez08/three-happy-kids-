export const entregasDemo = [
  { id: "HK-1048", cliente: "Laura Gomez", direccion: "Cra. 18 #42-16", hora: "10:30 a. m.", estado: "En camino", paquete: "Ropa infantil" },
  { id: "HK-1049", cliente: "Carlos Perez", direccion: "Calle 73 #10-22", hora: "11:15 a. m.", estado: "Asignado", paquete: "Juguetes" },
  { id: "HK-1050", cliente: "Mariana Rojas", direccion: "Av. 5 #81-09", hora: "12:00 p. m.", estado: "Recogiendo", paquete: "Accesorios" },
];

export const coloresEstado = {
  Asignado: ["#fff8e0", "#b87800"],
  Recogiendo: ["#e8f4ff", "#3578b8"],
  "En camino": ["#e9f5ff", "#2774a8"],
  Entregado: ["#eafbea", "#3a7d44"],
  Fallido: ["#fff0f0", "#c62828"],
};

export const styles = {
  card: { background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "1.1rem" },
  panel: { background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.5rem" },
  gridTarjetas: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "1rem", marginBottom: "1.5rem" },
  dosColumnas: { display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(280px, 1fr)", gap: "1.5rem" },
  listaInfo: { display: "flex", justifyContent: "space-between", gap: "1rem", padding: "13px 0", borderBottom: "1px solid #eee", color: "#777", fontSize: "14px" },
  entregaFila: { width: "100%", display: "flex", alignItems: "center", gap: "1rem", border: 0, borderBottom: "1px solid #eee", background: "#fff", padding: "14px 0", cursor: "pointer" },
  botonPrincipal: { background: "#ff8c42", color: "#fff", border: 0, borderRadius: "7px", padding: "10px 15px", cursor: "pointer", marginRight: "8px" },
  botonSecundario: { background: "#fff", color: "#555", border: "1px solid #ddd", borderRadius: "7px", padding: "10px 15px", cursor: "pointer", marginTop: "12px" },
};
