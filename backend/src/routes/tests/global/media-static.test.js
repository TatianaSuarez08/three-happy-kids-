import express from 'express';
import request from 'supertest';

jest.mock('../../../config/storage.js', () => ({
  productImagesDirectory: require('node:path').resolve(__dirname, '../../../../storage/assets/productos'),
  profileImagesDirectory: require('node:path').resolve(__dirname, '../../../../storage/assets/foto_de_perfil')
}));

import { mountPublicImageRoutes } from '../../../middleware/mediaStatic.js';

const app = express();
mountPublicImageRoutes(app);

describe('acceso a imágenes públicas', () => {
  test('sirve las imágenes de producto bajo /media con caché y ETag', async () => {
    const response = await request(app).get('/media/productos/producto1.jpg');

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch(/^image\/jpeg/);
    expect(response.headers['cache-control']).toContain('max-age=86400');
    expect(response.headers.etag).toBeDefined();
  });

  test('mantiene disponible la ruta histórica de productos', async () => {
    const response = await request(app).get('/assets/productos/producto1.jpg');

    expect(response.statusCode).toBe(200);
  });

  test('no publica el directorio de evidencias de entrega', async () => {
    const response = await request(app).get('/media/entregas/evidencia.jpg');

    expect(response.statusCode).toBe(404);
  });
});
