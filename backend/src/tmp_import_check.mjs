// Importar módulos para comprobar errores de sintaxis sin iniciar el servidor
(async () => {
  try {
    await import('./db.js');
    await import('./models/UsuarioModel.js');
    await import('./controllers/UsuarioController.js');
    await import('./routes/UsuarioRoute.js');
    console.log('Import OK');
  } catch (e) {
    console.error('Import error:', e);
    process.exit(1);
  }
})();
