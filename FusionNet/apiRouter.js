// Se definen las rutas de la API en este archivo, se importan los archivos de rutas de los diferentes recursos de la API
import express from 'express'
const apiRouter = express.Router()
import authRouter from './routes/authRouter.js'
import userRouter from './routes/userRouter.js'
import notificationRouter from './routes/notificationRouter.js'
import PublicationRouter from './routes/publicationRouter.js'
import pageRouter from './routes/pageRouter.js'

apiRouter.use('/auth', authRouter)
apiRouter.use('/user', userRouter)
apiRouter.use('/notification', notificationRouter)
apiRouter.use('/publication', PublicationRouter)
apiRouter.use('/page', pageRouter)

apiRouter.get('/', (req, res) => {
  res.send('API is running')
})

export default apiRouter