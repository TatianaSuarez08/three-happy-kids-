import { createHash } from 'node:crypto';

jest.mock('../../../models/UsuarioModel.js', () => ({
  consumePasswordResetToken: jest.fn(),
  findActiveUserForPasswordReset: jest.fn(),
  savePasswordResetToken: jest.fn()
}));
jest.mock('../../../utils/password.js', () => ({
  hashPassword: jest.fn()
}));
jest.mock('../../../services/emailService.js', () => ({
  sendEmployeeAccountEmail: jest.fn(),
  sendPasswordChangedEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn()
}));
jest.mock('../../../models/AdminUsuarioModel.js', () => ({
  createAdminUser: jest.fn(),
  deactivateUser: jest.fn(),
  findUsers: jest.fn(),
  updateAdminUser: jest.fn(),
  updateUserStatus: jest.fn()
}));

import {
  consumePasswordResetToken,
  findActiveUserForPasswordReset,
  savePasswordResetToken
} from '../../../models/UsuarioModel.js';
import { hashPassword } from '../../../utils/password.js';
import {
  sendEmployeeAccountEmail,
  sendPasswordChangedEmail,
  sendPasswordResetEmail
} from '../../../services/emailService.js';
import { createUser as createAdminUser } from '../../../controllers/AdminUsuarioController.js';
import { createAdminUser as persistAdminUser } from '../../../models/AdminUsuarioModel.js';
import {
  requestPasswordReset,
  resetPassword
} from '../../../controllers/PasswordRecoveryController.js';
import { createRateLimiter } from '../../../middleware/rateLimit.js';

const user = { id: 8, nombre: 'Ana Pérez', email: 'ana@example.com' };
const token = 'A'.repeat(43);

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  json: jest.fn()
});

describe('recuperación de contraseña', () => {
  let response;

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    response = createResponse();
    findActiveUserForPasswordReset.mockResolvedValue(user);
    savePasswordResetToken.mockResolvedValue(true);
    sendPasswordResetEmail.mockResolvedValue(undefined);
    hashPassword.mockResolvedValue('bcrypt-hash');
    consumePasswordResetToken.mockResolvedValue(user);
    sendPasswordChangedEmail.mockResolvedValue(undefined);
  });

  test('responde de forma genérica y solo persiste el hash del token aleatorio', async () => {
    await requestPasswordReset({ body: { email: ' Ana@Example.com ' } }, response);

    expect(findActiveUserForPasswordReset).toHaveBeenCalledWith('ana@example.com');
    const [userId, tokenHash] = savePasswordResetToken.mock.calls[0];
    const emailedToken = sendPasswordResetEmail.mock.calls[0][0].token;
    expect(userId).toBe(user.id);
    expect(tokenHash).toBe(createHash('sha256').update(emailedToken).digest('hex'));
    expect(tokenHash).not.toBe(emailedToken);
    expect(response.status).toHaveBeenCalledWith(202);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: expect.stringContaining('Si existe una cuenta')
    }));
    expect(JSON.stringify(response.json.mock.calls[0][0])).not.toContain(emailedToken);
  });

  test('usa la misma respuesta cuando el correo no corresponde a una cuenta activa', async () => {
    findActiveUserForPasswordReset.mockResolvedValueOnce(undefined);

    await requestPasswordReset({ body: { email: 'desconocido@example.com' } }, response);

    expect(response.status).toHaveBeenCalledWith(202);
    expect(response.json).toHaveBeenCalledWith({
      success: true,
      message: 'Si existe una cuenta asociada a este correo, recibirás instrucciones para restablecer tu contraseña.'
    });
    expect(savePasswordResetToken).not.toHaveBeenCalled();
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  test('mantiene respuesta genérica si falla el envío SMTP', async () => {
    sendPasswordResetEmail.mockRejectedValueOnce(new Error('SMTP no disponible'));
    const logError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await requestPasswordReset({ body: { email: user.email } }, response);

    expect(response.status).toHaveBeenCalledWith(202);
    expect(sendPasswordResetEmail).toHaveBeenCalled();
    expect(logError).toHaveBeenCalled();
  });

  test('rechaza correo inválido sin consultar usuarios', async () => {
    await requestPasswordReset({ body: { email: 'no-es-correo' } }, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(findActiveUserForPasswordReset).not.toHaveBeenCalled();
  });

  test('hashea y consume el token antes de confirmar el cambio', async () => {
    await resetPassword({
      body: { token, password: 'NuevaClave123', confirmar_password: 'NuevaClave123' }
    }, response);

    const expectedTokenHash = createHash('sha256').update(token).digest('hex');
    expect(hashPassword).toHaveBeenCalledWith('NuevaClave123');
    expect(consumePasswordResetToken).toHaveBeenCalledWith(expectedTokenHash, 'bcrypt-hash');
    expect(sendPasswordChangedEmail).toHaveBeenCalledWith({
      to: user.email,
      name: user.nombre
    });
    expect(response.json).toHaveBeenCalledWith({
      success: true,
      message: 'Contraseña actualizada correctamente',
      emailSent: true
    });
  });

  test.each([
    ['token inválido', { token: 'bad', password: 'NuevaClave123', confirmar_password: 'NuevaClave123' }],
    ['contraseña corta', { token, password: '123', confirmar_password: '123' }],
    ['contraseñas diferentes', { token, password: 'NuevaClave123', confirmar_password: 'OtraClave123' }]
  ])('rechaza %s antes de actualizar la contraseña', async (_case, body) => {
    await resetPassword({ body }, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(consumePasswordResetToken).not.toHaveBeenCalled();
  });

  test('rechaza token vencido, consumido o inexistente sin revelar cuál fue la causa', async () => {
    consumePasswordResetToken.mockResolvedValueOnce(null);

    await resetPassword({
      body: { token, password: 'NuevaClave123', confirmar_password: 'NuevaClave123' }
    }, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      error: 'El enlace de recuperación es inválido o expiró'
    });
    expect(sendPasswordChangedEmail).not.toHaveBeenCalled();
  });

  test('no convierte un fallo del correo de confirmación en fallo del cambio de contraseña', async () => {
    sendPasswordChangedEmail.mockRejectedValueOnce(new Error('SMTP no disponible'));
    const logError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await resetPassword({
      body: { token, password: 'NuevaClave123', confirmar_password: 'NuevaClave123' }
    }, response);

    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      emailSent: false
    }));
    expect(logError).toHaveBeenCalled();
  });
});

describe('notificación de cuentas de empleados', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    persistAdminUser.mockResolvedValue({
      id: 10,
      nombre: 'Luis',
      apellido: 'Gómez',
      correo: 'luis@example.com',
      rol: 'Bodeguero'
    });
    sendEmployeeAccountEmail.mockResolvedValue(undefined);
  });

  test('envía la notificación sin incluir la contraseña proporcionada', async () => {
    const response = createResponse();
    await createAdminUser({
      body: {
        nombre: 'Luis',
        apellido: 'Gómez',
        correo: 'luis@example.com',
        password: 'NoEnviar123',
        rol: 'Bodeguero'
      }
    }, response);

    expect(sendEmployeeAccountEmail).toHaveBeenCalledWith({
      to: 'luis@example.com',
      name: 'Luis Gómez'
    });
    expect(JSON.stringify(sendEmployeeAccountEmail.mock.calls[0])).not.toContain('NoEnviar123');
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      emailSent: true
    }));
  });

  test('reporta el fallo de notificación sin deshacer la cuenta de empleado', async () => {
    sendEmployeeAccountEmail.mockRejectedValueOnce(new Error('SMTP no disponible'));
    const response = createResponse();
    const logError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await createAdminUser({
      body: {
        nombre: 'Luis',
        apellido: 'Gómez',
        correo: 'luis@example.com',
        password: 'NoEnviar123',
        rol: 'Bodeguero'
      }
    }, response);

    expect(persistAdminUser).toHaveBeenCalledTimes(1);
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      emailSent: false
    }));
    expect(logError).toHaveBeenCalled();
  });
});

describe('límite de solicitudes de recuperación', () => {
  test('aplica el límite por IP y permite nuevas solicitudes al finalizar la ventana', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const limiter = createRateLimiter({ limit: 2, windowMs: 60000 });
    const next = jest.fn();
    const response = createResponse();
    const request = { ip: '192.0.2.1' };

    limiter(request, response, next);
    limiter(request, response, next);
    limiter(request, response, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(response.status).toHaveBeenCalledWith(429);
    expect(response.set).toHaveBeenCalledWith('Retry-After', '60');

    jest.advanceTimersByTime(60001);
    limiter(request, response, next);
    expect(next).toHaveBeenCalledTimes(3);
    jest.useRealTimers();
  });
});
