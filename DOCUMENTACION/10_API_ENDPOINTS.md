# 10. Referencia de endpoints

## Convención

La API de respaldo montada en `api/` usa el prefijo:

```text
/api/v1
```

El backend principal usa la raíz, pero la documentación técnica debe describir el esquema de servicio real del frontend, que apunta a `/api/v1` en todas las peticiones.

## 1. Autenticación

### `POST /api/v1/registro`

- Descripción: crea una cuenta de cliente.
- Autenticación: no
- Body:
  - `nombre_usuario`
  - `email`
  - `password`
  - `confirmar_password`
- Respuesta exitosa: `201` con `user` y `token`
- Errores comunes:
  - `400` datos faltantes o email inválido
  - `409` email ya registrado

### `POST /api/v1/login`

- Descripción: autentica al usuario.
- Autenticación: no
- Body:
  - `email`
  - `password`
- Respuesta exitosa: `200` con `user` y `token`
- Errores comunes:
  - `400` datos faltantes o email inválido
  - `401` credenciales inválidas
  - `403` usuario inactivo

### `GET /api/v1/me`

- Descripción: devuelve el perfil del usuario autenticado.
- Autenticación: `Bearer token`
- Respuesta exitosa: perfil del usuario
- Errores comunes:
  - `401` token inválido
  - `404` usuario no encontrado

### `PUT /api/v1/me/foto`

- Descripción: actualiza la foto de perfil.
- Autenticación: `Bearer token`
- Form-data: archivo `foto`
- Respuesta exitosa: `200` con `fotoPerfil`

## 2. Productos y catálogo

### `GET /api/v1/productos-publicos`

- Descripción: lista productos públicos.
- Autenticación: no
- Respuesta exitosa: lista de productos

### `GET /api/v1/productos-publicos/:id`

- Descripción: detalle de un producto.
- Autenticación: no
- Parámetro: `id`
- Respuesta: detalle del producto o `404`

### `GET /api/v1/categorias`

- Descripción: obtiene categorías activas.
- Autenticación: no
- Respuesta: arreglo de categorías

### `GET /api/v1/colores`

- Descripción: obtiene los colores disponibles.
- Autenticación: requerida; permisos de `productos:read`
- Respuesta: arreglo de colores

### `GET /api/v1/productos`

- Descripción: lista de productos para administración.
- Autenticación: requerida
- Permisos: `administrador`, `bodeguero` con permisos de lectura
- Respuesta: lista de productos

### `GET /api/v1/productos/:id`

- Descripción: detalle de un producto específico.
- Autenticación: requerida
- Permisos: `administrador`, `bodeguero` con permisos de lectura

### `POST /api/v1/productos`

- Descripción: crea un producto.
- Autenticación: requerida
- Permisos: `administrador`, `bodeguero` con `productos:write`
- Form-data: archivo `imagen` + campos del producto
- Respuesta: producto creado
- Errores comunes:
  - `400` datos inválidos
  - `409` nombre duplicado

### `PUT /api/v1/productos/:id`

- Descripción: actualiza producto.
- Autenticación: requerida
- Permisos: `administrador`, `bodeguero` con `productos:write`
- Form-data opcional: imagen
- Respuesta: producto actualizado

### `DELETE /api/v1/productos/:id`

- Descripción: elimina producto.
- Autenticación: requerida
- Permisos: `administrador`, `bodeguero` con `productos:write`
- Respuesta: confirmación

## 3. Carrito

### `GET /api/v1/carrito`

- Descripción: obtiene carrito activo del usuario.
- Autenticación: requerida

### `POST /api/v1/carrito`

- Descripción: agrega producto al carrito.
- Autenticación: requerida
- Body ejemplo:

```json
{
  "productId": 5,
  "quantity": 2
}
```

- Respuesta: carrito actualizado

### `PUT /api/v1/carrito/:productId`

- Descripción: modifica cantidad de un producto.
- Autenticación: requerida
- Body ejemplo:

```json
{
  "quantity": 3
}
```

### `DELETE /api/v1/carrito/:productId`

- Descripción: elimina un producto del carrito.
- Autenticación: requerida

### `DELETE /api/v1/carrito`

- Descripción: vacía el carrito.
- Autenticación: requerida

## 4. Favoritos

### `GET /api/v1/favoritos`

- Descripción: lista favoritos del usuario autenticado.
- Autenticación: requerida

### `POST /api/v1/favoritos`

- Descripción: agrega favorito.
- Autenticación: requerida
- Body:
  - `productId`

### `DELETE /api/v1/favoritos/:productId`

- Descripción: elimina favorito.
- Autenticación: requerida

## 5. Pedidos

### `GET /api/v1/pedidos`

- Descripción: lista pedidos del sistema.
- Autenticación: requerida
- Permisos: `administrador`, `bodeguero`, `mensajero`, `pedidos:read`

### `POST /api/v1/pedidos`

- Descripción: crea un pedido.
- Autenticación: requerida
- Permisos: `comprar`
- Body ejemplo:

```json
{
  "direccion": "Calle 123",
  "ciudad": "Bogotá",
  "telefono": "3000000000",
  "pago": "efectivo",
  "productos": [
    { "id": 2, "cantidad": 1 }
  ]
}
```

- Respuesta: `201` con `id` del pedido
- Errores:
  - `400` faltan datos del pedido
  - `409` stock insuficiente

### `PUT /api/v1/pedidos/:id/estado`

- Descripción: actualiza el estado del pedido.
- Autenticación: requerida
- Permisos: `administrador`, `mensajero` con `pedidos:write`
- Body:

```json
{
  "estado": "En camino"
}
```

### `GET /api/v1/mis-pedidos`

- Descripción: pedidos propios del usuario autenticado.
- Autenticación: requerida
- Permisos: `pedidos:own:read`

## 6. Inventario

### `GET /api/v1/inventario/:id/historial`

- Descripción: historial del producto.
- Autenticación: requerida
- Permisos: administrador o bodeguero

### `POST /api/v1/inventario/movimiento`

- Descripción: registra movimiento de inventario.
- Autenticación: requerida
- Body:
  - `productId`
  - `tipo`
  - `cantidad`
  - `motivo`
  - `referencia`

## 7. Usuarios administrativos

### `GET /api/v1/usuarios`

- Descripción: obtiene usuarios del sistema.
- Autenticación: requerida
- Permisos: administrador con `usuarios:read`

### `POST /api/v1/usuarios`

- Descripción: crea un usuario administrativo.
- Autenticación: requerida
- Permisos: administrador con `usuarios:write`
- Body: nombre, apellido, correo, password, rol

### `PUT /api/v1/usuarios/:id`

- Descripción: actualiza un usuario administrativo.
- Autenticación: requerida

### `PUT /api/v1/usuarios/:id/estado`

- Descripción: activa o desactiva un usuario.
- Autenticación: requerida

### `DELETE /api/v1/usuarios/:id`

- Descripción: desactiva un usuario.
- Autenticación: requerida

## 8. Dashboard y logística

### `GET /api/v1/dashboard`

- Descripción: métricas del sistema.
- Autenticación: requerida

### `GET /api/v1/logistica`

- Descripción: resumen logístico.
- Autenticación: requerida

### `GET /api/v1/health`

- Descripción: health check de la base de datos.
- Autenticación: no
- Respuesta exitosa: `{ "ok": true }`
- Respuesta si falla: `503` con `{ "ok": false, "error": "Base de datos no disponible" }`

## 9. Observación de implementación

La lista anterior corresponde a la lógica real implementada por las rutas del backend y del espejo API. La documentación debe tratarlas como endpoints activos del sistema y no como propuestas futuras.
