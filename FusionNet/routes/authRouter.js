import express from 'express';
const router = express.Router();
import {login, checkAuth, refreshToken, logout} from '../controllers/authController.js';

router.post('/login', login); //Login
router.get('/checkAuth', checkAuth); //Chequear si el usuario esta logeado usando el token que se le asigna
router.get('/logout', logout); //Logout del usuario que limpiua el token 
router.get('/refreshToken', refreshToken); //Refrescar el token del usuario en caso de que se expire el token normal

export default router;