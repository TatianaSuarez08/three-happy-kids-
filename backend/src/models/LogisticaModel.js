import pool from '../db.js';

export const getLogisticaResumen = async ({ userId, isCourier = false } = {}) => {
  const [summary] = await pool.execute(`
    SELECT
      (SELECT COUNT(*) FROM factura WHERE estado = 'Pendiente') AS pedidosPendientes,
      (SELECT COUNT(*) FROM entrega WHERE estado IN ('Pendiente', 'Por recoger')) AS entregasPendientes,
      (SELECT COUNT(*)
       FROM inventario i
       JOIN producto p ON p.id = i.id_producto
       WHERE p.estado = 'Activo' AND i.cantidad_disponible <= i.cantidad_minima) AS productosBajoStock,
      (SELECT COUNT(*) FROM factura WHERE estado IN ('Pendiente', 'Pagada')) AS pedidosActivos
  `);

  const [tasks] = await pool.execute(`
    SELECT
      f.id AS idPedido,
      CONCAT(c.primer_nombre, ' ', c.primer_apellido) AS cliente,
      c.telefono,
      c.direccion,
      c.ciudad,
      COALESCE(e.estado, 'Pendiente') AS estadoEntrega,
      f.total,
      DATE_FORMAT(f.fecha, '%Y-%m-%d') AS fecha,
      (
        SELECT COUNT(*)
        FROM detalle_pedido dp
        WHERE dp.id_factura = f.id
      ) AS cantidadProductos,
      a.id_mensajero AS idMensajero,
      a.fecha_asignacion AS fechaAsignacion
    FROM factura f
    JOIN cliente c ON c.id = f.id_cliente
    LEFT JOIN entrega e ON e.id_factura = f.id
    LEFT JOIN asignacion_entrega a
      ON a.id_entrega = e.id AND a.estado = 'Activa'
    WHERE f.estado <> 'Anulada'
      AND e.estado IN ('Por recoger', 'En camino')
      AND (
        (? = 1 AND a.id_mensajero = ?)
        OR (? = 0 AND e.estado IN ('Por recoger', 'En camino'))
      )
    ORDER BY f.fecha DESC, f.id DESC
    LIMIT 12
  `, [isCourier ? 1 : 0, userId || null, isCourier ? 1 : 0]);

  return {
    summary: summary[0] || {
      pedidosPendientes: 0,
      entregasPendientes: 0,
      productosBajoStock: 0,
      pedidosActivos: 0
    },
    tasks: tasks || []
  };
};
