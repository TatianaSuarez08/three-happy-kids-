import { Router } from 'express';
import { changeUserStatus, createUser, editUser, getUsers, removeUser } from '../controllers/AdminUsuarioController.js';
import auth from '../middleware/autenticacion.js';
import permitRoles from '../middleware/role.js';

const router = Router();
const administrador = [auth, permitRoles('administrador')];

router.get('/usuarios', ...administrador, getUsers);
router.post('/usuarios', ...administrador, createUser);
router.put('/usuarios/:id', ...administrador, editUser);
router.put('/usuarios/:id/estado', ...administrador, changeUserStatus);
router.delete('/usuarios/:id', ...administrador, removeUser);

export default router;
