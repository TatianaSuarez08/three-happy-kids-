import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import {
  defaultDeliveryImagesDirectory,
  getImageMetadata,
  persistEvidenceImage,
  removeEvidenceImage
} from '../../../services/evidenciaEntregaService.js';

const imageSamples = [
  {
    name: 'JPEG',
    bytes: Buffer.from([0xff, 0xd8, 0xff, 0x00]),
    mimeType: 'image/jpeg',
    extension: '.jpg'
  },
  {
    name: 'PNG',
    bytes: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    mimeType: 'image/png',
    extension: '.png'
  },
  {
    name: 'WebP',
    bytes: Buffer.from('RIFF0000WEBP'),
    mimeType: 'image/webp',
    extension: '.webp'
  }
];

describe('servicio de evidencia de entrega', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('identifica JPEG, PNG y WebP por la firma binaria', () => {
    imageSamples.forEach(({ bytes, mimeType, extension }) => {
      expect(getImageMetadata(bytes)).toEqual({
        mimeType,
        extension,
        size: bytes.length
      });
    });
  });

  test('rechaza contenidos que no tienen una firma de imagen admitida', () => {
    expect(() => getImageMetadata(Buffer.from('<svg></svg>'))).toThrow(
      expect.objectContaining({ code: 'INVALID_IMAGE' })
    );
    expect(() => getImageMetadata(Buffer.from([0xff, 0xd8]))).toThrow(
      expect.objectContaining({ code: 'INVALID_IMAGE' })
    );
    expect(() => getImageMetadata(Buffer.from([0xff, 0x00, 0xff]))).toThrow(
      expect.objectContaining({ code: 'INVALID_IMAGE' })
    );
    expect(() => getImageMetadata(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x00]))).toThrow(
      expect.objectContaining({ code: 'INVALID_IMAGE' })
    );
    expect(() => getImageMetadata(Buffer.from('RIFF000000XX'))).toThrow(
      expect.objectContaining({ code: 'INVALID_IMAGE' })
    );
    expect(() => getImageMetadata('image/jpeg')).toThrow(
      expect.objectContaining({ code: 'INVALID_IMAGE' })
    );
  });

  test('guarda con nombre exclusivo y persiste el contenido de la evidencia', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'happykids-evidence-'));
    try {
      const [sample] = imageSamples;
      const first = await persistEvidenceImage(sample.bytes, { directory });
      const second = await persistEvidenceImage(sample.bytes, { directory });

      expect(first.filename).not.toBe(second.filename);
      expect(first.extension).toBe(sample.extension);
      expect(first.relativePath).toBe(`entregas/${first.filename}`);
      expect(await fs.readFile(first.filePath)).toEqual(sample.bytes);

      await removeEvidenceImage(first.filename, { directory });
      await removeEvidenceImage(second.filename, { directory });
      await expect(fs.access(first.filePath)).rejects.toMatchObject({ code: 'ENOENT' });
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });

  test('rechaza nombres de evidencia inválidos sin acceder al sistema de archivos', async () => {
    await expect(removeEvidenceImage(undefined)).rejects.toThrow('La referencia de evidencia no es válida');
    await expect(removeEvidenceImage('../fuera.jpg')).rejects.toThrow('La referencia de evidencia no es válida');
  });

  test('rechaza una ruta resuelta fuera del directorio de evidencias', async () => {
    const safeDirectory = path.join(path.sep, 'safe-test');
    const outsidePath = path.join(path.sep, 'outside-test', 'photo.jpg');
    const resolve = jest.spyOn(path, 'resolve').mockImplementation((...segments) => {
      if (segments.length === 1 && segments[0] === 'safe-test') return safeDirectory;
      if (segments.length === 2 && segments[0] === safeDirectory) return outsidePath;
      return path.win32.resolve(...segments);
    });

    await expect(removeEvidenceImage(
      `${'a'.repeat(8)}-${'a'.repeat(4)}-${'a'.repeat(4)}-${'a'.repeat(4)}-${'a'.repeat(12)}.jpg`,
      { directory: 'safe-test' }
    )).rejects.toThrow('La ruta de evidencia no es válida');

    expect(resolve).toHaveBeenCalledTimes(2);
  });

  test('rechaza una ruta generada que intenta salir del directorio permitido', async () => {
    jest.spyOn(crypto, 'randomUUID').mockReturnValue('../fuera');

    await expect(persistEvidenceImage(imageSamples[0].bytes, { directory: 'evidencias-test' }))
      .rejects.toThrow('No se pudo generar una ruta segura para la evidencia');
  });

  test('usa el directorio por defecto al persistir y eliminar una evidencia', async () => {
    const mkdir = jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
    const writeFile = jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
    const unlink = jest.spyOn(fs, 'unlink').mockResolvedValue(undefined);

    const evidence = await persistEvidenceImage(imageSamples[0].bytes);
    await removeEvidenceImage(evidence.filename);

    expect(evidence.filePath).toBe(path.join(defaultDeliveryImagesDirectory, evidence.filename));
    expect(mkdir).toHaveBeenCalledWith(defaultDeliveryImagesDirectory, { recursive: true });
    expect(writeFile).toHaveBeenCalledWith(
      evidence.filePath,
      imageSamples[0].bytes,
      { flag: 'wx', mode: 0o600 }
    );
    expect(unlink).toHaveBeenCalledWith(evidence.filePath);
  });

  test('resuelve el directorio predeterminado cuando se importa desde la raíz del proyecto', () => {
    const originalDirectory = process.cwd();
    let isolatedService;

    try {
      process.chdir(path.dirname(originalDirectory));
      jest.isolateModules(() => {
        isolatedService = require('../../../services/evidenciaEntregaService.js');
      });
    } finally {
      process.chdir(originalDirectory);
    }

    expect(isolatedService.defaultDeliveryImagesDirectory).toBe(defaultDeliveryImagesDirectory);
  });
});
