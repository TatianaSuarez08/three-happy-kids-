# Sistema de Encriptación con SHA2 + SALT

## ¿Cómo Funciona?

Tu sistema usa **SHA2 (SHA-256) + SALT** para hashear contraseñas de forma segura.

### 📌 Diferencia Importante

| Concepto | Definición |
|----------|-----------|
| **Hash** | Conversión de datos → valor único que NO se puede revertir |
| **SHA2 (SHA-256)** | Algoritmo de hash criptográfico estándar |
| **SALT** | Datos aleatorios agregados al hash para mayor seguridad |
| **SHA2 + SALT** | Combinación segura: imposible recuperar contraseña original |

---

## 🔐 Flujo Completo en Tu Aplicación

### 1️⃣ REGISTRO: Usuario Crea Contraseña

```javascript
// Usuario ingresa: password = "cliente123"

// Backend (UsuarioController.js):
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');  // Generar salt: abc123def456...
  const hash = crypto.createHash('sha256')
    .update(salt + password)  // salt + "cliente123"
    .digest('hex');  // SHA256
  return `${salt}:${hash}`;  // "abc123def456...:xyz789..."
}

// Se guarda en BD: "abc123def456...:xyz789..."
INSERT INTO usuario (contrasena) VALUES ('abc123def456...:xyz789...');
```

### 2️⃣ LOGIN: Usuario Intenta Iniciar Sesión

```javascript
// Usuario ingresa: password = "cliente123"

// Backend (UsuarioController.js):
const verifyPassword = (password, storedHash) => {
  const [salt, hash] = storedHash.split(':');  // Separar salt del hash
  const computedHash = crypto.createHash('sha256')
    .update(salt + password)  // salt + "cliente123"
    .digest('hex');  // SHA256
  return hash === computedHash;  // Comparar hashes
}

// Leer de BD: "abc123def456...:xyz789..."
// Calcular: SHA256("abc123def456..." + "cliente123") = "xyz789..."
// Comparar: ¿xyz789... == xyz789...? → ✓ VÁLIDO
```

---

## 📊 Ejemplo Visual

```
REGISTRO:
┌─────────────────────────┐
│ Usuario ingresa:        │
│ "cliente123"            │
└────────────┬────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│ 1. Generar SALT aleatorio                    │
│    salt = crypto.randomBytes(16).toString()  │
│    Result: "a1b2c3d4e5f6g7h8..."             │
└────────────┬─────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│ 2. Calcular SHA256                           │
│    SHA256(salt + password)                   │
│    SHA256("a1b2c3d4e5f6g7h8..." + "cliente.│
│    Result: "xyz789abc123def456..."           │
└────────────┬─────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│ 3. Guardar en BD                             │
│    "a1b2c3d4e5f6g7h8...:xyz789abc123..."    │
│    (salt:hash)                               │
└──────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────────

LOGIN:
┌─────────────────────────┐
│ Usuario ingresa:        │
│ "cliente123"            │
└────────────┬────────────┘
             │
             ├──────────────────────────────────┐
             │                                  │
             ▼                                  ▼
    ┌─────────────────┐   ┌────────────────────────────────┐
    │ Contraseña:     │   │ Leer de BD:                    │
    │ "cliente123"    │   │ "a1b2c3d4e5f6g7h8...:xyz789..." │
    └─────────────────┘   └────────────────────────────────┘
             │                                  │
             │                                  ▼
             │                    ┌──────────────────────────┐
             │                    │ Separar salt:hash        │
             │                    │ salt="a1b2c3d4e5f6g7h8..." │
             │                    │ hash="xyz789abc123..."   │
             │                    └──────────────┬───────────┘
             │                                   │
             └───────────────┬───────────────────┘
                             │
                             ▼
                ┌──────────────────────────────────┐
                │ 1. Calcular SHA256 nuevamente    │
                │    SHA256(salt + "cliente123")   │
                │    Result: "xyz789abc123..."     │
                └──────────────┬───────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ 2. Comparar hashes   │
                    │ ¿xyz789... == xyz... │
                    └──────────────┬───────┘
                                   │
                        ┌──────────┴──────────┐
                        │                     │
                        ▼                     ▼
                ┌────────────┐        ┌────────────┐
                │ ✓ VÁLIDO   │        │ ✗ INVÁLIDO │
                │ Generar    │        │ Rechazar   │
                │ JWT Token  │        │ Login      │
                └────────────┘        └────────────┘
```

---

## 🛡️ Características de Seguridad

### ✅ SALT Aleatorio
- Cada usuario tiene un salt único y aleatorio
- Imposible que dos usuarios con misma contraseña tengan mismo hash
- Ejemplo:
  ```
  User 1: "cliente123" → hash = SHA256("salt_aleatorio_1" + "cliente123")
  User 2: "cliente123" → hash = SHA256("salt_aleatorio_2" + "cliente123")
  
  Los hashes son DIFERENTES aunque la contraseña sea igual ✓
  ```

### ✅ SHA-256
- Algoritmo criptográfico estándar
- Genera hash de 256 bits (64 caracteres hexadecimales)
- Imposible revertir (unidireccional)

### ✅ Comparación Segura
- Solo se comparan hashes, nunca contraseñas en texto plano
- Salt se extrae del hash almacenado para comparar

### ✅ Validaciones
- Contraseña mínimo 6 caracteres
- Email debe ser válido
- Usuario activo (validación adicional)

---

## 📝 Formato del Hash Almacenado

```
salt:hash
├─ salt (16 bytes = 32 caracteres hex)
│  Ejemplo: "a1b2c3d4e5f6g7h81a1b2c3d4e5f6g7h8"
│
└─ hash (32 bytes = 64 caracteres hex)
   Ejemplo: "abc123def456xyz789abc123def456xyz789abc123def456xyz789abc123"

Completo:
"a1b2c3d4e5f6g7h81a1b2c3d4e5f6g7h8:abc123def456xyz789abc123def456xyz789abc123def456xyz789abc123"
```

---

## 🚀 Cómo Funciona en Tu Código

### Backend: Archivo UsuarioController.js

```javascript
// REGISTRO - Hashear contraseña
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(salt + password).digest('hex');
  return `${salt}:${hash}`;
};

// LOGIN - Verificar contraseña
const verifyPassword = (password, storedHash) => {
  const [salt, hash] = storedHash.split(':');
  const computedHash = crypto.createHash('sha256').update(salt + password).digest('hex');
  return hash === computedHash;
};
```

### Generador de Hashes: Archivo generate_hashes.js

```bash
node generate_hashes.js
```

Genera automáticamente hashes SHA2 para usuarios de prueba.

---

## 🔄 Proceso Completo de Autenticación

### 1. Usuario se Registra
```
Frontend: Envía email, nombre_usuario, contraseña (texto plano)
         ↓
Backend: hashPassword("cliente123")
         ├─ Generar salt aleatorio
         ├─ SHA256(salt + "cliente123")
         └─ Guardar: "salt:hash" en BD
         ↓
Respuesta: Token JWT + datos usuario
```

### 2. Usuario Inicia Sesión
```
Frontend: Envía email, contraseña (texto plano)
         ↓
Backend: 
  1. Buscar usuario por email
  2. Obtener hash almacenado: "salt:hash"
  3. verifyPassword("cliente123", "salt:hash")
     ├─ Extraer salt
     ├─ Calcular SHA256(salt + "cliente123")
     └─ Comparar con hash almacenado
  4. Si coincide → generar JWT Token
     Si no coincide → rechazar login
         ↓
Respuesta: Token JWT + datos usuario (si válido)
         o Error 401 (si inválido)
```

---

## 📊 Comparativa: SHA2 vs bcrypt

| Aspecto | SHA2 + SALT | bcrypt |
|---------|------------|--------|
| **Velocidad** | Muy rápido | Lento (a propósito) |
| **Seguridad** | Buena | Excelente |
| **Salt** | Manual | Automático |
| **Rounds** | No (SHA2 es fijo) | Configurable (10) |
| **Librería** | crypto (built-in) | bcryptjs (externa) |
| **Complejidad** | Simple | Media |
| **Ideal para** | Alta velocidad | Máxima seguridad |

---

## ⚙️ Configuración del Backend

El backend NO requiere bcryptjs:

**package.json - Dependencias:**
```json
{
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.6.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.3",
    "morgan": "^1.10.0",
    "mysql2": "^3.5.0"
  }
}
```

**Nota**: `crypto` es parte de Node.js, no requiere instalación.

---

## 🧪 Ejemplo Práctico

### Generar Hash para "cliente123"

```bash
node generate_hashes.js
```

**Salida:**
```
=== HASHES SHA2 PARA USUARIOS DE PRUEBA ===

Cliente - Contraseña: cliente123
Hash SHA2: a1b2c3d4e5f6g7h8:xyz789abc123def456xyz789abc123def456xyz789abc123def456

Admin - Contraseña: admin123
Hash SHA2: x1y2z3a4b5c6d7e8:abc123def456xyz789abc123def456xyz789abc123def456
```

---

## 📋 Checklist de Implementación

- [x] Backend usa SHA2 + SALT en UsuarioController.js
- [x] Verificación de contraseña usa verifyPassword()
- [x] Hash se almacena en BD como "salt:hash"
- [x] Archivo generate_hashes.js genera hashes automáticamente
- [x] Usuarios se crean vía /registro o SQL con hashes SHA2
- [x] JWT tokens sin cambios (generados después de verificar)
- [x] Frontend no necesita cambios (envía texto plano)
- [ ] Base de datos tiene usuarios con hashes SHA2

---

## 🎯 Ventajas de SHA2 + SALT

✅ **Simple y directo**: Fácil de entender y mantener  
✅ **Rápido**: Mejor rendimiento que bcrypt  
✅ **Seguro**: Salt aleatorio previene ataques rainbow tables  
✅ **Built-in**: No requiere librerías externas  
✅ **Estándar**: SHA-256 es criptográficamente seguro  

---

## 📚 Referencias

- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)
- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [SHA-256 Wikipedia](https://en.wikipedia.org/wiki/SHA-2)
- [Salt (Cryptography)](https://en.wikipedia.org/wiki/Salt_(cryptography))
