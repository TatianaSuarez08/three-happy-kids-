jest.mock('../../config/env.js', () => ({
  env: { JWT_SECRET: 'test-secret' }
}));
jest.mock('../../models/UsuarioModel.js', () => ({
  createUser: jest.fn(),
  findUserByEmail: jest.fn(),
  findUserProfile: jest.fn(),
  updatePassword: jest.fn(),
  updateUserProfilePhoto: jest.fn()
}));

import { updateUserProfilePhoto } from '../../models/UsuarioModel.js';
import { updateMyProfilePhoto } from '../../controllers/UsuarioController.js';

describe('actualización de foto de perfil', () => {
  let response;

  beforeEach(() => {
    jest.clearAllMocks();
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  test('guarda y devuelve la ruta de la imagen subida', async () => {
    updateUserProfilePhoto.mockResolvedValueOnce(true);

    await updateMyProfilePhoto(
      { file: { filename: 'perfil-123abc.png' }, user: { id: 7 } },
      response
    );

    expect(updateUserProfilePhoto).toHaveBeenCalledWith(
      7,
      '/assets/foto_de_perfil/perfil-123abc.png'
    );
    expect(response.json).toHaveBeenCalledWith({
      success: true,
      message: 'Foto de perfil actualizada correctamente',
      fotoPerfil: '/assets/foto_de_perfil/perfil-123abc.png'
    });
  });

  test('rechaza la solicitud si no se subió una imagen', async () => {
    await updateMyProfilePhoto({ user: { id: 7 } }, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      error: 'Selecciona una imagen de perfil'
    });
    expect(updateUserProfilePhoto).not.toHaveBeenCalled();
  });
});
