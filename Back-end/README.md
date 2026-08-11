# Back-end Three Happy Kids

## Dependencias

```bash
npm install
```

## Iniciar servidor

```bash
npm run dev
```

## Rutas de autenticación

- `POST /api/auth/register`
- `POST /api/auth/login`

## Ejemplo de tabla SQL

```sql
CREATE TABLE Usuarios (
  id INT IDENTITY(1,1) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME2 DEFAULT GETDATE()
);
```
