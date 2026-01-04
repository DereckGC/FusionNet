import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';
import Publication from '../models/publicationModel.js';
import Page from '../models/pageModel.js';
import { ValidationError, NotFoundError, UnauthorizedError } from '../utility/errorHandler.js'
import {validateEmail} from '../utility/validations/userValidation.js';
import sendEmail from '../services/emailService.js';
// Creacion del usuario
const createUser = async (req, res, next) => {
    try {
        const {username, email, password, biography, avatar} = req.body;
        const user = new User({username, email, password, biography, avatar});
        await user.save();
        return res.status(201).json(user);
    } catch (error) {
       return next(error);
    }
}

// Metodo para cambiar el estado de firstTime del usuario, con el proposito de mostrar un mensaje cuando inicia sesion por primera vez
const firstTime = async (req, res, next) => {
    try {
        const {username} = req.params;
        const user = await User.findOne({username})
        if(!user) {
            return next(new NotFoundError('User not found'));
        }
        user.firstTime = false;
        await user.save();
        return res.status(200).json(user);
    }
    catch (error) {
        return next(error);
    }
} 

// Metodo para obtener todos los usuarios excepto el usuario actual
const getUsers = async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let users = await User.find({
            username: { $ne: user.username }, // Excluye el usuario actual
        });

        // Filtrar a los que lo tienen bloqueado
        users = users.filter(u => !u.blockedUsers.includes(user.id));

        return res.status(200).json(users);
    } catch (error) {
        return next(error);
    }
};

// Metodo para buscar un usuario por su nombre de usuario
// teniendo en cuenta que el middleware valido que no esten bloqueados
const findUser = async (req, res, next) => {
    try {
        const { username, usernameFind } = req.params;
        const user = await User.findOne({ username: username });
        if (!user) {
            next(new NotFoundError('User not found'));
        }

        const userFind = await User.findOne({ username: usernameFind });
        if (!userFind) {
            return next(new NotFoundError('User to find not found'));
        }
        
        return res.status(200).json(userFind);
    } catch (error) {
        return next(error);
    }
};

// Metodo para obtener un usuario por su nombre de usuario
const getUserByName = async (req, res, next) => {
    try {
        const {username} = req.params;
        let user = await User.findOne({username}); 
        if(!user) {
            return next(new NotFoundError('User not found'));
        }
        return res.status(200).json(user);
    } catch (error) {
        return next(error);
    }
}

// Metodo para obtener los amigos de un usuario
const getFriends = async (req, res, next) => {
    try {
        const { username } = req.params;
        let user = await User.findOne({ username }).populate('friends');
        if (!user) {
            return next(new NotFoundError('User not found'));
        }
        if (user.friends.length === 0) {
            return next(new NotFoundError('The user has no friends'));
        }
        const friends = user.friends;
        return res.status(200).json(friends);
    } catch (error) {
        return next(error);
    }
};

// Metodo para actualizar la informacion de un usuario
const updateUser = async (req, res, next) => {

    try {
        const {nameUpdate} = req.params;
        const {username, email, password, biography, avatar} = req.body;
        let user = await User.findOne({username: nameUpdate});
        if(!user) {
            return next(new NotFoundError('User not found'));
        }
        if(email !== user.email){
            await validateEmail(email)
        }
        
        user = await User.findOneAndUpdate({username: nameUpdate}, {username, email, password, biography, avatar}, { new: true, runValidators: true });
        if (!user) {
            return next (new NotFoundError('User not found'));
        }
        return res.status(200).json(user);
    } catch (error) {
        return next(error);
    }
}

// Metodo para eliminar un usuario
const deleteUser = async (req, res, next) => {
    try {
        const {username} = req.params;
        const user = await User.findOneAndDelete({username});
        
        if (!user) {
            return next (new NotFoundError('User not found'));
        }
        return res.status(200).send('User deleted');
    } catch (error) {
        return next(error);
    }
}

// Metodo para obtener las solicitudes de amistad de un usuario
const getFriendRequests = async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).populate('notifications');
        if (!user) {
            return next(new NotFoundError('User not found'));
        }
        const friendRequests = user.notifications.filter(notification => notification.type === 'friendRequest');
        if (friendRequests.length === 0) {
            return res.status(200).send({ message: 'No friend requests' });
        }
        return res.status(200).json(friendRequests);
    } catch (error) {
        return next(error);
    }
}

// Metodo para aceptar o rechazar una solicitud de amistad
const acceptFriendRequest = async (req, res, next) => {
    try {
        const { idNotification, sender, receiver, answer } = req.body;
        const notification = await Notification.findById(idNotification);
        const senderUser = await User.findOne({ username: sender });
        const receiverUser = await User.findOne({ username: receiver });
        if (!notification) {
            return next(new NotFoundError('Notification not found'));
        }
        if (!receiverUser.notifications.includes(notification.id)) {
            return next(new ValidationError('Notification not found in receiver\'s notifications array'));
        }

        if(senderUser.friends.includes(receiverUser.id)) return next(new ValidationError('The users are already friends'));

        if (answer === 'accept' ){
            senderUser.friends.push(receiverUser.id);
            receiverUser.friends.push(senderUser.id);
            await senderUser.save() 
            await receiverUser.save()
            receiverUser.notifications = receiverUser.notifications.filter(notifId => notifId.toString() !== idNotification);
            //mantiene todas las notificaciones que no sean la que se esta aceptando
            await receiverUser.save();

            
            if (receiverUser.email) { // Si el usuario tiene email, se le envía una notificación
                await sendEmail(
                    receiverUser.email,
                    "You were mentioned in a post!",
                    `You have been accepted as a friend by ${senderUser.username}`
                );
            }

            // elimina la notificacion de la base de datos
            await Notification.findByIdAndDelete(idNotification);
            return res.status(200).send({ message: 'Friend request accepted' });


        } else if (answer === 'decline') {
            // Agrega el id del usuario que rechazo la solicitud a la lista de rechazados
            // si la respuesta es rechazar la solicitud el usuario que la envio no podra enviar otra de nuevo
            senderUser.rejectedFriendsRequest.push(receiverUser.id)
            await senderUser.save();
            receiverUser.notifications = receiverUser.notifications.filter(notifId => notifId.toString() !== idNotification);
            //mantiene todas las notificaciones que no sean la que se esta aceptando
            await receiverUser.save();
    
            // elimina la notificacion de la base de datos
            await Notification.findByIdAndDelete(idNotification);
            return res.status(200).send({ message: 'Friend request declined' });
        }
       
    } catch (error) {
        return next(error);
    }
}

// Metodo para eliminar un amigo
const deleteFriend = async (req, res, next) => {
    try {
        const { username } = req.params;
        const { friendUsername } = req.body;

        const user = await User.findOne({ username });
        const friend = await User.findOne({ username: friendUsername });

        if (!user || !friend) {
            return next(new NotFoundError('User not found'));
        }
        if (!user.friends.includes(friend.id)) {
            return next(new ValidationError('User is not friend with this user'));
        }

        // Elimina la amistad de ambos usuarios
        user.friends = user.friends.filter(friendId => friendId.toString() !== friend.id);
        friend.friends = friend.friends.filter(friendId => friendId.toString() !== user.id);
        await user.save();
        await friend.save();
        return res.status(200).send({ message: 'Friend deleted' });
    } catch (error) {
        return next(error);
    }
}

// Metodo para bloquear a un usuario
const blockUser = async (req, res, next) => {
    try {
        const { username } = req.params;
        const { blockUsername } = req.body;

        const user = await User.findOne({ username });
        const blockUser = await User.findOne({ username: blockUsername });

        if (!user || !blockUser) {
            return next(new NotFoundError('User not found'));
        }

        if (user.blockedUsers.includes(blockUser.id)) {
            return next(new ValidationError('User is already blocked'));
        }
        user.blockedUsers.push(blockUser.id);
        // Elimina la de amistad si existe y las notificaciones de ambos usuarios enviadas entre ellos
        if(user.notifications.length > 0 || blockUser.notifications.length > 0){
            user.notifications = user.notifications.filter(notification => notification.sender != blockUser.id);
            blockUser.notifications = blockUser.notifications.filter(notification => notification != user.id);
            await Notification.findOneAndDelete({sender: blockUser.id, receiver: user.id});
            await Notification.findOneAndDelete({sender: user.id, receiver: blockUser.id});
        }
        if(user.friends.includes(blockUser.id)){
            user.friends = user.friends.filter(friendId => friendId.toString() !== blockUser.id);

            blockUser.friends = blockUser.friends.filter(friendId => friendId.toString() !== user.id);

            blockUser.save();
        }

        await user.save();
        return res.status(200).send({ message: 'User blocked' });
    } catch (error) {
        return next(error);
    }
}

// Metodo para desbloquear a un usuario
const unlockUser = async (req, res, next) => {
    try {
        const { username } = req.params;
        const { unlockUsername } = req.body;

        const user = await User.findOne({username});
        const unlockUser = await User.findOne({username: unlockUsername});
        if (!user || !unlockUser) {
            return next(new NotFoundError('User not found'));
        }

        if (!user.blockedUsers.includes(unlockUser.id)) {
            return next(new ValidationError('User is not blocked'));
        }
        user.blockedUsers = user.blockedUsers.filter(blockedUserId => blockedUserId.toString() !== unlockUser.id);
        await user.save();
        return res.status(200).send({message: 'User unlocked'});
    }catch (error) {
        return next(error);
    }
}

// Metodo para obtener las notificaciones de un usuario
const getNotifications = async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).populate('notifications');
        if (!user) {
            return next(new NotFoundError('User not found'));
        }
        if (user.notifications.length === 0) {
            return res.status(200).send({ message: 'The user has no notifications' });
        }
        return res.status(200).json(user.notifications);
    } catch (error) {
        return next(error);
    }
}

// Metodo para generar el feed de un usuario
const generateFeed = async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });

        if (!user) {
            return next(new NotFoundError('User not found'));
        }

        const friends = user.friends;
        let feed = await Publication.find()
            .populate({ path: 'comments.user', select: 'username avatar' })
            .limit(100); // Evitar cargar demasiadas publicaciones

        // Filtrar las publicaciones que no son de amigos o tengan bloqueado al usuario
        feed = await filterFeed(feed, user);

        // Si el usuario no tiene amigos, se envía el feed sin filtrar
        if (friends.length === 0) {
            return res.status(200).json(feed);
        } else {
            // Si el usuario tiene amigos, se envía el feed con las publicaciones de amigos primero y publicaciones de las paginas, 
            let friendsFeed = feed.filter(publication => 
                publication.author && friends.includes(publication.author.id) && publication.type !== 'page'
            );

            // luego se toman 10 publicaciones del feed que no son de amigos
            let nonFriendsFeed = feed.filter(publication => 
                publication.author && !friends.includes(publication.author.id)
            ).slice(0, 10);

            // Une las publicaciones de amigos con las publicaciones que no son de amigos
            feed = [...friendsFeed, ...nonFriendsFeed];

            return res.status(200).json(feed);
        }
    } catch (error) {
        return next(error);
    }
};

const filterFeed = async (feed, user) => {
    try {
        // Construye el autor de cada publicacion para manejarlo de manera mas sencilla en el front
        feed = await Promise.all(feed.map(constructAuthor));
    } catch (error) {
        console.log(error);
    }

    // Filtra las publicaciones que no son de amigos o tienen bloqueado al usuario
    feed = feed.filter(publication => 
        !user.blockedUsers.includes(publication.author?.id) &&
        !(publication.author instanceof User && publication.author.blockedUsers.includes(user.id)) &&
        !user.publications.includes(publication.id)
    );

    return feed;
};

// Construye el autor de una publicacion
const constructAuthor = async (publication) => {
    try {
        // Si la publicacion es de una pagina, se busca la pagina y se agrega a la publicacion
        if (publication.type === 'page') {
            const page = await Page.findById(publication.author).populate('author');
            publication.authorPage = page;
        } else {
            // Si la publicacion es de un usuario, se busca el usuario y se agrega a la publicacion
            const author = await User.findById(publication.author);
            publication.author = author;
        }
        return publication;
    } catch (error) {
        console.log(error);
    }
};

export 
{ 
    createUser, getUsers, findUser, 
    updateUser, deleteUser, acceptFriendRequest, 
    getFriendRequests, deleteFriend, blockUser,
    unlockUser, getNotifications, getUserByName,
    getFriends, generateFeed, firstTime
};