import { API_BASE_URLS } from './apiClient';
import { getSessionToken, request } from './httpClient';

export const getOrders = async () => {
  const data = await request('/pedidos');
  return data?.orders || [];
};

export const getMyOrders = async () => {
  const data = await request('/mis-pedidos');
  return data?.orders || [];
};

export const createOrder = async (order, idempotencyKey) => {
  return request('/pedidos', {
    method: 'POST',
    body: JSON.stringify(order),
    idempotencyKey
  });
};

export const updateOrderStatus = async (orderId, estado) => {
  return request(`/pedidos/${orderId}/estado`, {
    method: 'PUT',
    body: JSON.stringify({ estado })
  });
};

export const getAvailableWarehouseOrders = async () => {
  const data = await request('/bodega/pedidos/disponibles');
  return data?.orders || [];
};

export const getMyWarehouseOrders = async () => {
  const data = await request('/bodega/pedidos/mios');
  return data?.orders || [];
};

export const assignWarehouseOrder = (orderId) => request(`/bodega/pedidos/${orderId}/asignar`, {
  method: 'POST'
});

export const releaseWarehouseOrder = (orderId) => request(`/bodega/pedidos/${orderId}/liberar`, {
  method: 'POST'
});

export const submitOrderPreparation = (orderId, productos) => request(`/bodega/pedidos/${orderId}/preparacion`, {
  method: 'PUT',
  body: JSON.stringify({ productos })
});

export const getAvailableCourierOrders = async () => {
  const data = await request('/mensajeria/pedidos/disponibles');
  return data?.orders || [];
};

export const getMyCourierOrders = async () => {
  const data = await request('/mensajeria/mis-entregas');
  return data?.orders || [];
};

export const getCourierHistory = async () => {
  const data = await request('/mensajeria/historial');
  return data?.history || [];
};

export const assignCourierOrder = (orderId) => request(`/mensajeria/pedidos/${orderId}/asignar`, {
  method: 'POST'
});

export const releaseCourierOrder = (orderId) => request(`/mensajeria/pedidos/${orderId}/liberar`, {
  method: 'POST'
});

export const updateCourierOrderStatus = (orderId, estado, observacion = '') => request(
  `/mensajeria/pedidos/${orderId}/estado`,
  { method: 'PUT', body: JSON.stringify({ estado, observacion }) }
);

export const uploadDeliveryEvidence = (orderId, file) => {
  const formData = new FormData();
  formData.append('evidencia', file);
  return request(`/mensajeria/pedidos/${orderId}/evidencia`, {
    method: 'POST',
    body: formData
  });
};

export const getDeliveryEvidenceObjectUrl = async (orderId) => {
  const token = getSessionToken();
  let lastError;
  for (const baseUrl of API_BASE_URLS) {
    let response;
    try {
      response = await fetch(`${baseUrl}/api/v1/mensajeria/pedidos/${orderId}/evidencia`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (err) {
      if (!(err instanceof TypeError)) throw err;
      lastError = err;
      continue;
    }
    if (!response.ok) {
      let message = 'No se pudo consultar la evidencia';
      try {
        const body = await response.json();
        message = body.error || message;
      } catch {
        message = 'No se pudo consultar la evidencia';
      }
      const error = new Error(message);
      if ([502, 503, 504].includes(response.status)) {
        lastError = error;
        continue;
      }
      throw error;
    }
    return URL.createObjectURL(await response.blob());
  }
  throw lastError || new Error('No hay instancias disponibles para consultar la evidencia.');
};

export const getOrderNovelties = async () => {
  const data = await request('/admin/novedades/pedidos');
  return data?.novelties || [];
};

export const resolveOrderNovelty = (noveltyId, decision) => request(
  `/admin/novedades/pedidos/${noveltyId}/resolver`,
  { method: 'PUT', body: JSON.stringify({ decision }) }
);
