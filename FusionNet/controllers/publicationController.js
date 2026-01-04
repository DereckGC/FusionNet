import fs from 'fs';
import Publication from '../models/publicationModel.js';
import User from '../models/userModel.js';
import { ValidationError, NotFoundError, UnauthorizedError } from '../utility/errorHandler.js';
import upload from '../config/multerConfig.js';
import path from 'path'
import { createMentionNotification, createCommentNotification, createLikeNotification } from './notificationController.js';
import Page from '../models/pageModel.js';

// Se declara la creacion de una publicacion en la base de datos
const createPublication = async (req, res, next) => {
    try {
        const { author, title,  content } = req.body; 
        const {dinamicPublication} = req.body;
        let multimedia = null;

        // Validar que el autor de la publicación exista
        const userAuthor = await User.findOne({username: author});
        if (!userAuthor){ return next(new NotFoundError('Author not found'))}

        // Validar que la publicación no exista
        if(await Publication.findOne({title: title}) ){
            if (req.file) {
                // Y si existe una con ese titulo, elimina la magen de la actual publicación que se intenta subir
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error("Failed to delete file:", err);
                });
            }
            return next(new ValidationError('Publication already exists'));
        }

        if (req.file && !dinamicPublication) {
            // Si se subió un archivo, se guarda la ruta de la imagen en la carpeta de uploads
            multimedia = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`; // Save file path
        }else if (dinamicPublication){
            multimedia = req.body.multimedia
        }
           
        // Crear la publicación
        const publication = new Publication({ author:userAuthor.id, title, multimedia, content, multimedia });

        // Guardar la publicación en la base de datos y dentro del arreglo de publicaciones del autor
        userAuthor.publications.push(publication);
        await userAuthor.save();
        await publication.save();
        return res.status(200).json(publication);
    } catch (error) {
        return next(error);
    }
};

// metodo para obtener todas las publicaciones
const getAllPublications = async (req, res, next) => {
    try {
        const publications = await Publication.find();
        return res.status(200).json(publications);
    } catch (error) {
        return next(error);
    }
};

// metodo para obtener las publicaciones de un autor
const getPublicationsByAuthor = async (req, res, next) => {
    try {
        const { author } = req.params;
        const user = await User.findOne({ username: author });
        const publications = await Publication.find({ author: user.id })
            .populate('author')
            .populate({
                path: 'comments.user',
                select: 'username avatar'
            });

        return res.status(200).json(publications);
    } catch (error) {
        return next(error);
    }
};

// metodo para eliminar una publicacion
const deletePublication = async (req, res, next) => {
    try {
        const { id } = req.params;
        const publication = await Publication.findByIdAndDelete(id);
        if (!publication) {
            return next(new NotFoundError('Publication not found'));
        } else {
            // Elimina la imagen de la publicación si existe
            if (publication.multimedia) {
                // Obtiene la ruta de la imagen
                const oldImagePath = publication.multimedia.split(`${req.protocol}://${req.get('host')}/`)[1];
                fs.unlink(oldImagePath, (err) => {
                    // Si la publicacion tiene imagen, se elimina la imagen de la carpeta uploads, si no se muestra un error
                    if (err) console.error("Failed to delete old image:", err);
                });
            }

            // Elimina la publicación del arreglo de publicaciones del autor
            const user = await User.findById(publication.author);
            if (!user) {
                return next(new UnauthorizedError('The author of post is not found'));
            }
            user.publications = user.publications.filter(pub => pub.toString() !== publication.id);
            await user.save();
            return res.status(200).json({ message: 'Publication deleted' });
        }
    } catch (error) {
        return next(error);
    }
};

// Metodo para buscar menciones en un comentario
async function searchForMentions(comment, user, publication) {
    const mentionPattern = /@([a-zA-Z0-9_!#$%^&*]+)/g; // Match @mentions
    const mentions = [];
    // Se declara un string vacio para guardar los mensajes de menciones

    let messageMentions = '';	

    // Busca todas las menciones en el comentario
    let match;
    while ((match = mentionPattern.exec(comment))) {
        mentions.push(match[1]); // Guarda el nombre de usuario mencionado
    }

    // Busca los usuarios mencionados en la base de datos
    const userComment = await User.findOne({ username: user });

    if (mentions.length > 0) {
        for (let mention of mentions) {
            // Busca si el usuario mencionado existe
            try {
                const userMentioned = await User.findOne({ username: mention });
                if (userMentioned) {
                    // Si el usuario mencionado existe, crea una notificación de mención
                    messageMentions += `User ${userComment.username} mentioned you in a comment\n`;
                    await createMentionNotification(userMentioned, userComment, publication );
                }
            } catch (error) {
                console.error(`Error processing mention '${mention}':`, error);
            }
        }
    }

    return messageMentions;
}

// Metodo para obtener los usuarios que dieron like a una publicacion
const getLikesName = async (req, res, next) => {
    try {
        const { publicationID } = req.params;
        const publication = await Publication.findById(publicationID);
        if (!publication) return next(new NotFoundError('Publication not found'));
        const likes = publication.likes;
        const users = [];
        for (let i = 0; i < likes.length; i++) {
            const user = await User.findById(likes[i]).select('username avatar');
            users.push({ username: user.username, avatar: user.avatar });
        }
        return res.status(200).json(users);
    } catch (error) {
        return next(error);
    }
}

// Metodo para agregar un comentario a una publicacion
const addComment = async (req, res, next) => {
    try {
        const { idPublication } = req.params;
        const { user, comment} = req.body;

        // Validar que el usuario y el comentario existan
        if (!user || !comment) {
            return next(new ValidationError("Missing user or comment"));
        }

        // Valida que el usuario y la publicación existan
        const userObject = await User.findOne({ username: user });
        if (!userObject) {
            return next(new NotFoundError("User not found"));
        }
        const publication = await Publication.findById(idPublication);
        if (!publication) {
            return next(new NotFoundError("Publication not found"));
        }

        // Busca menciones en el comentario, si hay un @ en el comentario
        let messageMentions = '';
        if (comment.includes("@")) {
            messageMentions = await searchForMentions(comment, user, publication);
        }
       
        // Agrega el comentario a la publicación
        publication.comments.push({ user: userObject.id, comment });
        await publication.save();

        // Crea una notificación de comentario
        let owner;
        let notiAdded;
        if (publication.type !== 'page') {
            // Si la publicación es de un usuario 
            owner = await User.findById(publication.author)
            // Crea una notificación de comentario para el dueño de la publicación
            notiAdded = await createCommentNotification(owner.username, userObject.username, publication);
        } else {
            // Si la publicación es de una página
            const page = await Page.findById(publication.author);
            if (!page) {
                return next(new NotFoundError("Page not found"));
            }
            // Crea una notificación de comentario para el dueño de la página
            owner = await User.findById(page.author);
            notiAdded = await createCommentNotification(owner.username, userObject.username, publication, page);
        }


        // Obtiene el avatar y el nombre de usuario del autor del comentario para enviarlo en la respuesta
        const avatar = userObject.avatar
        let username = userObject.username
        return res.status(201).json({ publication, messageMentions, notiAdded, avatar, username });

    } catch (error) {
        return next(error);
    }
};

// Metodo para agregar un like a una publicacion
const addLike = async (req, res, next) => {
    try {
        // Obtiene la publicacion
        const { publicationID } = req.params;
        const publication = await Publication.findById(publicationID);
        if (!publication) return next(new NotFoundError('Publication not found'));

        // Obtiene el usuario
        const { username } = req.body;
        const user = await User.findOne({ username });
        if (!user) return next(new NotFoundError('User not found'));

        // Verifica si el usuario ya dio like a la publicación
        if (publication.likes.includes(user.id)) return next(new ValidationError('User already liked this publication'));
        publication.likes.push(user.id);
        publication.save();

        // Crea una notificación de like
        let owner
        let notiAdded
        if (publication.type !== 'page') {
            // Si la publicación es de un usuario
            owner = await User.findById(publication.author)
            // Crea una notificación de like para el dueño de la publicación
            notiAdded = await createLikeNotification(owner.username, user.username, publication);
        } else {
            // Si la publicación es de una página
            const page = await Page.findById(publication.author);
            if (!page) {
                return next(new NotFoundError("Page not found"));
            }
            // Crea una notificación de like para el dueño de la página
            owner = await User.findById(page.author);
            notiAdded = await createLikeNotification(owner.username, user.username, publication, page);
        }
        
        return res.status(200).json({ message: 'Like added', notiAdded });
    } catch (error) {
        return next(error);
    }
};

// Metodo para obtener la cantidad de likes de una publicacion
const getCountLikes = async (req, res, next) => {
    try {
        const { publicationID } = req.params;
        const publication = await Publication.findById(publicationID);
        if (!publication) return next(new NotFoundError('Publication not found'));
        return res.status(200).json({ likes: publication.likes.length });
    } catch (error) {
        return next(error);
    }
};

export {
    createPublication,
    upload,
    getAllPublications,
    getPublicationsByAuthor,
    deletePublication,
    addLike,
    getCountLikes,
    addComment,
    getLikesName
};