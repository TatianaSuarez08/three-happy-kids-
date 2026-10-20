# 20. Configuración

## Base de datos

La aplicación depende de una base MySQL con las tablas de usuarios, productos, clientes, empleado, inventario, pedidos, pagos y entregas.

## Variables de entorno

Se recomienda usar un archivo `.env` en el backend con:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contrasena
DB_DATABASE=happykids
JWT_SECRET=tu_clave_secreta
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

## Frontend

El frontend usa variables de entorno para el backend, por ejemplo:

```env
VITE_BACKEND_URL=http://localhost:3000
```

## Observación

La aplicación tiene una arquitectura funcional actual, pero requiere una mejora de trazabilidad del inventario y clara separación de permisos por acción.
