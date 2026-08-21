# Error de conexión del backend con MySQL

## Problema identificado

Las peticiones que necesitaban consultar la base de datos fallaban porque el backend no estaba cargando las variables de conexión desde el archivo `.env`.

El archivo `.env` se encuentra en:

```text
Back-end/.env
```

Pero `Back-end/src/db.js` utilizaba esta ruta:

```js
dotenv.config({ path: path.resolve(currentDirectory, '../../.env') });
```

Desde `src`, `../../.env` apunta a la raíz del proyecto. Como allí no existe el archivo, `DB_HOST`, `DB_USER`, `DB_PASSWORD` y `DB_DATABASE` no se cargaban correctamente. El servidor podía iniciar, pero las peticiones como `/login` fallaban al intentar consultar MySQL.

## Solución aplicada

Se cambió la ruta para subir solamente desde `src` hasta `Back-end`:

```js
dotenv.config({ path: path.resolve(currentDirectory, '../.env') });
```

Después de este cambio, el pool de MySQL recibe la configuración definida en `Back-end/.env` y las rutas pueden ejecutar sus consultas.

## Requisitos

- Node.js instalado.
- MySQL iniciado.
- Base de datos `happykids` creada.
- Dependencias del backend instaladas.

## Configurar las variables de entorno

El archivo debe estar en:

```text
Back-end/.env
```

Contenido mínimo:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_DATABASE=happykids
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=change_this_secret_in_production
```

`DB_PASSWORD` debe contener la contraseña configurada para el usuario de MySQL. Si el usuario no tiene contraseña, puede dejarse vacío.

## Carga de la configuración

La conexión se define en `Back-end/src/db.js`. Como el archivo está dentro de `Back-end/src`, la ruta correcta para cargar el archivo de entorno es:

```js
dotenv.config({ path: path.resolve(currentDirectory, '../.env') });
```

La ruta `../../.env` buscaría el archivo en la raíz del proyecto y no encontraría `Back-end/.env`. En ese caso, las variables de conexión quedarían sin valor y las peticiones que consultan MySQL fallarían.

## Iniciar el backend

Desde la raíz del proyecto:

```powershell
cd Back-end
npm.cmd start
```

En desarrollo también se puede usar:

```powershell
npm.cmd run dev
```

La API debe quedar disponible en:

```text
http://localhost:3000
```

Si PowerShell informa que `npm.ps1` está bloqueado por la política de ejecución, utiliza `npm.cmd` como muestran los comandos anteriores.

## Comprobar la conexión directamente

Desde `Back-end`, ejecuta una consulta mínima:

```powershell
node --input-type=module -e "import { pool } from './src/db.js'; const [rows] = await pool.query('SELECT 1 AS conectado'); console.log(rows); await pool.end();"
```

Una conexión correcta debe mostrar un resultado similar a:

```text
[ { conectado: 1 } ]
```

## Comprobar la API

La ruta raíz permite verificar que Express está escuchando:

```text
GET http://localhost:3000/
```

Respuesta esperada:

```json
{
  "success": true,
  "message": "API de Express con MySQL lista"
}
```

Para probar una consulta de usuarios, se puede enviar un login con un correo inexistente:

```powershell
$body = '{"email":"usuario-inexistente@ejemplo.com","password":"clave-inexistente"}'
Invoke-WebRequest -Uri http://localhost:3000/login -Method Post -ContentType 'application/json' -Body $body -UseBasicParsing
```

La respuesta esperada es `401`, porque la ruta funciona y el usuario no existe.

## Diagnóstico de errores frecuentes

| Error | Causa probable | Solución |
|---|---|---|
| `ECONNREFUSED` | MySQL no está iniciado o el host/puerto es incorrecto | Inicia MySQL y revisa `DB_HOST` |
| `ER_ACCESS_DENIED_ERROR` | Usuario o contraseña incorrectos | Revisa `DB_USER` y `DB_PASSWORD` |
| `ER_BAD_DB_ERROR` | La base de datos no existe | Crea `happykids` o corrige `DB_DATABASE` |
| `EADDRINUSE` | El puerto del backend ya está ocupado | Detén el proceso anterior o usa otro `PORT` |
| Error de CORS | El origen del frontend no coincide | Revisa `CORS_ORIGIN` |
| `500` en `/login` | Error de consulta, esquema o configuración | Revisa la consola del backend y ejecuta la prueba `SELECT 1` |

Después de modificar `.env`, siempre hay que reiniciar el backend para que Node.js vuelva a cargar las variables.
