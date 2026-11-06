jest.mock('../../../config/env.js', () => ({
  env: { JWT_SECRET: 'test-secret' }
}));
jest.mock('../../../models/UsuarioModel.js', () => ({
  createUser: jest.fn(),
  findUserByEmail: jest.fn(),
  findUserProfile: jest.fn(),
  listActiveDocumentTypes: jest.fn(),
  updatePassword: jest.fn(),
  updateUserProfilePhoto: jest.fn()
}));
jest.mock('../../../utils/password.js', () => ({
  hashPassword: jest.fn(),
  verifyPassword: jest.fn()
}));

import {
  createUser,
  findUserByEmail,
  findUserProfile,
  listActiveDocumentTypes,
  updatePassword,
  updateUserProfilePhoto
} from '../../../models/UsuarioModel.js';
import { hashPassword, verifyPassword } from '../../../utils/password.js';
import {
  getDocumentTypes,
  getMyProfile,
  loginUser,
  registerUser,
  updateMyProfilePhoto
} from '../../../controllers/UsuarioController.js';

const validRegistration = {
  nombre_usuario: 'usuario_demo',
  email: 'demo@example.com',
  password: 'Clave123!',
  confirmar_password: 'Clave123!',
  primer_nombre: 'Ana',
  primer_apellido: 'Pérez',
  numero_documento: '12345678',
  id_tipo_documento: 1
};

const createdUser = {
  id: 7,
  nombre: 'usuario_demo',
  email: 'demo@example.com',
  telefono: null,
  fotoPerfil: null,
  idioma: 'es',
  roles: ['cliente']
};

describe('actualización de foto de perfil', () => {
  let response;

  beforeEach(() => {
    jest.clearAllMocks();
    findUserByEmail.mockResolvedValue(undefined);
    hashPassword.mockImplementation(async (password) => `hashed:${password}`);
    createUser.mockResolvedValue(createdUser);
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

  test('registra una cuenta, normaliza los datos y responde con token', async () => {
    const body = {
      ...validRegistration,
      nombre_usuario: ' usuario_demo ',
      email: ' DEMO@example.com ',
      primer_nombre: ' Ana ',
      primer_apellido: ' Pérez ',
      numero_documento: 12345678,
      id_tipo_documento: '1',
      telefono: ' 3001234567 ',
      direccion: ' Calle 1 ',
      ciudad: ' Bogotá '
    };

    await registerUser({ body }, response);

    expect(findUserByEmail).toHaveBeenCalledWith('demo@example.com');
    expect(hashPassword).toHaveBeenCalledWith('Clave123!');
    expect(createUser).toHaveBeenCalledWith({
      nombre_usuario: 'usuario_demo',
      email: 'demo@example.com',
      contrasena: 'hashed:Clave123!',
      idioma: 'es',
      primer_nombre: 'Ana',
      primer_apellido: 'Pérez',
      numero_documento: '12345678',
      id_tipo_documento: 1,
      telefono: '3001234567',
      direccion: 'Calle 1',
      ciudad: 'Bogotá'
    });
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({
      success: true,
      message: 'Usuario registrado correctamente',
      user: {
        id: 7,
        nombre: 'usuario_demo',
        email: 'demo@example.com',
        telefono: null,
        fotoPerfil: null,
        idioma: 'es',
        roles: ['cliente']
      },
      token: expect.any(String)
    });
  });

  test('registra opcionales vacíos como null y usa roles vacíos de manera segura', async () => {
    createUser.mockResolvedValueOnce({ ...createdUser, roles: undefined });

    await registerUser({ body: validRegistration }, response);

    expect(createUser).toHaveBeenCalledWith(expect.objectContaining({
      telefono: null,
      direccion: null,
      ciudad: null
    }));
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      user: expect.objectContaining({ roles: [] }),
      token: expect.any(String)
    }));
  });

  test.each([
    ['nombre_usuario', ''],
    ['email', ''],
    ['password', ''],
    ['confirmar_password', ''],
    ['primer_nombre', ''],
    ['primer_apellido', ''],
    ['numero_documento', ''],
    ['id_tipo_documento', '']
  ])('requiere el campo %s', async (field, value) => {
    const body = { ...validRegistration, [field]: value };

    await registerUser({ body }, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ error: 'Faltan datos obligatorios' });
    expect(createUser).not.toHaveBeenCalled();
  });

  test('maneja un body ausente y tipos no textuales en campos opcionales', async () => {
    await registerUser({}, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ error: 'Faltan datos obligatorios' });

    response.status.mockClear();
    response.json.mockClear();
    const body = {
      ...validRegistration,
      telefono: 3001234567,
      direccion: null,
      ciudad: {}
    };
    await registerUser({ body }, response);

    expect(createUser).toHaveBeenCalledWith(expect.objectContaining({
      telefono: null,
      direccion: null,
      ciudad: null
    }));
  });

  test('rechaza contraseñas diferentes, no textuales y cortas', async () => {
    await registerUser({
      body: { ...validRegistration, confirmar_password: 'Otra123!' }
    }, response);
    expect(response.json).toHaveBeenLastCalledWith({ error: 'Las contraseñas no coinciden' });

    await registerUser({
      body: { ...validRegistration, password: 123456, confirmar_password: 123456 }
    }, response);
    expect(response.json).toHaveBeenLastCalledWith({
      error: 'La contraseña debe tener al menos 6 caracteres'
    });

    await registerUser({
      body: { ...validRegistration, password: '123', confirmar_password: '123' }
    }, response);
    expect(response.json).toHaveBeenLastCalledWith({
      error: 'La contraseña debe tener al menos 6 caracteres'
    });
  });

  test.each(['ab', 'a'.repeat(51), 'usuario@demo'])(
    'rechaza un nombre de usuario inválido: %s',
    async (nombre_usuario) => {
      await registerUser({ body: { ...validRegistration, nombre_usuario } }, response);

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('El nombre solo puede contener')
      }));
    }
  );

  test.each([
    ['primer_nombre', 'Ana1'],
    ['primer_apellido', 'Pérez1']
  ])('rechaza caracteres inválidos en %s', async (field, value) => {
    await registerUser({ body: { ...validRegistration, [field]: value } }, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('El nombre y apellido')
    }));
  });

  test.each(['12A4', '9223372036854775808'])(
    'rechaza un número de documento inválido: %s',
    async (numero_documento) => {
      await registerUser({ body: { ...validRegistration, numero_documento } }, response);

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({
        error: 'El número de documento debe contener solo dígitos y ser válido'
      });
    }
  );

  test.each(['0', '1.5', '9007199254740992'])(
    'rechaza un tipo de documento inválido: %s',
    async (id_tipo_documento) => {
      await registerUser({ body: { ...validRegistration, id_tipo_documento } }, response);

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({
        error: 'Selecciona un tipo de documento válido'
      });
    }
  );

  test.each([
    ['telefono', '1'.repeat(21)],
    ['direccion', 'x'.repeat(151)],
    ['ciudad', 'x'.repeat(61)]
  ])('rechaza un campo de contacto que supera su longitud: %s', async (field, value) => {
    await registerUser({ body: { ...validRegistration, [field]: value } }, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      error: 'Revisa la longitud del teléfono, dirección o ciudad'
    });
  });

  test.each(['correo-invalido', 'x'.repeat(90) + '@example.com'])(
    'rechaza un correo inválido: %s',
    async (email) => {
      await registerUser({ body: { ...validRegistration, email } }, response);

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({ error: 'Formato de email inválido' });
    }
  );

  test('rechaza correos registrados y usuarios inactivos', async () => {
    findUserByEmail.mockResolvedValueOnce({ id: 9 });
    await registerUser({ body: validRegistration }, response);
    expect(response.status).toHaveBeenLastCalledWith(409);
    expect(response.json).toHaveBeenLastCalledWith({ error: 'El email ya está registrado' });

    findUserByEmail.mockRejectedValueOnce(new Error('El usuario está inactivo'));
    await registerUser({ body: validRegistration }, response);
    expect(response.status).toHaveBeenLastCalledWith(409);
    expect(response.json).toHaveBeenLastCalledWith({ error: 'El email ya está registrado' });

    findUserByEmail.mockRejectedValueOnce(new Error('db failure'));
    await registerUser({ body: validRegistration }, response);
    expect(response.status).toHaveBeenLastCalledWith(500);
    expect(response.json).toHaveBeenLastCalledWith({ error: 'Error al registrar el usuario' });
  });

  test.each([
    ['ER_DUP_ENTRY', 409, 'El nombre de usuario, correo o documento ya está registrado'],
    ['ER_NO_REFERENCED_ROW_2', 400, 'El tipo de documento seleccionado ya no está disponible'],
    ['DATABASE_ERROR', 500, 'Error al registrar el usuario']
  ])('traduce el error de registro %s', async (code, status, message) => {
    createUser.mockRejectedValueOnce(Object.assign(new Error('db failure'), { code }));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await registerUser({ body: validRegistration }, response);

    expect(response.status).toHaveBeenCalledWith(status);
    expect(response.json).toHaveBeenCalledWith({ error: message });
  });

  test('reporta errores al hashear la contraseña antes de crear la cuenta', async () => {
    hashPassword.mockRejectedValueOnce(new Error('hash failure'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await registerUser({ body: validRegistration }, response);

    expect(createUser).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ error: 'Error al registrar el usuario' });
  });

  test('devuelve tipos documentales y presenta errores del modelo', async () => {
    const documentTypes = [{ id: 1, sigla: 'CC', nombre: 'Cédula' }];
    listActiveDocumentTypes.mockResolvedValueOnce(documentTypes);

    await getDocumentTypes({}, response);
    expect(response.json).toHaveBeenCalledWith({ success: true, documentTypes });

    listActiveDocumentTypes.mockRejectedValueOnce(new Error('db failure'));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await getDocumentTypes({}, response);
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenLastCalledWith({
      error: 'No se pudieron consultar los tipos de documento'
    });
  });

  test('valida credenciales, correo y contraseña en el login', async () => {
    await loginUser({ body: { email: '', password: '' } }, response);
    expect(response.json).toHaveBeenLastCalledWith({ error: 'Faltan datos obligatorios' });

    await loginUser({ body: { email: 'invalido', password: 'Clave123!' } }, response);
    expect(response.json).toHaveBeenLastCalledWith({ error: 'Formato de email inválido' });

    await loginUser({ body: { email: 123, password: 'Clave123!' } }, response);
    expect(response.json).toHaveBeenLastCalledWith({ error: 'Faltan datos obligatorios' });

    await loginUser({ body: { email: 'demo@example.com' } }, response);
    expect(response.json).toHaveBeenLastCalledWith({ error: 'Faltan datos obligatorios' });

    await loginUser({}, response);
    expect(response.status).toHaveBeenLastCalledWith(500);
    expect(response.json).toHaveBeenLastCalledWith({ error: 'Error en el login' });
  });

  test('rechaza usuarios inexistentes y contraseñas incorrectas', async () => {
    findUserByEmail.mockResolvedValueOnce(undefined);
    await loginUser({ body: { email: 'demo@example.com', password: 'Clave123!' } }, response);
    expect(response.status).toHaveBeenLastCalledWith(401);

    findUserByEmail.mockResolvedValueOnce({ id: 7, password: 'hash' });
    verifyPassword.mockResolvedValueOnce({ valid: false, legacy: false });
    await loginUser({ body: { email: 'demo@example.com', password: 'incorrecta' } }, response);
    expect(response.status).toHaveBeenLastCalledWith(401);
    expect(response.json).toHaveBeenLastCalledWith({ error: 'Credenciales inválidas' });
  });

  test('inicia sesión y migra hashes heredados', async () => {
    const user = {
      id: 7,
      nombre: 'Ana',
      email: 'demo@example.com',
      password: 'legacy',
      roles: ['cliente']
    };
    findUserByEmail.mockResolvedValue(user);
    verifyPassword.mockResolvedValueOnce({ valid: true, legacy: true });

    await loginUser({ body: { email: ' DEMO@example.com ', password: 'Clave123!' } }, response);

    expect(findUserByEmail).toHaveBeenCalledWith('demo@example.com');
    expect(updatePassword).toHaveBeenCalledWith(7, 'hashed:Clave123!');
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Login exitoso',
      user: expect.objectContaining({ id: 7, roles: ['cliente'] }),
      token: expect.any(String)
    }));
  });

  test('inicia sesión sin roles y no actualiza un hash moderno', async () => {
    findUserByEmail.mockResolvedValueOnce({ ...createdUser, password: 'bcrypt', roles: undefined });
    verifyPassword.mockResolvedValueOnce({ valid: true, legacy: false });

    await loginUser({ body: { email: 'demo@example.com', password: 'Clave123!' } }, response);

    expect(updatePassword).not.toHaveBeenCalled();
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      user: expect.objectContaining({ roles: [] }),
      token: expect.any(String)
    }));
  });

  test.each([
    [new Error('El usuario está inactivo'), 403, 'El usuario está inactivo'],
    [new Error('db failure'), 500, 'Error en el login']
  ])('maneja errores de búsqueda durante el login', async (error, status, message) => {
    findUserByEmail.mockRejectedValueOnce(error);
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await loginUser({ body: { email: 'demo@example.com', password: 'Clave123!' } }, response);

    expect(response.status).toHaveBeenCalledWith(status);
    expect(response.json).toHaveBeenCalledWith({ error: message });
  });

  test.each([
    ['verify', new Error('verify failure')],
    ['upgrade', new Error('hash failure')],
    ['save', new Error('update failure')]
  ])('maneja errores durante la autenticación o actualización (%s)', async (step, error) => {
    findUserByEmail.mockResolvedValueOnce({ ...createdUser, password: 'legacy' });
    if (step === 'verify') verifyPassword.mockRejectedValueOnce(error);
    if (step === 'upgrade') verifyPassword.mockResolvedValueOnce({ valid: true, legacy: true });
    if (step === 'save') {
      verifyPassword.mockResolvedValueOnce({ valid: true, legacy: true });
      updatePassword.mockRejectedValueOnce(error);
    }
    if (step === 'upgrade') hashPassword.mockRejectedValueOnce(error);
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await loginUser({ body: { email: 'demo@example.com', password: 'Clave123!' } }, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ error: 'Error en el login' });
  });

  test('obtiene perfiles, reporta perfiles inexistentes y errores', async () => {
    findUserProfile.mockResolvedValueOnce({ id: 7, nombre: 'Ana' });
    await getMyProfile({ user: { id: 7 } }, response);
    expect(response.json).toHaveBeenCalledWith({
      success: true,
      user: { id: 7, nombre: 'Ana' }
    });

    findUserProfile.mockResolvedValueOnce(null);
    await getMyProfile({ user: { id: 7 } }, response);
    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenLastCalledWith({ error: 'Usuario no encontrado' });

    findUserProfile.mockRejectedValueOnce(new Error('db failure'));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await getMyProfile({ user: { id: 7 } }, response);
    expect(response.status).toHaveBeenLastCalledWith(500);
    expect(response.json).toHaveBeenLastCalledWith({
      error: 'No se pudo consultar el perfil'
    });
  });

  test('reporta perfiles fotográficos inexistentes y errores del modelo', async () => {
    updateUserProfilePhoto.mockResolvedValueOnce(false);
    await updateMyProfilePhoto(
      { file: { filename: 'foto.png' }, user: { id: 7 } },
      response
    );
    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenLastCalledWith({ error: 'Usuario no encontrado' });

    updateUserProfilePhoto.mockRejectedValueOnce(new Error('db failure'));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await updateMyProfilePhoto(
      { file: { filename: 'foto.png' }, user: { id: 7 } },
      response
    );
    expect(response.status).toHaveBeenLastCalledWith(500);
    expect(response.json).toHaveBeenLastCalledWith({
      error: 'No se pudo actualizar la foto de perfil'
    });
  });
});
