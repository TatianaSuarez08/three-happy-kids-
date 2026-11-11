jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(() => ({
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message' }),
      verify: jest.fn().mockResolvedValue(true)
    }))
  }
}));
jest.mock('../../../config/env.js', () => ({
  env: {
    MAIL_HOST: 'smtp.example.test',
    MAIL_PORT: '587',
    MAIL_SECURE: false,
    MAIL_USER: '',
    MAIL_PASS: '',
    MAIL_FROM: 'HappyKids <no-reply@example.test>',
    FRONTEND_URL: 'https://happykids.example.test'
  }
}));

import nodemailer from 'nodemailer';
import {
  sendEmployeeAccountEmail,
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  verifyMailConnection
} from '../../../services/emailService.js';

test('configura SMTP y genera plantillas seguras con enlaces del frontend', async () => {
  await sendWelcomeEmail({ to: 'ana@example.test', name: '<Ana & Luis>' });
  await sendPasswordResetEmail({ to: 'ana@example.test', name: 'Ana', token: 'token-seguro' });
  await sendPasswordChangedEmail({ to: 'ana@example.test', name: 'Ana' });
  await sendEmployeeAccountEmail({ to: 'luis@example.test', name: 'Luis Gómez' });
  await verifyMailConnection();

  expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({
    host: 'smtp.example.test',
    port: 587,
    secure: false
  }));
  const transporter = nodemailer.createTransport.mock.results[0].value;
  expect(transporter.sendMail).toHaveBeenCalledTimes(4);
  expect(transporter.verify).toHaveBeenCalledTimes(1);

  const [welcome, recovery, changed, employee] = transporter.sendMail.mock.calls.map(([message]) => message);
  expect(welcome.html).toContain('&lt;Ana &amp; Luis&gt;');
  expect(welcome.text).toContain('<Ana & Luis>');
  expect(recovery.text).toContain('https://happykids.example.test/recuperar-pass?token=token-seguro');
  expect(recovery.text).toContain('20 minutos');
  expect(changed.subject).toContain('contraseña');
  expect(employee.text).toContain('no incluye ninguna contraseña');
  expect(employee.text).not.toContain('contraseña:');
});
