export const API_BASE_URLS = [...new Set([
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
  import.meta.env.VITE_API_BACKUP_URL || 'http://localhost:3001'
])];
const API_PREFIX = '/api/v1';
const REQUEST_TIMEOUT_MS = 20000;
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const getStoredToken = () => {
  const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
  return storage.getItem('token');
};

const readJsonResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return response.json();
  const text = await response.text();
  return text ? { message: text } : {};
};

export const apiClient = async (path, options = {}) => {
  const token = getStoredToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const method = (options.method || 'GET').toUpperCase();
  const idempotencyKey = options.idempotencyKey
    || (MUTATING_METHODS.has(method) ? crypto.randomUUID() : undefined);
  const fetchOptions = { ...options };
  delete fetchOptions.idempotencyKey;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const headers = {
    ...(fetchOptions.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    ...(fetchOptions.headers || {}),
  };

  let lastError;
  for (const apiBaseUrl of API_BASE_URLS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(`${apiBaseUrl}${API_PREFIX}${normalizedPath}`, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });
      const data = await readJsonResponse(response);

      if (!response.ok) {
        const error = new Error(data?.error || data?.message || `Solicitud fallida (${response.status})`);
        if (![502, 503, 504].includes(response.status)) throw error;
        lastError = error;
        continue;
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        lastError = new Error('La solicitud tardó demasiado y fue cancelada.', { cause: error });
        continue;
      }
      if (error instanceof TypeError) {
        lastError = error;
        continue;
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new Error('No hay instancias disponibles para atender la solicitud.');
};
