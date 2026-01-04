import mongoose from 'mongoose'
import { type } from 'os';
import { title } from 'process';
const { Schema } = mongoose;
import moment from 'moment';
const PublicationSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, //
    authorPage:{
        type: Schema.Types.ObjectId,
        ref: 'Page',
        required: false
    }, // en caso de que se haya creando la pulicacion desde una pagina a la hora de devolverla en el feed se debe mostrar el creador 
    // (osea la pagina) como un objeto para acceder a su informacion
    // dentro de la base de datos no tendra ningun efecto, sera usado solamente para el envio de datos al front, ya que al hacer
    // populate a el autor de la publicacion siendo una pagina lanzara un error
    title: {
        type: String,
        required: true
    }, // titulo de la publicacion, tiene que ser unico 
    content: {
        type: String,
        required: true
    }, // contenido de la publicacion
    multimedia: {
        type: String,
        required: false
    }, //imagen de la publicacion
    date: {
        type: String,
        required: true,
        default: moment().format('MMMM Do YYYY, h:mm:ss a') //se utiliza moment para obtener la fecha y hora actual, se formatea la fecha 
    },
    type: { //type page en caso de que la publicacion sea de una pagina
        type: String,
        required: false
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }], //arreglo de usuarios que dieron like a la publicacion
    comments: [{
        user : {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        comment: {
            type: String,
            required: true
        },
    }] // arreglo de comentarios de la publicacion junto con el usuario que lo realizo
})

PublicationSchema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject()
    object.id = _id
    return object
})

const Publication = mongoose.model('Publication', PublicationSchema)
export default Publication;