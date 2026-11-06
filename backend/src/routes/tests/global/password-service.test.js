import { hashPassword, verifyPassword, verifyPasswordAndUpgrade, SALT_ROUNDS } from '../../../services/passwordService.js';
import { createHash } from 'node:crypto';
import {
  hashPassword as hashUtilityPassword,
  verifyPassword as verifyUtilityPassword
} from '../../../utils/password.js';

describe('servicio de contraseñas', () => {
  test('genera y verifica hashes bcrypt', async () => {
    const password = 'PruebaSegura123!';
    const hash = await hashPassword(password);

    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
    expect(SALT_ROUNDS).toBeGreaterThanOrEqual(10);
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
    await expect(verifyPassword('incorrecta', hash)).resolves.toBe(false);
    await expect(verifyPassword(password, 'legacy-format')).resolves.toBe(false);
  });

  test('actualiza un hash legacy válido a bcrypt sin cambiar la contraseña', async () => {
    const legacyHash = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:73a77058b69295dca5c4a46ea3ffe26b9c32ba2855726f0a2f467f1d79af43ca';
    const result = await verifyPasswordAndUpgrade('Legacy123!', legacyHash);

    expect(result.valid).toBe(true);
    expect(result.upgradedHash).toMatch(/^\$2[aby]\$\d{2}\$/);
  });

  test('verifica hashes bcrypt durante la validación y no los vuelve a actualizar', async () => {
    const password = 'ContraseñaBcrypt123!';
    const hash = await hashPassword(password);

    await expect(verifyPasswordAndUpgrade(password, hash)).resolves.toEqual({
      valid: true,
      upgradedHash: null
    });
    await expect(verifyPasswordAndUpgrade('incorrecta', hash)).resolves.toEqual({
      valid: false,
      upgradedHash: null
    });
  });

  test('maneja valores de hash y contraseñas inválidos en ambos validadores', async () => {
    expect(await verifyPassword('clave', null)).toBe(false);
    expect(await verifyPasswordAndUpgrade('clave', null)).toEqual({
      valid: false,
      upgradedHash: null
    });
    expect(await verifyPasswordAndUpgrade('clave', 'formato-inválido')).toEqual({
      valid: false,
      upgradedHash: null
    });

    const legacyPassword = 'ClaveLegacy123!';
    const salt = 'b'.repeat(32);
    const digest = createHash('sha256').update(`${salt}${legacyPassword}`).digest('hex');
    const legacyHash = `${salt}:${digest}`;

    await expect(verifyPasswordAndUpgrade('otra-clave', legacyHash)).resolves.toEqual({
      valid: false,
      upgradedHash: null
    });
    await expect(verifyUtilityPassword(legacyPassword, legacyHash)).resolves.toEqual({
      valid: true,
      legacy: true
    });
    await expect(verifyUtilityPassword('otra-clave', legacyHash)).resolves.toEqual({
      valid: false,
      legacy: true
    });
    await expect(verifyUtilityPassword(legacyPassword, 'sin-separador')).resolves.toEqual({
      valid: false,
      legacy: true
    });
    await expect(verifyUtilityPassword(legacyPassword, null)).resolves.toEqual({
      valid: false,
      legacy: true
    });
  });

  test('hashea y verifica contraseñas con la utilidad de autenticación', async () => {
    const hash = await hashUtilityPassword('ClaveSegura123!');

    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
    await expect(verifyUtilityPassword('ClaveSegura123!', hash)).resolves.toEqual({
      valid: true,
      legacy: false
    });
    await expect(verifyUtilityPassword('incorrecta', hash)).resolves.toEqual({
      valid: false,
      legacy: false
    });
    const alternatePrefix = `$2b$${hash.slice(4)}`;
    await expect(verifyUtilityPassword('ClaveSegura123!', alternatePrefix)).resolves.toEqual({
      valid: true,
      legacy: false
    });
  });

  test.each(['9', '16', 'no-numérico'])(
    'usa el número predeterminado de rondas cuando la configuración es %s',
    (configuredRounds) => {
      const originalValue = process.env.BCRYPT_SALT_ROUNDS;
      let rounds;
      process.env.BCRYPT_SALT_ROUNDS = configuredRounds;

      try {
        jest.isolateModules(() => {
          rounds = require('../../../services/passwordService.js').SALT_ROUNDS;
        });
      } finally {
        if (originalValue === undefined) delete process.env.BCRYPT_SALT_ROUNDS;
        else process.env.BCRYPT_SALT_ROUNDS = originalValue;
      }

      expect(rounds).toBe(12);
      expect(SALT_ROUNDS).toBeGreaterThanOrEqual(10);
    }
  );
});
