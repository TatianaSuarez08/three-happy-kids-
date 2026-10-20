import pool from '../db.js';

export const findDashboardData = async () => {
  const [[stats]] = await pool.query(
    `SELECT
       (SELECT COALESCE(SUM(f.total), 0) FROM factura f WHERE f.estado <> 'Anulada') AS totalVentas,
       (SELECT COUNT(*) FROM factura) AS totalPedidos,
      (SELECT COUNT(DISTINCT u.id) FROM usuario u JOIN usuario_rol ur ON ur.id_usuario = u.id JOIN rol r ON r.id = ur.id_rol WHERE LOWER(r.nombre_rol) = 'cliente' AND u.activo = 1) AS totalClientes,
       (SELECT COUNT(*) FROM producto WHERE estado = 'Activo') AS totalProductos,
       (SELECT COUNT(*) FROM factura f LEFT JOIN entrega e ON e.id_factura = f.id WHERE COALESCE(e.estado, CASE f.estado WHEN 'Anulada' THEN 'Cancelado' ELSE 'Pendiente' END) = 'Pendiente') AS pedidosPendientes,
       (SELECT COUNT(*) FROM factura f JOIN entrega e ON e.id_factura = f.id WHERE e.estado = 'En camino') AS pedidosEnCamino,
       (SELECT COUNT(*) FROM factura f JOIN entrega e ON e.id_factura = f.id WHERE e.estado = 'Entregado') AS pedidosEntregados,
       (SELECT COUNT(*) FROM inventario i JOIN producto p ON p.id = i.id_producto WHERE p.estado = 'Activo' AND i.cantidad_disponible <= i.cantidad_minima) AS stockBajo`
  );

  const [recentOrders] = await pool.query(
    `SELECT
       f.id,
       DATE_FORMAT(f.fecha, '%Y-%m-%d') AS fecha,
       f.total,
       COALESCE(e.estado, CASE f.estado WHEN 'Anulada' THEN 'Cancelado' ELSE 'Pendiente' END) AS estado,
       CONCAT(c.primer_nombre, ' ', c.primer_apellido) AS cliente
     FROM factura f
     JOIN cliente c ON c.id = f.id_cliente
     LEFT JOIN entrega e ON e.id_factura = f.id
     ORDER BY f.id DESC
     LIMIT 5`
  );

  const [lowStock] = await pool.query(
    `SELECT p.nombre_producto AS nombre, t.nombre_talla AS talla,
            i.cantidad_disponible AS stock, i.cantidad_minima AS stockMin
     FROM inventario i
     JOIN producto p ON p.id = i.id_producto
     JOIN talla t ON t.id = p.id_talla
     WHERE p.estado = 'Activo' AND i.cantidad_disponible <= i.cantidad_minima
     ORDER BY i.cantidad_disponible ASC, p.nombre_producto
     LIMIT 5`
  );

  return { stats, recentOrders, lowStock };
};
