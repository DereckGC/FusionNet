import cron from 'node-cron'; 
import User from '../models/userModel.js'; 
import mongoose from 'mongoose'; 

const createDynamicPublication = async (task) => {
    try {
        let user = await User.findOne({ username: 'admin' });
        if (!user) {
            user = {username:'admin', email:'admin@gmail.com', password:'passWordAdmin', biography:'Aministrator', avatar:'/avatars/avatar_king.png'};
            const response = await fetch('http://localhost:3000/api/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });
            user = await User.findOne({ username: 'admin' });
        }

        let dinamicPublications = mongoose.connection.collection('dinamic_publications'); 
        let publications = await dinamicPublications.find({}).toArray(); 
        let content = publications[user.publications.length]; 

        if (!content) {
            task.stop(); 
            return;
        }

        if (user.publications.length >= publications.length) {
            task.stop(); 
            return;
        }

        const response = await fetch('http://localhost:3000/api/publication/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: content.title,
                content: content.content,
                author: user.username,
                dinamicPost: true,
                multimedia: content.multimedia
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message}`);
        }

    } catch (error) {
    }
};

const task = cron.schedule('* * * * *', () => createDynamicPublication(task));