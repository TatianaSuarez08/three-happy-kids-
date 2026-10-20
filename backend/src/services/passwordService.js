import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const configuredSaltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
export const SALT_ROUNDS = Number.isInteger(configuredSaltRounds) && configuredSaltRounds >= 10 && configuredSaltRounds <= 15
  ? configuredSaltRounds
  : 12;

export const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

export const verifyPassword = (password, hashedPassword) => {
  if (typeof hashedPassword !== 'string' || !hashedPassword.startsWith('$2')) return Promise.resolve(false);
  return bcrypt.compare(password, hashedPassword);
};

export const verifyPasswordAndUpgrade = async (password, storedHash) => {
  if (typeof storedHash !== 'string') return { valid: false, upgradedHash: null };

  if (storedHash.startsWith('$2')) {
    return { valid: await bcrypt.compare(password, storedHash), upgradedHash: null };
  }

  const legacyMatch = /^(?<salt>[a-f0-9]{32}):(?<digest>[a-f0-9]{64})$/i.exec(storedHash);
  if (!legacyMatch) return { valid: false, upgradedHash: null };

  const legacyDigest = crypto.createHash('sha256').update(legacyMatch.groups.salt + password).digest('hex');
  const valid = crypto.timingSafeEqual(Buffer.from(legacyDigest, 'hex'), Buffer.from(legacyMatch.groups.digest, 'hex'));
  return { valid, upgradedHash: valid ? await hashPassword(password) : null };
};
