import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const camposProducto = [
  ["nombre", "Nombre del producto", "text", true],
  ["marca", "Marca", "text", false],
  ["precioCompra", "Precio de compra", "number", false],
  ["precioVenta", "Precio de venta", "number", true],
  ["stock", "Stock inicial", "number", true],
  ["stockMinimo", "Stock mínimo", "number", true],
  ["idCategoria", "ID de categoría", "number", true],
  ["idTalla", "ID de talla", "number", true],
];

function AgregarProducto() {
  const navigate = useNavigate();
  const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagen, setImagen] = useState(null);
  const [colores, setColores] = useState([]);
  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    precioCompra: "",
    precioVenta: "",
    marca: "",
    idCategoria: "",
    idTalla: "",
    idColor: "",
    stock: "0",
    stockMinimo: "0",
    estado: "Activo",
  });

  useEffect(() => {
    const cargarColores = async () => {
      try {
        const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
        const response = await fetch(`${backend}/colores`, {
          headers: { Authorization: `Bearer ${storage.getItem("token")}` },
        });
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error(`El backend no devolvió JSON en ${backend}/colores. Reinicia el backend en el puerto 3000.`);
        }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudieron cargar los colores");
        setColores(data.colors || []);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los colores");
      }
    };

    cargarColores();
  }, [backend]);

  const actualizarCampo = (event) => {
    const { name, value } = event.target;
    setFormulario((previo) => ({ ...previo, [name]: value }));
  };

  const crearProducto = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
      const token = storage.getItem("token");
      const datos = new FormData();
      Object.entries(formulario).forEach(([campo, valor]) => {
        datos.append(campo, valor);
      });
      datos.append("imagen", imagen);

      const response = await fetch(`${backend}/productos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: datos,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo crear el producto");
      }

      navigate("/admin/inventario");
    } catch (err) {
      setError(err.message || "No se pudo crear el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Agregar producto</h2>
            <p className="admin-sub">Registra un producto con su inventario inicial</p>
          </div>
          <button className="btn-admin-cancelar" onClick={() => navigate("/admin/inventario")}>
            Volver al inventario
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="producto-formulario" onSubmit={crearProducto}>
          <div className="producto-formulario-grid">
            {camposProducto.map(([name, label, type, required]) => (
              <label className="producto-formulario-campo" key={name}>
                {label}
                <input
                  name={name}
                  type={type}
                  value={formulario[name]}
                  onChange={actualizarCampo}
                  required={required}
                  min={type === "number" ? "0" : undefined}
                  step={name.includes("precio") ? "0.01" : undefined}
                />
              </label>
            ))}
            <label className="producto-formulario-campo">
              Color
              <select name="idColor" value={formulario.idColor} onChange={actualizarCampo} required>
                <option value="">Selecciona un color</option>
                {colores.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="producto-formulario-campo">
              Estado
              <select name="estado" value={formulario.estado} onChange={actualizarCampo} required>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </label>
            <label className="producto-formulario-campo producto-formulario-imagen">
              Imagen del producto
              <input
                name="imagen"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) => setImagen(event.target.files?.[0] || null)}
                required
                className="producto-input-archivo"
              />
              {imagen && (
                <div className="producto-vista-previa">
                  <img src={URL.createObjectURL(imagen)} alt="Vista previa del producto" />
                </div>
              )}
              <small>Formatos: JPG, PNG, WEBP o GIF. Máximo: 5 MB.</small>
            </label>
            <label className="producto-formulario-campo producto-formulario-descripcion">
              Descripción
              <textarea
                name="descripcion"
                value={formulario.descripcion}
                onChange={actualizarCampo}
                rows="4"
              />
            </label>
          </div>

          <div className="producto-formulario-acciones">
            <button type="button" className="btn-admin-cancelar" onClick={() => navigate("/admin/inventario")} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-admin-primary" disabled={loading}>
              {loading ? "Guardando..." : "Guardar producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AgregarProducto;
