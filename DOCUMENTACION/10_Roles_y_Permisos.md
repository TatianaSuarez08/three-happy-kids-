# 10. Roles y permisos

## Roles detectados

Los roles reales que se observan en el código y la base de datos son:

- administrador
- cliente
- mensajero
- bodeguero (existente como opción, pero no completamente integrado)

## Implementación actual

El backend valida roles usando el middleware `permitRoles`. El frontend también valida permisos en `ProtectedRoute`, pero esto es solo una capa visual.

## Problemas reales

- No existe una tabla de permisos por módulo y acción.
- El sistema de roles es muy simple y no soporta una matriz granular de autorización.
- Se puede concluir que el backend no aplica permisos por acción, sino por rol general.

## Matriz recomendada

| Módulo | Acción | Administrador | Bodeguero | Mensajero | Cliente |
| --- | --- | --- | --- | --- | --- |
| Productos | Consultar | Sí | Sí | Sí | Sí |
| Productos | Crear | Sí | No | No | No |
| Productos | Editar | Sí | No | No | No |
| Inventario | Consultar | Sí | Sí | No | No |
| Inventario | Entrada | Sí | Sí | No | No |
| Inventario | Salida | Sí | Sí | No | No |
| Pedidos | Consultar | Sí | Sí | Sí | Sí |
| Pedidos | Preparar | Sí | Sí | No | No |
| Entregas | Gestionar | Sí | No | Sí | No |
| Usuarios | Gestionar | Sí | No | No | No |

## Recomendación

Para una versión robusta, se debe soportar un sistema de permisos como:

- productos.crear
- productos.editar
- inventario.consultar
- inventario.entrada
- inventario.salida
- pedidos.consultar
- pedidos.preparar
- usuarios.gestionar

Esto debe validarse en backend y no depender únicamente del frontend.
