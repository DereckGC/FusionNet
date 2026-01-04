import { ValidationError, NotFoundError, UnauthorizedError } from '../utility/errorHandler.js'
import { validateNotification } from '../utility/validations/notificationValidation.js'
//valida los datos de la notificación, llamando a la función validateNotification
const createValidation = async (req, res, next) => {
    try {
        const {sender, receiver, content, type} = req.body
        await validateNotification(sender, receiver, content, type)
        next() 
    } catch (error) {
        return next (error); //el next con un error, lo que hace es que se va directamente al middleware de error
    }
}

export {createValidation}