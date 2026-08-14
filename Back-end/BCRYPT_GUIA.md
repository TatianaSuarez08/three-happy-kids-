# Sistema de Encriptación de Contraseñas con bcrypt

## ¿Cómo Funciona?

Tu sistema usa **bcrypt**, una librería especializada en **hashear** (encriptar) contraseñas de forma segura.

### 📌 Diferencia Importante

| Concepto | Definición |
|----------|-----------|
| **Hash** | Conversión de datos → valor único que NO se puede revertir |
| **Encriptación** | Conversión reversible (puede desencriptarse con una clave) |
| **bcrypt** | Genera un HASH, NO encripta. Es la opción segura para contraseñas |

### ¿Por Qué bcrypt y no encriptación reversible?

```
❌ MAL: password → encriptar → "xyz123" → desencriptar → "password"
   Problema: Si alguien obtiene la clave, recupera todas las contraseñas

✅ BIEN: password → bcrypt (hash) → "$2a$10$..." 
   Problema: Imposible recuperar la contraseña original
   Solución: Comparar contraseña ingresada con el hash almacenado
```

---

## 🔐 Flujo Completo en Tu Aplicación

### 1️⃣ REGISTRO: Usuario Crea Contraseña

```javascript
// Usuario ingresa: password = "miContraseña123"

// Backend (UsuarioController.js):
const hashedPassword = bcrypt.hashSync("miContraseña123", 10);
// Resultado: "$2a$10$QIvzK8JMxfK3jL9pQ2mK8eX7y5z3a1bC2dE4fG5hI6jK7lM8nO"

// Se guarda en BD la contraseña HASHEADA, no la original
INSERT INTO usuario (nombre_usuario, contrasena, correo) 
VALUES ('juan', '$2a$10$QIvz...', 'juan@example.com');
```

**Parámetros de bcrypt:**
- `10` = número de "rounds" (iteraciones) que toma hashear
  - Más rounds = más seguro pero más lento
  - 10 es el estándar recomendado

### 2️⃣ LOGIN: Usuario Intenta Iniciar Sesión

```javascript
// Usuario ingresa: email = "juan@example.com", password = "miContraseña123"

// Backend (UsuarioController.js):
const user = await findUserByEmail("juan@example.com");
// Resultado: { id: 1, email: "juan@example.com", password: "$2a$10$QIvz..." }

// Comparar contraseña ingresada con el hash almacenado
const isValidPassword = bcrypt.compareSync("miContraseña123", user.password);
// bcryptjs COMPARA de forma inteligente sin desencriptar
// Resultado: true (si coincide) o false (si no coincide)

if (isValidPassword) {
  // Generar token JWT y responder con éxito
} else {
  // Rechazar login
}
```

---

## 📊 Ejemplo Visual

```
REGISTRO:
┌─────────────────────────┐
│ Usuario ingresa:        │
│ "miContraseña123"       │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ bcrypt.hashSync("miContraseña123", 10)     │
│ (10 rounds de procesamiento criptográfico) │
└────────────┬────────────────────────────────┘
             │
             ▼
┌───────────────────────────────────────────────────────────────────┐
│ Resultado: "$2a$10$QIvzK8JMxfK3jL9pQ2mK8eX7y5z3a1bC2dE4fG5hI6jK7lM8nO"
│ (Hash único e irrecuperable)                                      │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────┐
│ Guardar en BD:          │
│ tabla usuario (correo,  │
│ contrasena_hasheada)    │
└─────────────────────────┘

─────────────────────────────────────────────────────────────────

LOGIN:
┌─────────────────────────┐
│ Usuario ingresa:        │
│ "miContraseña123"       │
└────────────┬────────────┘
             │
             ├──────────────────────────────────┐
             │                                  │
             ▼                                  ▼
     ┌─────────────────┐         ┌──────────────────────────────┐
     │ Comparar con:   │         │ Leer de BD:                  │
     │ "miContraseña.. │         │ "$2a$10$QIvzK8JMxfK3..."    │
     └─────────────────┘         └──────────────────────────────┘
             │                                  │
             └──────────────┬───────────────────┘
                            │
                            ▼
                ┌──────────────────────────────┐
                │ bcrypt.compareSync()         │
                │ (Compara inteligentemente)   │
                └──────────────┬───────────────┘
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

## 🔄 Funcionamiento Técnico de bcrypt

### ¿Cómo compara contraseñas sin desencriptar?

bcrypt usa **"salting"** (agregar datos aleatorios) para hacer cada hash único:

```
Password: "123456"

Hash 1: bcrypt.hashSync("123456", 10)
→ "$2a$10$aB1cD2eF3gH4iJ5kL6mN7o..."

Hash 2: bcrypt.hashSync("123456", 10) (misma contraseña)
→ "$2a$10$xY9zA8bC7dE6fG5hI4jK3l..."

❗ Los hashes son DIFERENTES aunque la contraseña sea igual
   Esto es seguridad por "salting"

Pero bcrypt es inteligente:
bcrypt.compareSync("123456", "$2a$10$aB1cD2eF3gH4iJ5kL6mN7o...")  → true
bcrypt.compareSync("123456", "$2a$10$xY9zA8bC7dE6fG5hI4jK3l...")  → true
```

### El hash $2a$10$... qué significa

```
$2a$         = Algoritmo bcrypt versión a
$10$         = 10 rounds de procesamiento
$...         = El salt (datos aleatorios)
...          = El hash final
```

---

## 🚀 Flujo en Tu Código

### Archivo: Back-end/src/controllers/UsuarioController.js

```javascript
// REGISTRO (línea 43)
const hashedPassword = bcrypt.hashSync(password, 10);
// Genera el hash seguro de la contraseña

// LOGIN (línea 90)
const isValidPassword = bcrypt.compareSync(password, user.password);
// Compara la contraseña ingresada con el hash guardado
```

### Archivo: Back-end/src/models/UsuarioModel.js

```javascript
// Cuando se busca usuario por email, trae la contraseña hasheada
const [users] = await pool.execute(
  'SELECT ... contrasena AS password ...',
  [email]
);
// user.password = "$2a$10$..." (el hash)
```

---

## 🛡️ Seguridad Implementada

✅ **Contraseñas hasheadas** con bcrypt 10 rounds  
✅ **Hash único** cada vez (salting automático)  
✅ **Imposible recuperar** la contraseña original  
✅ **Validación en cliente y servidor**  
✅ **JWT tokens** con expiración de 8 horas  
✅ **Comparación segura** en cada login  

---

## ⚠️ Errores Comunes

### ❌ MAL: Encriptación reversible
```javascript
const encrypted = AES.encrypt(password, key);
// Problema: Si alguien obtiene 'key', recupera todas las contraseñas
```

### ✅ BIEN: Usar bcrypt (lo que haces)
```javascript
const hashed = bcrypt.hashSync(password, 10);
// Seguro: Imposible recuperar la contraseña sin bcrypt.compareSync()
```

---

## 📝 Comandos para Pruebas

### Generar un hash en la terminal
```javascript
// En Node.js o navegador:
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('miContraseña123', 10);
console.log(hash);
// → $2a$10$QIvzK8JMxfK3jL9pQ2mK8eX7y5z3a1bC2dE4fG5hI6jK7lM8nO
```

### Verificar un hash
```javascript
const isValid = bcrypt.compareSync('miContraseña123', 
  '$2a$10$QIvzK8JMxfK3jL9pQ2mK8eX7y5z3a1bC2dE4fG5hI6jK7lM8nO'
);
console.log(isValid); // → true

const isInvalid = bcrypt.compareSync('otraContraseña', 
  '$2a$10$QIvzK8JMxfK3jL9pQ2mK8eX7y5z3a1bC2dE4fG5hI6jK7lM8nO'
);
console.log(isInvalid); // → false
```

---

## 🎯 Resumen del Flujo

1. **REGISTRO**
   - Usuario ingresa contraseña en texto plano
   - Backend hashea con bcrypt (10 rounds)
   - Guarda el hash en BD (contraseña original se descarta)

2. **LOGIN**
   - Usuario ingresa contraseña en texto plano
   - Backend obtiene hash de BD
   - Usa bcrypt.compareSync() para comparar
   - Si coincide → genera JWT token
   - Si no coincide → rechaza login

3. **SEGURIDAD**
   - Contraseña original nunca se almacena
   - Hash es único aunque contraseña sea igual
   - Imposible "desencriptar" el hash
   - Solo se puede verificar comparando con bcrypt

---

## 📚 Referencias

- **bcryptjs**: https://www.npmjs.com/package/bcryptjs
- **OWASP Password Storage**: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- **Why bcrypt**: https://stackoverflow.com/questions/4795385/you-are-doing-it-wrong-hashing-passwords-in-nodejs
