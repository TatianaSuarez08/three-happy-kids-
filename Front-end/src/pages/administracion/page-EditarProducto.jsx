import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getColors, getProduct, updateProduct } from "../../services/productoAdminService";
import { API_BASE_URL } from "../../services/httpClient";

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
        const data = await getColors();
        setColores(data.colors || []);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los colores");
      }
    };

    cargarColores();
  }, []);

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        const data = await getProduct(id);

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
  }, [id]);

  const actualizarCampo = (event) => {
    const { name, value } = event.target;
    setFormulario((previo) => ({ ...previo, [name]: value }));
  };

  const guardarCambios = async (event) => {
    event.preventDefault();
    setError("");
    setGuardando(true);

    try {
      const datos = new FormData();
      Object.entries(formulario).forEach(([campo, valor]) => datos.append(campo, valor));
      if (imagen) datos.append("imagen", imagen);

      await updateProduct(id, datos);

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

        <form className="admin-form" onSubmit={guardarCambios}>
          <div className="admin-form-grid">
            {camposProducto.map(([name, label, type, required]) => (
              <label className="admin-form-field" key={name}>
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
            <label className="admin-form-field">
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
            <label className="admin-form-field">
              Estado
              <select name="estado" value={formulario.estado} onChange={actualizarCampo} required>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </label>
            <label className="admin-form-field admin-form-field--image">
              Nueva imagen (opcional)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) => setImagen(event.target.files?.[0] || null)}
                className="admin-form-file"
              />
              {(imagen || imagenActual) && (
                <div className="admin-form-preview">
                  <img
                    src={imagen ? URL.createObjectURL(imagen) : `${API_BASE_URL}${imagenActual}`}
                    alt="Imagen del producto"
                  />
                </div>
              )}
              <small>Deja vacío el campo si deseas conservar la imagen actual.</small>
            </label>
            <label className="admin-form-field admin-form-field--description">
              Descripción
              <textarea name="descripcion" value={formulario.descripcion} onChange={actualizarCampo} rows="4" />
            </label>
          </div>

          <div className="admin-form-actions">
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
