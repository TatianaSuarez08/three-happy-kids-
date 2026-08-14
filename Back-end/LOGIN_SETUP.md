# Guía de Implementación del Sistema de Login

## Descripción General

Tu sistema de login está completamente integrado con la estructura de base de datos de `happykids`. Este documento explica cómo funciona y cómo configurarlo correctamente.

## Estructura de Base de Datos

El sistema utiliza las siguientes tablas:

- **usuario**: Almacena credenciales de usuarios (correo, contraseña hasheada, estado)
- **rol**: Define los roles disponibles (ej: administrador, cliente)
- **usuario_rol**: Tabla intermedia que asocia usuarios con roles

```
usuario (id, nombre_usuario, contrasena, correo, activo, idioma)
    ↓
usuario_rol (id_usuario, id_rol)
    ↓
rol (id, nombre_rol)
```

## Configuración Backend

### 1. Variables de Entorno (.env)

Crea un archivo `.env` en la carpeta `Back-end` con el siguiente contenido:

```env
# Puerto del servidor
PORT=3000

# Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_DATABASE=happykids

# Seguridad
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
NODE_ENV=development
```

**Nota**: Nunca guardes las credenciales reales en `.env.example`, ese es solo para referencia.

### 2. Instalar Dependencias

```bash
cd Back-end
npm install
```

Las dependencias necesarias ya están en `package.json`:
- `express`: Framework web
- `mysql2`: Cliente para MySQL
- `bcryptjs`: Hash seguro de contraseñas
- `jsonwebtoken`: Generación de tokens JWT
- `cors`: Control de origen cruzado
- `dotenv`: Variables de entorno

### 3. Iniciar el Servidor

```bash
# Modo desarrollo (con reload automático)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## Endpoints Backend

### POST /registro
Registra un nuevo usuario en el sistema

**Petición:**
```json
{
  "nombre_usuario": "juan_perez",
  "email": "juan@example.com",
  "password": "miContraseña123",
  "confirmar_password": "miContraseña123"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario registrado correctamente",
  "user": {
    "id": 1,
    "nombre": "juan_perez",
    "email": "juan@example.com",
    "idioma": "es",
    "roles": ["cliente"]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**
- `400`: Datos inválidos (contraseñas no coinciden, email inválido, etc.)
- `409`: Email o usuario_name ya existe
- `500`: Error del servidor

**Validaciones:**
- Nombre de usuario: mínimo 3 caracteres
- Email: formato válido y único
- Contraseña: mínimo 6 caracteres
- Las contraseñas deben coincidir

### POST /login
Inicia sesión de un usuario

**Petición:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "usuario@example.com",
    "idioma": "es",
    "roles": ["cliente"]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**
- `400`: Datos inválidos o faltantes
- `401`: Credenciales incorrectas
- `403`: Usuario inactivo
- `500`: Error del servidor

### GET /me
Obtiene datos del usuario autenticado (requiere token)

**Header requerido:**
```
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "user": {
    "email": "usuario@example.com",
    "nombre": "Juan Pérez",
    "roles": ["cliente"]
  }
}
```

## Configuración Frontend

### 1. Variables de Entorno (.env.local)

Crea un archivo `.env.local` en `Front-end`:

```
VITE_BACKEND_URL=http://localhost:3000
```

En producción, cambiar a la URL real del servidor.

### 2. Instalar Dependencias

```bash
cd Front-end
npm install
```

### 3. Iniciar Desarrollo

```bash
npm run dev
```

El frontend estará en: `http://localhost:5173` (o el puerto que Vite asigne)

## Flujo de Autenticación

### 1. Usuario Ingresa Credenciales
El usuario completa el formulario en `InicioSesion.jsx`

### 2. Validación en Cliente
Se validan:
- Email válido
- Contraseña mínimo 6 caracteres
- Campos no vacíos

### 3. Petición al Backend
Se envía POST a `/login` con email y password

### 4. Validación en Backend
El servidor:
- Busca el usuario por email
- Verifica que esté activo
- Compara la contraseña (bcrypt)
- Obtiene los roles del usuario

### 5. Generación de Token
Se crea un JWT con:
- Email del usuario
- Nombre
- Array de roles
- Expiración en 8 horas

### 6. Respuesta y Almacenamiento
El frontend guarda en `localStorage`:
- `token`: JWT para peticiones autenticadas
- `user`: Datos públicos del usuario
- `userRoles`: Array de roles para navegación

### 7. Redirección según Rol
- Si es **admin**: `/admin/dashboard`
- Si es **cliente**: `/cliente/catalogo`
- Si otro rol: `/`

## Cómo Crear Usuarios

### Opción 1: A través del Frontend (RECOMENDADO)
Los usuarios se registran en `http://localhost:5173/registro` usando el formulario de registro.
El frontend encriptará la contraseña y el backend la hasheará con bcrypt.

### Opción 2: Llamar API de Registro Directamente
```bash
curl -X POST http://localhost:3000/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_usuario": "juan_perez",
    "email": "juan@example.com",
    "password": "miContraseña123",
    "confirmar_password": "miContraseña123"
  }'
```

### Opción 3: Usando SQL (Para pruebas rápidas)
Ejecuta el script `sql_insert_test_users.sql` en tu base de datos MySQL para crear usuarios de prueba.

```sql
-- 1. Insertar roles (si no existen)
INSERT INTO rol (nombre_rol) VALUES ('cliente'), ('administrador');

-- 2. Insertar usuario (la contraseña DEBE estar hasheada con bcrypt)
-- Usa https://bcrypt-generator.com/ para generar el hash
INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma) 
VALUES ('juan_perez', '$2a$10$tuHashDeContraseña', 'juan@example.com', 1, 'es');

-- 3. Asignar rol al usuario
INSERT INTO usuario_rol (id_usuario, id_rol) 
VALUES (1, 1); -- usuario_id=1, rol_id=1 (cliente)
```

## Protección de Rutas

El componente `ProtectedRoute` verifica:
1. **Token válido**: Si no existe, redirige a `/login`
2. **Roles permitidos**: Si especificas `allowedRoles={["administrador"]}`, verifica que el usuario tenga ese rol

Ejemplo de uso:
```jsx
<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute allowedRoles={["administrador"]}>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

## 🔐 Sistema de Encriptación (SHA2 + SALT)

Tu sistema usa **SHA2 (SHA-256) + SALT** para encriptar contraseñas de forma segura.

### ¿Cómo funciona?

1. **REGISTRO**: Usuario ingresa contraseña
   ```
   Contraseña ingresada: "cliente123"
   ↓
   Generar SALT aleatorio: "a1b2c3d4e5f6g7h8..."
   ↓
   SHA256(salt + "cliente123") = "xyz789abc123..."
   ↓
   Guardar en BD: "a1b2c3d4e5f6g7h8...:xyz789abc123..."
   ```

2. **LOGIN**: Usuario ingresa contraseña
   ```
   Contraseña ingresada: "cliente123"
   ↓
   Leer de BD: "a1b2c3d4e5f6g7h8...:xyz789abc123..."
   ↓
   Separar salt: "a1b2c3d4e5f6g7h8..."
   ↓
   SHA256(salt + "cliente123") = "xyz789abc123..."
   ↓
   Comparar con hash guardado: ¿xyz789... == xyz789...?
   ↓
   Resultado: ✓ válido o ✗ inválido
   ```

### Características de Seguridad

✅ **SALT aleatorio**: Cada hash es único aunque la contraseña sea igual  
✅ **SHA-256**: Algoritmo criptográfico estándar  
✅ **Irreversible**: No se puede obtener la contraseña original  
✅ **Validación en cliente y servidor**  

**Nota**: Las contraseñas NUNCA se desencriptan. Solo se comparan hashes.

Para más detalles, consulta el archivo `SHA2_GUIA.md`.

---
- [ ] Usar HTTPS en lugar de HTTP
- [ ] Guardar tokens en HttpOnly cookies en lugar de localStorage
- [ ] Implementar refresh tokens para renovar sesiones
- [ ] Agregar rate limiting para prevenir ataques de fuerza bruta
- [ ] Implementar endpoint de registro con verificación de email
- [ ] Agregar endpoint de recuperación de contraseña
- [ ] Usar variables de entorno seguras en producción

## Troubleshooting

### "Credenciales inválidas"
- Verifica que el email y contraseña sean correctos
- Asegúrate de que el usuario esté activo en la BD
- Comprueba que la contraseña esté hasheada correctamente

### "Token no proporcionado"
- Verifica que incluyas el header `Authorization: Bearer <token>`
- Comprueba que el token no haya expirado

### "El usuario está inactivo"
- En MySQL, actualiza: `UPDATE usuario SET activo = 1 WHERE id = ?;`

### "Error de conexión a BD"
- Verifica que MySQL esté corriendo
- Comprueba las credenciales en `.env`
- Asegúrate de que la BD `happykids` existe

## Próximos Pasos

1. ✅ Crear archivo `.env` con credenciales reales
2. ✅ Crear usuarios de prueba en la BD (o usar /registro)
3. ✅ Iniciar backend: `npm run dev`
4. ✅ Iniciar frontend: `npm run dev`
5. ✅ Probar login en `http://localhost:5173/login`
6. ✅ Probar registro en `http://localhost:5173/registro`
7. ⬜ Implementar endpoint de recuperación de contraseña
8. ⬜ Mejorar protección de tokens (cookies HttpOnly)
9. ⬜ Agregar refresh tokens
10. ⬜ Desplegar a producción con HTTPS

---

¡Sistema de autenticación completamente funcional! 🎉
