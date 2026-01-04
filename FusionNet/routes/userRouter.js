import express from 'express';
const router = express.Router();

import {
    createValidation, getUserValidation, updateValidation, 
    deleteValidation, acceptFriendRequestValidation, getFriendRequestsValidation, 
    blockUserValidation, validateDeleteFriend, validateUnlockUser
} from '../middlewares/userValidation.js';
//Es necesario importar los controladores para poder utilizarlos en las rutas y tambien los middleware 
import { 
    createUser, getUsers, findUser, 
    updateUser, deleteUser, acceptFriendRequest, 
    getFriendRequests, deleteFriend, blockUser,
    unlockUser, getNotifications, getUserByName, 
    getFriends, generateFeed, firstTime
} from '../controllers/userController.js';

//Rutas para manejo de usuarios 
router.post('/', createValidation, createUser);
router.get('/find/:username/:usernameFind', getUserValidation, findUser);
router.get('/users/:username', getUsers);
router.put('/:nameUpdate', updateValidation, updateUser);
router.delete('/:username', deleteValidation, deleteUser);
router.get('/notifications/get/:username', getNotifications);
router.get('/:username', getUserByName);
router.get('/feed/:username', generateFeed);

//Rutas para manejo de solicitudes de amistad
router.post('/friend/request/accept', acceptFriendRequestValidation, acceptFriendRequest);
router.get('/friend/request/:username', getFriendRequestsValidation,  getFriendRequests);

//Rutas para manejo de bloqueo de usuarios y eliminación de amigos
router.post('/block/:username', blockUserValidation, blockUser);
router.post('/unlock/:username', validateUnlockUser, unlockUser);
router.post('/friend/delete/:username', validateDeleteFriend, deleteFriend);
router.get('/friends/:username', getFriends);
//Ruta para manejo de primera vez que se inicia sesión 
router.get('/firstTime/:username', firstTime);

export default router;