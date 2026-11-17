import crypto from 'node:crypto';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const projectDirectory = path.resolve(currentDirectory, '../../..');
const defaultAssetsDirectory = path.resolve(projectDirectory, 'backend/storage/assets');
const assetsDirectory = process.env.MEDIA_STORAGE_DIR
  ? (path.isAbsolute(process.env.MEDIA_STORAGE_DIR)
    ? path.resolve(process.env.MEDIA_STORAGE_DIR)
    : path.resolve(projectDirectory, process.env.MEDIA_STORAGE_DIR))
  : defaultAssetsDirectory;
export const productImagesDirectory = path.resolve(assetsDirectory, 'productos');
export const profileImagesDirectory = path.resolve(assetsDirectory, 'foto_de_perfil');

fs.mkdirSync(productImagesDirectory, { recursive: true });
fs.mkdirSync(profileImagesDirectory, { recursive: true });

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
