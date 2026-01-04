import jwt from 'jsonwebtoken';
import { config } from './envConfig.js'
//En este documento se realiza la creación de los tokens de autenticación y refresco de los usuarios
//Se utiliza la librería jsonwebtoken para la creación de los tokens
//Se importa la configuración de las variables de entorno para la clave secreta de los tokens
//Se exportan dos funciones, una para la creación del token de autenticación y otra para la creación del token de refresco
//Ambas funciones reciben como parámetro el usuario que se desea autenticar y refrescar
const generateToken = (user) => {
    return jwt.sign({ id: user.id, username: user.username, avatar:user.avatar, email:user.email },  config.SECRET_JWT_KEY,
    {
        expiresIn: '5m'//El token de autenticación expira en 5 minutos
    })
}

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id, username: user.username, avatar:user.avatar, email:user.email},  config.SECRET_JWT_REFRESH_KEY,
    {
        expiresIn: '1h' //El token de refresco expira en 1 hora
    })
}

export { generateToken, generateRefreshToken}