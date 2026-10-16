import { request, requestBlob } from './httpClient';

export const getLogistica = async () => {
  const data = await request('/logistica');
  return {
    summary: data?.summary || null,
    tasks: data?.tasks || []
  };
};

export const getAvailableDeliveries = async () => {
  const data = await request('/entregas/disponibles');
  return data?.deliveries || [];
};

export const assignDelivery = async (orderId) => {
  return request(`/pedidos/${orderId}/asignaciones`, {
    method: 'POST'
  });
};

export const getMyDeliveries = async () => {
  const data = await request('/mis-entregas');
  return data?.deliveries || [];
};

export const getAssignmentHistory = async (orderId) => {
  return request(`/pedidos/${orderId}/asignaciones`);
};

export const getDeliveryEvidence = async (orderId) => {
  const data = await request(`/pedidos/${orderId}/evidencias`);
  return data?.evidence || [];
};

export const confirmDelivery = async (orderId, image) => {
  const body = new FormData();
  body.append('evidencia', image);
  return request(`/pedidos/${orderId}/evidencias`, {
    method: 'POST',
    body
  });
};

export const getDeliveryEvidenceImage = async (evidenceId) => {
  return requestBlob(`/evidencias/${evidenceId}/archivo`);
};
