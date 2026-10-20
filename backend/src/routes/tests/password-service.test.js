import { hashPassword, verifyPassword, verifyPasswordAndUpgrade, SALT_ROUNDS } from '../../services/passwordService.js';

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
});
