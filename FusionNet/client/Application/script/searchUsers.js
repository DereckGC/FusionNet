// Obtiene los parámetros de la URL
const urlParams = new URLSearchParams(window.location.search);
let viewFriends = null;

// Verifica si la URL tiene el parámetro 'viewFriends'
if (urlParams.has('viewFriends')) {
    viewFriends = urlParams.get('viewFriends');
}

// Evento que se ejecuta cuando el DOM se ha cargado completamente
window.addEventListener('DOMContentLoaded', async function () {
    if (viewFriends) {
        await searchFriends(); // Si se están viendo los amigos, busca amigos
    } else {
        await getUsers(); // Si no, obtiene todos los usuarios
    }
});

// Función para mostrar un mensaje de notificación
const showToast = (message) => {
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "center",
        backgroundColor: "linear-gradient(to right, #8B6508, #DAA520)", // Dorado oscuro
        stopOnFocus: true,
        style: {
            color: "white",
            fontWeight: "bold",
            borderRadius: "8px",
            padding: "10px 20px",
        }
    }).showToast();
};

// Función asincrónica para buscar un usuario
const searchUser = async () => {
    try {
        const user = await getSession();
        const search = document.getElementById('search').value.trim(); // Eliminar espacios en blanco

        if (!search) {
            await getUsers(); // Cargar lista general de usuarios   
            return; // Detener ejecución
        }

        const response = await fetch(`${localStorage.getItem('URL')}/api/user/find/${user.username}/${search}`);
        // Limpiar contenedor antes de mostrar resultados nuevos
        const usersContainer = document.getElementById('users');
        usersContainer.innerHTML = "";

        if (!response.ok) {
            const message = await response.json();
            showToast(`⚠️ ${message.message}`);
            await getUsers(); // Cargar lista general de usuarios
            return; // Detener ejecución
        }

        const foundUser = await response.json();

        // Crear y añadir usuario encontrado
        const userContainer = document.createElement('div');
        userContainer.className = 'user-container';
        userContainer.onclick = () => seeProfile(foundUser.username);
        userContainer.innerHTML = `
            <img src="${foundUser.avatar}" class="user-avatar" onclick="seeProfile('${foundUser.username}')">
            <div class="user-info">
                <h3>${foundUser.username}</h3>
                <p>${foundUser.email}</p>
            </div>
        `;

        usersContainer.appendChild(userContainer);
    } catch (error) {
        console.error('Error searching users:', error);
        showToast('⚠️ Error searching users');
    }
};

// Función asincrónica para obtener todos los usuarios
const getUsers = async () => {
    try {
        const user = await getSession();
        if (!user || !user.username) {
            throw new Error('User session is invalid');
        }
        const response = await fetch(`${localStorage.getItem('URL')}/api/user/users/${encodeURIComponent(user.username)}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch users: ${response.statusText}`);
        }
        const users = await response.json();
        document.getElementById('users').innerHTML = "";
        users.forEach(user => {
            const userContainer = document.createElement('div');
            userContainer.className = 'user-container';
            userContainer.onclick = () => seeProfile(user.username);
            userContainer.innerHTML = `
                <img src="${user.avatar}" class="user-avatar" onclick="seeProfile('${user.username}')">
                <div class="user-info">
                    <h3>${user.username}</h3>
                    <p>${user.email}</p>
                </div>
            `;
            document.getElementById('users').appendChild(userContainer);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
};

// Función asincrónica para obtener la sesión del usuario actual
const getSession = async () => {
    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/auth/checkAuth`);
        if (!response.ok) {
            throw new Error(`Failed to check auth: ${response.statusText}`);
        }
        const data = await response.json();
        if (!data || !data.user) {
            throw new Error('Invalid session data');
        }
        const user = await getUser(data.user.username);
        return user;
    } catch (error) {
        console.error('Error fetching session:', error);
    }
};

// Función asincrónica para obtener los datos de un usuario por nombre de usuario
const getUser = async (username) => {
    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/user/${encodeURIComponent(username)}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch user data: ${response.statusText}`);
        }
        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Error in get user data:', error);
    }
};

// Función para ver el perfil de un usuario
const seeProfile = (username) => {
    localStorage.setItem('seeProfile', username);
    window.location.href = '/Application/views/seeProfile.html';
};

// Función asincrónica para buscar amigos
const searchFriends = async () => {
    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/user/friends/${localStorage.getItem('user')}`);

        if (!response.ok) {
            const message = await response.json();
            showToast(`⚠️ ${message.message}`);
            await getUsers();
            return;
        }

        const friends = await response.json();
        document.getElementById('users').innerHTML = "";
        friends.forEach(friend => {
            const userContainer = document.createElement('div');
            userContainer.className = 'user-container';
            userContainer.onclick = () => seeProfile(friend.username);
            userContainer.innerHTML = `
                <img src="${friend.avatar}" class="user-avatar" onclick="seeProfile('${friend.username}')">
                <div class="user-info">
                    <h3>${friend.username}</h3>
                    <p>${friend.email}</p>
                </div>
            `;
            document.getElementById('users').appendChild(userContainer);
        });
    } catch (error) {
        console.error('Error searching friends:', error);
    }
};