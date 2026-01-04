//Este documento maneja errores de manera personalizada, se pueden crear errores personalizados y manejarlos de manera mas sencilla
//Todos estos errores heredan de la clase Error de javascript y se les añade un statusCode para manejar el status de la respuesta
// y luego otros errores heredan de ese CustomError para manejar errores mas especificos como errores de validacion, no encontrado o no autorizado 


class CustomError extends Error {
    constructor(message,statusCode) {
        super(message);
        this.name = this.constructor.name
        this.statusCode = statusCode
        Error.captureStackTrace(this, this.constructor)
    }
}

class ValidationError extends CustomError {
    constructor(message) {
        super(message,400)
    }
}

class NotFoundError extends CustomError {
    constructor(message) {
        super(message,404)
    }
}

class UnauthorizedError extends CustomError {
    constructor(message) {
        super(message,401)
    }
}

export { ValidationError, NotFoundError, UnauthorizedError };