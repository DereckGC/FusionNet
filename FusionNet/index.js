// Importaciones
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path, { join } from 'path';

import apiRouter from './apiRouter.js';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import { config } from './utility/envConfig.js';
import { fileURLToPath } from 'url';

import { errorMidleware } from './middlewares/errorMiddleware.js';
import './config/cronJob.js';

dotenv.config();
connectDB();

const app = express();

app.use(cookieParser());
app.use(cors({

}));

app.use(express.json());

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'client')));


app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'Login/login.html'));
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/avatars', express.static(path.join(__dirname, 'avatars')));

app.use(errorMidleware)

app.listen(config.PORT, () => {
  console.log(`Server is running on http://localhost:${config.PORT}`);
  console.log(`Server is running on http://localhost:${config.PORT}/api`);
});

//IMPLEMENTAR EL MIDDLEWARE DE AUTENTICACION DE USUARIO CON JWT 