import express from 'express';
const router = express.Router();
import { 
    createPage, upload, listAllPages, 
    getPageByAuthor, deletePage, updatePage, 
    createPublicationForPages, deletePublicationOfPage, 
    addFollower, removeFollower,  getPublicationFromPage,
    getPageByTitle, getFolloewdPages
} from '../controllers/pageController.js';
import { 
    validatePageCreateMiddleware, validateDeletePageMiddleware, 
    validateUpdatePageMiddleware, validateAddNewPublicationMiddleware, 
    validateAddFollowerMiddleware, validateRemoveFollowerMiddleware
} from '../middlewares/pageValidation.js'


router.post('/create', upload.single('imageProfile'), validatePageCreateMiddleware, createPage); // Create a nueva pagina, de igual manera se debe de subir una imagen de perfil 
router.get('/', listAllPages); // Listar todas las paginas
router.get('/pages/:author',  getPageByAuthor); // Listar todas las paginas de un autor
router.delete('/:title', validateDeletePageMiddleware, deletePage); // Eliminar una pagina
router.put('/:title', upload.single('imageProfile'), validateUpdatePageMiddleware, updatePage); // Actualizar una pagina
router.get('/search/:title', getPageByTitle);  // Buscar una pagina por su titulo
router.get('/pagesFollowed/:username', getFolloewdPages); // Listar todas las paginas seguidas por un usuario util para realizar el feed
router.post('/publication', upload.single('multimedia'), validateAddNewPublicationMiddleware, createPublicationForPages); // Crear una nueva publicacion
router.delete('/publication/:title/:idPublication', deletePublicationOfPage); // Eliminar una publicacion
router.post('/follow/:title', validateAddFollowerMiddleware, addFollower); // seguir una pagina 
router.post('/unfollow/:title', validateRemoveFollowerMiddleware, removeFollower); // Dejar de seguir una pagina
router.get('/publication/:idPage', getPublicationFromPage); // Listar todas las publicaciones de una pagina
export default router;