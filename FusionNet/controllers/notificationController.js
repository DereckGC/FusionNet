import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';
import { ValidationError, NotFoundError, UnauthorizedError } from '../utility/errorHandler.js';
import Publication from '../models/publicationModel.js';
import sendEmail from '../services/emailService.js';

//En este metodo se obtienen todas las notificaciones de tipo friendRequest
//Se obtiene el username del usuario y se busca en la base de datos
//Se obtienen las notificaciones de tipo friendRequest junto con el sender de la notificacion y el avatar del sender
//Se retorna un json con las notificaciones
const getAllFriendRequestsNotification = async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).populate({
            path: 'notifications',
            match: { type: 'friendRequest' },
            populate: { path: 'sender', select: 'username avatar' }
        });
        //El match es para filtrar las notificaciones que sean de tipo friendRequest
        //el populate es para obtener el sender de la notificacion y seleccionar solo el username y el avatar

        if (!user) {
            return next(new NotFoundError('User not found'));
        }

        return res.status(200).json(user.notifications);
    } catch (error) {
        return next(error);
    }
}
//En este metodo se obtienen todas las notificaciones de tipo like
//De igual manera que se optienen las notificaciones de tipo friendRequest
//Se obtienen las notificaciones de tipo like junto con el sender de la notificacion y el contenido de la notificacion
//Se retorna un json con las notificaciones
const getAllLikeNotifications = async (req, res, next) => {
    try {
        const { username } = req.params;
        
        const user = await User.findOne({ username }).populate({
            path: 'notifications',
            match: { type: 'like' },
            populate: [
                { path: 'sender', select: 'username avatar' },
                { path: 'content', select: 'content' } // En este caso la notificacion guarda el mensaje entonces tambien se devuelve 
            ]
        })

        if (!user) {
            return next(new NotFoundError('User not found'));
        }

        return res.status(200).json(user.notifications);
    } catch (error) {
        return next(error);
    }
}
//En este metodo se obtienen todas las notificaciones de tipo comment
//Funciona exactamente de la misma manera que el metodo anterior
//Se obtienen las notificaciones de tipo comment junto con el sender de la notificacion y el contenido de la notificacion
const getAllCommentNotifications = async (req, res, next) => {
    try {
        const { username } = req.params;
        
        const user = await User.findOne({ username }).populate({
            path: 'notifications',
            match: { type: 'comment' },
            populate: [
                { path: 'sender', select: 'username avatar' },
                { path: 'content', select: 'content' } // de igual manera devuelve el contenido de la notificacion
            ]
        })

        if (!user) {
            return next(new NotFoundError('User not found'));
        }

        return res.status(200).json(user.notifications);
    } catch (error) {
        return next(error);
    }
}
//En este metodo se obtienen todas las notificaciones de tipo mention
//Funciona exactamente de la misma manera que el metodo anterior
//Se obtienen las notificaciones de tipo mention junto con el sender de la notificacion y el contenido de la notificacion
//Se retorna un json con las notificaciones
async function getAllMentionNotifications(req, res, next) {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username }).populate({
            path: 'notifications',
            match: { type: 'mention' },
            populate: { path: 'sender', select: 'username avatar' }
        });

        if (!user) {
            return next(new NotFoundError('User not found'));
        }

        return res.status(200).json(user.notifications);
    } catch (error) {
        return next(error);
    }
}
//Este metodo crea una notificacion de tipo friendRequest
//Se obtienen el sender y el receiver de la notificacion
//Se verifica que el sender y el receiver existan en la base de datos

const createFriendRequestNotification = async (req, res, next) => {
    try {
        const { sender, receiver, content } = req.body;
        let type = 'friendRequest';

        // Find sender and receiver in the database
        const senderUser = await User.findOne({ username: sender });
        const receiverUser = await User.findOne({ username: receiver });
        if(senderUser === null || receiverUser === null){
            return next(new NotFoundError('User not found'));
        }
        if(receiverUser.blockedUsers.includes(senderUser.id) || senderUser.blockedUsers.includes(receiverUser.id)){
            return next(new UnauthorizedError('Cannot send notification to blocked user'));
        }
        if(receiverUser.friends.includes(senderUser.id) || senderUser.friends.includes(receiverUser.id)){
            return next(new ValidationError('User is already friend with this user'));
        }

        if(await Notification.findOne({sender: senderUser.id, receiver: receiverUser.id, type: type}) || 
            await Notification.findOne({sender: receiverUser.id, receiver: senderUser.id, type: type})){
            return next(new ValidationError('Friend request already exists'));
        }
        
        // revisar si el usuario rechazo la solicitud de amistad anteriormente 
        const isRejected = await checkForFriendRejection(receiverUser, senderUser);
        if (isRejected) {
            return next(new UnauthorizedError('Friend request rejected'));
        }

        // Crea una nueva notificacion 
        const notification = new Notification({
            sender: senderUser.id,
            receiver: receiverUser.id,
            type,
            content
        });

        await notification.save();

      

        receiverUser.notifications.push(notification.id); //La guarda en el arreglo de notificaciones del usuario receptor
    
        await receiverUser.save(); //Guarda el usuario receptor

        if (receiverUser.email) { // Envia un correo electronico si el usuario tiene un email
            await sendEmail(
                receiverUser.email,
                "You were mentioned in a post!",
                content
            );
        }
       

        return res.status(201).send(notification);

    } catch (error) {
        return next(error);
    }
};

//Elimina una notificacion de la base de datos especialmente las de tipo friendRequest una vez se hayan aceptado o rechazado
const deleteNotification = async (req, res, next) => {
    try {
        const { notificationID } = req.params;  // Ensure consistency in route param names
        const notification = await Notification.findById(notificationID);
        
        if (!notification) return next(new NotFoundError('Notification not found'));
        
        if (!notification.receiver) return next(new NotFoundError('Notification receiver not found'));
        
        const user = await User.findById(notification.receiver);
        if (!user) return next(new NotFoundError('User not found'));
        
        user.notifications = user.notifications.filter(id => id.toString() !== notificationID.toString()); 
        //El to string es necesario para comparar los id de los objetos de la base de datos con los id de las notificaciones
        await user.save();
        
        await Notification.deleteOne({ _id: notificationID });  

        return res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        return next(error);
    }
};

//Revisa si el usuario rechazo la solicitud de amistad anteriormente 
const checkForFriendRejection = async (receiver, sender) => {
    if (!sender) {
        return false;
    }
    if (!sender.rejectedFriendsRequest) {
        return false;
    }
    return sender.rejectedFriendsRequest.includes(receiver.id);
};

//Crea una notificacion de tipo mention 
async function createMentionNotification(receiver, sender, publication) {
    try {
        let type = 'mention';
        let content = `You have been mentioned in the post ${publication.title}  by ${sender.username} `;

        const notification = new Notification({
            sender: sender.id,
            receiver: receiver.id,
            type: type,
            content: content
        });

        await notification.save();

        receiver.notifications.push(notification.id);
        await receiver.save();

        if (receiver.email) { // Envia un correo electronico si el usuario tiene un email
            await sendEmail(
                receiver.email,
                "You were mentioned in a post!",
                content
            );
        }
       

        return true;
    } catch (error) {
        console.error("Error creating mention notification:", error);
        return false;
    }
}
//Crea una notificacion de tipo like 
const createLikeNotification = async (receiver, sender, publication, page) => {
    try {
        let content
        if(page){
            content = `You have received a like from ${sender} in your page ${page.title} in your  post ${publication.title}`;
        } else {
            content = `You have received a like from ${sender} in your post ${publication.title}`;
        }
       
        let type = 'like';
       
        const senderUser = await User.findOne({ username: sender });
        const receiverUser = await User.findOne({ username: receiver });

        const notification = new Notification({
            sender: senderUser.id,
            receiver: receiverUser.id,
            type: type,
            content: content
        });

        await notification.save();

        receiverUser.notifications.push(notification.id);
        await receiverUser.save();

        if (receiverUser.email) { // Envia un correo electronico si el usuario tiene un email
            await sendEmail(
                receiverUser.email,
                "You were mentioned in a post!",
                content
            );
        }
        return true;
    } catch (error) {
        console.error("Error creating like notification:", error);
        return false;
    }
}
//Crea una notificacion de tipo comment
const createCommentNotification = async (receiver, sender, publication, page) => {
    try {
        let content
        if(page){
             content = `You have received a comment from ${sender} in your page ${page.title} in your  post ${publication.title}`;
        } else {
             content = `You have received a comment from ${sender} in your post ${publication.title}`;
        }

        let type = 'comment';
       
        const senderUser = await User.findOne({ username: sender });
        const receiverUser = await User.findOne({ username: receiver });

        const notification = new Notification({
            sender: senderUser.id,
            receiver: receiverUser.id,
            type: type,
            content: content
        });

        await notification.save();

        receiverUser.notifications.push(notification.id);
        await receiverUser.save();
        if (receiverUser.email) { // Envia un correo electronico si el usuario tiene un email
            await sendEmail(
                receiverUser.email,
                "You were mentioned in a post!",
                content
            );
        }
        return true;
    } catch (error) {
        console.error("Error creating like notification:", error);
        return false;
    }
}

export { createFriendRequestNotification, createMentionNotification, createLikeNotification, createCommentNotification, getAllFriendRequestsNotification, getAllLikeNotifications, getAllCommentNotifications,  getAllMentionNotifications, deleteNotification };