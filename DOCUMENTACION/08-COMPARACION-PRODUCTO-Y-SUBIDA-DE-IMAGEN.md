# Comparación del producto y subida de imágenes

## 1. Resultado de la comparación

Se comparó la tabla `producto` y la tabla `inventario` de `DataBaseHappyKids_CORREGIDA.sql` con el formulario y el endpoint de creación.

| Formulario | Backend | Base de datos | Resultado |
|---|---|---|---|
| `nombre` | `productData.nombre` | `producto.nombre_producto` | Coincide |
| `descripcion` | `productData.descripcion` | `producto.descripcion` | Coincide |
| `precioCompra` | `productData.precioCompra` | `producto.precio_compra` | Coincide |
| `precioVenta` | `productData.precioVenta` | `producto.precio_venta` | Coincide |
| `marca` | `productData.marca` | `producto.marca` | Coincide |
| Archivo `imagen` | `req.file.filename` | `producto.imagen_producto` | Coincide mediante una ruta |
| `idCategoria` | `productData.idCategoria` | `producto.id_categoria` | Coincide |
| `idTalla` | `productData.idTalla` | `producto.id_talla` | Coincide |
| `idColor` | `productData.idColor` | `producto.id_color` | Coincide |
| `stock` | `productData.stock` | `inventario.cantidad_disponible` | Coincide |
| `stockMinimo` | `productData.stockMinimo` | `inventario.cantidad_minima` | Coincide |

La base no necesita una columna nueva: `imagen_producto VARCHAR(255)` ya existe y es suficiente para guardar la ruta de la imagen.

## 2. Cómo se guarda la imagen

El flujo ahora funciona así:

1. El administrador selecciona una imagen desde `page-AgregarProducto.jsx`.
2. React la envía como `multipart/form-data` usando `FormData`.
3. El endpoint `POST /productos` recibe el archivo en el campo `imagen`.
4. `multer` valida el tipo y limita el tamaño a 5 MB.
5. El backend genera un nombre único, por ejemplo:

```text
producto-1f6d8d2c-7b39-4d1a-a4db-123456789abc.jpg
```

6. El archivo se guarda en:

```text
Front-end/src/assets/productos/
```

7. MySQL guarda esta ruta en `producto.imagen_producto`:

```text
/assets/productos/producto-1f6d8d2c-7b39-4d1a-a4db-123456789abc.jpg
```

8. Express publica esa carpeta para que la imagen pueda solicitarse desde el navegador:

```text
http://localhost:3000/assets/productos/nombre-del-archivo.jpg
```

## 3. Archivos modificados o creados

- `Front-end/src/admin/page-AgregarProducto.jsx`: cambia el campo de URL por un selector de archivos y envía `FormData`.
- `Back-end/src/middleware/subidaImagen.js`: configura `multer`, valida formatos, limita el tamaño y define la carpeta destino.
- `Back-end/src/controllers/ProductoController.js`: exige la imagen y guarda su ruta en el producto.
- `Back-end/src/routes/UsuarioRoute.js`: aplica `uploadProductImage.single('imagen')` al endpoint de productos.
- `Back-end/index.js`: publica `/assets/productos` mediante Express.
- `Back-end/package.json`: añade la dependencia `multer`.
- `Back-end/src/models/ProductoModel.js`: ya insertaba el valor recibido en `imagen_producto`, por lo que no necesitó cambiar sus columnas.

## 4. Formatos permitidos

Se aceptan:

- JPG/JPEG.
- PNG.
- WEBP.
- GIF.

El tamaño máximo es de 5 MB. El nombre final no conserva directamente el nombre original del archivo; se genera uno aleatorio para evitar colisiones entre productos.

## 5. Requisitos para que funcione

- Ejecutar `npm install` dentro de `Back-end` para instalar `multer`.
- Tener iniciados el backend y el frontend.
- Tener un token válido de administrador.
- Tener existentes los IDs enviados para categoría, talla y color.
- Tener activa la base de datos `happykids` con la tabla `producto` y su columna `imagen_producto`.

## 6. Consideración sobre el catálogo

El listado administrativo ya recibe `imagen_producto` desde `GET /productos`. Las pantallas públicas del catálogo todavía usan imágenes importadas de forma estática desde Vite. Por esa razón, el nuevo producto se guarda correctamente y su imagen queda disponible en Express, pero para mostrarlo automáticamente en el catálogo público todavía habría que conectar también el catálogo frontend al endpoint `GET /productos`.
