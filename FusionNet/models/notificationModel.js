import mongoose from 'mongoose'
const { Schema } = mongoose;

const NotificationSchema = new Schema({
    sender: { //Quien envia la notificacion
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: { //Quien recibe la notificacion
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: { //Tipo de notificacion
        type: String,
        required: true
    },
    content: { //Contenido de la notificacion
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
})

NotificationSchema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject()
    object.id = _id
    return object
})

const Notification = mongoose.model('Notification', NotificationSchema)
export default Notification;