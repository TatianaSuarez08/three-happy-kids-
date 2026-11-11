# 10. Referencia de endpoints

## Convenciones

La tabla describe las rutas del backend principal (`backend/src/routes/`). En el backend se pueden invocar con prefijo `/api/v1` o sin él; el frontend usa `/api/v1`. La instancia `API/` solo monta el prefijo y tiene excepciones de cobertura listadas al final.

- `Público`: no requiere token.
- `JWT`: requiere `Authorization: Bearer <token>`.
- `JWT + acceso`: requiere JWT y al menos uno de los roles o permisos indicados por `permitRoles(...)`.
- Los parámetros entre `:...` son segmentos de ruta. Las respuestas y validaciones exactas dependen del controlador; los formatos resumidos están en “Contratos importantes”.

## Cuenta y usuario

| Método | Path | Acceso |
|---|---|---|
| `POST` | `/registro` | Público |
| `GET` | `/tipos-documento` | Público |
| `POST` | `/login` | Público |
| `POST` | `/recuperar-contrasena` | Público; límite por IP |
| `POST` | `/restablecer-contrasena` | Público; límite por IP |
| `GET` | `/me` | JWT |
| `PUT` | `/me/foto` | JWT; multipart, campo `foto` |

## Catálogo y productos

| Método | Path | Acceso |
|---|---|---|
| `GET` | `/categorias` | Público |
| `GET` | `/productos-publicos` | Público |
| `GET` | `/productos-publicos/:id` | Público |
| `GET` | `/colores` | JWT + administrador/bodeguero o `productos:read` |
| `GET` | `/productos` | JWT + administrador/bodeguero o `productos:read` |
| `GET` | `/productos/:id` | JWT + administrador/bodeguero o `productos:read` |
| `POST` | `/productos` | JWT + administrador/bodeguero o `productos:write`; multipart, campo `imagen` |
| `PUT` | `/productos/:id` | JWT + administrador/bodeguero o `productos:write`; admite imagen |
| `DELETE` | `/productos/:id` | JWT + administrador/bodeguero o `productos:write` |

## Carrito, favoritos y pedidos

| Método | Path | Acceso |
|---|---|---|
| `GET`, `POST`, `DELETE` | `/carrito` | JWT |
| `PUT`, `DELETE` | `/carrito/:productId` | JWT |
| `GET`, `POST` | `/favoritos` | JWT |
| `DELETE` | `/favoritos/:productId` | JWT |
| `GET` | `/pedidos` | JWT + administrador |
| `POST` | `/pedidos` | JWT + permiso `comprar` (incluido por los roles funcionales) |
| `PUT` | `/pedidos/:id/estado` | JWT + administrador |
| `GET` | `/mis-pedidos` | JWT + roles/permiso `pedidos:own:read` |

## Administración, logística e inventario

| Método | Path | Acceso |
|---|---|---|
| `GET` | `/usuarios` | JWT + administrador o `usuarios:read` |
| `POST`, `PUT` | `/usuarios`, `/usuarios/:id` | JWT + administrador o `usuarios:write` |
| `PUT` | `/usuarios/:id/estado` | JWT + administrador o `usuarios:write` |
| `DELETE` | `/usuarios/:id` | JWT + administrador o `usuarios:write` |
| `GET` | `/dashboard` | JWT + administrador o `dashboard:read` |
| `GET` | `/logistica` | JWT + administrador |
| `GET` | `/inventario/:id/historial` | JWT + administrador/bodeguero |
| `POST` | `/inventario/movimiento` | JWT + administrador/bodeguero |
| `GET` | `/inventario/actividad` | JWT + administrador/bodeguero |
| `POST` | `/inventario/actividad/reportes` | JWT + administrador |
| `GET` | `/admin/compras/opciones` | JWT + administrador |
| `POST` | `/admin/compras` | JWT + administrador |
| `GET` | `/bodega/compras` | JWT + administrador/bodeguero |
| `POST` | `/bodega/compras/:id/recepcion` | JWT + bodeguero |

La actividad acepta filtros opcionales por query según el servicio de inventario. Los reportes administrativos reciben datos de usuario/actividad y motivo/descripcion; consulta el controlador y el modelo para validar el payload exacto.

## Preparación de pedidos, entrega y novedades

| Método | Path | Acceso |
|---|---|---|
| `GET` | `/bodega/pedidos/disponibles` | JWT + bodeguero/administrador |
| `GET` | `/bodega/pedidos/mios` | JWT + bodeguero |
| `POST` | `/bodega/pedidos/:id/asignar` | JWT + bodeguero |
| `POST` | `/bodega/pedidos/:id/liberar` | JWT + bodeguero |
| `PUT` | `/bodega/pedidos/:id/preparacion` | JWT + bodeguero |
| `GET` | `/mensajeria/pedidos/disponibles` | JWT + mensajero |
| `GET` | `/mensajeria/mis-entregas` | JWT + mensajero |
| `GET` | `/mensajeria/historial` | JWT + mensajero |
| `POST` | `/mensajeria/pedidos/:id/asignar` | JWT + mensajero |
| `POST` | `/mensajeria/pedidos/:id/liberar` | JWT + mensajero |
| `PUT` | `/mensajeria/pedidos/:id/estado` | JWT + mensajero |
| `POST` | `/mensajeria/pedidos/:id/evidencia` | JWT + mensajero; multipart, campo `evidencia` |
| `GET` | `/mensajeria/pedidos/:id/evidencia` | JWT + mensajero/administrador |
| `GET` | `/admin/novedades/pedidos` | JWT + administrador |
| `PUT` | `/admin/novedades/pedidos/:id/resolver` | JWT + administrador |

El endpoint de estado de entrega aplica transiciones definidas en el servicio de flujo; completar la entrega requiere evidencia y declarar un fallo requiere observación.

## Estado y archivos estáticos

| Método | Path | Acceso |
|---|---|---|
| `GET` | `/` | Público; estado del servicio |
| `GET` | `/health` | Público; verificación de MySQL |
| `GET` | `/assets/productos/...` | Archivos estáticos |
| `GET` | `/assets/foto_de_perfil/...` | Archivos estáticos |

En el backend principal, `GET /health` está disponible también como `/api/v1/health`. En `API/`, el health check registrado está bajo `/api/v1/health`.

## Contratos importantes

- Registro: requiere `nombre_usuario`, `email`, `password`, `confirmar_password`, `primer_nombre`, `primer_apellido`, `numero_documento` e `id_tipo_documento`. Si tiene éxito, responde `201` con `{ success, message, emailSent, user, token }`; `emailSent` indica si salió el correo de bienvenida.
- Login: recibe `email` y `password`; responde con `{ success, message, user, token }`.
- Recuperación: `POST /recuperar-contrasena` recibe `{ email }` y responde `202` con un mensaje genérico, sin confirmar si la cuenta existe.
- Cambio por enlace: `POST /restablecer-contrasena` recibe `{ token, password, confirmar_password }`. Responde éxito cuando la contraseña cambia y agrega `emailSent` para indicar si se envió el correo de confirmación; enlaces inválidos, usados o vencidos se rechazan.
- Alta administrativa: `POST /usuarios` conserva su guarda de administrador y agrega `emailSent` para informar si se notificó a la cuenta creada; la notificación nunca incluye la contraseña.
- Checkout: recibe `{ direccion, ciudad, telefono, pago, productos }`; si tiene éxito responde `201` con `{ success, message, id, estadoPago }`. El servidor valida stock y registra el pedido en transacción.
- Carrito: agregar producto acepta alias de identificador `productId`, `id_producto` o `id`; la cantidad puede recibirse como `quantity` o `cantidad`.
- Errores de autenticación/autorización: `401` si falta o falla el JWT; `403` si no coincide el acceso requerido. Los controladores también pueden responder validación, conflicto y no encontrado; revisa el controlador para los errores de cada recurso.

## Diferencias de la instancia `API/`

`API/` registra las rutas bajo `/api/v1`, pero `UsuarioRoute.js` no incluye `GET /tipos-documento`. Su `InventarioRoute.js` no registra las rutas de actividad/reportes ni las de compra/recepción que aparecen arriba. `PedidoFlujoRoute.js` reutiliza rutas del backend principal. Por esas diferencias, esta tabla no debe interpretarse como contrato completo de la instancia `API/`.
