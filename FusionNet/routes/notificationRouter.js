import express from 'express';
const router = express.Router();
import { createValidation } from '../middlewares/notificationValidation.js';
import { createFriendRequestNotification, createMentionNotification, createLikeNotification, createCommentNotification, getAllFriendRequestsNotification, getAllLikeNotifications, getAllCommentNotifications,  getAllMentionNotifications, deleteNotification } from '../controllers/notificationController.js';

router.post('/friend/request', createValidation, createFriendRequestNotification) // crea una notificacion de solicitud de amistad 
router.post('/like',createLikeNotification) // crea la notificacion de like
router.post('/mention',createMentionNotification) // crea la notificacion de mencion    
router.post('/comment',createCommentNotification) // crea la notificacion de comentario

//esta ruta es para obtener todas las notificaciones de un usuario, incluyendo quien la envio, su avatar entre otras cosas
router.get('/friend/requests/:username', getAllFriendRequestsNotification); // obtiene todas las notificaciones de solicitud de amistad
router.get('/likes/:username', getAllLikeNotifications); // obtiene todas las notificaciones de like
router.get('/comments/:username', getAllCommentNotifications); // obtiene todas las notificaciones de comentario
router.get('/mentions/:username', getAllMentionNotifications); // obtiene todas las notificaciones de mencion

router.delete('/:notificationID', deleteNotification); // elimina una notificacion
export default router;