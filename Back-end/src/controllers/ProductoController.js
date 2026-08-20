import { unlink } from 'fs/promises';
import {
  createProduct,
  deactivateProduct,
  findProductById,
  findProducts,
  updateProduct
} from '../models/ProductoModel.js';

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export const getProducts = async (_req, res) => {
  try {
    const products = await findProducts();
    res.json({ success: true, products });
  } catch (error) {
    console.error('Error al consultar productos:', error);
    res.status(500).json({ error: 'No se pudieron consultar los productos' });
  }
};

export const getProduct = async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'El ID del producto no es válido' });
  }

  try {
    const product = await findProductById(id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json({ success: true, product });
  } catch (error) {
    console.error('Error al consultar producto:', error);
    res.status(500).json({ error: 'No se pudo consultar el producto' });
  }
};

export const addProduct = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precioCompra,
      precioVenta,
      marca,
      idCategoria,
      idTalla,
      idColor,
      stock,
      stockMinimo
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Debes seleccionar una imagen del producto' });
    }

    const parsedPrecioCompra = precioCompra === '' || precioCompra == null
      ? null
      : toNumber(precioCompra);
    const parsedPrecioVenta = toNumber(precioVenta);
    const parsedCategoria = Number.parseInt(idCategoria, 10);
    const parsedTalla = Number.parseInt(idTalla, 10);
    const parsedColor = Number.parseInt(idColor, 10);
    const parsedStock = Number.parseInt(stock, 10);
    const parsedStockMinimo = Number.parseInt(stockMinimo, 10);

    if (!nombre || nombre.trim().length < 3) {
      return res.status(400).json({ error: 'El nombre debe tener al menos 3 caracteres' });
    }

    if (parsedPrecioCompra !== null && parsedPrecioCompra < 0) {
      return res.status(400).json({ error: 'El precio de compra no puede ser negativo' });
    }

    if (!parsedPrecioVenta || parsedPrecioVenta < 0) {
      return res.status(400).json({ error: 'El precio de venta debe ser válido' });
    }

    if (![parsedCategoria, parsedTalla, parsedColor].every(Number.isInteger)) {
      return res.status(400).json({ error: 'Categoría, talla y color son obligatorios' });
    }

    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ error: 'El stock debe ser un número mayor o igual a cero' });
    }

    if (!Number.isInteger(parsedStockMinimo) || parsedStockMinimo < 0) {
      return res.status(400).json({ error: 'El stock mínimo debe ser un número mayor o igual a cero' });
    }

    const product = await createProduct({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim(),
      precioCompra: parsedPrecioCompra,
      precioVenta: parsedPrecioVenta,
      marca: marca?.trim(),
      imagen: `/assets/productos/${req.file.filename}`,
      idCategoria: parsedCategoria,
      idTalla: parsedTalla,
      idColor: parsedColor,
      stock: parsedStock,
      stockMinimo: parsedStockMinimo
    });

    res.status(201).json({
      success: true,
      message: 'Producto creado correctamente',
      product
    });
  } catch (error) {
    console.error('Error al crear producto:', error);

    if (req.file) {
      await unlink(req.file.path).catch(() => {});
    }

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe un producto con ese nombre' });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'La categoría, talla o color no existe' });
    }

    res.status(500).json({ error: 'No se pudo crear el producto' });
  }
};

const parseProductData = (body) => {
  const {
    nombre,
    descripcion,
    precioCompra,
    precioVenta,
    marca,
    idCategoria,
    idTalla,
    idColor,
    stock,
    stockMinimo
  } = body;

  const parsedPrecioCompra = precioCompra === '' || precioCompra == null
    ? null
    : toNumber(precioCompra);
  const parsedPrecioVenta = toNumber(precioVenta);
  const parsedCategoria = Number.parseInt(idCategoria, 10);
  const parsedTalla = Number.parseInt(idTalla, 10);
  const parsedColor = Number.parseInt(idColor, 10);
  const parsedStock = Number.parseInt(stock, 10);
  const parsedStockMinimo = Number.parseInt(stockMinimo, 10);

  if (!nombre || nombre.trim().length < 3) {
    return { error: 'El nombre debe tener al menos 3 caracteres' };
  }
  if (parsedPrecioCompra !== null && (parsedPrecioCompra === null || parsedPrecioCompra < 0)) {
    return { error: 'El precio de compra no es válido' };
  }
  if (parsedPrecioVenta === null || parsedPrecioVenta < 0) {
    return { error: 'El precio de venta debe ser válido' };
  }
  if (![parsedCategoria, parsedTalla, parsedColor].every(Number.isInteger)) {
    return { error: 'Categoría, talla y color son obligatorios' };
  }
  if (!Number.isInteger(parsedStock) || parsedStock < 0) {
    return { error: 'El stock debe ser un número mayor o igual a cero' };
  }
  if (!Number.isInteger(parsedStockMinimo) || parsedStockMinimo < 0) {
    return { error: 'El stock mínimo debe ser un número mayor o igual a cero' };
  }

  return {
    value: {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim(),
      precioCompra: parsedPrecioCompra,
      precioVenta: parsedPrecioVenta,
      marca: marca?.trim(),
      idCategoria: parsedCategoria,
      idTalla: parsedTalla,
      idColor: parsedColor,
      stock: parsedStock,
      stockMinimo: parsedStockMinimo
    }
  };
};

export const editProduct = async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) {
    if (req.file) await unlink(req.file.path).catch(() => {});
    return res.status(400).json({ error: 'El ID del producto no es válido' });
  }

  try {
    const parsed = parseProductData(req.body);
    if (parsed.error) {
      if (req.file) await unlink(req.file.path).catch(() => {});
      return res.status(400).json({ error: parsed.error });
    }

    const currentProduct = await findProductById(id);
    if (!currentProduct) {
      if (req.file) await unlink(req.file.path).catch(() => {});
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const updatedProduct = await updateProduct(id, {
      ...parsed.value,
      imagen: req.file ? `/assets/productos/${req.file.filename}` : null
    });

    if (req.file && currentProduct.imagen?.startsWith('/assets/productos/')) {
      const oldImagePath = new URL(`../../../Front-end/src${currentProduct.imagen}`, import.meta.url);
      await unlink(oldImagePath).catch(() => {});
    }

    res.json({ success: true, message: 'Producto actualizado correctamente', product: updatedProduct });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    if (req.file) await unlink(req.file.path).catch(() => {});

    if (error.code === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe un producto con ese nombre' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'La categoría, talla o color no existe' });
    }
    res.status(500).json({ error: 'No se pudo actualizar el producto' });
  }
};

export const removeProduct = async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'El ID del producto no es válido' });
  }

  try {
    const removed = await deactivateProduct(id);
    if (!removed) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json({ success: true, message: 'Producto desactivado correctamente' });
  } catch (error) {
    console.error('Error al desactivar producto:', error);
    res.status(500).json({ error: 'No se pudo desactivar el producto' });
  }
};
