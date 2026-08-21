import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const camposProducto = [
  ["nombre", "Nombre del producto", "text", true],
  ["marca", "Marca", "text", false],
  ["precioCompra", "Precio de compra", "number", false],
  ["precioVenta", "Precio de venta", "number", true],
  ["stock", "Stock", "number", true],
  ["stockMinimo", "Stock mínimo", "number", true],
  ["idCategoria", "ID de categoría", "number", true],
];

function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [imagen, setImagen] = useState(null);
  const [imagenActual, setImagenActual] = useState("");
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

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
        const response = await fetch(`${backend}/productos/${id}`, {
          headers: { Authorization: `Bearer ${storage.getItem("token")}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudo cargar el producto");

        const product = data.product;
        setFormulario({
          nombre: product.nombre || "",
          descripcion: product.descripcion || "",
          precioCompra: product.precioCompra ?? "",
          precioVenta: product.precioVenta ?? "",
          marca: product.marca || "",
          idCategoria: product.idCategoria ?? "",
          idTalla: product.idTalla ?? "",
          idColor: product.idColor ?? "",
          stock: product.stock ?? 0,
          stockMinimo: product.stockMinimo ?? 0,
          estado: product.estado || "Activo",
        });
        setImagenActual(product.imagen || "");
      } catch (err) {
        setError(err.message || "No se pudo cargar el producto");
      } finally {
        setLoading(false);
      }
    };

    cargarProducto();
  }, [backend, id]);

  const actualizarCampo = (event) => {
    const { name, value } = event.target;
    setFormulario((previo) => ({ ...previo, [name]: value }));
  };

  const guardarCambios = async (event) => {
    event.preventDefault();
    setError("");
    setGuardando(true);

    try {
      const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
      const datos = new FormData();
      Object.entries(formulario).forEach(([campo, valor]) => datos.append(campo, valor));
      if (imagen) datos.append("imagen", imagen);

      const response = await fetch(`${backend}/productos/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${storage.getItem("token")}` },
        body: datos,
      });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(`El backend no devolvió JSON en ${backend}/productos/${id}. Reinicia el backend en el puerto 3000.`);
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo actualizar el producto");

      navigate("/admin/inventario");
    } catch (err) {
      setError(err.message || "No se pudo actualizar el producto");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return <div className="admin-page"><div className="admin-container">Cargando producto...</div></div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Editar producto</h2>
            <p className="admin-sub">Actualiza el producto y sus existencias</p>
          </div>
          <button className="btn-admin-cancelar" onClick={() => navigate("/admin/inventario")}>
            Volver al inventario
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="producto-formulario" onSubmit={guardarCambios}>
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
              Nueva imagen (opcional)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) => setImagen(event.target.files?.[0] || null)}
                className="producto-input-archivo"
              />
              {(imagen || imagenActual) && (
                <div className="producto-vista-previa">
                  <img
                    src={imagen ? URL.createObjectURL(imagen) : `${backend}${imagenActual}`}
                    alt="Imagen del producto"
                  />
                </div>
              )}
              <small>Deja vacío el campo si deseas conservar la imagen actual.</small>
            </label>
            <label className="producto-formulario-campo producto-formulario-descripcion">
              Descripción
              <textarea name="descripcion" value={formulario.descripcion} onChange={actualizarCampo} rows="4" />
            </label>
          </div>

          <div className="producto-formulario-acciones">
            <button type="button" className="btn-admin-cancelar" onClick={() => navigate("/admin/inventario")} disabled={guardando}>
              Cancelar
            </button>
            <button type="submit" className="btn-admin-primary" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarProducto;
