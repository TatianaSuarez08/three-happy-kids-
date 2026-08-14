# ⚡ GUÍA RÁPIDA: SHA2 EN TODO EL PROYECTO

## Estado Actual
✅ Backend: SHA2 + SALT implementado
✅ UsuarioController.js: hashPassword() y verifyPassword() listos
✅ UsuarioModel.js: Correcto
✅ Frontend: Listo (no requiere cambios)
✅ generate_hashes.js: Script disponible

## 🚀 PASOS FINALES

### Paso 1: Generar Hashes SHA2
```bash
cd Back-end
node generate_hashes.js
```

Verás:
```
=== HASHES SHA2 PARA USUARIOS DE PRUEBA ===

Cliente - Contraseña: cliente123
Hash SHA2: a1b2c3d4e5f6g7h8:xyz789...

Admin - Contraseña: admin123
Hash SHA2: x1y2z3a4b5c6d7e8:abc123...

-- Ejecuta esto en MySQL:
[SCRIPT SQL COMPLETO]
```

### Paso 2: Copiar TODO el SQL que genera
**Copia TODO lo que dice "-- Ejecuta esto en MySQL:"**

### Paso 3: Ejecutar en MySQL
```bash
mysql -u root -p happykids
```

Pega TODO el SQL que copiaste. Presiona Enter.

### Paso 4: Reiniciar Backend
```bash
npm run dev
```

### Paso 5: Prueba en Navegador
- **Login**: http://localhost:5173/login
- **Email**: admin@example.com
- **Contraseña**: admin123

---

## 📁 ARCHIVOS MODIFICADOS

| Archivo | Cambio |
|---------|--------|
| UsuarioController.js | ✅ SHA2 + hashPassword() |
| UsuarioModel.js | ✅ Sin cambios (listo) |
| UsuarioRoute.js | ✅ Sin cambios (listo) |
| package.json | ✅ Removido bcryptjs |
| generate_hashes.js | ✅ Script SHA2 |
| sql_insert_test_users.sql | ✅ Actualizado |
| SHA2_GUIA.md | ✅ Documentación nueva |
| LOGIN_SETUP.md | ✅ Actualizado |
| Registro.jsx | ✅ Sin cambios (listo) |
| Iniciosesion.jsx | ✅ Sin cambios (listo) |

---

## 🔐 Cómo Funciona SHA2

```
REGISTRO:
contraseña "cliente123"
    ↓
hashPassword():
  - salt = "a1b2c3d4..." (aleatorio)
  - hash = SHA256("a1b2c3d4..." + "cliente123")
  - resultado: "a1b2c3d4...:xyz789..."
    ↓
Guardar en BD

LOGIN:
contraseña "cliente123"
    ↓
Leer de BD: "a1b2c3d4...:xyz789..."
    ↓
verifyPassword():
  - Separar: salt="a1b2c3d4...", hash="xyz789..."
  - Calcular: SHA256("a1b2c3d4..." + "cliente123")
  - Comparar: ¿xyz789... == xyz789...? → ✓
    ↓
Generar JWT Token
```

---

## ✅ VERIFICACIÓN FINAL

### En Terminal:
```bash
# Backend corriendo
npm run dev  # Debe estar activo

# Frontend corriendo
npm run dev  # Debe estar activo
```

### En Navegador (http://localhost:5173/login):
```
Email: admin@example.com
Contraseña: admin123

Resultado esperado:
✓ Login exitoso
✓ Redirige a /admin/dashboard (IndexAdmi.jsx)
✓ Token guardado en localStorage
```

### En MySQL:
```sql
SELECT u.correo, u.nombre_usuario, u.contrasena, r.nombre_rol
FROM usuario u
LEFT JOIN usuario_rol ur ON u.id = ur.id_usuario
LEFT JOIN rol r ON ur.id_rol = r.id
ORDER BY u.id;
```

Debes ver:
```
admin@example.com  | admin_test      | a1b2c3d4...:xyz789... | administrador
cliente@example.com| cliente_test    | x1y2z3a4...:abc123... | cliente
```

---

## 🎯 CARACTERÍSTICAS IMPLEMENTADAS

✅ SHA2 (SHA-256) para hashing  
✅ SALT aleatorio para cada usuario  
✅ Verificación segura de contraseñas  
✅ JWT tokens con expiración 8h  
✅ Validaciones en cliente y servidor  
✅ Control de acceso por roles  
✅ Usuarios activos/inactivos  
✅ Protección de rutas  

---

## 📞 TROUBLESHOOTING

### Error: "Credenciales inválidas"
1. Verifica que ejecutaste el script SQL
2. Verifica que los hashes en BD coincidan con generate_hashes.js
3. Revisa que contraseñas sean exactas (caso sensible)

### Error: "No database selected"
1. Verifica .env tiene DB_DATABASE=happykids
2. Verifica BD existe en MySQL

### Hash en BD no coincide
1. Ejecuta generate_hashes.js nuevamente
2. Copia el SQL completo
3. Borra usuarios anteriores y re-inserta

---

¡Todo listo para funcionar con SHA2! 🚀
