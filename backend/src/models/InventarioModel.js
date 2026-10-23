import pool from '../db.js';

export const findInventoryByProductId = async (productId) => {
  const [rows] = await pool.execute(
    `SELECT id, cantidad_disponible AS stock, cantidad_minima AS stockMinimo, fecha_actualizacion
     FROM inventario
     WHERE id_producto = ?`,
    [productId]
  );

  return rows[0] || null;
};

export const findInventoryMovementsByProductId = async (productId, usuarioId = null) => {
  const userFilter = usuarioId === null ? '' : 'AND m.id_usuario = ?';
  const values = usuarioId === null ? [productId] : [productId, usuarioId];
  const [rows] = await pool.execute(
    `SELECT
       m.id,
       m.id_producto,
       m.tipo,
       m.cantidad,
       m.delta,
       m.motivo,
       m.referencia,
       m.fecha_movimiento,
       COALESCE(u.nombre_usuario, 'Sistema') AS usuario
     FROM inventario_movimiento m
     LEFT JOIN usuario u ON u.id = m.id_usuario
     WHERE m.id_producto = ?
       ${userFilter}
     ORDER BY m.fecha_movimiento DESC, m.id DESC`,
    values
  );

  return rows;
};

export const findEmployeeActivity = async (usuarioId = null, filters = {}) => {
  const { rol = '', categoria = '', evento = '', desde = null, hasta = null } = filters;
  const [rows] = await pool.execute(
    `SELECT actividad.*,
            COALESCE((
              SELECT GROUP_CONCAT(r.nombre_rol ORDER BY r.nombre_rol SEPARATOR ', ')
              FROM usuario_rol ur
              JOIN rol r ON r.id = ur.id_rol
              WHERE ur.id_usuario = actividad.usuarioId
            ), 'Sin rol') AS rol
     FROM (
       SELECT
         CONCAT('inventario-', m.id) AS id,
         'Inventario' AS categoria,
         m.tipo AS evento,
         m.motivo AS descripcion,
         m.delta AS cantidad,
         m.fecha_movimiento AS fecha,
         u.id AS usuarioId,
         COALESCE(NULLIF(CONCAT_WS(' ', e.nombre, e.apellido), ''), u.nombre_usuario, 'Sistema') AS usuario,
         p.nombre_producto AS producto,
         NULL AS pedidoId
       FROM inventario_movimiento m
       JOIN producto p ON p.id = m.id_producto
       LEFT JOIN usuario u ON u.id = m.id_usuario
       LEFT JOIN empleado e ON e.id_usuario = u.id
       UNION ALL
       SELECT
         CONCAT('pedido-', h.id) AS id,
         'Pedido' AS categoria,
         h.evento,
         h.observacion AS descripcion,
         NULL AS cantidad,
         h.creado_en AS fecha,
         u.id AS usuarioId,
         COALESCE(NULLIF(CONCAT_WS(' ', e.nombre, e.apellido), ''), u.nombre_usuario) AS usuario,
         NULL AS producto,
         h.id_factura AS pedidoId
       FROM pedido_historial h
       JOIN usuario u ON u.id = h.id_usuario
       LEFT JOIN empleado e ON e.id_usuario = u.id
       UNION ALL
       SELECT
         CONCAT('novedad-compra-', n.id) AS id,
         'Recepción' AS categoria,
         n.tipo AS evento,
         n.descripcion,
         -n.cantidad AS cantidad,
         n.creada_en AS fecha,
         u.id AS usuarioId,
         COALESCE(NULLIF(CONCAT_WS(' ', e.nombre, e.apellido), ''), u.nombre_usuario) AS usuario,
         p.nombre_producto AS producto,
         NULL AS pedidoId
       FROM pedido_novedad n
       JOIN usuario u ON u.id = n.id_reporta
       LEFT JOIN empleado e ON e.id_usuario = u.id
       LEFT JOIN producto p ON p.id = n.id_producto
       WHERE n.id_compra IS NOT NULL
     ) actividad
     WHERE (? IS NULL OR actividad.usuarioId = ?)
       AND (? = '' OR EXISTS (
         SELECT 1
         FROM usuario_rol ur
         JOIN rol r ON r.id = ur.id_rol
         WHERE ur.id_usuario = actividad.usuarioId
           AND LOWER(r.nombre_rol) = LOWER(?)
       ))
       AND (? = '' OR actividad.categoria = ?)
       AND (? = '' OR actividad.evento LIKE CONCAT('%', ?, '%'))
       AND (? IS NULL OR DATE(actividad.fecha) >= ?)
       AND (? IS NULL OR DATE(actividad.fecha) <= ?)
     ORDER BY actividad.fecha DESC, actividad.id DESC`,
    [usuarioId, usuarioId, rol, rol, categoria, categoria, evento, evento, desde, desde, hasta, hasta]
  );

  return rows;
};

export const findInventoryActivityEmployees = async () => {
  const [rows] = await pool.execute(
    `SELECT u.id,
            COALESCE(NULLIF(CONCAT_WS(' ', e.nombre, e.apellido), ''), u.nombre_usuario) AS nombre,
            COALESCE(GROUP_CONCAT(r.nombre_rol ORDER BY r.nombre_rol SEPARATOR ', '), 'Sin rol') AS roles
     FROM usuario u
     LEFT JOIN empleado e ON e.id_usuario = u.id
     LEFT JOIN usuario_rol ur ON ur.id_usuario = u.id
     LEFT JOIN rol r ON r.id = ur.id_rol
     GROUP BY u.id, e.nombre, e.apellido, u.nombre_usuario
     ORDER BY nombre, u.id`
  );

  return rows;
};

export const findAdminActivityReports = async () => {
  const [rows] = await pool.execute(
    `SELECT r.id, r.actividad_id AS actividadId, r.id_factura AS pedidoId,
            r.id_usuario_reportado AS usuarioId, r.rol_reportado AS rol,
            r.motivo, r.descripcion, r.estado, r.creado_en AS fecha,
            reportado.nombre_usuario AS reportadoPor,
            administrador.nombre_usuario AS administrador
     FROM admin_reporte_actividad r
     JOIN usuario reportado ON reportado.id = r.id_usuario_reportado
     JOIN usuario administrador ON administrador.id = r.id_administrador
     ORDER BY (r.estado = 'Pendiente') DESC, r.creado_en DESC, r.id DESC`
  );
  return rows;
};

export const createAdminActivityReport = async ({
  adminId,
  usuarioId,
  rol,
  actividadId,
  motivo,
  descripcion
}) => {
  const parsed = String(actividadId).match(/^(inventario|pedido|novedad-compra)-(\d+)$/);
  if (!parsed) {
    throw Object.assign(new Error('La actividad seleccionada no es válida'), { code: 'ACTIVITY_NOT_FOUND' });
  }

  const [, source, rawId] = parsed;
  const numericActivityId = Number(rawId);
  if (!Number.isSafeInteger(numericActivityId) || numericActivityId <= 0) {
    throw Object.assign(new Error('La actividad seleccionada no es válida'), { code: 'ACTIVITY_NOT_FOUND' });
  }
  const sourceQueries = {
    inventario: 'SELECT id_usuario AS usuarioId, NULL AS pedidoId FROM inventario_movimiento WHERE id = ?',
    pedido: 'SELECT id_usuario AS usuarioId, id_factura AS pedidoId FROM pedido_historial WHERE id = ?',
    'novedad-compra': 'SELECT id_reporta AS usuarioId, NULL AS pedidoId FROM pedido_novedad WHERE id = ? AND id_compra IS NOT NULL'
  };
  const [activityRows] = await pool.execute(sourceQueries[source], [numericActivityId]);
  if (!activityRows.length || Number(activityRows[0].usuarioId) !== Number(usuarioId)) {
    throw Object.assign(new Error('La actividad seleccionada no existe o no corresponde al usuario'), { code: 'ACTIVITY_NOT_FOUND' });
  }

  const [roleRows] = await pool.execute(
    `SELECT r.nombre_rol
     FROM usuario_rol ur
     JOIN rol r ON r.id = ur.id_rol
     WHERE ur.id_usuario = ? AND LOWER(r.nombre_rol) = LOWER(?)`,
    [usuarioId, rol]
  );
  if (!roleRows.length) {
    throw Object.assign(new Error('El rol no corresponde al usuario seleccionado'), { code: 'INVALID_REPORT_ROLE' });
  }

  const [result] = await pool.execute(
    `INSERT INTO admin_reporte_actividad
       (id_administrador, id_usuario_reportado, rol_reportado, actividad_id,
        id_factura, motivo, descripcion)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [adminId, usuarioId, roleRows[0].nombre_rol, actividadId, activityRows[0].pedidoId, motivo, descripcion]
  );
  return { id: result.insertId };
};

export const findPurchasesForReceipt = async () => {
  const [rows] = await pool.execute(
    `SELECT
       c.id AS idCompra,
       c.fecha_compra AS fecha,
       c.total,
       c.estado,
       pr.nombre AS proveedor,
       dc.id AS idDetalle,
       dc.id_producto AS idProducto,
       p.nombre_producto AS producto,
       t.nombre_talla AS talla,
       co.nombre_color AS color,
       dc.cantidad AS cantidadSolicitada,
       COALESCE(recibido.cantidadRecibida, 0) + COALESCE(legado.cantidadRecibida, 0) AS cantidadRecibida
     FROM compra c
     JOIN proveedor pr ON pr.id = c.id_proveedor
     LEFT JOIN detalle_compra dc ON dc.id_compra = c.id
     LEFT JOIN producto p ON p.id = dc.id_producto
     LEFT JOIN talla t ON t.id = p.id_talla
     LEFT JOIN color co ON co.id = p.id_color
     LEFT JOIN (
       SELECT rd.id_detalle_compra, SUM(rd.cantidad_recibida) AS cantidadRecibida
       FROM compra_recepcion_detalle rd
       JOIN compra_recepcion r ON r.id = rd.id_recepcion
       GROUP BY rd.id_detalle_compra
     ) recibido ON recibido.id_detalle_compra = dc.id
     LEFT JOIN (
       SELECT id_producto, referencia, SUM(delta) AS cantidadRecibida
       FROM inventario_movimiento
       WHERE tipo = 'entrada' AND motivo = 'Recepción de compra'
       GROUP BY id_producto, referencia
     ) legado
       ON legado.id_producto = dc.id_producto
       AND legado.referencia = CONCAT('COMPRA:', c.id)
     ORDER BY c.fecha_compra DESC, c.id DESC, dc.id`
  );

  const purchasesById = new Map();
  rows.forEach((row) => {
    let purchase = purchasesById.get(row.idCompra);
    if (!purchase) {
      purchase = {
        id: row.idCompra,
        fecha: row.fecha,
        total: row.total,
        estado: row.estado,
        proveedor: row.proveedor,
        productos: [],
        recepciones: [],
        novedades: []
      };
      purchasesById.set(row.idCompra, purchase);
    }
    if (row.idDetalle !== null) {
      purchase.productos.push({
        idDetalle: row.idDetalle,
        idProducto: row.idProducto,
        nombre: row.producto,
        talla: row.talla,
        color: row.color,
        cantidadSolicitada: row.cantidadSolicitada,
        cantidadRecibida: Number(row.cantidadRecibida),
        cantidadPendiente: Number(row.cantidadSolicitada) - Number(row.cantidadRecibida)
      });
    }
  });

  const purchases = [...purchasesById.values()];
  if (!purchases.length) return purchases;

  const placeholders = purchases.map(() => '?').join(', ');
  const purchaseIds = purchases.map(({ id }) => id);
  const [receiptRows] = await pool.execute(
    `SELECT r.id AS idRecepcion, r.id_compra AS idCompra, r.recibida_en AS fecha,
            COALESCE(NULLIF(CONCAT_WS(' ', e.nombre, e.apellido), ''), u.nombre_usuario) AS empleado,
            d.id_detalle_compra AS idDetalle,
            d.cantidad_recibida AS cantidadRecibida,
            d.cantidad_danada AS cantidadDanada,
            p.nombre_producto AS producto,
            t.nombre_talla AS talla,
            co.nombre_color AS color
     FROM compra_recepcion r
     JOIN usuario u ON u.id = r.id_usuario
     LEFT JOIN empleado e ON e.id_usuario = u.id
     LEFT JOIN compra_recepcion_detalle d ON d.id_recepcion = r.id
     LEFT JOIN detalle_compra dc ON dc.id = d.id_detalle_compra
     LEFT JOIN producto p ON p.id = dc.id_producto
     LEFT JOIN talla t ON t.id = p.id_talla
     LEFT JOIN color co ON co.id = p.id_color
     WHERE r.id_compra IN (${placeholders})
     ORDER BY r.recibida_en DESC, r.id DESC, d.id`,
    purchaseIds
  );
  const receiptsByPurchase = new Map();
  receiptRows.forEach((row) => {
    let receipt = receiptsByPurchase.get(row.idRecepcion);
    if (!receipt) {
      receipt = {
        id: row.idRecepcion,
        idCompra: row.idCompra,
        fecha: row.fecha,
        empleado: row.empleado,
        productos: []
      };
      receiptsByPurchase.set(row.idRecepcion, receipt);
      const purchase = purchasesById.get(row.idCompra);
      purchase.recepciones.push(receipt);
    }
    if (row.idDetalle !== null) {
      receipt.productos.push({
        idDetalle: row.idDetalle,
        nombre: row.producto,
        talla: row.talla,
        color: row.color,
        cantidadRecibida: row.cantidadRecibida,
        cantidadDanada: row.cantidadDanada
      });
    }
  });

  const receiptReferences = purchaseIds.map((id) => `COMPRA:${id}`);
  const [legacyReceiptRows] = await pool.execute(
    `SELECT m.id, CAST(SUBSTRING(m.referencia, 8) AS UNSIGNED) AS idCompra,
            m.fecha_movimiento AS fecha,
            COALESCE(NULLIF(CONCAT_WS(' ', e.nombre, e.apellido), ''), u.nombre_usuario) AS empleado,
            dc.id AS idDetalle, m.cantidad AS cantidadRecibida,
            p.nombre_producto AS producto, t.nombre_talla AS talla,
            co.nombre_color AS color
     FROM inventario_movimiento m
     JOIN producto p ON p.id = m.id_producto
     JOIN detalle_compra dc ON dc.id_producto = p.id
     JOIN compra c ON c.id = dc.id_compra
     LEFT JOIN talla t ON t.id = p.id_talla
     LEFT JOIN color co ON co.id = p.id_color
     LEFT JOIN usuario u ON u.id = m.id_usuario
     LEFT JOIN empleado e ON e.id_usuario = u.id
     WHERE m.tipo = 'entrada'
       AND m.motivo = 'Recepción de compra'
       AND m.referencia IN (${placeholders})
       AND m.referencia = CONCAT('COMPRA:', c.id)
     ORDER BY m.fecha_movimiento DESC, m.id DESC`,
    receiptReferences
  );
  legacyReceiptRows.forEach((row) => {
    const purchase = purchasesById.get(row.idCompra);
    if (!purchase) return;
    purchase.recepciones.push({
      id: `historial-${row.id}`,
      idCompra: row.idCompra,
      fecha: row.fecha,
      empleado: row.empleado || 'Empleado sin identificar',
      productos: [{
        idDetalle: row.idDetalle,
        nombre: row.producto,
        talla: row.talla,
        color: row.color,
        cantidadRecibida: row.cantidadRecibida,
        cantidadDanada: 0
      }]
    });
  });

  const [noveltyRows] = await pool.execute(
    `SELECT n.id, n.id_compra AS idCompra,
            n.id_detalle_compra AS idDetalle, n.id_producto AS idProducto,
            p.nombre_producto AS producto, t.nombre_talla AS talla,
            co.nombre_color AS color, n.tipo, n.descripcion, n.cantidad,
            n.estado, n.decision, n.creada_en AS fecha,
            reporta.nombre_usuario AS reportadoPor,
            resuelve.nombre_usuario AS resueltoPor
     FROM pedido_novedad n
     LEFT JOIN producto p ON p.id = n.id_producto
     LEFT JOIN talla t ON t.id = p.id_talla
     LEFT JOIN color co ON co.id = p.id_color
     JOIN usuario reporta ON reporta.id = n.id_reporta
     LEFT JOIN usuario resuelve ON resuelve.id = n.id_resuelve
     WHERE n.id_compra IN (${placeholders})
     ORDER BY n.creada_en DESC, n.id DESC`,
    purchaseIds
  );
  noveltyRows.forEach((row) => {
    const purchase = purchasesById.get(row.idCompra);
    purchase.novedades.push({
      id: row.id,
      idDetalle: row.idDetalle,
      producto: row.producto,
      talla: row.talla,
      color: row.color,
      tipo: row.tipo,
      descripcion: row.descripcion,
      cantidad: row.cantidad,
      estado: row.estado,
      decision: row.decision,
      fecha: row.fecha,
      reportadoPor: row.reportadoPor,
      resueltoPor: row.resueltoPor
    });
  });

  return purchases;
};

export const findPurchaseCreationOptions = async () => {
  const [[providers], [products]] = await Promise.all([
    pool.execute(
      `SELECT id, nombre
       FROM proveedor
       WHERE estado = 'Activo'
       ORDER BY nombre`
    ),
    pool.execute(
      `SELECT id, nombre_producto AS nombre, precio_compra AS precioCompra,
              t.nombre_talla AS talla, c.nombre_color AS color
       FROM producto p
       JOIN talla t ON t.id = p.id_talla
       JOIN color c ON c.id = p.id_color
       WHERE p.estado = 'Activo' AND p.precio_compra IS NOT NULL
       ORDER BY p.nombre_producto`
    )
  ]);

  return { proveedores: providers, productos: products };
};

export const createPurchaseRecord = async (providerId, items) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [providers] = await connection.execute(
      `SELECT id FROM proveedor WHERE id = ? AND estado = 'Activo' FOR UPDATE`,
      [providerId]
    );
    if (!providers.length) {
      throw Object.assign(new Error('El proveedor no existe o está inactivo'), { code: 'PROVIDER_NOT_FOUND' });
    }

    const productIds = items.map((item) => item.productId);
    const placeholders = productIds.map(() => '?').join(', ');
    const [products] = await connection.execute(
      `SELECT id, precio_compra AS precioCompra
       FROM producto
       WHERE id IN (${placeholders}) AND estado = 'Activo' AND precio_compra IS NOT NULL
       FOR UPDATE`,
      productIds
    );
    if (products.length !== productIds.length) {
      throw Object.assign(new Error('Uno o más productos no existen o no tienen precio de compra'), { code: 'INVALID_PURCHASE_PRODUCTS' });
    }

    const prices = new Map(products.map((product) => [Number(product.id), Number(product.precioCompra)]));
    const lines = items.map((item) => ({
      ...item,
      price: prices.get(item.productId),
      subtotal: Math.round(prices.get(item.productId) * item.quantity * 100) / 100
    }));
    const total = Math.round(lines.reduce((sum, line) => sum + line.subtotal, 0) * 100) / 100;
    const [purchaseResult] = await connection.execute(
      `INSERT INTO compra (fecha_compra, total, estado, id_proveedor)
       VALUES (CURRENT_DATE, ?, 'Pendiente', ?)`,
      [total.toFixed(2), providerId]
    );
    for (const line of lines) {
      await connection.execute(
        `INSERT INTO detalle_compra (id_compra, id_producto, cantidad, precio, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [purchaseResult.insertId, line.productId, line.quantity, line.price, line.subtotal.toFixed(2)]
      );
    }
    await connection.commit();
    return { id: purchaseResult.insertId, total: total.toFixed(2), cantidadProductos: lines.length };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const receivePurchaseItems = async (
  purchaseId,
  userId,
  receivedItems,
  novelties,
  idempotencyKey
) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [purchaseRows] = await connection.execute(
      'SELECT id, estado FROM compra WHERE id = ? FOR UPDATE',
      [purchaseId]
    );
    if (!purchaseRows.length) {
      throw Object.assign(new Error('La compra no existe'), { code: 'PURCHASE_NOT_FOUND' });
    }
    const [duplicateReceipts] = await connection.execute(
      `SELECT id_compra AS idCompra FROM compra_recepcion
       WHERE clave_idempotencia = ? FOR UPDATE`,
      [idempotencyKey]
    );
    if (duplicateReceipts.length) {
      if (Number(duplicateReceipts[0].idCompra) !== purchaseId) {
        throw Object.assign(new Error('La clave ya se utilizó para otra recepción'), { code: 'IDEMPOTENCY_KEY_REUSED' });
      }
      const [openNovelties] = await connection.execute(
        `SELECT id FROM pedido_novedad
         WHERE id_compra = ? AND estado = 'Pendiente'
         LIMIT 1`,
        [purchaseId]
      );
      await connection.commit();
      return {
        estado: purchaseRows[0].estado,
        novedadesPendientes: openNovelties.length > 0,
        replayed: true
      };
    }
    if (['Recibida', 'Cancelada'].includes(purchaseRows[0].estado)) {
      throw Object.assign(new Error('La compra no admite más recepciones'), { code: 'PURCHASE_NOT_RECEIVABLE' });
    }

    const [lines] = await connection.execute(
      `SELECT id, id_producto AS idProducto, cantidad
       FROM detalle_compra
       WHERE id_compra = ?
       ORDER BY id
       FOR UPDATE`,
      [purchaseId]
    );
    if (!lines.length) {
      throw Object.assign(new Error('La compra no tiene productos registrados'), { code: 'PURCHASE_EMPTY' });
    }

    const [legacyReceivedRows] = await connection.execute(
      `SELECT id_producto AS idProducto, SUM(delta) AS cantidadRecibida
       FROM inventario_movimiento
       WHERE referencia = ? AND motivo = 'Recepción de compra' AND tipo = 'entrada'
       GROUP BY id_producto`,
      [`COMPRA:${purchaseId}`]
    );
    const receivedByProduct = new Map(
      legacyReceivedRows.map((row) => [Number(row.idProducto), Number(row.cantidadRecibida)])
    );
    const [newReceivedRows] = await connection.execute(
      `SELECT dc.id_producto AS idProducto, SUM(rd.cantidad_recibida) AS cantidadRecibida
       FROM compra_recepcion_detalle rd
       JOIN compra_recepcion r ON r.id = rd.id_recepcion
       JOIN detalle_compra dc ON dc.id = rd.id_detalle_compra
       WHERE r.id_compra = ?
       GROUP BY dc.id_producto`,
      [purchaseId]
    );
    newReceivedRows.forEach((row) => {
      const productId = Number(row.idProducto);
      receivedByProduct.set(
        productId,
        (receivedByProduct.get(productId) || 0) + Number(row.cantidadRecibida)
      );
    });
    const linesById = new Map(lines.map((line) => [Number(line.id), line]));
    const pendingUpdates = new Map();
    const receivedQuantityByDetail = new Map(
      receivedItems.map(({ idDetalle, cantidad }) => [idDetalle, cantidad])
    );
    receivedItems.forEach(({ idDetalle, cantidad }) => {
      const line = linesById.get(idDetalle);
      if (!line || pendingUpdates.has(idDetalle)) {
        throw Object.assign(new Error('La lista contiene un producto no válido o repetido'), { code: 'INVALID_RECEIPT_ITEMS' });
      }
      const alreadyReceived = receivedByProduct.get(Number(line.idProducto)) || 0;
      if (cantidad > Number(line.cantidad) - alreadyReceived || cantidad < 0) {
        throw Object.assign(new Error('La cantidad supera lo que falta por recibir'), { code: 'RECEIPT_EXCEEDS_ORDER' });
      }
      pendingUpdates.set(idDetalle, { line, cantidad, alreadyReceived });
    });
    const noveltiesByDetail = new Map();
    novelties.forEach((novelty) => {
      if (!linesById.has(novelty.idDetalle) || !novelty.cantidad || noveltiesByDetail.has(`${novelty.idDetalle}:${novelty.tipo}`)) {
        throw Object.assign(new Error('La lista de novedades contiene datos no válidos o repetidos'), { code: 'INVALID_RECEIPT_ITEMS' });
      }
      if (['Dañado', 'Talla incorrecta', 'Color incorrecto'].includes(novelty.tipo)
        && novelty.cantidad > (receivedQuantityByDetail.get(novelty.idDetalle) || 0)) {
        throw Object.assign(new Error('La cantidad no disponible supera las unidades recibidas'), { code: 'INVALID_RECEIPT_ITEMS' });
      }
      noveltiesByDetail.set(`${novelty.idDetalle}:${novelty.tipo}`, novelty);
    });
    const receivedAnything = [...pendingUpdates.values()].some(({ cantidad }) => cantidad > 0);
    if (!receivedAnything && !noveltiesByDetail.size) {
      throw Object.assign(new Error('Indica una cantidad recibida o reporta una novedad'), { code: 'INVALID_RECEIPT_ITEMS' });
    }

    const [receiptResult] = await connection.execute(
      `INSERT INTO compra_recepcion (id_compra, id_usuario, clave_idempotencia)
       VALUES (?, ?, ?)`,
      [purchaseId, userId, idempotencyKey]
    );
    const receiptId = receiptResult.insertId;
    for (const { line, cantidad } of pendingUpdates.values()) {
      if (cantidad <= 0) continue;
      const damagedNovelty = noveltiesByDetail.get(`${line.id}:Dañado`);
      const damagedQuantity = damagedNovelty?.cantidad || 0;
      const unusableTypes = ['Dañado', 'Talla incorrecta', 'Color incorrecto'];
      const unusableQuantity = [...noveltiesByDetail.values()]
        .filter((novelty) => novelty.idDetalle === Number(line.id) && unusableTypes.includes(novelty.tipo))
        .reduce((total, novelty) => total + novelty.cantidad, 0);
      if (unusableQuantity > cantidad) {
        throw Object.assign(new Error('Las unidades dañadas o de variante incorrecta superan las recibidas'), { code: 'INVALID_RECEIPT_ITEMS' });
      }
      await connection.execute(
        `INSERT INTO compra_recepcion_detalle
           (id_recepcion, id_detalle_compra, cantidad_recibida, cantidad_danada)
         VALUES (?, ?, ?, ?)`,
        [receiptId, line.id, cantidad, damagedQuantity]
      );

      const saleableQuantity = cantidad - unusableQuantity;
      if (saleableQuantity > 0) {
        await connection.execute(
          `INSERT INTO inventario (id_producto, cantidad_disponible, cantidad_minima, fecha_actualizacion)
           VALUES (?, ?, 0, CURRENT_DATE)
           ON DUPLICATE KEY UPDATE
             cantidad_disponible = cantidad_disponible + VALUES(cantidad_disponible),
             fecha_actualizacion = CURRENT_DATE`,
          [line.idProducto, saleableQuantity]
        );
        await connection.execute(
          `INSERT INTO inventario_movimiento
             (id_producto, tipo, cantidad, delta, motivo, referencia, id_usuario, fecha_movimiento)
           VALUES (?, 'entrada', ?, ?, 'Recepción de compra', ?, ?, NOW())`,
          [line.idProducto, saleableQuantity, saleableQuantity, `RECEPCION_COMPRA:${purchaseId}:${receiptId}`, userId]
        );
      }
      receivedByProduct.set(
        Number(line.idProducto),
        (receivedByProduct.get(Number(line.idProducto)) || 0) + cantidad
      );
      if (damagedQuantity > 0 && !damagedNovelty) {
        noveltiesByDetail.set(`${line.id}:Dañado`, {
          idDetalle: Number(line.id),
          tipo: 'Dañado',
          cantidad: damagedQuantity,
          descripcion: `Se recibieron ${cantidad} unidades; ${damagedQuantity} llegaron dañadas.`
        });
      }
    }

    for (const novelty of noveltiesByDetail.values()) {
      const line = linesById.get(novelty.idDetalle);
      await connection.execute(
        `INSERT INTO pedido_novedad
           (id_factura, id_compra, id_detalle_compra, id_producto, etapa, tipo, descripcion, cantidad, id_reporta)
         VALUES (NULL, ?, ?, ?, 'Recepción', ?, ?, ?, ?)`,
        [
          purchaseId,
          novelty.idDetalle,
          line.idProducto,
          novelty.tipo,
          novelty.descripcion,
          novelty.cantidad,
          userId
        ]
      );
    }

    const quantitiesComplete = lines.every((line) => (
      (receivedByProduct.get(Number(line.idProducto)) || 0) >= Number(line.cantidad)
    ));
    const [openNovelties] = await connection.execute(
      `SELECT id FROM pedido_novedad
       WHERE id_compra = ? AND estado = 'Pendiente'
       LIMIT 1`,
      [purchaseId]
    );
    const fullyReceived = quantitiesComplete && openNovelties.length === 0;
    if (fullyReceived) {
      await connection.execute(
        `UPDATE compra SET estado = 'Recibida' WHERE id = ?`,
        [purchaseId]
      );
    }

    await connection.commit();
    return {
      idRecepcion: receiptId,
      estado: fullyReceived ? 'Recibida' : purchaseRows[0].estado,
      novedadesPendientes: openNovelties.length > 0
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const adjustInventory = async ({ productId, tipo, cantidad, delta, motivo, referencia, usuarioId }) => {
  const normalizedTipo = String(tipo || 'ajuste').trim().toLowerCase();
  const numericCantidad = Number(cantidad);
  const numericDelta = Number(delta);

  if (!Number.isInteger(productId) || productId <= 0) {
    const error = new Error('El producto no es válido');
    error.code = 'INVALID_PRODUCT';
    throw error;
  }

  if (!['entrada', 'salida', 'ajuste'].includes(normalizedTipo)) {
    const error = new Error('El tipo de movimiento no es válido');
    error.code = 'INVALID_MOVEMENT_TYPE';
    throw error;
  }

  const finalDelta = Number.isFinite(numericDelta) ? numericDelta : normalizedTipo === 'salida' ? -Math.abs(Number(numericCantidad || 0)) : Math.abs(Number(numericCantidad || 0));

  if (!Number.isFinite(finalDelta)) {
    const error = new Error('El valor del movimiento no es válido');
    error.code = 'INVALID_DELTA';
    throw error;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [productRows] = await connection.execute(
      'SELECT id FROM producto WHERE id = ?',
      [productId]
    );

    if (productRows.length === 0) {
      const error = new Error('Producto no encontrado');
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    await connection.execute(
      `INSERT INTO inventario (id_producto, cantidad_disponible, cantidad_minima, fecha_actualizacion)
       VALUES (?, 0, 0, CURRENT_DATE)
       ON DUPLICATE KEY UPDATE id_producto = VALUES(id_producto)`,
      [productId]
    );

    const [inventoryRows] = await connection.execute(
      'SELECT cantidad_disponible FROM inventario WHERE id_producto = ? FOR UPDATE',
      [productId]
    );

    const currentStock = inventoryRows[0]?.cantidad_disponible ?? 0;
    const nextStock = currentStock + finalDelta;

    if (nextStock < 0) {
      const error = new Error('No hay suficiente stock para esta salida');
      error.code = 'INSUFFICIENT_STOCK';
      throw error;
    }

    await connection.execute(
      `INSERT INTO inventario (id_producto, cantidad_disponible, cantidad_minima, fecha_actualizacion)
       VALUES (?, ?, 0, CURRENT_DATE)
       ON DUPLICATE KEY UPDATE
         cantidad_disponible = VALUES(cantidad_disponible),
         fecha_actualizacion = CURRENT_DATE`,
      [productId, nextStock]
    );

    const movementQuantity = Math.abs(finalDelta);
    const [movementResult] = await connection.execute(
      `INSERT INTO inventario_movimiento
        (id_producto, tipo, cantidad, delta, motivo, referencia, id_usuario, fecha_movimiento)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        productId,
        normalizedTipo,
        movementQuantity,
        finalDelta,
        motivo || 'Ajuste de inventario',
        referencia || null,
        usuarioId || null
      ]
    );

    await connection.commit();

    return {
      id: movementResult.insertId,
      productId,
      tipo: normalizedTipo,
      cantidad: movementQuantity,
      delta: finalDelta,
      stockActual: nextStock,
      motivo: motivo || 'Ajuste de inventario',
      referencia: referencia || null
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
