import { Router } from 'express';
import { changeUserStatus, createUser, editUser, getUsers, removeUser } from '../controllers/AdminUsuarioController.js';
import auth from '../middleware/autenticacion.js';
import permitRoles from '../middleware/role.js';
import { uploadProfileImage } from '../middleware/subidaImagen.js';

const router = Router();
const administrador = [auth, permitRoles('administrador', { permission: 'usuarios:write' })];
const usuariosRead = [auth, permitRoles('administrador', { permission: 'usuarios:read' })];

router.get('/usuarios', ...usuariosRead, getUsers);
router.post('/usuarios', ...administrador, uploadProfileImage.single('foto'), createUser);
router.put('/usuarios/:id', ...administrador, editUser);
router.put('/usuarios/:id/estado', ...administrador, changeUserStatus);
router.delete('/usuarios/:id', ...administrador, removeUser);

export default router;
