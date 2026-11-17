import crypto from 'node:crypto';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { productImagesDirectory, profileImagesDirectory } from '../config/storage.js';

export { productImagesDirectory, profileImagesDirectory };

fs.mkdirSync(productImagesDirectory, { recursive: true });
fs.mkdirSync(profileImagesDirectory, { recursive: true });

const allowedExtensionsByMimeType = new Map([
  ['image/jpeg', new Set(['.jpg', '.jpeg'])],
  ['image/png', new Set(['.png'])],
  ['image/webp', new Set(['.webp'])],
  ['image/gif', new Set(['.gif'])]
]);

export const isSupportedImageUpload = (file) => (
  allowedExtensionsByMimeType
    .get(file.mimetype)
    ?.has(path.extname(file.originalname).toLowerCase()) || false
);

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
  if (!isSupportedImageUpload(file)) {
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

const deliveryImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const uploadDeliveryEvidence = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, callback) => {
    if (!deliveryImageMimeTypes.has(file.mimetype)) {
      callback(new Error('La evidencia debe ser una imagen JPG, PNG o WEBP'));
      return;
    }
    callback(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }
});
