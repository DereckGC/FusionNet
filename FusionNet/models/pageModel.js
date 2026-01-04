import mongoose from 'mongoose'
const { Schema } = mongoose;

const PageSchema = new Schema({
    title:{ //Nombre de la página
        type: String,
        required: true
    }, //Id del usuario que creo la pagina
    author:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, //Imagen de perfil de la página
    imageProfile:{
        type: String,
        default: 'https://www.w3schools.com/w3images/avatar2.png',
        required: true
    }, //descripcion de la página
    description:{
        type: String,
        required: true
    }, //descripcion de la página
    followers:{
        type: [Schema.Types.ObjectId],
        ref: 'User',
        default: []
    }, // seguidores de la página
    publications:{
        type: [Schema.Types.ObjectId],
        ref: 'Publication',
        default: []
    }, // publicaciones de la página
    phone:{
        type: String,
        required: true
    }, // telefono de la página
    email:{
        type: String,
        required: true
    } // correo de la página
})

PageSchema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject()
    object.id = _id
    return object
})

export default mongoose.model('Page', PageSchema)