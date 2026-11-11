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
