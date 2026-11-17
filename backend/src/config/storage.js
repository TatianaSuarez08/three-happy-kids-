import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const backendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const projectDirectory = path.resolve(backendDirectory, '..');
dotenv.config({ path: path.resolve(projectDirectory, '.env') });
dotenv.config({ path: path.resolve(backendDirectory, '.env') });

const configuredStorageDirectory = process.env.MEDIA_STORAGE_DIR;
const assetsDirectory = configuredStorageDirectory
  ? (path.isAbsolute(configuredStorageDirectory)
    ? path.resolve(configuredStorageDirectory)
    : path.resolve(projectDirectory, configuredStorageDirectory))
  : path.resolve(backendDirectory, 'storage/assets');

export const productImagesDirectory = path.resolve(assetsDirectory, 'productos');
export const profileImagesDirectory = path.resolve(assetsDirectory, 'foto_de_perfil');
export const deliveryImagesDirectory = path.resolve(assetsDirectory, 'entregas');
