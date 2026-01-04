import { pageValidation, deletePageValidation, updatePageValidation, addNewPublicationValidation, addFollowerValidation, removeFollowerValidation} from '../utility/validations/pageValidation.js'
import { validatePublication } from '../utility/validations/publicationValidation.js'
import { ValidationError, NotFoundError, UnauthorizedError } from '../utility/errorHandler.js'
import fs from 'fs';

//Validacion de los datos de la pagina, la imagen no viaja en el body, sino en el form-data
//se tiene que usar el fs.unlink para borrar la imagen en caso de que la validacion falle ya que se guarda en el servidor temporalmente
const validatePageCreateMiddleware = async (req, res, next) => {
    try {
        const {title, author, description, phone, email} = req.body
        await pageValidation(title, author, description, phone, email)
        next()
    } catch (error) {
        if (req.file) { //revisa el file en caso de que haya un error en la validacion
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Failed to delete file:", err);
            });
        }
        next(error)
    }
}

//Verifica que el titulo de la pagina exista
const validateDeletePageMiddleware = async (req, res, next) => {
    try {
        const {title} = req.params
        await deletePageValidation(title)
        next()
    } catch (error) {
        next(error)
    }
}
//Valida los datos de la pagina a actualizar, la imagen no viaja en el body, sino en el form-data
//se tiene que usar el fs.unlink para borrar la imagen en caso de que la validacion falle ya que se guarda en el servidor temporalmente
const validateUpdatePageMiddleware = async (req, res, next) => {
    try {
        const {title} = req.params
        const {newTitle, description, phone, email} = req.body
        await updatePageValidation(title, newTitle, description, phone, email)
        next()
    } catch (error) {
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Failed to delete file:", err);
            });
        }
        next(error)
    }
}

//Valida los datos de la publicacion al crear una nueva
const validateAddNewPublicationMiddleware = async (req, res, next) => {
    try {
        const {author , content } = req.body
        await addNewPublicationValidation(author)
       
        next()
    } catch (error) {
        next(error)
    }
}
//Valida el anañdir un seguidor a la pagina 
const validateAddFollowerMiddleware = async (req, res, next) => {
    try {
        const {title} = req.params
        const {username} = req.body
        await addFollowerValidation(title, username)
        next()
    } catch (error) {
        next(error)
    }
}

//Valida el eliminar un seguidor de la pagina
const validateRemoveFollowerMiddleware = async (req, res, next) => {
    try {
        const {title} = req.params
        const {username} = req.body
        await removeFollowerValidation(title, username)
        next()
    } catch (error) {
        next(error)
    }
}

export { validatePageCreateMiddleware, validateDeletePageMiddleware, validateUpdatePageMiddleware, validateAddNewPublicationMiddleware, validateAddFollowerMiddleware, validateRemoveFollowerMiddleware}