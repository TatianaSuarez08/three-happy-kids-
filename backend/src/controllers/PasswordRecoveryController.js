import { createHash, randomBytes } from 'node:crypto';
import {
  consumePasswordResetToken,
  findActiveUserForPasswordReset,
  savePasswordResetToken
} from '../models/UsuarioModel.js';
import { hashPassword } from '../utils/password.js';
import { sendPasswordChangedEmail, sendPasswordResetEmail } from '../services/emailService.js';

const genericRequestMessage = 'Si existe una cuenta asociada a este correo, recibirás instrucciones para restablecer tu contraseña.';
const isValidEmail = (email) => typeof email === 'string'
  && email.length <= 100
  && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const requestPasswordReset = async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!isValidEmail(email)) return res.status(400).json({ error: 'Formato de email inválido' });

  try {
    const user = await findActiveUserForPasswordReset(email);
    if (user) {
      const token = randomBytes(32).toString('base64url');
      const tokenHash = createHash('sha256').update(token).digest('hex');
      const saved = await savePasswordResetToken(user.id, tokenHash);

      if (saved) {
        try {
          await sendPasswordResetEmail({ to: user.email, name: user.nombre, token });
        } catch (error) {
          console.error('No se pudo enviar el correo de recuperación:', error.message);
        }
      }
    }

    return res.status(202).json({ success: true, message: genericRequestMessage });
  } catch (error) {
    console.error('Error al procesar la solicitud de recuperación:', error.message);
    return res.status(500).json({ error: 'No se pudo procesar la solicitud de recuperación' });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password, confirmar_password: confirmation } = req.body || {};
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return res.status(400).json({ error: 'El enlace de recuperación es inválido o expiró' });
  }
  if (typeof password !== 'string' || typeof confirmation !== 'string') {
    return res.status(400).json({ error: 'Completa ambos campos de contraseña' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }
  if (password !== confirmation) {
    return res.status(400).json({ error: 'Las contraseñas no coinciden' });
  }

  try {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const passwordHash = await hashPassword(password);
    const user = await consumePasswordResetToken(tokenHash, passwordHash);
    if (!user) return res.status(400).json({ error: 'El enlace de recuperación es inválido o expiró' });

    let emailSent = false;
    try {
      await sendPasswordChangedEmail({ to: user.email, name: user.nombre });
      emailSent = true;
    } catch (error) {
      console.error('No se pudo enviar la confirmación de cambio de contraseña:', error.message);
    }

    return res.json({
      success: true,
      message: 'Contraseña actualizada correctamente',
      emailSent
    });
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error.message);
    return res.status(500).json({ error: 'No se pudo actualizar la contraseña' });
  }
};
