# 🚀 LEER PRIMERO - INICIO RÁPIDO

## ¿QUÉ PASÓ?

Revisamos TODO tu proyecto (backend y frontend) y cambié TODO lo de login a **SHA2** en lugar de bcrypt.

✅ Todo está listo para funcionar
✅ Ya no necesitas bcryptjs
✅ Las contraseñas se encriptan con SHA256 + SALT aleatorio
✅ El sistema es seguro y rápido

---

## 📋 5 PASOS PARA EMPEZAR

### PASO 1: Insertar Usuarios en MySQL
```bash
# Abre MySQL
mysql -u root -p

# Selecciona la BD
USE happykids;

# COPIA Y PEGA TODO ESTO:
```

```sql
-- Crear roles
INSERT INTO rol (nombre_rol) VALUES ('cliente'), ('administrador')
ON DUPLICATE KEY UPDATE nombre_rol = nombre_rol;

-- Usuario CLIENTE
INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma) 
VALUES (
  'cliente_test',
  '15a78f08777fc96ed270f97a254ebdd8:c946f8f7b1ad720fba8e99291ff7785a980e68c43dd264fc4f523faee2f58214',
  'cliente@example.com',
  1,
  'es'
)
ON DUPLICATE KEY UPDATE contrasena = VALUES(contrasena), activo = VALUES(activo);

-- Usuario ADMIN
INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma) 
VALUES (
  'admin_test',
  '4314032fab0158615f76a60ee8454abe:f934ddc5738cd2ee372cb814af769974712acbf26db583441d40824892bc52a8',
  'admin@example.com',
  1,
  'es'
)
ON DUPLICATE KEY UPDATE contrasena = VALUES(contrasena), activo = VALUES(activo);

-- Asignar roles
DELETE FROM usuario_rol WHERE id_usuario = (SELECT id FROM usuario WHERE correo = 'cliente@example.com');
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id FROM usuario u, rol r
WHERE u.correo = 'cliente@example.com' AND r.nombre_rol = 'cliente';

DELETE FROM usuario_rol WHERE id_usuario = (SELECT id FROM usuario WHERE correo = 'admin@example.com');
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id FROM usuario u, rol r
WHERE u.correo = 'admin@example.com' AND r.nombre_rol = 'administrador';

-- Verificar
SELECT u.id, u.correo, GROUP_CONCAT(r.nombre_rol) as roles 
FROM usuario u
LEFT JOIN usuario_rol ur ON u.id = ur.id_usuario
LEFT JOIN rol r ON ur.id_rol = r.id
GROUP BY u.id;
```

Presiona Enter y escribe `exit;`

---

### PASO 2: Inicia el Backend
Abre una Terminal (PowerShell o Git Bash):
```bash
cd Back-end
npm run dev
```

Debe mostrarte:
```
✓ Servidor corriendo en puerto 3000
```

---

### PASO 3: Inicia el Frontend
Abre OTRA Terminal:
```bash
cd Front-end
npm run dev
```

Debe mostrarte:
```
➜  Local:   http://localhost:5173/
```

---

### PASO 4: Abre el Navegador
Entra a: http://localhost:5173/login

---

### PASO 5: Login como Admin
```
Email:      admin@example.com
Contraseña: admin123
```

Deberías ver:
✅ Login exitoso
✅ Redirige a /admin/dashboard
✅ Token guardado en localStorage

---

## 🎯 PROBAR CON CLIENTE

También puedes probar con:
```
Email:      cliente@example.com
Contraseña: cliente123
```

Deberías ver:
✅ Login exitoso
✅ Redirige a /cliente/catalogo

---

## 📁 ARCHIVOS CREADOS/ACTUALIZADOS

### Documentación (LEER ESTOS)
```
✅ ESTADO_PROYECTO_SHA2.md ← RESUMEN COMPLETO del proyecto
✅ SHA2_GUIA.md ← Explicación detallada de SHA2 (con diagramas)
✅ SHA2_SETUP_FINAL.md ← Guía rápida
✅ INSTALACION_MYSQL.md ← Instrucciones MySQL paso a paso
✅ USUARIOS_SHA2_SETUP.sql ← SQL listo para ejecutar
```

### Backend (YA ESTÁ LISTO)
```
✅ UsuarioController.js - SHA2 + hashPassword() + verifyPassword()
✅ UsuarioModel.js - Acceso a BD
✅ generate_hashes.js - Genera hashes SHA2
✅ package.json - Removido bcryptjs
✅ .env - Configurado
```

### Frontend (YA ESTÁ LISTO)
```
✅ Iniciosesion.jsx - Login form
✅ Registro.jsx - Register form
✅ App.jsx - Rutas protegidas
✅ ProtectedRoute.jsx - Protección de roles
✅ .env.local - Configurado
```

---

## 🔐 ¿CÓMO FUNCIONA SHA2?

```
SIMPLE:

REGISTRO:
  User escribe: "cliente123"
  Backend: SHA256(random_salt + "cliente123") = "hash_unico"
  Guardar en BD: "random_salt:hash_unico"

LOGIN:
  User escribe: "cliente123"
  Backend: Lee "random_salt:hash_unico" de BD
  Backend: SHA256(random_salt + "cliente123") = nuevo_hash
  Backend: ¿nuevo_hash == hash_unico? → ✓ Acceso

VENTAJAS:
✅ No se guarda contraseña en texto plano
✅ Cada usuario tiene salt único
✅ Imposible recuperar contraseña original
✅ Rápido (más que bcrypt)
✅ Estándar (SHA-256)
```

---

## ❌ SI ALGO NO FUNCIONA

### Error: "Credenciales inválidas"
**Solución:**
1. Verifica que ejecutaste TODO el SQL en MySQL
2. Verifica que copiaste los hashes completos (son muy largos)
3. Intenta nuevamente

### Error: "Cannot connect to database"
**Solución:**
1. Verifica que MySQL está corriendo
2. Verifica .env tiene DB_DATABASE=happykids
3. Revisa conexión MySQL

### Backend no inicia
**Solución:**
1. `cd Back-end && npm run dev`
2. Si falta algo: `npm install`
3. Verifica puerto 3000 no esté en uso

### Frontend no carga
**Solución:**
1. `cd Front-end && npm run dev`
2. Si falta algo: `npm install`
3. Verifica .env.local tiene VITE_BACKEND_URL=http://localhost:3000

---

## 📚 DOCUMENTACIÓN COMPLETA

Si quieres entender TODO en detalle, lee en este orden:

1. **Este archivo** (lo que estás leyendo) - Overview rápido
2. **ESTADO_PROYECTO_SHA2.md** - Resumen de todos los archivos
3. **SHA2_GUIA.md** - Cómo funciona SHA2 con ejemplos
4. **INSTALACION_MYSQL.md** - Pasos detallados para MySQL

---

## ✨ FEATURES QUE YA ESTÁN IMPLEMENTADAS

✅ SHA2 (SHA-256) password encryption  
✅ Random salt para cada usuario  
✅ JWT tokens con 8h expiration  
✅ Login y Registro funcionales  
✅ Rol-based access control  
✅ Protección de rutas (/admin/*)  
✅ LocalStorage para sesiones  
✅ Validación en cliente y servidor  
✅ CORS configurado  
✅ Database pool connections  
✅ Error handling  

---

## 🚀 QUICK START (1 LÍNEA)

```
1. Ejecuta SQL en MySQL
2. npm run dev en Back-end/
3. npm run dev en Front-end/
4. http://localhost:5173/login
5. admin@example.com / admin123
6. ✓ Listo!
```

---

## 🎉 ¡HECHO!

Todo está configurado, documentado y listo.

Solo necesitas:
1. Insertar usuarios en MySQL
2. Ejecutar dos `npm run dev`
3. Login

¿Preguntas? Lee los archivos .md en Back-end/

**¡Vamos!** 🚀
