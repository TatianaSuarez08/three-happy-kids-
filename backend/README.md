# Backend principal HappyKids

Servicio Express principal conectado a MySQL. La entrada es `index.js`; las rutas de `src/routes/` se montan bajo `/api/v1` y también sin prefijo para compatibilidad. La lógica se organiza en rutas, controladores, modelos, servicios y middleware.

## Configuración

El backend carga primero el `.env` de la raíz y después `backend/.env` como respaldo. Copia `.env.example` a la raíz del repositorio y configura `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `JWT_SECRET` y `CORS_ORIGIN`. `JWT_SECRET` es obligatorio.

La fuente de esquema es [`DOCUMENTACION/sql/DataBaseHappyKids_CORREGIDA.sql`](../DOCUMENTACION/sql/DataBaseHappyKids_CORREGIDA.sql). Para bases existentes, `CREATE TABLE IF NOT EXISTS` no actualiza tablas; revisa las migraciones y respalda la base antes de cualquier cambio.

## Ejecución y pruebas

```bash
npm install
npm run dev
```

El puerto predeterminado es `3000`. Las pruebas de caja blanca están en `src/routes/tests/` y se ejecutan con:

```bash
npm test
```

Este comando usa Jest y genera cobertura. Consulta la [guía del proyecto](../DOCUMENTACION/README.md) para los flujos funcionales, los permisos y la referencia de endpoints.

## Imágenes compartidas

Las imágenes se guardan por defecto en `backend/storage/assets/productos` y `backend/storage/assets/foto_de_perfil`, con rutas resueltas desde los módulos (no desde el directorio de inicio de Node). `MEDIA_STORAGE_DIR` permite indicar otro directorio absoluto o relativo para el almacenamiento completo de imágenes. Los productos nuevos usan `/media/productos/<archivo>` y los perfiles `/media/usuarios/<archivo>`. Las rutas antiguas `/assets/productos/...` y `/assets/foto_de_perfil/...` siguen disponibles para las referencias ya guardadas. Productos y fotos de perfil conservan el acceso público que ya tenían; si las fotos de perfil deben ser privadas, el cliente tendrá que migrar a una descarga autenticada antes de cerrar esas rutas. No se sirve estáticamente `storage/assets/entregas`: las evidencias continúan disponibles solo mediante el endpoint autenticado de mensajería.

El frontend web debe mantener `VITE_BACKEND_URL` apuntando al origen del backend (por defecto `http://localhost:3000`); las rutas `/media/...` se combinan con ese origen. Android debe configurar el mismo origen por entorno y resolver las rutas relativas de imágenes contra él: `http://10.0.2.2:3000` en el emulador, la IP LAN del equipo en un dispositivo físico y el dominio HTTPS en producción. La API puede consumirse bajo `/api/v1`; las rutas de imágenes no llevan ese prefijo. Para conservar cargas en despliegues con almacenamiento efímero, monta `backend/storage` como volumen persistente.
