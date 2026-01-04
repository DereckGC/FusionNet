// Evento que se ejecuta cuando el DOM se ha cargado completamente
document.addEventListener('DOMContentLoaded', async function () {
    const username = localStorage.getItem('seeProfile'); // Obtiene el nombre de usuario del perfil a ver
    const currentUser = localStorage.getItem('user'); // Obtiene el nombre de usuario del usuario actual
    
    if (username && currentUser) {
        try {
            // Realiza solicitudes para obtener los datos del usuario y del usuario actual
            const userResponse = await fetch(`${localStorage.getItem('URL')}/api/user/${encodeURIComponent(username)}`);
            const currentUserResponse = await fetch(`${localStorage.getItem('URL')}/api/user/${encodeURIComponent(currentUser)}`);
            
            if (userResponse.ok && currentUserResponse.ok) {
                const user = await userResponse.json();
                const currentUserData = await currentUserResponse.json();
                const isBlocked = currentUserData.blockedUsers.includes(user.id); // Verifica si el usuario está bloqueado
                
                // Renderiza el contenido del perfil
                document.getElementById('profileContent').innerHTML = `
                    <div class="container">
                        <div class="row">
                            <div class="col-12 d-flex flex-column align-items-center">
                                <div id="Avatar" class="text-center mb-4">
                                    <div class="h3 mb-3">
                                        <strong id="username">${user.username}</strong>
                                        ${isBlocked ? '<span id="blockedTag" style="color: red; font-weight: bold;"> (Blocked)</span>' : ''}
                                    </div>
                                    <div class="imageAvatar">
                                        <img id="avatar" src="${user.avatar}" alt="Avatar" class="rounded-circle" style="width: 10rem; height: 10rem;">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row text-center mb-4">
                            <div id="publis" class="col">
                                <span id="cantPublications" class="h4 d-block"><strong>${user.publications.length}</strong></span>
                                <span><strong>Publications</strong></span>
                            </div>
                            <div id="followers" class="col">
                                <span id="cantFriends" class="h4 d-block"><strong>${user.friends.length}</strong></span>
                                <span><strong>Friends</strong></span>
                            </div>
                            <div id="friends" class="col">
                                <span id="cantFollowPages" class="h4 d-block"><strong>${user.followPages.length}</strong></span>
                                <span><strong>Following Page</strong></span>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12">
                                <div id="biographyContent" class="text-center">
                                    <p class="lead">
                                        <strong id="biography">${user.biography}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="row mt-4">
                            <div class="col-12 d-flex justify-content-center gap-3">
                                <a href="#" class="btn btn-primary w-auto text-center" onclick="sendFriendRequest()">Send Friend Request</a>
                                <a href="#" class="btn btn-danger w-auto text-center" onclick="blockUser()">Block User</a>
                            </div>
                            <div class="col-12 d-flex justify-content-center gap-3 mt-3">
                                <a href="#" class="btn btn-primary w-auto text-center" onclick="deleteFriend()">Delete Friend</a>
                                <a href="#" class="btn btn-danger w-auto text-center" onclick="unlockUser()">Unlock User</a>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                console.error('Error fetching user profile:', userResponse.statusText);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    } else {
        console.error('No username found in localStorage');
    }
    await loadPublications(); // Carga las publicaciones del usuario
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

// Función asincrónica para enviar una solicitud de amistad
const sendFriendRequest = async () => {
    const username = localStorage.getItem('seeProfile');
    if (username) {
        const receiver = await getUser(username);
        const sender = await getUser(localStorage.getItem('user'));
        const content = `${sender.username} wants to be your friend`;
        try {
            const response = await fetch(`${localStorage.getItem('URL')}/api/notification/friend/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sender: sender.username, receiver: receiver.username, content })
            });
            if (response.status == 201) {
                showToast('✅ Friend request sent successfully');
            } else {
                const message = await response.json();
                showToast(`⚠️ ${message.message}`);
            }
        } catch (error) {
            console.error('Error sending friend request:', error);
        }
    } else {
        console.error('No username found in localStorage');
    }
};

// Función asincrónica para eliminar un amigo
const deleteFriend = async () => {
    const username = localStorage.getItem('seeProfile');
    if (username) {
        const receiver = await getUser(username);
        const sender = await getUser(localStorage.getItem('user'));
        try {
            const response = await fetch(`${localStorage.getItem('URL')}/api/user/friend/delete/${sender.username}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ friendUsername: receiver.username })
            });
            if (response.ok) {
                showToast('✅ Friend deleted successfully');
            } else {
                const message = await response.json();
                showToast(`⚠️ ${message.message}`);
            }
        } catch (error) {
            console.error('Error deleting friend:', error);
        }
    } else {
        console.error('No username found in localStorage');
    }
}

// Función asincrónica para bloquear a un usuario
const blockUser = async () => {
    const username = localStorage.getItem('seeProfile');
    if (username) {
        const user = await getUser(localStorage.getItem('user'));
        const userToBlock = await getUser(username);
        try {
            const response = await fetch(`${localStorage.getItem('URL')}/api/user/block/${user.username}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ blockUsername: userToBlock.username })
            });
            if (response.ok) {
                showToast('✅ User blocked successfully');

                // Agregar el indicador de "Blocked" junto al nombre
                const usernameElement = document.getElementById('username');
                if (usernameElement && !document.getElementById('blockedTag')) {
                    const blockedTag = document.createElement('span');
                    blockedTag.id = 'blockedTag';
                    blockedTag.textContent = ' (Blocked)';
                    blockedTag.style.color = 'red';
                    blockedTag.style.fontWeight = 'bold';
                    usernameElement.appendChild(blockedTag);
                }
            } else {
                const message = await response.json();
                showToast(`⚠️ ${message.message}`);
            }
        } catch (error) {
            console.error('Error blocking user:', error);
        }
    } else {
        console.error('No username found in localStorage');
    }
};

// Función asincrónica para desbloquear a un usuario
const unlockUser = async () => {
    const username = localStorage.getItem('seeProfile');
    const user = await getUser(localStorage.getItem('user'));
    const userToUnlock = await getUser(username);
    
    if (username && user && userToUnlock) {
        try {
            const response = await fetch(`${localStorage.getItem('URL')}/api/user/unlock/${user.username}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ unlockUsername: userToUnlock.username })
            });

            if (response.ok) {
                showToast('✅ User unlocked successfully');
                
                // Eliminar el nuevo indicador "(Blocked)"
                document.getElementById('blockedTag')?.remove();
                
            } else {
                const message = await response.json();
                showToast(`⚠️ ${message.message}`);
            }
        } catch (error) {
            console.error('Error unlocking user:', error);
        }
    } else {
        console.error('No username found in localStorage');
    }
};

// Función para obtener los datos de un usuario
const getUser = async (username) => {
    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/user/${encodeURIComponent(username)}`);
        if (response.ok) {
            return await response.json();
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

// Función asincrónica para cargar las publicaciones del usuario
const loadPublications = async () => {
    const response = await fetch(`${localStorage.getItem('URL')}/api/publication/${localStorage.getItem('seeProfile')}`);
    const publications = await response.json();
    const publicationsContainer = document.getElementById('postContainer');
    publicationsContainer.innerHTML = ''; // Limpia el contenido previo
    if(!response.ok){
        publicationsContainer.innerHTML = '<div class="col-12 text-center"><h3>No publications available</h3></div>';
    } else {
        publications.forEach(publication => {
            const hasImage = publication.multimedia && publication.multimedia.trim() !== "";
            const previewText = publication.content ? publication.content.substring(0, 100) + "..." : "No content available";
    
            const publicationElement = document.createElement('div');
            publicationElement.className = 'col'; // Usa el tamaño automático de Bootstrap para 3 por fila
            publicationElement.innerHTML = `
                 <a href="/publication/views/fullProfile.html?id=${publication.id}" class="publication-link"> 
                <div class="imgContainer ${hasImage ? '' : 'no-image'}">
                    ${hasImage 
                        ? `<img src="${publication.multimedia}" class="post-img">` 
                        : `<div class="text-preview">${previewText}</div>`}
                </div>
                </a>
            `;
            publicationsContainer.appendChild(publicationElement);
        });
    }
};