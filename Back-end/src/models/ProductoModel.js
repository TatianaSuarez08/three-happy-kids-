import pool from '../db.js';

export const findProducts = async () => {
  const [rows] = await pool.execute(
    `SELECT
       p.id,
       p.nombre_producto AS nombre,
       p.descripcion,
       p.precio_compra,
       p.precio_venta AS precio,
       p.marca,
       p.imagen_producto,
       p.estado,
       c.nombre_categoria AS categoria,
       t.nombre_talla AS talla,
       co.nombre_color AS color,
       COALESCE(i.cantidad_disponible, 0) AS stock,
       COALESCE(i.cantidad_minima, 0) AS stockMin
     FROM producto p
     JOIN categoria c ON c.id = p.id_categoria
     JOIN talla t ON t.id = p.id_talla
     JOIN color co ON co.id = p.id_color
     LEFT JOIN inventario i ON i.id_producto = p.id
     ORDER BY p.id DESC`
  );

  return rows;
};

export const findProductById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT
       p.id,
       p.nombre_producto AS nombre,
       p.descripcion,
       p.precio_compra AS precioCompra,
       p.precio_venta AS precioVenta,
       p.marca,
       p.imagen_producto AS imagen,
       p.id_categoria AS idCategoria,
       p.id_talla AS idTalla,
       p.id_color AS idColor,
       p.estado,
       COALESCE(i.cantidad_disponible, 0) AS stock,
       COALESCE(i.cantidad_minima, 0) AS stockMinimo
     FROM producto p
     LEFT JOIN inventario i ON i.id_producto = p.id
     WHERE p.id = ?`,
    [id]
  );

  return rows[0];
};

export const createProduct = async (productData) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [productResult] = await connection.execute(
      `INSERT INTO producto
        (nombre_producto, descripcion, precio_compra, precio_venta, marca,
         imagen_producto, id_categoria, id_talla, id_color, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Activo')`,
      [
        productData.nombre,
        productData.descripcion || null,
        productData.precioCompra ?? null,
        productData.precioVenta,
        productData.marca || null,
        productData.imagen || null,
        productData.idCategoria,
        productData.idTalla,
        productData.idColor
      ]
    );

    await connection.execute(
      `INSERT INTO inventario
        (cantidad_disponible, cantidad_minima, id_producto)
       VALUES (?, ?, ?)`,
      [productData.stock, productData.stockMinimo, productResult.insertId]
    );

    await connection.commit();

    return {
      id: productResult.insertId,
      nombre: productData.nombre,
      precio: productData.precioVenta,
      stock: productData.stock,
      stockMin: productData.stockMinimo,
      estado: 'Activo'
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateProduct = async (id, productData) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const imageClause = productData.imagen
      ? ', imagen_producto = ?'
      : '';
    const productParams = [
      productData.nombre,
      productData.descripcion || null,
      productData.precioCompra ?? null,
      productData.precioVenta,
      productData.marca || null,
      productData.idCategoria,
      productData.idTalla,
      productData.idColor
    ];

    if (productData.imagen) productParams.push(productData.imagen);
    productParams.push(id);

    const [productResult] = await connection.execute(
      `UPDATE producto
       SET nombre_producto = ?, descripcion = ?, precio_compra = ?,
           precio_venta = ?, marca = ?, id_categoria = ?, id_talla = ?,
           id_color = ?${imageClause}
       WHERE id = ?`,
      productParams
    );

    if (productResult.affectedRows === 0) {
      const error = new Error('Producto no encontrado');
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    await connection.execute(
      `INSERT INTO inventario (cantidad_disponible, cantidad_minima, id_producto)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         cantidad_disponible = VALUES(cantidad_disponible),
         cantidad_minima = VALUES(cantidad_minima),
         fecha_actualizacion = CURRENT_DATE`,
      [productData.stock, productData.stockMinimo, id]
    );

    await connection.commit();
    return findProductById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const deactivateProduct = async (id) => {
  const [result] = await pool.execute(
    `UPDATE producto SET estado = 'Inactivo' WHERE id = ?`,
    [id]
  );

  return result.affectedRows > 0;
};
