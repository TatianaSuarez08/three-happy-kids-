# Diagnóstico inicial de HappyKids

## Estado encontrado

El repositorio contiene tres aplicaciones o capas principales:

- `frontend/`: aplicación React/Vite con páginas de cliente, administración, bodega y mensajería.
- `backend/`: aplicación Express/ESM que monta las rutas bajo `/api/v1`, aplica JWT/roles y conecta con MySQL.
- `documentacion/`: guías, SQL, arquitectura, seguridad y progreso.

## Problemas detectados

1. El Frontend tenía imports `Context/` mientras la carpeta real era `context/`, una dependencia accidental de Windows.
2. El Backend almacenaba imágenes dentro de `frontend/src/assets`, mezclando responsabilidades.
3. La documentación estaba repartida entre `documentacion/` y `docs/`.

## Decisiones

- La raíz se limita a `backend/`, `frontend/` y `documentacion/`, además de archivos y carpetas ocultas de configuración.
- Las imágenes se almacenan en `backend/storage/assets/`; las URL HTTP `/assets/productos/...` y `/assets/foto_de_perfil/...` permanecen compatibles.
- Se conservan modelos, controladores, rutas, SQL, páginas y pruebas; no se eliminaron elementos sin comprobación de referencias.
- La documentación histórica se mantiene y sus referencias se actualizan progresivamente.

## Verificaciones requeridas

- Build y lint del Frontend.
- Tests y sintaxis del Backend.
- Revisión de imports, rutas, variables de entorno y comunicación Frontend-Backend.
- Verificación de MySQL cuando el servicio `MySQL97` esté disponible.
