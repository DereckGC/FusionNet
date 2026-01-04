import fs from 'fs';
import Page from '../models/pageModel.js';
import User from '../models/userModel.js';
import { ValidationError, NotFoundError, UnauthorizedError } from '../utility/errorHandler.js';
import upload from '../config/multerConfig.js';
import Publication from '../models/publicationModel.js';

// Crea una publicación para una página en específico
const createPublicationForPages = async (req, res, next) => {
    try {
        const { author, title, content } = req.body; // Obtener los datos de la publicación
        let multimedia = null; // Inicializar la variable multimedia
         
        if (req.file) { // Si se subió un archivo
            multimedia =  `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`; // Guardar la URL de la imagen
        }
        const pageAuthor = await Page.findById(author); // Buscar la página que publica
        let type = 'page'; // Tipo de publicación
        const publication = new Publication({ author: pageAuthor.id, title, type, content, multimedia }); // Crear la publicación con los datos
        
        pageAuthor.publications.push(publication); // Agregar la publicación a la página
        
        await pageAuthor.save(); // Guardar la página
        await publication.save(); // Guardar la publicación

        return res.status(201).json(publication); // Enviar la publicación creada
    } catch (error) {
        return next(error); // Pasar el error al siguiente middleware de manejo de errores
    }
};

// Obtiene una página por su título
const getPageByTitle = async (req, res, next) => {
    try {
        const { title } = req.params; // Obtener el título de la página
       
        const page = await Page.findOne({ title }).populate('author'); // Buscar la página por su título y obtener el autor de la página
        if (!page) {
            return next(new NotFoundError('Page not found')); // Si no se encuentra la página, lanzar un error
        }
        return res.status(200).json(page); // Enviar la página encontrada
    } catch (error) {
        return next(error); // Pasar el error al siguiente middleware de manejo de errores
    }
};

// Elimina una publicación de una página en específico
const deletePublicationOfPage = async (req, res, next) => {
    try {
        const { idPage, idPublication } = req.params; // Obtener el ID de la página y el ID de la publicación
        const page = await Page.findById(idPage); // Buscar la página por su ID
        if (!page) {
            return next(new NotFoundError('Page not found')); // Si no se encuentra la página, lanzar un error
        }
        if (!page.publications.includes(idPublication)) {
            return next(new NotFoundError('Publication not found')); // Si la publicación no está en la página, lanzar un error
        }

        const publication = await Publication.findByIdAndDelete(idPublication); // Buscar la publicación por su ID y eliminarla
        if (!publication) {
            return next(new NotFoundError('Publication not found')); // Si no se encuentra la publicación, lanzar un error
        }

        // Eliminar la imagen de la publicación si existe
        if (publication.multimedia) {
            const oldImagePath = publication.multimedia.split(`${req.protocol}://${req.get('host')}/`)[1];
            fs.unlink(oldImagePath, (err) => {
                if (err) console.error("Failed to delete old image:", err);
            });
        }

        // Eliminar la publicación de la lista de publicaciones de la página
        page.publications = page.publications.filter(idPub => idPub.toString() !== idPublication.toString());
        await page.save(); // Guardar la página
        return res.json({ message: 'Publication deleted successfully', publication }); // Enviar la respuesta de éxito

    } catch (error) {
        return next(error); // Pasar el error al siguiente middleware de manejo de errores
    }
};

// Crea una página en específico
const createPage = async (req, res, next) => {
    try {
        const { title, author, description, phone, email } = req.body; // Obtener los datos de la página
        let imageProfile = null;

        if (req.file) { // Si se subió un archivo
            imageProfile = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`; // Guardar la URL de la imagen
        }

        const userAuthor = await User.findOne({ username: author }); // Buscar el autor de la página
        if (!userAuthor) {
            return next(new NotFoundError('Author not found')); // Si no se encuentra el autor, lanzar un error
        }

        const page = new Page({ title, author: userAuthor.id, imageProfile, description, phone, email }); // Crear la página con los datos
        
        userAuthor.myPages.push(page); // Agregar la página a la lista de páginas del autor

        await page.save(); // Guardar la página
        await userAuthor.save(); // Guardar el autor
        res.status(201).send(page); // Enviar la página creada
    } catch (error) {
        next(new ValidationError(error.message)); // Pasar el error al siguiente middleware de manejo de errores
    }
};

// Lista todas las páginas existentes
const listAllPages = async (req, res, next) => {
    try {
        const pages = await Page.find({}).populate('author'); // Obtener todas las páginas y obtener el autor de cada una
        res.send(pages); // Enviar las páginas encontradas
    } catch (error) {
        next(new NotFoundError(error.message)); // Pasar el error al siguiente middleware de manejo de errores
    }
};

// Obtiene las páginas de un autor en específico
const getPageByAuthor = async (req, res, next) => {
    try {
        const { author } = req.params; // Obtener el autor de la página
        const user = await User.findOne({ username: author }); // Buscar el autor de la página
        const pages = await Page.find({ author: user.id }).populate('author'); // Obtener las páginas del autor
        if (!pages) {
            return next(new NotFoundError('Pages not found')); // Si no se encuentran páginas, lanzar un error
        } else {
            if (pages.length === 0) {
                return next(new NotFoundError('User has no pages')); // Si el usuario no tiene páginas, lanzar un error
            }
            res.json(pages); // Enviar las páginas encontradas
        }   
    } catch (error) {
        next(error); // Pasar el error al siguiente middleware de manejo de errores
    }
};

// Obtiene las páginas que sigue un usuario en específico
const getFolloewdPages = async (req, res, next) => {
    try {
        const { username } = req.params; // Obtener el nombre de usuario
        const user = await User.findOne({ username }); // Buscar el usuario
        if (!user) {
            return next(new NotFoundError('User not found')); // Si no se encuentra el usuario, lanzar un error
        }
        const pages = await Page.find({ followers: user.id }).populate('author'); // Obtener las páginas que sigue el usuario
        res.json(pages); // Enviar las páginas encontradas
    } catch (error) {
        next(error); // Pasar el error al siguiente middleware de manejo de errores
    }
};

// Obtiene las publicaciones de una página en específico
const getPublicationFromPage = async (req, res, next) => {
    try {
        const { idPage } = req.params; // Obtener el ID de la página
        const page = await Page.findById(idPage).populate({
            path: 'publications',
            populate: [
                {
                    path: 'author',
                    model: 'Page', // El modelo de la página
                    populate: {
                        path: 'author', // El autor de la página
                        model: 'User', // Del usuario se saca el nombre de usuario y el email
                        select: 'username email'
                    }
                },
                {
                    path: 'comments.user', // Luego de los comentarios se obtiene el usuario que comentó
                    model: 'User', // 
                    select: 'username avatar' // y retorna el avatar y el username
                }
            ]
        });
        if (!page) {
            return next(new NotFoundError('Page not found')); // Si no se encuentra la página, lanzar un error
        }
        res.json(page); // Enviar la página encontrada
    } catch (error) {
        next(error); // Pasar el error al siguiente middleware de manejo de errores
    }
};

// Elimina una página en específico
const deletePage = async (req, res, next) => {
    try {
        const { title } = req.params; // Obtener el título de la página
        
        // Eliminar la página
        const page = await Page.findOneAndDelete({ title }).populate('author', 'username');
        
        if (!page) {
            return next(new NotFoundError('Page not found')); // Si no se encuentra la página, lanzar un error
        }

        const id = page.id;

        // Eliminar la imagen de la página si existe
        if (page.imageProfile) {
            const oldImagePath = page.imageProfile.split(`${req.protocol}://${req.get('host')}/`)[1];
            fs.unlink(oldImagePath, (err) => {
                if (err) console.error("Failed to delete old image:", err);
            });
        }
        
        // Eliminar la página de la lista "myPages" del autor
        const author = await User.findById(page.author);
        if (author) {
            author.myPages = author.myPages.filter(idPage => idPage.toString() !== id.toString());
            await author.save();
        }

        // Eliminar la página de "followPages" en todos los usuarios con una sola consulta
        await User.updateMany(
            { followPages: id }, // Filtrar usuarios que siguen esta página
            { $pull: { followPages: id } } // Eliminar el ID de "followPages"
        );

        // Eliminar todas las publicaciones relacionadas a la página
        await Publication.deleteMany({ author: id });

        return res.json({ message: 'Page deleted successfully' }); // Enviar la respuesta de éxito
    } catch (error) {
        next(error); // Pasar el error al siguiente middleware de manejo de errores
    }
};

// Actualiza una página en específico
const updatePage = async (req, res, next) => {
    
    try {
        const { title } = req.params; // Obtener el título de la página
        const { newTitle, description, phone, email } = req.body; // Obtener los nuevos datos de la página
        let imageProfile = null;

        if (req.file) { // Si se subió un archivo
            imageProfile = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`; // Guardar la URL de la imagen
        }

        const page = await Page.findOne({ title }); // Buscar la página por su título
        if (!page) {
            return next(new NotFoundError('Page not found')); // Si no se encuentra la página, lanzar un error
        } else {
            // Eliminar la imagen anterior si existe y se ha subido una nueva imagen
            if (imageProfile && page.imageProfile) {
                const oldImagePath = page.imageProfile.split(`${req.protocol}://${req.get('host')}/`)[1];
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error("Failed to delete old image:", err);
                });
            }

            // Actualizar los datos de la página
            page.title = newTitle || page.title;
            page.description = description || page.description;
            page.phone = phone || page.phone;
            page.email = email || page.email;
            page.imageProfile = imageProfile || page.imageProfile;
            await page.save(); // Guardar la página
            return res.status(200).json(page) // Enviar la página actualizada
        }
    } catch (error) {
        next(error); // Pasar el error al siguiente middleware de manejo de errores
    }
};

// Añade un seguidor a una página
const addFollower = async (req, res, next) => {
    try {
        const { title } = req.params; // Obtener el título de la página
        const { username } = req.body; // Obtener el nombre de usuario
        const page = await Page.findOne({ title }); // Buscar la página por su título
        
        const user = await User.findOne({ username }); // Buscar el usuario por su nombre de usuario
        
        // Añadir el usuario a la lista de seguidores de la página
        page.followers.push(user.id);
        // Añadir la página a la lista de páginas seguidas por el usuario
        user.followPages.push(page.id);
        await page.save(); // Guardar la página
        await user.save(); // Guardar el usuario
        res.json({ message: 'Follower added successfully' }); // Enviar la respuesta de éxito
    } catch (error) {
        next(error); // Pasar el error al siguiente middleware de manejo de errores
    }
};

// Elimina un seguidor de una página
const removeFollower = async (req, res, next) => {
    try {
        const { title } = req.params; // Obtener el título de la página
        const { username } = req.body; // Obtener el nombre de usuario
        
        const page = await Page.findOne({ title }); // Buscar la página por su título
        const user = await User.findOne({ username }); // Buscar el usuario por su nombre de usuario

        // Eliminar el usuario de la lista de seguidores de la página
        page.followers = page.followers.filter(id => id.toString() !== user.id.toString());
        // Eliminar la página de la lista de páginas seguidas por el usuario
        user.followPages = user.followPages.filter(id => id.toString() !== page.id.toString());
        await page.save(); // Guardar la página
        await user.save(); // Guardar el usuario
        res.json({ message: 'Follower removed successfully' }); // Enviar la respuesta de éxito
    } catch (error) {
        next(error); // Pasar el error al siguiente middleware de manejo de errores
    }
};

// Exportar los métodos del controlador
export { 
    createPage, upload, listAllPages, 
    getPageByAuthor, deletePage, updatePage, 
    createPublicationForPages, deletePublicationOfPage, 
    addFollower, removeFollower, getPublicationFromPage,
    getPageByTitle, getFolloewdPages
};