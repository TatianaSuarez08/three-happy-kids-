# Diagnóstico inicial de HappyKids

## Estado encontrado

El repositorio contiene cuatro aplicaciones o capas principales:

- `frontend/`: aplicación React/Vite con páginas de cliente, administración, bodega y mensajería.
- `backend/`: aplicación Express/ESM que monta las rutas bajo `/api/v1`, aplica JWT/roles y conecta con MySQL.
- `api/`: API Gateway Express con CORS, proxy versionado y control de comunicación interna.
- `backend/services/users-service/`: servicio independiente de usuarios/autenticación, integrado físicamente bajo Backend para evitar una quinta carpeta raíz.
- `documentacion/`: guías, SQL, arquitectura, seguridad y progreso.

## Problemas detectados

1. Los nombres originales `backend`, `frontend`, `API` y `documentacion` no seguían una convención uniforme.
2. `Users-service` estaba en la raíz, aunque es un servicio interno del dominio Backend.
3. El Frontend tenía imports `Context/` mientras la carpeta real era `context/`, una dependencia accidental de Windows.
4. El Backend almacenaba imágenes dentro de `frontend/src/assets`, mezclando responsabilidades.
5. La documentación estaba repartida entre `documentacion/` y `docs/`.
6. La Gateway conservaba utilidades históricas que ya no son consumidas por React.

## Decisiones

- La raíz se limita a `backend/`, `frontend/`, `api/` y `documentacion/`, además de archivos y carpetas ocultas de configuración.
- El Users Service conserva su `package.json` independiente, pero vive en `backend/services/users-service/`.
- Las imágenes se almacenan en `backend/storage/assets/`; las URL HTTP `/assets/productos/...` y `/assets/foto_de_perfil/...` permanecen compatibles.
- Se conservan modelos, controladores, rutas, SQL, páginas y pruebas; no se eliminaron elementos sin comprobación de referencias.
- La documentación histórica se mantiene y sus referencias se actualizan progresivamente.

## Verificaciones requeridas

- Build y lint del Frontend.
- Tests y sintaxis del Backend.
- Sintaxis, auditoría y smoke test de la Gateway.
- Sintaxis, auditoría y endpoint de salud del Users Service.
- Revisión de imports, rutas, variables de entorno y comunicación Gateway-servicios.
- Verificación de MySQL cuando el servicio `MySQL97` esté disponible.
