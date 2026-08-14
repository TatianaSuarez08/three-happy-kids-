# ⚡ INSTALACIÓN FINAL - SHA2 EN MYSQL

## 🎯 Objetivo
Insertar usuarios de prueba en la base de datos con contraseñas encriptadas en SHA2.

---

## 📋 PASO A PASO

### Paso 1️⃣: Abre MySQL
```bash
mysql -u root -p
```
Te pedirá contraseña. Si MySQL no tiene contraseña, presiona Enter.

### Paso 2️⃣: Selecciona la Base de Datos
```sql
USE happykids;
```

### Paso 3️⃣: COPIA Y PEGA TODO EL SIGUIENTE CÓDIGO

```sql
-- =====================================================
-- SCRIPT SETUP: USUARIOS DE PRUEBA CON SHA2
-- =====================================================

-- 1. Crear roles básicos
INSERT INTO rol (nombre_rol) VALUES ('cliente'), ('administrador')
ON DUPLICATE KEY UPDATE nombre_rol = nombre_rol;

-- 2. Crear usuario CLIENTE de prueba
INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma) 
VALUES (
  'cliente_test',
  '15a78f08777fc96ed270f97a254ebdd8:c946f8f7b1ad720fba8e99291ff7785a980e68c43dd264fc4f523faee2f58214',
  'cliente@example.com',
  1,
  'es'
)
ON DUPLICATE KEY UPDATE 
  contrasena = VALUES(contrasena),
  activo = VALUES(activo);

-- 3. Crear usuario ADMIN de prueba
INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma) 
VALUES (
  'admin_test',
  '4314032fab0158615f76a60ee8454abe:f934ddc5738cd2ee372cb814af769974712acbf26db583441d40824892bc52a8',
  'admin@example.com',
  1,
  'es'
)
ON DUPLICATE KEY UPDATE 
  contrasena = VALUES(contrasena),
  activo = VALUES(activo);

-- 4. Asignar rol CLIENTE
DELETE FROM usuario_rol WHERE id_usuario = (SELECT id FROM usuario WHERE correo = 'cliente@example.com');
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id FROM usuario u, rol r
WHERE u.correo = 'cliente@example.com' AND r.nombre_rol = 'cliente';

-- 5. Asignar rol ADMINISTRADOR
DELETE FROM usuario_rol WHERE id_usuario = (SELECT id FROM usuario WHERE correo = 'admin@example.com');
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id FROM usuario u, rol r
WHERE u.correo = 'admin@example.com' AND r.nombre_rol = 'administrador';

-- 6. VERIFICACIÓN
SELECT 
  u.id,
  u.nombre_usuario,
  u.correo,
  u.activo,
  GROUP_CONCAT(r.nombre_rol) as roles
FROM usuario u
LEFT JOIN usuario_rol ur ON u.id = ur.id_usuario
LEFT JOIN rol r ON ur.id_rol = r.id
GROUP BY u.id
ORDER BY u.id;
```

### Paso 4️⃣: Presiona ENTER
Deberías ver algo como:
```
+----+--------------+-----------------------+--------+------------------+
| id | nombre_usuario| correo               | activo | roles           |
+----+--------------+-----------------------+--------+------------------+
| 1  | cliente_test | cliente@example.com   |   1    | cliente         |
| 2  | admin_test   | admin@example.com     |   1    | administrador   |
+----+--------------+-----------------------+--------+------------------+
```

### Paso 5️⃣: Escribe `exit` para salir de MySQL
```
exit;
```

---

## ✅ VERIFICACIÓN DE CONTRASEÑAS

Las contraseñas están encriptadas así:

| Email | Contraseña | Hash SHA2 |
|-------|-----------|-----------|
| cliente@example.com | cliente123 | 15a78f08777fc96ed270f97a254ebdd8:c946f8f7b1ad720fba8e99291ff7785a980e68c43dd264fc4f523faee2f58214 |
| admin@example.com | admin123 | 4314032fab0158615f76a60ee8454abe:f934ddc5738cd2ee372cb814af769974712acbf26db583441d40824892bc52a8 |

---

## 🚀 DESPUÉS DE INSERTAR USUARIOS

### 1. Inicia el Backend
```bash
cd Back-end
npm run dev
```

Deberías ver:
```
✓ Servidor corriendo en puerto 3000
```

### 2. Inicia el Frontend
```bash
cd Front-end
npm run dev
```

Deberías ver:
```
  ➜  Local:   http://localhost:5173/
```

### 3. Abre http://localhost:5173/login

### 4. Login con Admin
```
Email: admin@example.com
Contraseña: admin123

Resultado: ✓ Redirige a /admin/dashboard
```

### 5. Login con Cliente
```
Email: cliente@example.com
Contraseña: cliente123

Resultado: ✓ Redirige a /cliente/catalogo
```

---

## 🔍 SI ALGO FALLA

### ❌ Error: "Credenciales inválidas"
**Solución:**
1. Verifica que el SQL se ejecutó correctamente
2. Verifica que copiaste TODO el código SQL (incluyendo los hashes)
3. Intenta nuevamente con la contraseña exacta (caso sensible)

### ❌ Error: "No database selected"
**Solución:**
1. En el terminal MySQL, asegúrate de ejecutar `USE happykids;`
2. En .env del backend, verifica: `DB_DATABASE=happykids`

### ❌ Error: "Access Denied"
**Solución:**
1. Verifica usuario MySQL: `mysql -u root -p`
2. Si no tienes contraseña, presiona Enter sin escribir nada
3. Si tampoco funciona, revisa .env (DB_USER, DB_PASSWORD)

### ❌ Backend dice "Cannot connect to database"
**Solución:**
1. Verifica que MySQL está corriendo
2. Verifica .env tiene valores correctos:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_DATABASE=happykids
   ```

---

## 📱 RESUMEN QUICK START

```bash
# 1. MySQL - Ejecuta USUARIOS_SHA2_SETUP.sql
mysql -u root -p happykids < USUARIOS_SHA2_SETUP.sql

# 2. Terminal 1 - Backend
cd Back-end
npm run dev

# 3. Terminal 2 - Frontend
cd Front-end
npm run dev

# 4. Browser - Test
http://localhost:5173/login
admin@example.com / admin123
```

---

¡Listo! 🎉
