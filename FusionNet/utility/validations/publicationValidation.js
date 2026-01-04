import { ValidationError, NotFoundError, UnauthorizedError } from '../errorHandler.js'
import User from '../../models/userModel.js' // Importacion del modelo de usuarios
import Publication from '../../models/publicationModel.js' // Importacion del modelo de usuarios

//Valida los datos de la publicacion al crear una nueva
const validatePublication = async (title, author, content) => {

    if(!title){
        throw new ValidationError('Title is required')
    }

    if (await Publication.findOne({title: title})) {
        throw new ValidationError('Title is already in use')
    }

    if(!author){
        throw new ValidationError('Author is required')
    }

    if(! await User.findOne({username:author})) throw new NotFoundError('Author not found')

    if(!content){
        throw new ValidationError('Content is required')
    }
    
}

//Valida los datos de la publicacion al eliminar una
const validateDeletePublication = async (id) => {

    if (!id) {
        throw new ValidationError('Publication id is required')
    }

    const publication = await Publication.findById(id)
    if (!publication) {
        throw new NotFoundError('Publication not found')
    }

}

//Valida los datos de la publicacion al obtener una
const validateGetPublication = async (author) => {

    if (!author) {
        throw new ValidationError('Publication author is required')
    }

    const authorUser = await User.findOne({username:author})
    if (!authorUser) {
        throw new NotFoundError('Author not found')
    }

    if (!await Publication.findOne({author:authorUser.id})) {
        throw new NotFoundError('Author has no publications')
    }

}

export { validatePublication, validateDeletePublication, validateGetPublication}
        