import dotenv from 'dotenv';
dotenv.config();
//En este documento se configuran las variables de entorno para evitar tener estar llamando todo el tiempo a process.env
//aqui se encuentra el puerto, la clave secreta para el token y la clave secreta para el token de refresco
//tambien se encuentra la cantidad de post dinamicos que se quieren mostrar en el home, esto se puede cambiar en el archivo .env
export const config = {
  PORT: process.env.PORT || 5000,
  SECRET_JWT_KEY: process.env.SECRET_JWT_KEY,
  SECRET_JWT_REFRESH_KEY: process.env.SECRET_JWT_REFRESH_KEY,
  COUNT_DYNAMIC_POST : process.env.COUNT_DYNAMIC_POST,
}