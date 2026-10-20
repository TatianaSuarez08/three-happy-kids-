import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { pool } from '../src/db.js';
import { verifyPassword } from '../src/services/passwordService.js';
import { buildRolePermissions } from '../src/middleware/role.js';

const api = process.env.BACKEND_URL || `http://localhost:${process.env.BACKEND_PORT || process.env.PORT || 3002}`;
const email = `bcrypt.integration.${Date.now()}@example.com`;
const suffix = Date.now();
const documentNumber = String(suffix);
const originalPassword = 'Original123!';
const updatedPassword = 'Updated123!';
let userId;
let orderId;
const orderIds = [];
let orderedProductId;
let orderedQuantity = 1;

const requestJson = async (path, options) => {
  const response = await fetch(`${api}${path}`, options);
  const body = await response.json();
  return { response, body };
};

try {
  const documentTypes = await requestJson('/tipos-documento');
  assert.equal(documentTypes.response.status, 200);
  assert.ok(documentTypes.body.documentTypes.length > 0);
  const documentTypeId = documentTypes.body.documentTypes[0].id;

  const registration = await requestJson('/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre_usuario: `bcrypt_${Date.now()}`,
      email,
      password: originalPassword,
      confirmar_password: originalPassword,
      primer_nombre: 'Bcrypt',
      primer_apellido: 'Integration',
      numero_documento: documentNumber,
      id_tipo_documento: documentTypeId,
      telefono: '3000000000',
      direccion: 'Calle de integración',
      ciudad: 'Bogotá'
    })
  });
  assert.equal(registration.response.status, 201);
  userId = registration.body.user.id;
  assert.equal('password' in registration.body.user, false);
  assert.equal('passwordHash' in registration.body.user, false);

  const [rows] = await pool.execute('SELECT contrasena FROM usuario WHERE correo = ?', [email]);
  assert.equal(rows.length, 1);
  assert.match(rows[0].contrasena, /^\$2[aby]\$\d{2}\$/);
  assert.equal(await verifyPassword(originalPassword, rows[0].contrasena), true);

  const wrongLogin = await requestJson('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Wrong123!' })
  });
  assert.equal(wrongLogin.response.status, 401);

  const login = await requestJson('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: originalPassword })
  });
  assert.equal(login.response.status, 200);

  const profile = await requestJson('/me', {
    headers: { Authorization: `Bearer ${login.body.token}` }
  });
  assert.equal(profile.response.status, 200);
  assert.equal(profile.body.user.esCliente, 1);
  assert.equal(profile.body.user.direccion, 'Calle de integración');
  assert.equal('password' in profile.body.user, false);
  assert.equal('passwordHash' in profile.body.user, false);

  const update = await requestJson('/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${login.body.token}`
    },
    body: JSON.stringify({
      nombre: 'Bcrypt Integration',
      email,
      telefono: '3000000000',
      direccion: 'Avenida de integración',
      password: updatedPassword
    })
  });
  assert.equal(update.response.status, 200);

  const updatedProfile = await requestJson('/me', {
    headers: { Authorization: `Bearer ${login.body.token}` }
  });
  assert.equal(updatedProfile.response.status, 200);
  assert.equal(updatedProfile.body.user.direccion, 'Avenida de integración');

  const oldLogin = await requestJson('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: originalPassword })
  });
  assert.equal(oldLogin.response.status, 401);

  const newLogin = await requestJson('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: updatedPassword })
  });
  assert.equal(newLogin.response.status, 200);

  const [products] = await pool.execute(
    `SELECT p.id, i.cantidad_disponible
     FROM producto p
     JOIN inventario i ON i.id_producto = p.id
    WHERE p.estado = 'Activo' AND i.cantidad_disponible >= 2
     ORDER BY p.id
     LIMIT 1`
  );
  assert.ok(products[0], 'Se requiere al menos un producto activo con stock para probar checkout');
  orderedProductId = products[0].id;
  const order = await requestJson('/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${newLogin.body.token}` },
    body: JSON.stringify({
      direccion: 'Calle de integración',
      ciudad: 'Bogotá',
      telefono: '3000000000',
      pago: 'Efectivo',
      productos: [{ id: orderedProductId, cantidad: orderedQuantity }]
    })
  });
  assert.equal(order.response.status, 201);
  orderId = order.body.id;
  orderIds.push(orderId);
  const [stockAfterOrder] = await pool.execute('SELECT cantidad_disponible FROM inventario WHERE id_producto = ?', [orderedProductId]);
  assert.equal(stockAfterOrder[0].cantidad_disponible, products[0].cantidad_disponible - orderedQuantity);
  const reference = `Pedido #${orderId}`;
  const [saleMovements] = await pool.execute(
    'SELECT tipo, delta FROM inventario_movimiento WHERE referencia = ? ORDER BY id',
    [reference]
  );
  assert.deepEqual(saleMovements.map((movement) => [movement.tipo, Number(movement.delta)]), [['salida', -orderedQuantity]]);

  const messengerToken = jwt.sign(
    { id: userId, roles: ['mensajero'], permissions: buildRolePermissions(['mensajero']) },
    process.env.JWT_SECRET
  );
  const messengerHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${messengerToken}` };
  const forbiddenCancel = await requestJson(`/pedidos/${orderId}/estado`, {
    method: 'PUT',
    headers: messengerHeaders,
    body: JSON.stringify({ estado: 'Cancelado' })
  });
  assert.equal(forbiddenCancel.response.status, 403);

  const startDelivery = await requestJson(`/pedidos/${orderId}/estado`, {
    method: 'PUT',
    headers: messengerHeaders,
    body: JSON.stringify({ estado: 'En camino' })
  });
  assert.equal(startDelivery.response.status, 200);

  const queueDuringDelivery = await requestJson('/logistica', { headers: { Authorization: `Bearer ${messengerToken}` } });
  assert.equal(queueDuringDelivery.response.status, 200);
  const queuedOrder = queueDuringDelivery.body.tasks.find((task) => task.idPedido === orderId);
  assert.equal(queuedOrder.estadoEntrega, 'En camino');
  assert.equal(queuedOrder.telefono, '3000000000');

  const completeDelivery = await requestJson(`/pedidos/${orderId}/estado`, {
    method: 'PUT',
    headers: messengerHeaders,
    body: JSON.stringify({ estado: 'Entregado' })
  });
  assert.equal(completeDelivery.response.status, 200);

  const queueAfterDelivery = await requestJson('/logistica', { headers: { Authorization: `Bearer ${messengerToken}` } });
  assert.equal(queueAfterDelivery.response.status, 200);
  assert.equal(queueAfterDelivery.body.tasks.some((task) => task.idPedido === orderId), false);

  const administratorToken = jwt.sign(
    { id: userId, roles: ['administrador'], permissions: buildRolePermissions(['administrador']) },
    process.env.JWT_SECRET
  );
  const reopen = await requestJson(`/pedidos/${orderId}/estado`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${administratorToken}` },
    body: JSON.stringify({ estado: 'Pendiente' })
  });
  assert.equal(reopen.response.status, 409);

  const cancellationOrder = await requestJson('/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${newLogin.body.token}` },
    body: JSON.stringify({
      direccion: 'Calle de integración',
      ciudad: 'Bogotá',
      telefono: '3000000000',
      pago: 'Efectivo',
      productos: [{ id: orderedProductId, cantidad: orderedQuantity }]
    })
  });
  assert.equal(cancellationOrder.response.status, 201);
  const cancellationOrderId = cancellationOrder.body.id;
  orderIds.push(cancellationOrderId);
  const cancel = await requestJson(`/pedidos/${cancellationOrderId}/estado`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${administratorToken}` },
    body: JSON.stringify({ estado: 'Cancelado' })
  });
  assert.equal(cancel.response.status, 200);
  const [stockAfterCancel] = await pool.execute('SELECT cantidad_disponible FROM inventario WHERE id_producto = ?', [orderedProductId]);
  assert.equal(stockAfterCancel[0].cantidad_disponible, products[0].cantidad_disponible - orderedQuantity);

  const duplicateCancel = await requestJson(`/pedidos/${cancellationOrderId}/estado`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${administratorToken}` },
    body: JSON.stringify({ estado: 'Cancelado' })
  });
  assert.equal(duplicateCancel.response.status, 409);
  const [stockAfterDuplicateCancel] = await pool.execute('SELECT cantidad_disponible FROM inventario WHERE id_producto = ?', [orderedProductId]);
  assert.equal(stockAfterDuplicateCancel[0].cantidad_disponible, products[0].cantidad_disponible - orderedQuantity);

  await pool.execute('UPDATE usuario SET activo = 0 WHERE id = ?', [userId]);
  const inactiveSession = await requestJson('/me', {
    headers: { Authorization: `Bearer ${newLogin.body.token}` }
  });
  assert.equal(inactiveSession.response.status, 401);

  console.log('password-flow.integration: auth, profile, checkout, messaging transitions and cancellation OK');
} finally {
  if (orderIds.length > 0) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const currentOrderId of orderIds) {
        const [deliveries] = await connection.execute('SELECT estado FROM entrega WHERE id_factura = ?', [currentOrderId]);
        const [details] = await connection.execute('SELECT id_producto, cantidad FROM detalle_pedido WHERE id_factura = ?', [currentOrderId]);
        if (deliveries[0]?.estado !== 'Cancelado') {
          for (const detail of details) {
            await connection.execute(
              'UPDATE inventario SET cantidad_disponible = cantidad_disponible + ?, fecha_actualizacion = CURRENT_DATE WHERE id_producto = ?',
              [detail.cantidad, detail.id_producto]
            );
          }
        }
        await connection.execute('DELETE FROM inventario_movimiento WHERE referencia = ?', [`Pedido #${currentOrderId}`]);
        await connection.execute('DELETE FROM pago WHERE id_factura = ?', [currentOrderId]);
        await connection.execute('DELETE FROM entrega WHERE id_factura = ?', [currentOrderId]);
        await connection.execute('DELETE FROM detalle_pedido WHERE id_factura = ?', [currentOrderId]);
        await connection.execute('DELETE FROM factura WHERE id = ?', [currentOrderId]);
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  if (userId) {
    await pool.execute('DELETE FROM cliente WHERE id_usuario = ?', [userId]);
    await pool.execute('DELETE FROM usuario_rol WHERE id_usuario = ?', [userId]);
    await pool.execute('DELETE FROM usuario WHERE id = ?', [userId]);
  }
  await pool.end();
}
