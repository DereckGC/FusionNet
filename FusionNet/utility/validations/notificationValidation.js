import { ValidationError, NotFoundError, UnauthorizedError } from '../errorHandler.js'
import User from '../../models/userModel.js';

// Validación de los datos de la notificación
const validateNotification = async (sender, receiver, content, type) => {
    if(!sender){
        throw new ValidationError('sender is required');
    }
    if(!receiver){
        throw new ValidationError('receiver is required');
    }
    if(!content){
        throw new ValidationError('content is required');
    }
    if(type){
        throw new ValidationError('type is not required');
    }

    const senderUser = await User.findOne({username:sender})
    if(!senderUser){
        throw new NotFoundError('sender not found');
    }
    const receiverUser = await User.findOne({username:receiver})
    if(! receiverUser){
        throw new NotFoundError('receiver not found');
    }

    if(receiverUser.blockedUsers.includes(senderUser.id) || senderUser.blockedUsers.includes(receiverUser.id)){
        throw new UnauthorizedError('Cannot send friend request to blocked user');
    }
}

export { validateNotification }