import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
//En este archivo se configura el servicio de envio de correos electronicos
//Se utiliza el modulo nodemailer para enviar correos electronicos, se eligio el nodemailer ya que es un modulo muy popular y facil de usar 
//similar al utilizado en el proyecto de MVC en .NET, se configura el servicio de correo electronico de gmail, se configura el usuario y contraseña del correo electronico
//se crea una funcion sendEmail que recibe como parametros el destinatario, el asunto y el cuerpo del correo electronico
//se crea un objeto transporter que contiene la configuracion del servicio de correo electronico
//se utiliza el metodo sendMail del objeto transporter para enviar el correo electronico, se configura el remitente, el destinatario, el asunto y el cuerpo del correo electronico  
//se crea un html con diseño personalizado para enviar el correo electronico
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
},
})

const sendEmail = async (to,subject,body) => {
    let emailBody = '';
   try {
       await transporter.sendMail({
           from: "Our social media",
           to: to,
           subject: subject,
           html: emailBody = `
           <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
               <h2 style="color: #007BFF;">Notification from your favorite social media please check us!</h2>
               <p>Dear ${to}</p>
               <p> ${body}</p>
              
               <p>Best regards,<br><strong>The Team</strong></p>
           </div>
       `
       })
   } catch (error) {
       console.log(error)
   }
}
export default sendEmail;