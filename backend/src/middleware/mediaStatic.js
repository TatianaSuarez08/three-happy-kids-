import express from 'express';
import { productImagesDirectory, profileImagesDirectory } from '../config/storage.js';

const imageOptions = {
  dotfiles: 'deny',
  etag: true,
  immutable: true,
  lastModified: true,
  maxAge: '1d'
};

export const mountPublicImageRoutes = (app) => {
  app.use('/media/productos', express.static(productImagesDirectory, imageOptions));
  app.use('/media/usuarios', express.static(profileImagesDirectory, imageOptions));

  app.use('/assets/productos', express.static(productImagesDirectory, imageOptions));
  app.use('/assets/foto_de_perfil', express.static(profileImagesDirectory, imageOptions));
};
