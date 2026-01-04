import mongoose from 'mongoose'
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: { 
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    biography: {
        type: String,
        required: false
    },
    avatar: {  
        type: String,
        required: false
    }, 
    //atributos basicos
    friends: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    blockedUsers: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    //el usuario que es rechazado es en que guarda la informacion de quien lo rechazo
    rejectedFriendsRequest: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    //en que recibe la solicitud es quien guarda la informacion
    notifications: {
        type: [Schema.Types.ObjectId],
        ref: 'Notification', //esto es modelo notificacion
        default: []
    }, 
    publications: {
        type: [Schema.Types.ObjectId],
        ref: 'Publication', //esto es modelo publicacion
        default: []
    },
    followPages: {
        type: [Schema.Types.ObjectId],
        ref: 'Page', //esto es modelo pagina
        default: []
    }, 
    myPages: {
        type: [Schema.Types.ObjectId],
        ref: 'Page', //esto es modelo pagina
        default: []
    },
    firstTime: {
        type: Boolean,
        default: true
    },
});

UserSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject()
  object.id = _id
  return object
})

const User = mongoose.model('User', UserSchema)

export default User