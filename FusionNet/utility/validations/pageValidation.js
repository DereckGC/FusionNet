import Page from '../../models/pageModel.js';
import User from '../../models/userModel.js' // Importacion del modelo de usuarios
import { ValidationError, NotFoundError, UnauthorizedError } from '../errorHandler.js'

// Validación de los datos de la página
const pageValidation = async (title, author, description, phone, email) => {
    if (!title) {
        throw new ValidationError('Title is required');
    }
    if (!author) {
        throw new ValidationError('Author is required');
    }
    if (!await User.findOne({ username: author })) {
        throw new NotFoundError('Author not found');
    }
    if (!description) {
        throw new ValidationError('Description is required');
    }
    if (!phone) {
        throw new ValidationError('Phone is required');
    }
    if(await Page.findOne({ phone })) {
        throw new ValidationError('Phone already exists');
    }
    if (!email) {
        throw new ValidationError('Email is required');
    }

    // Validación de phone
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // Ejemplo de expresión regular para validar números de teléfono en formato E.164
    if (!phoneRegex.test(phone)) {
        throw new ValidationError('Invalid phone format');
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ValidationError('Invalid email format');
    }

    if (await Page.findOne({ title })) {
        throw new ValidationError('Page already exists');
    }
    if (await Page.findOne({ email })) {
        throw new ValidationError('Email already exists');
    }
};

// Validación de que la página a eliminar exista
const deletePageValidation = async (title) => {
    if (!await Page.findOne({title})) {
        throw new NotFoundError('Page not found');
    }
}

// Validación de los datos de la página a actualizar
const updatePageValidation = async (title, newTitle, description, phone, email) => {
    const page = await Page.findOne({ title });
    if (!page) {
        throw new NotFoundError('Page not found');
    }

    if (!newTitle) {
        throw new ValidationError('Title is required');
    }

    if (title !== newTitle && await Page.findOne({ title: newTitle })) {
        throw new ValidationError('Page already exists');
    }

    if (!description) {
        throw new ValidationError('Description is required');
    }
    if (!phone) {
        throw new ValidationError('Phone is required');
    }

    if (!email) {
        throw new ValidationError('Email is required');
    }

    // Validación de phone
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // Ejemplo de expresión regular para validar números de teléfono en formato E.164
    if (!phoneRegex.test(phone)) {
        throw new ValidationError('Invalid phone format');
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ValidationError('Invalid email format');
    }

    if (email !== page.email && await Page.findOne({ email })) {
        throw new ValidationError('Email already exists');
    }
};

// Validación de que el autor de la publicación exista
const addNewPublicationValidation = async (author) => {
    const page = await Page.findById(author);
    if (!page) {
        throw new NotFoundError('Page not found');
    }
}

// Validación de que el seguidor no exista en la lista de seguidores
const addFollowerValidation = async (title, username) => {
    const page = await Page.findOne({title})
    if (!page) {
        throw new NotFoundError('Page not found');
    }
    const user = await User.findOne({username})
    if (!user) {
        throw new NotFoundError('Follower not found');
    }
    if (page.followers.includes(user.id)) {
        throw new ValidationError('User is already a follower');
    }
    if (user.followPages.includes(page.id)) {
        throw new ValidationError('Page is already followed by user');
    }
}

// Validación de que el seguidor exista en la lista de seguidores
const removeFollowerValidation = async (title, username) => {
    const page = await Page.findOne({title})
    if (!page) {
        throw new NotFoundError('Page not found');
    }
    const user = await User.findOne({username})
    if (!user) {
        throw new NotFoundError('Follower not found');
    }

    if (!page.followers.includes(user.id)) {
        throw new NotFoundError('User is not a follower');
    }
    if (!user.followPages.includes(page.id)) {
        throw new NotFoundError('Page is not followed by user');
    }
}

export { pageValidation, deletePageValidation, updatePageValidation, addNewPublicationValidation, addFollowerValidation, removeFollowerValidation};