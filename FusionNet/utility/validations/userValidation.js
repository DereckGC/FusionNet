import bcrypt from 'bcrypt' // Importacion de la libreria para encriptar las contrasenias
import User from '../../models/userModel.js' // Importacion del modelo de usuarios
import { ValidationError, NotFoundError, UnauthorizedError } from '../errorHandler.js'

// Se declara la validación de los datos del usuario a la hora de crearlos
const validateUserData = (username, email, password, biography, avatar) => {
    if (!username) throw new ValidationError('Username is required');
    if (!email) throw new ValidationError('Email is required');
    if (!password) throw new ValidationError('Password is required');
    if (!biography) throw new ValidationError('Biography is required');
    if (!avatar) throw new ValidationError('Avatar is required');

    // Validación de username
    if (typeof username !== 'string') throw new ValidationError('Username must be a string');
    if (username.length < 3) {
        throw new ValidationError('The username must have at least 3 characters');
    }

    // Validación de email
    if (typeof email !== 'string') throw new ValidationError('Email must be a string');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ValidationError('Invalid email format');
    }

    // Validación de password
    if (typeof password !== 'string') throw new ValidationError('Password must be a string');
    if (password.length < 6) {
        throw new ValidationError('The password must have at least 6 characters');
    }

    // Validación de biography
    if (biography && typeof biography !== 'string') {
        throw new ValidationError('Biography must be a string');
    }

    // Validación de avatar
    if (avatar && typeof avatar !== 'string') {
        throw new ValidationError('Avatar must be a string');
    }

    return true;
}

// Se declara la validación de los datos del usuario a la hora de crearlos
const validateUserExist= async (username) => {
    if(!await User.findOne({username})){
        return false;
    }else{
        return true;
    }
}

// Se declara la validación de que el nombre de usuario no exista en la base de datos
const validateUserName = async (username) => {
    if (await User.findOne({ username })) throw new ValidationError('The user already exists');
}


// Se declara la validación de que el email no exista en la base de datos
const validateEmail = async (email) =>{
    if (await User.findOne({email})) throw new ValidationError('The email already exists');
}


// Se declara la validación para a la hora de que un usuario busque a otro este no este bloqueado
const getUserByNameValidation = async (username, usernameFind) => {

    if(username === usernameFind){
        throw new UnauthorizedError('You cannot search your own profile');
    }

    const user = await User.findOne({username: username});
    const userFind = await User.findOne({username: usernameFind});
    if (!user) {
       throw new NotFoundError('User not found');
    }
    if (!userFind) {
        throw new NotFoundError('User to find not found');
    }
    if(userFind.blockedUsers.includes(user.id)){
        throw new UnauthorizedError(`User ${username} is blocked to see the profile of ${usernameFind}`);
    }
}

// Se declara la funcion que hashea la contrasenia
const generateHashPassword = async (password) => {
    try {
        const hashpassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));
        return hashpassword;
    } catch (error) {
        throw new UnauthorizedError('Cannot encrypt the password');
    }
}

// Toma la contraseña ingresada por el usuario (sin hash) como primer argumento y 
// la contraseña almacenada (con hash) como segundo argumento
// Devuelve true si las contraseñas coinciden, de lo contrario, devuelve false, esto para validar en el inicio de sesion
// que las contrasenias coincidan
const validatePassword = async (loginPassword, userPassword) => {
    try {
        return await bcrypt.compare(loginPassword, userPassword);
    } catch (error) {
        throw new UnauthorizedError('Cannot compare the passwords');
    }
}

// Se declara la validación de que el usuario exista
const validateGetFriendRequests = async (username) => {	
    if (!username) throw new ValidationError('Username is required');	
}

// Se declara la validación para poder aceptar la solicitud de amistad
const validateAcceptFriendRequest = async (idNotification ,sender, receiver, answer) => {	

    if (!idNotification) throw new ValidationError('Notification id is required');
    if (!sender) throw new ValidationError('Sender is required');
    if (!receiver) throw new ValidationError('Receiver is required');
    if (!answer) throw new ValidationError('Answer is required');
}

// Se declara la validación para poder eliminar a un amigo
const validateDeleteFriendRequest = async (username, friendUsername) => {
    
    if (!username) throw new ValidationError('Username is required');
    const user = await User.findOne({username})
    if (!user) throw new NotFoundError('User not found');

    if (!friendUsername) throw new ValidationError('Friend username is required');
    const friend = await User.findOne({username:friendUsername})
    if (! friend) throw new NotFoundError('Friend not found');

    if (!user.friends.includes(friend.id)) {
        throw new ValidationError('User is not friend with this user');
    }
}

// Se declara la validación para poder bloquear a un usuario
const validateBlockUser = async (username, blockUsername) => {
    if (!username) throw new ValidationError('Username is required');
    const user = await User.findOne({username}) 
    if (! user) throw new NotFoundError('User not found');
    
    if (!blockUsername) throw new ValidationError('Block Username username is required');
    const blockUser = await User.findOne({username:blockUsername})
    if (! blockUser) throw new NotFoundError('Block User not found');

    if (user.blockedUsers.includes(blockUser.id)) {
        throw new ValidationError('User is already blocked');
    }
}

// Se declara la validación para poder desbloquear a un usuario
const validateUnblockUser = async (username, unlockUsername) => {
    if (!username) throw new ValidationError('Username is required');
    const user = await User.findOne({username}) 
    if (! user) throw new NotFoundError('User not found');
    
    if (!unlockUsername) throw new ValidationError('Unblock Username username is required');
    const unlockUser = await User.findOne({username:unlockUsername})
    if (! unlockUser) throw new NotFoundError('Unblock User not found');

    if (!user.blockedUsers.includes(unlockUser.id)) {
        throw new ValidationError('User is not blocked');
    }
}

export 
{ 
    validateUserData, validateUserName, validateEmail, getUserByNameValidation,
    validatePassword, generateHashPassword, validateAcceptFriendRequest, 
    validateGetFriendRequests, validateDeleteFriendRequest, validateBlockUser,
    validateUnblockUser, validateUserExist
}