# Documentación de Three Happy Kids

Esta carpeta contiene la documentación consolidada del proyecto. Cada tema tiene una sola guía para evitar información repetida.

## Orden recomendado

1. `01-INICIO-Y-CONFIGURACION.md`: instalación, `.env` y ejecución.
2. `02-AUTENTICACION-SHA2-Y-JWT.md`: registro, login, SHA-256 con salt, roles y tokens.
3. `03-FRONTEND-RUTAS-Y-COMPRAS.md`: rutas, panel admin, sesión, menú, carrito y pedidos.
4. `04-BASE-DE-DATOS.md`: estructura MySQL, usuarios de prueba y consultas.
5. `05-CONSUMO-DE-LA-API-Y-SISTEMA.md`: endpoints, consumo desde React, JWT, roles y estado actual de la API.
6. `06-DIAGNOSTICO-BASE-DE-DATOS-Y-DASHBOARD.md`: revisión del esquema, riesgos, consultas y API necesaria para el dashboard.
7. `07-CAMBIOS-BASE-DE-DATOS-CORREGIDA.md`: explicación de los cambios aplicados al nuevo esquema SQL y sus motivos.
8. `sql/DataBaseHappyKids_CORREGIDA.sql`: esquema completo corregido, sin datos de prueba ni consultas `SELECT`.
9. `08-COMPARACION-PRODUCTO-Y-SUBIDA-DE-IMAGEN.md`: correspondencia de campos y flujo para guardar imágenes de productos.
10. `09-CONEXION-BD.md`: configuración, pruebas y diagnóstico de la conexión del backend con MySQL.
11. `sql/USUARIOS_SHA2_SETUP.sql`: crea roles y usuarios de prueba.
12. `sql/sql_insert_test_users.sql`: script adicional de datos de prueba.

La documentación describe el código actual. Para configurar el proyecto se necesita editar `Back-end/.env` y ejecutar los comandos indicados en la primera guía.

## Estado actual

- Autenticación con SHA-256 + salt y JWT.
- Sesión opcional: `localStorage` con “Recordarme” o `sessionStorage` para sesión temporal.
- Rutas administrativas protegidas por el rol `administrador`.
- El administrador también puede comprar desde el catálogo, usar el carrito y consultar sus pedidos.
- Menú adaptado para clientes y administradores.
- `Mis pedidos` con filtros por estado y detalles expandibles.
- Documentación antigua consolidada en esta carpeta para evitar versiones repetidas.
