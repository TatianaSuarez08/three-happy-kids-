# Instancia adicional de Express

`API/` es un servicio Express ejecutable por separado, con configuración propia y rutas bajo `/api/v1`. Usa `API_PORT` (3001 por defecto) y la configuración MySQL/JWT del `.env` raíz; la configuración local de `backend/.env` puede servir como respaldo según el cargador de entorno.

Esta instancia no tiene paridad completa con `backend/`: faltan, entre otras, algunas rutas de tipos de documento y operaciones de inventario/compra que sí están en el servicio principal. El cliente frontend intenta esta URL como segunda instancia solo ante errores de red, timeout o HTTP 502/503/504; una ruta ausente no se reintenta automáticamente. No la consideres un reemplazo íntegro del backend.

## Ejecución y pruebas

```bash
npm install
npm run dev
```

Para ejecutar las pruebas propias de este paquete:

```bash
npm test
```

El script usa `node --test` y no está incluido en `npm run verify:all` de la raíz. La guía principal y la referencia de rutas están en [`DOCUMENTACION/README.md`](../DOCUMENTACION/README.md).
