import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter;

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const getTransporter = () => {
  if (transporter) return transporter;

  const port = Number(env.MAIL_PORT);
  if (!env.MAIL_HOST || !Number.isInteger(port) || port < 1 || port > 65535 || !env.MAIL_FROM) {
    throw new Error('Configura MAIL_HOST, MAIL_PORT y MAIL_FROM para habilitar el envío de correos.');
  }
  if (Boolean(env.MAIL_USER) !== Boolean(env.MAIL_PASS)) {
    throw new Error('MAIL_USER y MAIL_PASS deben configurarse juntos.');
  }

  transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port,
    secure: env.MAIL_SECURE,
    ...(env.MAIL_USER ? { auth: { user: env.MAIL_USER, pass: env.MAIL_PASS } } : {}),
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000
  });

  return transporter;
};

const frontendLink = (pathname, query = {}) => {
  if (!env.FRONTEND_URL) {
    throw new Error('Configura FRONTEND_URL para generar enlaces de correo.');
  }

  let url;
  try {
    url = new URL(pathname, env.FRONTEND_URL);
  } catch {
    throw new Error('FRONTEND_URL debe ser una URL válida.');
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('FRONTEND_URL debe utilizar HTTP o HTTPS.');
  }
  if (url.username || url.password) {
    throw new Error('FRONTEND_URL no debe incluir credenciales.');
  }
  Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
};

const renderTemplate = ({ greeting, paragraphs, actionLabel, actionUrl }) => {
  const safeGreeting = escapeHtml(greeting);
  const safeParagraphs = paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
  const safeActionLabel = actionLabel ? escapeHtml(actionLabel) : '';
  const safeActionUrl = actionUrl ? escapeHtml(actionUrl) : '';
  const actionHtml = actionUrl
    ? `<p style="margin:28px 0"><a href="${safeActionUrl}" style="display:inline-block;padding:13px 22px;border-radius:8px;background:#a85e3d;color:#fff;text-decoration:none;font-weight:700">${safeActionLabel}</a></p><p style="font-size:13px;word-break:break-all">Si el botón no funciona, copia este enlace:<br>${safeActionUrl}</p>`
    : '';
  const text = [
    greeting,
    ...paragraphs,
    ...(actionUrl ? [`${actionLabel}: ${actionUrl}`] : []),
    'Three Happy Kids'
  ].join('\n\n');

  return {
    text,
    html: `<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta charset="utf-8"></head><body style="margin:0;padding:24px;background:#fff8f0;font-family:Arial,sans-serif;color:#3d302a"><main style="max-width:600px;margin:0 auto;padding:32px 28px;background:#fff;border:1px solid #f0e8e0;border-radius:16px"><p style="margin:0 0 8px;color:#a85e3d;font-size:12px;font-weight:700;letter-spacing:2px">THREE HAPPY KIDS</p><h1 style="margin:0 0 22px;font-size:24px">${safeGreeting}</h1><div style="font-size:15px;line-height:1.7">${safeParagraphs}${actionHtml}</div><p style="margin:30px 0 0;color:#7a6e68;font-size:12px">Mensaje automático de HappyKids. Si tienes dudas, contacta con el equipo administrador.</p></main></body></html>`
  };
};

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!to || !subject || !text || !html) {
    throw new Error('El destinatario y el contenido del correo son obligatorios.');
  }
  return getTransporter().sendMail({ from: env.MAIL_FROM, to, subject, text, html });
};

export const verifyMailConnection = async () => getTransporter().verify();

export const sendWelcomeEmail = async ({ to, name }) => {
  const content = renderTemplate({
    greeting: `Hola ${name}`,
    paragraphs: [
      'Tu cuenta de HappyKids se creó correctamente.',
      'Inicia sesión para descubrir el catálogo, guardar tus favoritos y consultar tus pedidos.'
    ],
    actionLabel: 'Ingresar a HappyKids',
    actionUrl: frontendLink('/login')
  });
  return sendEmail({ to, subject: '¡Te damos la bienvenida a HappyKids!', ...content });
};

export const sendPasswordResetEmail = async ({ to, name, token }) => {
  const content = renderTemplate({
    greeting: `Hola ${name}`,
    paragraphs: [
      'Recibimos una solicitud para cambiar la contraseña de tu cuenta.',
      'El enlace vence en 20 minutos y solo puede utilizarse una vez. Si no solicitaste este cambio, puedes ignorar este mensaje.'
    ],
    actionLabel: 'Restablecer contraseña',
    actionUrl: frontendLink('/recuperar-pass', { token })
  });
  return sendEmail({ to, subject: 'Restablece tu contraseña de HappyKids', ...content });
};

export const sendPasswordChangedEmail = async ({ to, name }) => {
  const content = renderTemplate({
    greeting: `Hola ${name}`,
    paragraphs: [
      'La contraseña de tu cuenta de HappyKids se actualizó correctamente.',
      'Si no realizaste este cambio, contacta al equipo administrador cuanto antes.'
    ],
    actionLabel: 'Iniciar sesión',
    actionUrl: frontendLink('/login')
  });
  return sendEmail({ to, subject: 'Tu contraseña fue actualizada', ...content });
};

export const sendEmployeeAccountEmail = async ({ to, name }) => {
  const content = renderTemplate({
    greeting: `Hola ${name}`,
    paragraphs: [
      'El administrador creó una cuenta de acceso para ti en HappyKids.',
      'Ingresa con las credenciales que te proporcionó el administrador. Por seguridad, este correo no incluye ninguna contraseña.'
    ],
    actionLabel: 'Ingresar a HappyKids',
    actionUrl: frontendLink('/login')
  });
  return sendEmail({ to, subject: 'Tu cuenta de HappyKids está lista', ...content });
};
