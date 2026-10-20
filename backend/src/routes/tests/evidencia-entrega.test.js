import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  getImageMetadata,
  persistEvidenceImage,
  removeEvidenceImage
} from '../../services/evidenciaEntregaService.js';

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
});
