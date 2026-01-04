import express from 'express';
import{ createPublication, upload, getAllPublications, getPublicationsByAuthor, deletePublication, addLike, getCountLikes, addComment,getLikesName } from '../controllers/publicationController.js';
import { validatePublicationMiddleware, validateDeletePublicationMiddleware, validateGetPublicationMiddleware} from '../middlewares/publicationValidation.js';

const router = express.Router();

// se tiene que usar el upload.single('nombre del campo en el formulario')
router.post('/create', upload.single('multimedia'),  createPublication); //crear publicación
router.get('/', getAllPublications); //obtener todas las publicaciones
router.get('/:author', validateGetPublicationMiddleware, getPublicationsByAuthor); //obtener publicaciones de un autor
router.delete('/:id', validateDeletePublicationMiddleware, deletePublication); // eliminar publicación
router.post('/like/:publicationID', addLike); //añadir like a una publicación
router.get('/likes/:publicationID', getCountLikes); //obtener la cantidad de likes de una publicación para poder mostrarlo en el front END
router.post('/comment/:idPublication', addComment); // añadir comentario a una publicación
router.get('/likesName/:publicationID', getLikesName); //obtener los nombres de los usuarios que dieron like a una publicación

export default router;