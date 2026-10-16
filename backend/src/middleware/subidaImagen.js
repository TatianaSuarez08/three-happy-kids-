import crypto from 'crypto';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  defaultDeliveryImagesDirectory,
  getImageMetadata,
  persistEvidenceImage,
  removeEvidenceImage
} from '../services/evidenciaEntregaService.js';

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
export const productImagesDirectory = path.resolve(
  currentDirectory,
  '../../../Frontend/src/assets/productos'
);
export const profileImagesDirectory = path.resolve(
  currentDirectory,
  '../../../Frontend/src/assets/foto_de_perfil'
);
export const deliveryImagesDirectory = process.env.DELIVERY_IMAGES_DIR
  ? path.resolve(process.env.DELIVERY_IMAGES_DIR)
  : defaultDeliveryImagesDirectory;

const defaultDeliveryImageLimit = 5 * 1024 * 1024;
const configuredDeliveryImageLimit = process.env.DELIVERY_IMAGE_MAX_BYTES;
export const deliveryImageMaxBytes = configuredDeliveryImageLimit
  ? Number(configuredDeliveryImageLimit)
  : defaultDeliveryImageLimit;
if (!Number.isSafeInteger(deliveryImageMaxBytes) || deliveryImageMaxBytes < 1024 || deliveryImageMaxBytes > 20 * 1024 * 1024) {
  throw new Error('DELIVERY_IMAGE_MAX_BYTES debe ser un entero entre 1024 y 20971520');
}

fs.mkdirSync(productImagesDirectory, { recursive: true });
fs.mkdirSync(profileImagesDirectory, { recursive: true });
fs.mkdirSync(deliveryImagesDirectory, { recursive: true });

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, productImagesDirectory);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `producto-${crypto.randomUUID()}${extension}`);
  }
});

const fileFilter = (_req, file, callback) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(new Error('La imagen debe ser JPG, PNG, WEBP o GIF'));
    return;
  }

  callback(null, true);
};

export const uploadProductImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const profileStorage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, profileImagesDirectory);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `perfil-${crypto.randomUUID()}${extension}`);
  }
});

export const uploadProfileImage = multer({
  storage: profileStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadDeliveryEvidence = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: deliveryImageMaxBytes, files: 1 }
});

export { getImageMetadata, persistEvidenceImage, removeEvidenceImage };
