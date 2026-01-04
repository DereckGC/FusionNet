// Evento que se ejecuta cuando el DOM se ha cargado completamente
window.addEventListener('DOMContentLoaded', async function () {
    const user = await getSession(); // Obtiene la sesión del usuario actual
    loadPublications(user.username); // Carga las publicaciones del usuario
    document.getElementById('avatar').src = user.avatar; // Establece el avatar del usuario
    document.getElementById('username').innerText = user.username; // Establece el nombre de usuario
    document.getElementById('email').innerText = user.email; // Establece el email del usuario
    document.getElementById('cantPublications').innerText = user.publications.length; // Establece el número de publicaciones
    document.getElementById('cantFriends').innerText = user.friends.length; // Establece el número de amigos
    document.getElementById('cantFollowPages').innerText = user.followPages.length; // Establece el número de páginas seguidas
    document.getElementById('biography').innerText = user.biography; // Establece la biografía del usuario
});

// Función asincrónica para obtener la sesión del usuario actual
const getSession = async () => {
    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/auth/checkAuth`);
        if (response.ok) {
            const data = await response.json();
            const user = await getUser(data.user.username); // Obtiene los datos del usuario
            return user;
        }
    } catch (error) {
        console.error('Error fetching session:', error);
    }
};

// Función asincrónica para obtener los datos de un usuario por nombre de usuario
const getUser = async (username) => {
    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/user/${username}`);
        if (response.ok) {
            const user = await response.json();
            return user;
        }
    } catch (error) {
        console.error('Error in get user data', error);
    }
}

// Función asincrónica para cargar las publicaciones del usuario
const loadPublications = async (username) => {
    const response = await fetch(`${localStorage.getItem('URL')}/api/publication/${username}`);
    const publications = await response.json();
    const publicationsContainer = document.getElementById('postContainer');
    publicationsContainer.innerHTML = ''; // Limpia el contenido previo

    // Itera sobre cada publicación y genera el HTML correspondiente
    publications.forEach(publication => {
        const hasImage = publication.multimedia && publication.multimedia.trim() !== "";
        const previewText = publication.content ? publication.content.substring(0, 100) + "..." : "No content available";

        const publicationElement = document.createElement('div');
        publicationElement.className = 'col'; // Usa el tamaño automático de Bootstrap para 3 por fila
        publicationElement.innerHTML = `
             <a href="loadMyPublications.html?id=${publication.id}" class="publication-link"> 
            <div class="imgContainer ${hasImage ? '' : 'no-image'}">
                ${hasImage 
                    ? `<img src="${publication.multimedia}" class="post-img">` 
                    : `<div class="text-preview">${previewText}</div>`}
            </div>
            </a>
        `;
        publicationsContainer.appendChild(publicationElement);
    });
};

// Función para redirigir a la vista de páginas seguidas
const goToViewPagesFollowed = () => {
    window.location.href = '/Application/views/pagesByUser.html?pagesFollowed=' + true;
}

// Función para redirigir a la vista de amigos
const goToViewFriends = () => {
    window.location.href = '/Application/views/searchUsers.html?viewFriends=' + true;
}