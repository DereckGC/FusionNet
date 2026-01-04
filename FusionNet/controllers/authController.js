import {generateToken, generateRefreshToken} from '../utility/jwt.js'
import User from '../models/userModel.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import { ValidationError, NotFoundError, UnauthorizedError } from '../utility/errorHandler.js'
//En este metodo login, se recibe el email y el password, se busca el usuario en la base de datos, si no existe se manda un error, si existe se compara el password con el password encriptado en la base de datos, si no coinciden se manda un error, si coinciden se genera un token y se manda en la respuesta junto con el usuario sin el password 
//si existe, se hace un hash de la contraseña usando el bcrypt y se guarda en la base de datos, luego crea el token y se envia por medio de la cookie 
const login = async (req, res,next) => {

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return next(new UnauthorizedError('Invalid credentials'));
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return next(new UnauthorizedError('Invalid Password'));
        }

        let token = generateToken(user);
        res.cookie
        (
            'access_token', token, { 
            httpOnly: true, 
            secure: false, // ya que no se usa https en desarrollo, se pone en false, en produccion se pone en true
            sameSite: 'Lax',
            maxAge: 1000 * 60 * 60 }
        );
        
        let refreshToken = generateRefreshToken(user);
        res.cookie
        (
            'refresh_token', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
            maxAge: 1000 * 60 * 60 * 24 * 7}
        );
        
        const { password: _, ...publicUser } = user.toObject(); // elimina el campo password del objeto user y lo guarda en publicUser
        //elimina un campo del user , hay otra manera que es la manera larga, la otra opcion es decidir cuales mantener y no cuales quitar
        return res.status(200).json({ user: publicUser, token })
    } catch (error) {
        return next(error)
    }    
}

//En este metodo se recibe el refresh token, se verifica si existe, si no existe se manda un error, si existe se verifica si es valido, si no es valido se manda un error, si es valido se genera un nuevo token y se manda en la respuesta
const refreshToken = (req, res, next) => {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
        return next(new UnauthorizedError('Invalid credentials'));
    }
    try {
        const user = jwt.verify(refreshToken, process.env.SECRET_JWT_REFRESH_KEY);
        const token = generateToken(user);
        res.cookie
        (
            'access_token', token, { 
            httpOnly: true, 
            secure: false, 
            sameSite: 'Lax', 
            maxAge: 1000 * 60 * 60 }
        );

        return res.status(200).json({ message: 'Token refreshed' });
    } catch (error) {
        return next(error)
    }
}
//Este metodo es llamado cada vez que se necesita verificar si el usuario esta logeado, se verifica si existe el token, si no existe se manda un error, si existe se verifica si es valido, si no es valido se manda un error, si es valido se manda el usuario en la respuesta
const checkAuth = (req, res, next) => {

    const token = req.cookies.access_token;
    if (!token) {
        return next(new UnauthorizedError('Not logged in'));
    }

    try{
        const decoded = jwt.verify(token, process.env.SECRET_JWT_KEY);
        return res.json({ user: decoded })
    } catch (error) {
        return next(error)
    }
}
//Este metodo se encarga de cerrar la sesion, se limpian las cookies y se manda un mensaje de que se cerro la sesion
const logout = (req, res) => {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.json({ message: "Logged out" });
};

export {login, checkAuth, refreshToken, logout}