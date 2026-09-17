import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const BCRYPT_ROUNDS = Number.parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

export const hashPassword = (password) => bcrypt.hash(password, BCRYPT_ROUNDS);

const verifyLegacyPassword = (password, storedHash) => {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash || hash.length !== 64) return false;
  const computedHash = crypto.createHash('sha256').update(salt + password).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash));
};

export const verifyPassword = async (password, storedHash) => {
  if (storedHash?.startsWith('$2a$') || storedHash?.startsWith('$2b$') || storedHash?.startsWith('$2y$')) {
    return { valid: await bcrypt.compare(password, storedHash), legacy: false };
  }

  return { valid: verifyLegacyPassword(password, storedHash || ''), legacy: true };
};