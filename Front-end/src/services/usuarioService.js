import { request } from './httpClient';

export const getMyProfile = () => request('/me');

export const updateMyProfilePhoto = (photo) => {
  const body = new FormData();
  body.append('foto', photo);
  return request('/me/foto', { method: 'PUT', body });
};

export const getUsers = () => request('/usuarios');

export const createUser = (user) => request('/usuarios', { method: 'POST', body: user });

export const updateUser = (id, user) => request(`/usuarios/${id}`, {
  method: 'PUT',
  body: JSON.stringify(user)
});

export const updateUserStatus = (id, activo) => request(`/usuarios/${id}/estado`, {
  method: 'PUT',
  body: JSON.stringify({ activo })
});

export const deactivateUser = (id) => request(`/usuarios/${id}`, { method: 'DELETE' });