# API layer

Capa centralizada de integración entre frontend y backend.

## Configuración

- La URL base se toma desde `VITE_BACKEND_URL` en el entorno raíz del proyecto.
- La ruta base para la API es `/api/v1`.
- Las peticiones usan `fetch` y manejan automáticamente el token del usuario.

## Uso

```js
import { apiClient } from './services/apiClient.js';

const data = await apiClient('/usuarios');
```

## Reglas

- No duplicar lógica de conexión por módulo.
- Respetar permisos y roles del backend.
- Mantener la API en un único punto de entrada.
