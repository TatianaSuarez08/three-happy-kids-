# 19. Instalación

## Requisitos

- Node.js 18+
- MySQL 8+
- npm
- entorno de desarrollo local con base de datos disponible

## Backend

1. Entrar a [Back-end](../Back-end)
2. Ejecutar `npm install`
3. Crear variables de entorno necesarias para la conexión a MySQL
4. Iniciar con `npm start` o `npm run dev`

## Frontend

1. Entrar a [Front-end](../Front-end)
2. Ejecutar `npm install`
3. Iniciar con `npm run dev`

## Variables de entorno recomendadas

- DB_HOST
- DB_USER
- DB_PASSWORD
- DB_DATABASE
- JWT_SECRET
- PORT
- CORS_ORIGIN

## Importante

El proyecto requiere que la base de datos creada coincida con el esquema actual. El SQL de referencia se documenta en [DOCUMENTACION/sql/DataBaseHappyKids_CORREGIDA.sql](../DOCUMENTACION/sql/DataBaseHappyKids_CORREGIDA.sql).
