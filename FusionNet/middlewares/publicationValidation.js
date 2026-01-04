import { ValidationError, NotFoundError, UnauthorizedError } from '../utility/errorHandler.js'
import { validatePublication, validateDeletePublication, validateGetPublication} from '../utility/validations/publicationValidation.js'
import fs from 'fs';


//Validar publication middleware, de igual manera si falla se elimina la imagen subida 
const validatePublicationMiddleware = async (req, res, next) => {
    try {
        const { title, author, content } = req.body
        await validatePublication(title, author, content)
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
//Validar si se puede eliminar la publicacion
const validateDeletePublicationMiddleware = async (req, res, next) => {
    try {
        const { id } = req.params
        await validateDeletePublication(id)
        next()
    } catch (error) {
        next(error)
    }
}
//Validar si se puede obtener la publicacion
const validateGetPublicationMiddleware = async (req, res, next) => {
    try {
        const { author } = req.params
        await validateGetPublication(author)
        next()
    } catch (error) {
        next(error)
    }
}

export { validatePublicationMiddleware, validateDeletePublicationMiddleware, validateGetPublicationMiddleware}
