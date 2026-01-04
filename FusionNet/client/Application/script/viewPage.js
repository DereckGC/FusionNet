// Obtiene los parámetros de la URL
const urlParams = new URLSearchParams(window.location.search);
const title = urlParams.get('title');

// Evento que se ejecuta cuando la página se carga
window.onload = async () => {
    if (!title) {
        showToast("⚠️ No title parameter found in URL.");
        return; // Detener la ejecución si no se encuentra el título.
    }

    try {
        // Realiza una solicitud para buscar la página por título
        const response = await fetch(`${localStorage.getItem('URL')}/api/page/search/${title}`);
        if (!response.ok) {
            showToast(`⚠️ Page not found`);
            setTimeout(() => {
                window.location.href = '/Application/views/pages.html';
            }, 3000);
        } else {
            const page = await response.json();
            renderPage(page); // Renderiza la página
            loadPublications(page.id); // Carga las publicaciones de la página
        }
    } catch (error) {
        showToast('⚠️ Error loading page');
        setTimeout(() => {
            window.location.href = '/Application/views/pages.html';
        }, 3000);
    }
};

// Función para renderizar la página
const renderPage = (page) => {
    // Establece valores predeterminados en caso de que las propiedades no estén disponibles
    document.getElementById('imagePage').src = page.imageProfile || 'default-image.jpg';
    document.getElementById('title').textContent = page.title || 'No Title Available';
    document.getElementById('description').textContent = page.description || 'No description available';

    // Validación para autor
    document.getElementById('authorAvatar').src = page.author?.avatar || 'default-avatar.jpg';
    document.getElementById('authorUsername').textContent = page.author?.username || 'Unknown Author';

    // Validación para los campos de contacto
    document.getElementById('email').textContent = page.email ? `Email: ${page.email}` : 'Email: Not available';
    document.getElementById('phone').textContent = page.phone ? `Phone: ${page.phone}` : 'Phone: Not available';

    // Validación para los seguidores y publicaciones
    document.getElementById('followers').textContent = `Followers: ${page.followers ? page.followers.length : 0}`;
    document.getElementById('publications').textContent = `Publications: ${page.publications ? page.publications.length : 0}`;
};

// Función asincrónica para seguir una página
const followPage = async () => {
    const username = localStorage.getItem('user');
    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/page/follow/${title}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });
        if (response.ok) {
            showToast('✅ You are now following this page');
            // Incrementar el número de seguidores
            const followersElement = document.getElementById('followers');
            const currentFollowers = parseInt(followersElement.textContent.split(': ')[1]);
            followersElement.textContent = `Followers: ${currentFollowers + 1}`;
        } else {
            const errorData = await response.json();
            showToast(`⚠️ ${errorData.message}`);
        }
    } catch (error) {
        showToast('⚠️ Error following the page');
    }
};

// Función asincrónica para dejar de seguir una página
const unfollowPage = async () => {
    const username = localStorage.getItem('user');
    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/page/unfollow/${title}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });
        if (response.ok) {
            showToast('✅ You have unfollowed this page');
            // Decrementar el número de seguidores
            const followersElement = document.getElementById('followers');
            const currentFollowers = parseInt(followersElement.textContent.split(': ')[1]);
            followersElement.textContent = `Followers: ${currentFollowers - 1}`;
        } else {
            const errorData = await response.json();
            showToast(`⚠️ ${errorData.message}`);
        }
    } catch (error) {
        showToast('⚠️ Error unfollowing the page');
    }
};

// Función para mostrar un mensaje de notificación
const showToast = (message) => {
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "center",
        style: {
            background: "linear-gradient(to right, #8B6508, #DAA520)", // Dorado oscuro
            color: "white",
            fontWeight: "bold",
            borderRadius: "8px",
            padding: "10px 20px",
        }
    }).showToast();
};

// Función asincrónica para cargar las publicaciones de la página
const loadPublications = async (idPage) => {
    const response = await fetch(`${localStorage.getItem('URL')}/api/page/publication/${idPage}`);
    const data = await response.json();
    const publicationsContainer = document.getElementById('postContainer');
    publicationsContainer.innerHTML = ''; // Limpia el contenido previo
    const publications = data.publications;
    

    // Itera sobre cada publicación y genera el HTML correspondiente
    publications.forEach(publication => {
        const hasImage = publication.multimedia && publication.multimedia.trim() !== "";
        const previewText = publication.content ? publication.content.substring(0, 100) + "..." : "No content available";

        const publicationElement = document.createElement('div');
        publicationElement.className = 'col'; // Usa el tamaño automático de Bootstrap para 3 por fila
        publicationElement.innerHTML = `
             <a href="/publication/views/loadAllPublicationPages.html?id=${publication._id}&title=${title}" class="publication-link"> 
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
