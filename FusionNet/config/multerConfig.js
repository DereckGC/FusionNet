import multer from 'multer'

//multer, un middleware de Node.js para manejar la subida de archivos en aplicaciones
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Ensure 'uploads/' exists
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
})

const upload = multer({ storage: storage })
export default upload;