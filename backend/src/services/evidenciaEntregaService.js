import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const workingDirectory = path.resolve(process.cwd());
const projectRoot = path.basename(workingDirectory).toLowerCase() === 'backend'
  ? path.dirname(workingDirectory)
  : workingDirectory;
export const defaultDeliveryImagesDirectory = path.resolve(
  projectRoot,
  'Frontend/src/assets/entregas'
);

const imageTypes = [
  {
    mimeType: 'image/jpeg',
    extension: '.jpg',
    matches: (buffer) => buffer.length >= 3
      && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  },
  {
    mimeType: 'image/png',
    extension: '.png',
    matches: (buffer) => buffer.length >= 8
      && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  },
  {
    mimeType: 'image/webp',
    extension: '.webp',
    matches: (buffer) => buffer.length >= 12
      && buffer.toString('ascii', 0, 4) === 'RIFF'
      && buffer.toString('ascii', 8, 12) === 'WEBP'
  }
];

export const getImageMetadata = (buffer) => {
  if (!Buffer.isBuffer(buffer)) {
    const error = new Error('Debes seleccionar una imagen válida');
    error.code = 'INVALID_IMAGE';
    throw error;
  }

  const type = imageTypes.find(({ matches }) => matches(buffer));
  if (!type) {
    const error = new Error('La imagen debe ser JPEG, PNG o WebP válida');
    error.code = 'INVALID_IMAGE';
    throw error;
  }

  return { mimeType: type.mimeType, extension: type.extension, size: buffer.length };
};

export const persistEvidenceImage = async (buffer, { directory = defaultDeliveryImagesDirectory } = {}) => {
  const metadata = getImageMetadata(buffer);
  const filename = `${crypto.randomUUID()}${metadata.extension}`;
  const safeDirectory = path.resolve(directory);
  const filePath = path.resolve(safeDirectory, filename);
  if (path.dirname(filePath) !== safeDirectory) {
    throw new Error('No se pudo generar una ruta segura para la evidencia');
  }

  await fs.mkdir(safeDirectory, { recursive: true });
  await fs.writeFile(filePath, buffer, { flag: 'wx', mode: 0o600 });

  return {
    filename,
    relativePath: `entregas/${filename}`,
    filePath,
    ...metadata
  };
};

export const removeEvidenceImage = async (filename, { directory = defaultDeliveryImagesDirectory } = {}) => {
  if (typeof filename !== 'string' || !/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(filename)) {
    throw new Error('La referencia de evidencia no es válida');
  }

  const safeDirectory = path.resolve(directory);
  const filePath = path.resolve(safeDirectory, filename);
  if (path.dirname(filePath) !== safeDirectory) {
    throw new Error('La ruta de evidencia no es válida');
  }
  await fs.unlink(filePath);
};
