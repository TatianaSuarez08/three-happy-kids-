jest.mock('../../../db.js', () => ({
  __esModule: true,
  default: { getConnection: jest.fn() }
}));

import pool from '../../../db.js';
import {
  consumePasswordResetToken,
  savePasswordResetToken
} from '../../../models/UsuarioModel.js';

const connection = {
  beginTransaction: jest.fn(),
  commit: jest.fn(),
  execute: jest.fn(),
  release: jest.fn(),
  rollback: jest.fn()
};

describe('persistencia transaccional de recuperación', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.getConnection.mockResolvedValue(connection);
    connection.beginTransaction.mockResolvedValue(undefined);
    connection.commit.mockResolvedValue(undefined);
    connection.rollback.mockResolvedValue(undefined);
    connection.release.mockReturnValue(undefined);
  });

  test('guarda un solo token hasheado y limita reenvíos por usuario', async () => {
    connection.execute
      .mockResolvedValueOnce([[{ id: 8 }], []])
      .mockResolvedValueOnce([[{ en_espera: 0 }], []])
      .mockResolvedValueOnce([{ affectedRows: 1 }, []]);

    await expect(savePasswordResetToken(8, 'a'.repeat(64))).resolves.toBe(true);

    expect(connection.execute).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('SELECT id FROM usuario WHERE id = ? AND activo = 1 FOR UPDATE'),
      [8]
    );
    expect(connection.execute).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INTERVAL 1 MINUTE'),
      [8]
    );
    expect(connection.execute).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('INTERVAL 20 MINUTE'),
      [8, 'a'.repeat(64)]
    );
    expect(connection.commit).toHaveBeenCalledTimes(1);
    expect(connection.release).toHaveBeenCalledTimes(1);
  });

  test('no reemplaza el token durante el periodo de espera', async () => {
    connection.execute
      .mockResolvedValueOnce([[{ id: 8 }], []])
      .mockResolvedValueOnce([[{ en_espera: 1 }], []]);

    await expect(savePasswordResetToken(8, 'b'.repeat(64))).resolves.toBe(false);

    expect(connection.execute).toHaveBeenCalledTimes(2);
    expect(connection.commit).toHaveBeenCalledTimes(1);
  });

  test('actualiza la contraseña y marca usado el token en la misma transacción', async () => {
    connection.execute
      .mockResolvedValueOnce([[
        { id_usuario: 8 }
      ], []])
      .mockResolvedValueOnce([[
        { id: 8, nombre: 'Ana', email: 'ana@example.com' }
      ], []])
      .mockResolvedValueOnce([[{ id_usuario: 8 }], []])
      .mockResolvedValueOnce([{ affectedRows: 1 }, []])
      .mockResolvedValueOnce([{ affectedRows: 1 }, []]);

    await expect(consumePasswordResetToken('c'.repeat(64), 'bcrypt-hash')).resolves.toEqual({
      id: 8,
      nombre: 'Ana',
      email: 'ana@example.com'
    });

    expect(connection.execute.mock.calls[0][0]).toContain('SELECT id_usuario FROM recuperacion_contrasena');
    expect(connection.execute.mock.calls[1][0]).toContain('WHERE id = ? AND activo = 1');
    expect(connection.execute.mock.calls[2][0]).toContain('usado_en IS NULL');
    expect(connection.execute.mock.calls[2][0]).toContain('expira_en > UTC_TIMESTAMP()');
    expect(connection.execute).toHaveBeenNthCalledWith(
      4,
      'UPDATE usuario SET contrasena = ? WHERE id = ?',
      ['bcrypt-hash', 8]
    );
    expect(connection.execute.mock.calls[4][0]).toContain('SET usado_en = UTC_TIMESTAMP()');
    expect(connection.commit).toHaveBeenCalledTimes(1);
  });

  test('revierte y rechaza el token inválido, vencido, usado o de usuario inactivo', async () => {
    connection.execute.mockResolvedValueOnce([[], []]);

    await expect(consumePasswordResetToken('d'.repeat(64), 'bcrypt-hash')).resolves.toBeNull();

    expect(connection.rollback).toHaveBeenCalledTimes(1);
    expect(connection.execute).toHaveBeenCalledTimes(1);
    expect(connection.commit).not.toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalledTimes(1);
  });
});
