import { ValidationError, NotFoundError, UnauthorizedError } from '../utility/errorHandler.js'
//En este middleware se capturan los errores que se generan en la aplicación y se envían al cliente en formato JSON.
//es el middleware de salida que utiliza el servidor para enviar errores al cliente.

export const errorMidleware = (err, req, res,next) => {
    console.error(err); 

    if(err instanceof ValidationError) {
        return res.status(err.statusCode || 400).json({ error: err.name, message: err.message})
    }

    if(err instanceof NotFoundError) {
        return res.status(err.statusCode || 404).json({ error: err.name, message: err.message})
    }

    if(err instanceof UnauthorizedError) {
        return res.status(err.statusCode || 401).json({ error: err.name, message: err.message})
    }

    return res.status(500).json({ error: 'Server Error', message: err.message });
}

