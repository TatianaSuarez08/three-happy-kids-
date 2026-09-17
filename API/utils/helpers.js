export const readJsonResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return null;
};

export const getStoredToken = () => {
  const localToken = localStorage.getItem('token');
  if (localToken) return localToken;

  return sessionStorage.getItem('token');
};
