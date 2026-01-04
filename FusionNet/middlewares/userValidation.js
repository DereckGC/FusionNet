import { 
    
    validateUserData, validateUserName, validateEmail, getUserByNameValidation,
    validatePassword, generateHashPassword, validateAcceptFriendRequest, 
    validateGetFriendRequests, validateDeleteFriendRequest, validateBlockUser,
    validateUnblockUser, validateUserExist
    
} from '../utility/validations/userValidation.js';

import { ValidationError, NotFoundError, UnauthorizedError } from '../utility/errorHandler.js';
//Valida los datos de entrada para la creación de un usuario
const createValidation = async (req, res, next) => {
    
    const {username, email, password, biography, avatar} = req.body;
    try {
        validateUserData(username, email, password, biography, avatar);
        await validateUserName(username);
        await validateEmail(email);
        req.body.password = await generateHashPassword(password);
    } catch (error) {
        return next (error);
    }
    
    return next();
}
//Validacion para obtener un usuario por nombre de a quien se busca y el quien lo busca 
const getUserValidation = async (req, res, next) => {

    try {
        const {username, usernameFind} = req.params;
        await getUserByNameValidation(username, usernameFind);
    } catch (error) {
        return next (error);
    }
    
    return next();
}
//Valida los datos de entrada para la actualización de un usuario
const updateValidation = async (req, res, next) => {
    const {nameUpdate} = req.params;
    if (!nameUpdate) {
        return next(new ValidationError('Name is required'));
    }
    
    try {
        if(!await validateUserExist(nameUpdate)){
            return next(new NotFoundError('User to update not found'));
        }
        const {username, email, password, biography, avatar} = req.body;
        validateUserData(username, email, password, biography, avatar);
        if(username !== nameUpdate){
            await validateUserName(username); // en caso de que se quiera cambiar el nombre de usuario se valida que no exista
        }
        req.body.password = await generateHashPassword(password);
    } catch (error) {
        return next (error);
    }
    
    return next();
}
//Valida los datos de entrada para la eliminación de un usuario
const deleteValidation = (req, res, next) => {
    
    const {username} = req.params;
    if (!username) {
        return next(new ValidationError('Name is required'));
    }
    return next();
}
//Valida los datos de entrada para aceptar una solicitud de amistad
const acceptFriendRequestValidation = (req, res, next) => {
    try {
        const { idNotification, sender, receiver, answer } = req.body;
        validateAcceptFriendRequest(idNotification, sender, receiver, answer);
    } catch (error) {
        return next (error);
    }
    return next();
}
//Valida los datos de entrada para obtener las solicitudes de amistad
const getFriendRequestsValidation = (req, res, next) => {
    try {
        const {username} = req.params;
        validateGetFriendRequests(username);
    } catch (error) {
        return next (error);
    }
    return next();
}
//Valida los datos de entrada para bloquear a un usuario
const blockUserValidation = async (req, res, next) => {
    try {
        const { username } = req.params;
        const { blockUsername } = req.body;
        await validateBlockUser(username, blockUsername);
    } catch (error) {
        return next (error);
    }
    return next();
}
//Valida los datos de entrada para desbloquear a un usuario
const validateUnlockUser = async (req, res, next) => {
    try {
        const { username } = req.params;
        const { unlockUsername } = req.body;
        await validateUnblockUser(username, unlockUsername);
    } catch (error) {
        return next (error);
    }
    return next();
}
//Valida los datos de entrada para eliminar a un amigo
const validateDeleteFriend = async (req, res, next) => {
    try {
        const { username } = req.params;
        const { friendUsername } = req.body;
        await validateDeleteFriendRequest(username, friendUsername);    
    } catch (error) {
        return next (error);
    }
    return next();
}

export 
{
    createValidation, getUserValidation, updateValidation, 
    deleteValidation, acceptFriendRequestValidation, getFriendRequestsValidation, 
    blockUserValidation, validateDeleteFriend, validateUnlockUser
};