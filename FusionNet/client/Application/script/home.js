// Al cargar el contenido de la página, cargar el feed del usuario
window.addEventListener('DOMContentLoaded', async function () {
    const username = localStorage.getItem('user'); // Obtener el nombre de usuario desde el almacenamiento local
    let feed = [];
    const user = await getUser(username); // Obtener los datos del usuario
    if (user.firstTime) {
        showToast(`Welcome To our social media have a good day ${user.username}`); // Mostrar mensaje de bienvenida si es la primera vez del usuario
        const response = await fetch(`${localStorage.getItem('URL')}/api/user/firstTime/${localStorage.getItem('user')}`); // Actualizar el estado de primera vez del usuario
    }

    if (username) {
        feed = await loadFeed(username); // Cargar el feed del usuario
        if (feed && feed.length > 0) {
            feed.sort(() => Math.random() - 0.5); // Desordenar el array
            loadPublications(feed); // Cargar las publicaciones en el feed
        }
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

// Función para obtener los datos del usuario
const getUser = async (username) => {
    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/user/${encodeURIComponent(username)}`); // Hacer una solicitud para obtener los datos del usuario
        if (response.ok) {
            return await response.json(); // Convertir la respuesta a JSON y retornar los datos del usuario
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error blocking user:', error); // Mostrar error en la consola
    }
}

// Función para eliminar el estado de primera vez del usuario
const userLoged = async () => {
    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/user/deleteFirstTime/${localStorage.getItem('user')}`); // Hacer una solicitud para eliminar el estado de primera vez del usuario
    } catch (error) {
        console.error('Error in get user data', error); // Mostrar error en la consola
    }
}

// Función para cargar el feed del usuario
const loadFeed = async (username) => {
    const response = await fetch(`${localStorage.getItem('URL')}/api/user/feed/${username}`); // Hacer una solicitud para obtener el feed del usuario
    const feed = await response.json(); // Convertir la respuesta a JSON
    return feed; // Retornar el feed
}

// Función para cargar las publicaciones en el feed
const loadPublications = async (publications) => {
    const publicationContainer = document.getElementById('postContainer'); // Obtener el contenedor de publicaciones
    publicationContainer.innerHTML = ''; // Limpiar el contenido anterior

    publications.forEach(publication => {
        const authorPage = publication.type == 'page' ? true : false; // Verificar si la publicación es de una página

        const htmlContent = `
        <div class="container publication mt-5 text-dark">
            <div class="row">
                <div class="col-md-8 offset-md-2 bg-light p-3">

                    <!-- Encabezado de la publicación con información del autor -->
                    <div class="d-flex align-items-center mb-3" id="${publication.id}" >
                        <img src="${authorPage ? publication.authorPage.imageProfile : publication.author.avatar}" class="rounded-circle" alt="Author Avatar" style="width: 40px; height: 40px; object-fit: cover;">
                        <h5 class="ms-3 mb-0" id="authorName">${authorPage ? publication.authorPage.title : publication.author.username}</h5>
                        <h5 class="ms-3 mb-0" id="authorName">${publication.date}</h5>
                    </div>

                    <!-- Imagen de la publicación -->
                    <div class="text-center mb-3" onclick="${authorPage ? `goToViewPage('${publication.authorPage.title}')` : `goToViewProfile('${publication.author.username}')`}">
                        <img src="${publication.multimedia || "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjdnNjFveDR3bDhjN3Fqcng4bmQ1MTd2enh2dzR1b3FnZjd6MWVtMSZlcD12MV9pbnRlcm5naWZfYnlfaWQmY3Q9Zw/C21GGDOpKT6Z4VuXyn/giphy.gif"}" class="img-fluid rounded" alt="Post GIF">
                    </div>

                    <!-- Descripción de la publicación -->
                    <h5 class="" id="title">${publication.title}</h5>
                    <p id="postDescription" class="fs-5 text-dark mb-3">${publication.content}</p>

                    <!-- Acciones de la publicación (Me gusta, Comentario) -->
                    <div class="d-flex justify-content-between mb-4" >
                        <button class="btn btnPublication btn-outline-primary like-button" data-publication-id="${authorPage ? publication.id : publication.id}">
                            <i class="bi bi-heart"></i> Like
                            <span class="like-count ms-2">${publication.likes.length}</span> <!-- Número de Me gusta -->
                        </button>
                        
                        <button class="btn btnPublication btn-outline-primary comment-btn see-who-liked-btn" data-publication-id="${publication.id}">
                            <i class="bi bi-chat"></i> See who liked
                        </button>
                    </div>

                    <!-- Sección de comentarios -->
                    <div class="mb-4 comments-section overflow-scroll text-dark" >
                        ${publication.comments.map(comment => `
                        <div class="d-flex align-items-start mb-2">
                            <img src="${comment.user.avatar}" class="rounded-circle" style="width: 35px; height: 35px; object-fit: cover;" alt="User Avatar">
                            <div class="ms-3">
                                <strong>${comment.user.username}</strong>
                                <p class="mb-0">${comment.comment}</p>
                            </div>
                        </div>
                        `).join('')}
                    </div>

                    <!-- Sección para añadir un comentario -->
                    <div class="d-flex">
                        <input type="text" class="form-control me-2 userComment" placeholder="Add a comment...">
                        <button class="btn postButton btn-primary" data-comment-id="${publication._id || publication.id}">Post</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        // Añadir el HTML generado para cada publicación al contenedor
        publicationContainer.innerHTML += htmlContent;
    });

    // Añadir eventos a los botones de publicar comentario
    const postCommentButton = document.querySelectorAll('.postButton');
    postCommentButton.forEach(button => {
        button.addEventListener('click', async (event) => {
            const buttonElement = event.target.closest('.postButton');
            const publicationIdComment = buttonElement.getAttribute('data-comment-id');
            const commentText = buttonElement.previousElementSibling.value;
            try {
                const response = await fetch(`${localStorage.getItem('URL')}/api/publication/comment/${publicationIdComment}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ user: localStorage.getItem('user'), comment: commentText }) // Enviar los datos del comentario
                });
                if (response.ok) {
                    document.querySelector('.userComment').value = ''; // Limpiar el campo de entrada del comentario
                    const commentsSection = buttonElement.closest('.container').querySelector('.comments-section');
                    const data = await response.json();
                    
                    // Añadir temporalmente el comentario a la página
                    const newCommentHtml = `
                        <div class="d-flex align-items-start mb-2">
                            <img src="${data.avatar}" class="rounded-circle" style="width: 35px; height: 35px; object-fit: cover;" alt="User Avatar">
                            <div class="ms-3">
                                <strong>${data.username}</strong>
                                <p class="mb-0">${commentText}</p>
                            </div>
                        </div>
                    `;
                    commentsSection.innerHTML += newCommentHtml;
                }
            } catch (error) {
                console.error(`Error posting comment to publication ${publicationIdComment}:`, error); // Mostrar error en la consola
            }
        });
    });

    // Añadir eventos a los botones de Me gusta
    const likeButtons = document.querySelectorAll('.like-button');
    likeButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const buttonElement = event.target.closest('.like-button');
            const publicationId = buttonElement.getAttribute('data-publication-id');
            try {
                const response = await fetch(`${localStorage.getItem('URL')}/api/publication/like/${publicationId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: localStorage.getItem('user') }) // Enviar los datos del usuario que da Me gusta
                });
                if (response.ok) {
                    const likeCountSpan = buttonElement.querySelector('.like-count');
                    likeCountSpan.textContent = parseInt(likeCountSpan.textContent) + 1; // Incrementar el contador de Me gusta
                } else {
                    console.error(`Failed to like publication ${publicationId}.`);
                }
            } catch (error) {
                console.error(`Error liking publication ${publicationId}:`, error); // Mostrar error en la consola
            }
        });
    });

    // Añadir eventos a los botones de ver quién dio Me gusta
    const seeWhoLikedButtons = document.querySelectorAll('.see-who-liked-btn');
    seeWhoLikedButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const publicationId = event.target.getAttribute('data-publication-id');
            const modalBody = document.querySelector('#likeModal .modal-body');
            
            try {
                const response = await fetch(`${localStorage.getItem('URL')}/api/publication/likesName/${publicationId}`); // Hacer una solicitud para obtener los nombres de los usuarios que dieron Me gusta
                const likesData = await response.json();
                
                modalBody.innerHTML = ''; // Limpiar el contenido del modal
                
                if (likesData.length > 0) {
                    likesData.forEach(like => {
                        const likeItemHtml = `
                            <div class="d-flex align-items-center mb-2">
                                <img src="${like.avatar}" class="rounded-circle" style="width: 35px; height: 35px; object-fit: cover;" alt="User Avatar">
                                <div class="ms-3">
                                    <strong>${like.username}</strong>
                                </div>
                            </div>
                        `;
                        modalBody.innerHTML += likeItemHtml;
                    });
                } else {
                    modalBody.innerHTML = '<p>No one has liked this post yet.</p>'; // Mostrar mensaje si nadie ha dado Me gusta
                }
                const likeModal = new bootstrap.Modal(document.getElementById('likeModal'));
                likeModal.show(); // Mostrar el modal después de que se haya llenado el contenido
            } catch (error) {
                console.error(`Error fetching likes for publication ${publicationId}:`, error); // Mostrar error en la consola
            }
        });
    });
}

// Función para redirigir a la vista de la página
const goToViewPage = (title) => {
    window.location.href = `/Application/views/viewPage.html?title=${title}`;
}

// Función para redirigir a la vista del perfil
const goToViewProfile = (username) => {
    localStorage.setItem('seeProfile', username);
    window.location.href = '/Application/views/seeProfile.html';
}