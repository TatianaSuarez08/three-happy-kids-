import { API_CONFIG, buildApiUrl } from '../config/index.js';
import { getStoredToken, readJsonResponse } from '../utils/helpers.js';

export const apiClient = async (path, options = {}) => {
  const token = getStoredToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = {
    ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

  try {
    const response = await fetch(buildApiUrl(path), {
      ...options,
      headers,
      signal: controller.signal,
    });

    const data = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(data?.error || data?.message || `Solicitud fallida (${response.status})`);
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('La solicitud tardó demasiado y fue cancelada.');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};
