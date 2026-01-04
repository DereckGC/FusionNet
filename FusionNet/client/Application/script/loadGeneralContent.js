// Evento que se ejecuta cuando el DOM se ha cargado completamente
window.addEventListener('DOMContentLoaded', async function () {
    await Initsession(); // Inicializa la sesión
});

// Función asincrónica para inicializar la sesión
const Initsession = async () => {
    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/auth/checkAuth`);
        if (response.ok) {
            const data = await response.json();
            const user = await data.user;
            const username = user.username;
            document.getElementById('imageProfile').src = user.avatar; // Establece el avatar del usuario
            await Promise.all([
                loadLikeNotification(username),
                loadCommentNotification(username),
                loadMentionNotification(username),
                loadFriendNotification(username),
            ]);
        } else {
            const refresh = await fetch(`${localStorage.getItem('URL')}/api/auth/refreshToken`);
            if (refresh.ok) {
                return session();
            } else {
                window.location.href = '/login/login.html'; // Redirige a la página de login si no se puede refrescar el token
            }
        }
    } catch (error) {
        console.error('Error fetching session:', error);
    }
};

// Función asincrónica para cerrar sesión
async function logout() {
    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/auth/logout`);
        if (response.ok) {
            window.location.href = '/login/login.html'; // Redirige a la página de login
        }
    } catch (error) {
        console.log(error);
    }
}

// Función asincrónica para cargar el conteo de notificaciones
async function loadNotificationCount(endpoint, badgeId) {
    try {
        const response = await fetch(endpoint);
        if (response.ok) {
            const notifications = await response.json();
            document.querySelector(badgeId).textContent = notifications.length; // Actualiza el conteo de notificaciones
        }
    } catch (error) {
        console.log(error);
    }
}

// Funciones para cargar diferentes tipos de notificaciones
async function loadLikeNotification(username) {
    await loadNotificationCount(`${localStorage.getItem('URL')}/api/notification/likes/${localStorage.getItem('user')}`, '#likesBadge');
}

async function loadCommentNotification(username) {
    await loadNotificationCount(`${localStorage.getItem('URL')}/api/notification/comments/${localStorage.getItem('user')}`, '#commentsBadge');
}

async function loadMentionNotification(username) {
    await loadNotificationCount(`${localStorage.getItem('URL')}/api/notification/mentions/${localStorage.getItem('user')}`, '#mentionsBadge');
}

async function loadFriendNotification(username) {
    await loadNotificationCount(`${localStorage.getItem('URL')}/api/notification/friend/requests/${localStorage.getItem('user')}`, '#friendsBadge');
}

// Función genérica para cargar notificaciones en modales
async function loadNotifications(endpoint, listId) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) return;
        
        const notifications = await response.json();
        const listElement = document.getElementById(listId);
        
        // Construye la lista de notificaciones
        listElement.innerHTML = notifications.map(notification => `
            <li class="d-flex align-items-center mb-2">
                <img src="${notification.sender.avatar}" class="rounded-circle" style="width: 35px; height: 35px; object-fit: cover;" alt="User Avatar">
                <div class="ms-3">
                    <strong>${notification.sender.username}</strong>
                    <p class="ms-auto">${notification.content}</p>
                </div>
                
                <button class="btn delete-button btn-danger btn-sm ms-auto" data-notification-id="${notification.id}">Delete</button>
            </li>
        `).join('');
    } catch (error) {
        console.log(error);
    }
}

// Event listeners para los modales
document.getElementById('mentionsModal').addEventListener('show.bs.modal', () => {
    loadNotifications(`${localStorage.getItem('URL')}/api/notification/mentions/${localStorage.getItem('user')}`, 'mentionsList');
});

document.getElementById('commentsModal').addEventListener('show.bs.modal', () => {
    loadNotifications(`${localStorage.getItem('URL')}/api/notification/comments/${localStorage.getItem('user')}`, 'commentsList');
});

document.getElementById('heartModal').addEventListener('show.bs.modal', () => {
    loadNotifications(`${localStorage.getItem('URL')}/api/notification/likes/${localStorage.getItem('user')}`, 'heartList');
});

document.getElementById('friendRequestModal').addEventListener('show.bs.modal', () => {
    loadFriendRequests();
});

// Delegación de eventos para los botones de eliminar
document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete-button')) {
        const notificationId = event.target.getAttribute('data-notification-id');
        
        try {
            const response = await fetch(`${localStorage.getItem('URL')}/api/notification/${notificationId}`, { method: 'DELETE' });
            if (response.ok) {
                event.target.closest('li').remove();
                loadLikeNotification();
                loadCommentNotification();
                loadMentionNotification();
                loadFriendNotification();
            } else {
                console.error(`Failed to delete notification ${notificationId}.`);
            }
        } catch (error) {
            console.error(`Error deleting notification ${notificationId}:`, error);
        }
    }
});

// Función asincrónica para manejar solicitudes de amistad
async function handleFriendRequest(idNotification, sender, answer) {
   
    try {
        const username = localStorage.getItem('user');
        const response = await fetch(`${localStorage.getItem('URL')}/api/user/friend/request/accept`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idNotification, sender, receiver: username, answer })
        });

        if (!response.ok) {
            //showMessage("Failed to process request");
            return;
        }

        // Elimina la solicitud de la lista después de la acción
        document.querySelector(`button[data-request-id="${idNotification}"]`).parentElement.remove()
        loadFriendNotification()
    } catch (error) {
        console.error("Error processing request:", error);
    }
}

// Función asincrónica para cargar solicitudes de amistad
async function loadFriendRequests() {
    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/notification/friend/requests/${localStorage.getItem('user')}`);
        if (!response.ok) return;
        
        const friendRequests = await response.json();
        const listElement = document.getElementById("friendRequestList");
        
        // Construye la lista de solicitudes de amistad
        listElement.innerHTML = friendRequests.map(request => `
            <li class="d-flex align-items-center mb-2 p-2 border rounded">
                <img src="${request.sender.avatar}" class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover;" alt="User Avatar">
                <div class="ms-3">
                    <strong>${request.sender.username}</strong>
                    <p class="text-muted mb-0">Sent you a friend request</p>
                </div>
                
                <button class="btn btn-success btn-sm ms-auto me-1 accept-button" 
                    data-request-id="${request.id}" 
                    data-sender-id="${request.sender.username}">
                    Accept
                </button>

                <button class="btn btn-danger btn-sm reject-button" 
                    data-request-id="${request.id}" 
                    data-sender-id="${request.sender.username}">
                    Reject
                </button>
            </li>
        `).join('');

        // Añade event listeners a los botones
        document.querySelectorAll(".accept-button").forEach(button => {
            button.addEventListener("click", async () => {
                const requestId = button.dataset.requestId;
                const senderId = button.dataset.senderId;
                handleFriendRequest(requestId, senderId, 'accept');
            });
        });
        
        document.querySelectorAll(".reject-button").forEach(button => {
            button.addEventListener("click", async () => {
                const requestId = button.dataset.requestId;
                const senderId = button.dataset.senderId;
                handleFriendRequest(requestId, senderId, 'decline');
            });
        });

    } catch (error) {
        console.error("Error loading friend requests:", error);
    }
}

// Función para mostrar un mensaje de notificación
const showMessage = (message) => {
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
    }).showMessage();
};