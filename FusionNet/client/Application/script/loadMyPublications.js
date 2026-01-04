// Función asincrónica para cargar las publicaciones del usuario
const loadPublication = async () => {
    const author = localStorage.getItem('user'); // Obtiene el nombre del autor desde el almacenamiento local
    const response = await fetch(`${localStorage.getItem('URL')}/api/publication/${author}`); // Realiza una solicitud para obtener las publicaciones del autor
    const publications = await response.json(); // Convierte la respuesta a JSON
    const publicationContainer = document.getElementById('postContainer');
    publicationContainer.innerHTML = ''; // Limpia el contenido previo

    // Itera sobre cada publicación y genera el HTML correspondiente
    publications.forEach(publication => {
        const htmlContent = `
        <div class="container mt-5">
            <div class="row">
                <div class="col-md-8 offset-md-2 bg-light p-3">

                    <!-- Encabezado del post con información del autor -->
                    <div class="d-flex align-items-center mb-3" id="${publication.id}">
                        <img src="${publication.author.avatar}" class="rounded-circle" alt="Author Avatar" style="width: 40px; height: 40px; object-fit: cover;">
                        <h5 class="ms-3 mb-0" id="authorName">${publication.author.username}</h5>
                        <h5 class="ms-3 mb-0" id="authorName">${publication.date}</h5>
                    </div>

                    <!-- Imagen del post -->
                    <div class="text-center mb-3">
                        <img src="${publication.multimedia || "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjdnNjFveDR3bDhjN3Fqcng4bmQ1MTd2enh2dzR1b3FnZjd6MWVtMSZlcD12MV9pbnRlcm5naWZfYnlfaWQmY3Q9Zw/C21GGDOpKT6Z4VuXyn/giphy.gif"}" class="img-fluid rounded" alt="Post GIF">
                    </div>

                    <!-- Descripción del post -->
                    <h5 class="" id="title">${publication.title}</h5>
                    <p id="postDescription" class="fs-5 text-dark mb-3">${publication.content}</p>

                    <!-- Acciones del post (Like, Comment) -->
                    <div class="d-flex justify-content-between mb-4">
                        <button class="btn btnPublication btn-outline-primary like-button" data-publication-id="${publication.id}">
                            <i class="bi bi-heart"></i> Like
                            <span class="like-count ms-2">${publication.likes.length}</span> <!-- Número de Likes -->
                        </button>
                        
                        <button class="btn btnPublication btn-outline-primary comment-btn" onclick="deletePublication('${publication.id}', this)">
                            <i class="bi bi-trash3"></i> Delete
                        </button>
                    </div>

                    <!-- Sección de comentarios -->
                    <div class="mb-4 comments-section overflow-scroll text-dark">
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

                    <!-- Añadir un comentario -->
                    <div class="d-flex">
                        <input type="text" class="form-control me-2 userComment" placeholder="Add a comment...">
                        <button class="btn postButton btn-primary" data-comment-id="${publication.id}">Post</button>
                    </div>

                    <!-- Botón de regreso -->
                    <a href="profile.html" class="btn btnPublication btn-secondary mt-4 w-100">⬅ Back</a>
                </div>
            </div>
        </div>
        `;
        
        // Añade el HTML generado para cada publicación al contenedor
        publicationContainer.innerHTML += htmlContent;
    });

    // Añade eventos a los botones de comentar
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
                    body: JSON.stringify({ user: author, comment: commentText })
                });
                if(response.ok){
                    document.querySelector('.userComment').value = '';
                    const commentsSection = buttonElement.closest('.container').querySelector('.comments-section');
                    const data = await response.json();

                    // Añade temporalmente el comentario a la página
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
                console.error(`Error posting comment to publication ${publicationIdComment}:`, error);
            }
        });
    });

    // Añade eventos a los botones de like
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
                    body: JSON.stringify({ username: author })
                });
                if (response.ok) {
                    const likeCountSpan = buttonElement.querySelector('.like-count');
                    likeCountSpan.textContent = parseInt(likeCountSpan.textContent) + 1;
                } else {
                    console.error(`Failed to like publication ${publicationId}.`);
                }
            } catch (error) {
                console.error(`Error liking publication ${publicationId}:`, error);
            }
        });
    });

    // Añade eventos a los botones para ver quién ha dado like
    const seeWhoLikedButtons = document.querySelectorAll('.see-who-liked-btn');
    seeWhoLikedButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const publicationId = event.target.getAttribute('data-publication-id');
            const modalBody = document.querySelector('#likeModal .modal-body');
            
            try {
                const response = await fetch(`${localStorage.getItem('URL')}/api/publication/likesName/${publicationId}`);
                const likesData = await response.json();
                
                modalBody.innerHTML = ''; // Limpia el contenido del modal
                
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
                    modalBody.innerHTML = '<p>No one has liked this post yet.</p>';
                }
                const likeModal = new bootstrap.Modal(document.getElementById('likeModal'));
                likeModal.show(); // Muestra el modal después de poblar el contenido
            } catch (error) {
                console.error(`Error fetching likes for publication ${publicationId}:`, error);
            }
        });
    });
};

// Función asincrónica para eliminar una publicación
async function deletePublication(publicationId, button) {
    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/publication/${publicationId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showToast(`Publication deleted successfully.`);

            // Encuentra y elimina el contenedor de la publicación en el HTML
            const publicationContainer = button.closest('.container.mt-5');
            if (publicationContainer) {
                publicationContainer.remove();
            }
        } else {
            console.error(`Failed to delete publication ${publicationId}`);
        }
    } catch (error) {
        console.error(`Error deleting publication ${publicationId}:`, error);
    }
}

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

// Evento que se ejecuta cuando la página se carga
window.onload = async () => {
    await loadPublication(); // Carga las publicaciones del usuario
    const params = new URLSearchParams(window.location.search);
    const publicationId = params.get("id");
    if (publicationId) {
        setTimeout(() => {
            const targetElement = document.getElementById(publicationId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 200); // Ajusta el tiempo de espera si es necesario
    }
};


