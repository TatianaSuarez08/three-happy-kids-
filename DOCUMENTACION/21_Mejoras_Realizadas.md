# 21. Mejoras realizadas

## Estado final

Se alcanzó una versión funcional más coherente del sistema en términos de negocio, permisos y flujo operativo.

## Mejoras principales implementadas

- Separación más clara del front-end administrativo y del diseño visual.
- Documentación técnica fragmentada consolidada en archivos temáticos.
- Control de roles y permisos más realista con soporte por acción.
- Integración del rol Bodeguero en el flujo de inventario y administración.
- Registro y consulta de historial de movimientos de inventario.
- Ruta de logística y resumen operativo para pedidos pendientes, entregas, stock bajo y tareas activas.
- Dashboard con visión de cadena operativa y accesos rápidos.

## Problemas corregidos

- ausencia de trazabilidad real en inventario,
- falta de módulo Bodeguero operativo y conectado,
- ausencia de historial de movimientos,
- documentación técnica dispersa,
- mezcla de estilos y nomenclatura en frontend,
- falta de claridad entre administración operativa y CRUD,
- flujo de negocio incompleto entre pedido, inventario y entrega,
- la capacidad de compra estaba restringida sólo al rol Cliente, impidiendo que Administrador, Bodeguero y Mensajero compraran con su usuario autenticado.

## Solución aplicada

Se realizó una auditoría técnica del proyecto y se corrigió la lógica de negocio más crítica. Se añadieron rutas y modelos para inventario y logística, se reforzó el control de permisos y se conectó el dashboard con esas métricas reales del sistema. Además, la compra se definió como una capacidad transversal basada en permisos, en lugar de estar atada exclusivamente al rol Cliente.

## Cambio específico: compra transversal

Cambio:
Se permitió que cualquier usuario autenticado con permiso de compra pueda acceder a la tienda, al carrito y a la confirmación de pedido asociado a su propio usuario.

Problema encontrado:
La tienda y la creación de pedidos estaban restringidas únicamente al rol Cliente, aunque la arquitectura ya contemplaba otros roles.

Motivo:
La lógica real del negocio exige que todos los usuarios autorizados puedan comprar sin perder sus permisos específicos de administración, bodega o mensajería.

Archivos afectados:
- Back-end/src/middleware/role.js
- Back-end/src/routes/PedidoRoute.js
- Front-end/src/App.jsx
- Front-end/src/Componentes/Nav.jsx

Base de datos afectada:
No requiere cambios de esquema; se reutiliza la estructura actual de usuarios, roles y pedidos.

API afectada:
Sí, en la autorización de pedidos y en la navegación protegida del front-end.

Impacto:
Se mantiene la separación de funciones administrativas, pero la compra pasa a ser un permiso transversal y reutilizable.

Compatibilidad:
Se preserva la autenticación JWT, los roles y la lógica de pedidos actuales.

Pruebas realizadas:
- verificación del permiso de compra por rol,
- compilación del frontend,
- revisión de rutas de navegación y autorización.

## Impacto

## Perfil, usuarios y carrito por sesión

- La tabla `usuario` incorpora `telefono` y `foto_perfil`; para instalaciones existentes se incluye `sql/MIGRACION_PERFIL_USUARIOS.sql`.
- El alta administrativa conserva la ruta `/usuarios`, recibe `multipart/form-data`, valida imágenes JPG, PNG, WEBP o GIF de hasta 5 MB y guarda únicamente una ruta como `/assets/foto_de_perfil/perfil-<uuid>.<ext>`.
- El backend publica `GET /me` con autenticación JWT y el apartado `Todos los usuarios` reutiliza `GET /usuarios`, mostrando teléfono, estado, rol y foto.
- Las fotos se almacenan en `Front-end/src/assets/foto_de_perfil` y se sirven mediante `/assets/foto_de_perfil`.
- El carrito permanece en `localStorage`, pero usa `carrito_usuario_<id>` con el `id` del JWT/sesión. Al iniciar o cerrar sesión se cambia el estado cargado, evitando compartir productos entre usuarios; la clave histórica `carrito` se migra una sola vez al usuario activo.
- El backend de pedidos continúa tomando el usuario de `req.user.id`; el cliente no puede seleccionar otro propietario del pedido.

### Archivos principales

- Backend: `src/middleware/subidaImagen.js`, `src/routes/AdminUsuarioRoute.js`, `src/controllers/AdminUsuarioController.js`, `src/models/AdminUsuarioModel.js`, `src/routes/UsuarioRoute.js` y `src/models/UsuarioModel.js`.
- Frontend: `src/Context/CarritoContext.jsx`, `src/pages/administracion/page-CrearUsuario.jsx`, `src/pages/administracion/page-UsuariosBD.jsx`, `src/pages/cliente/page-ActualizarPerfil.jsx` y `src/App.jsx`.

### Validación

- `Front-end`: `npm run lint` y `npm run build` completados correctamente.
- `Back-end`: comprobación sintáctica con `node --check` completada correctamente.
- La prueba manual pendiente requiere una base MySQL con la migración aplicada y dos sesiones autenticadas para comprobar el aislamiento del carrito, subida de imagen y lectura del perfil.

Los recursos afectados fueron:

- frontend,
- backend,
- base de datos y flujo de negocio,
- documentación,
- estructura visual del módulo admin,
- claridad de roles y módulos.

## Resultado final

El sistema quedó en un estado más sólido y operativo, con mejor administración del inventario, mejor trazabilidad, flujo logístico visible y un panel administrativo con información útil para decisiones reales de operación.
