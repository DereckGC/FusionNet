// Obtener los parámetros de la URL
const urlParams = new URLSearchParams(window.location.search);
const title = urlParams.get('title');
const idPublication = urlParams.get('id');

// Función que se ejecuta cuando la ventana se carga
window.onload = async () => {
    if (!title) {
        showToast("⚠️ No se encontró el parámetro 'title' en la URL.");
        return; // Detener la ejecución si no se encuentra el título.
    }

    try {
        // Hacer una solicitud para obtener la página por su título
        const response = await fetch(`${localStorage.getItem('URL')}/api/page/search/${title}`);
        if (!response.ok) {
            showToast(`⚠️ Página no encontrada`);
            setTimeout(() => {
                window.location.href = '/Application/views/pages.html';
            }, 3000);
        } else {
            const page = await response.json();
            loadPublication(page.id); // Cargar las publicaciones de la página
        }
    } catch (error) {
        showToast('⚠️ Error al cargar la página');
        setTimeout(() => {
            window.location.href = '/Application/views/pages.html';
        }, 3000);
    }
};

// Función para cargar las publicaciones de una página específica
const loadPublication = async (idPage) => {
    const author = localStorage.getItem('user'); // Obtener el nombre del usuario desde el almacenamiento local
    const avatar = localStorage.getItem('avatar'); // Obtener el avatar del usuario desde el almacenamiento local
    const response = await fetch(`${localStorage.getItem('URL')}/api/page/publication/${idPage}`); // Hacer una solicitud para obtener las publicaciones de la página
    const data = await response.json(); // Convertir la respuesta a JSON
    const publicationContainer = document.getElementById('postContainer'); // Obtener el contenedor de publicaciones
    const publications = data.publications; // Obtener las publicaciones de la respuesta
    publicationContainer.innerHTML = ''; // Limpiar el contenido anterior

    // Iterar sobre cada publicación
    publications.forEach(publication => {
        const htmlContent = `
        <div class="container mt-5">
            <div class="row">
                <div class="col-md-8 offset-md-2 bg-light p-3">

                    <!-- Encabezado de la publicación con información del autor -->
                    <div class="d-flex align-items-center mb-3" id="${publication.id}" >
                        <img src="${publication.author.imageProfile}" class="rounded-circle" alt="Author Avatar" style="width: 40px; height: 40px; object-fit: cover;">
                        <h5 class="ms-3 mb-0" id="authorName">${publication.author.title}</h5>
                        <h5 class="ms-3 mb-0" id="authorName">${publication.date}</h5>
                    </div>

                    <!-- Imagen de la publicación -->
                    <div class="text-center mb-3">
                        <img src="${publication.multimedia || "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjdnNjFveDR3bDhjN3Fqcng4bmQ1MTd2enh2dzR1b3FnZjd6MWVtMSZlcD12MV9pbnRlcm5naWZfYnlfaWQmY3Q9Zw/C21GGDOpKT6Z4VuXyn/giphy.gif"}" class="img-fluid rounded" alt="Post GIF">
                    </div>

                    <!-- Descripción de la publicación -->
                    <h5 class="" id="title">${publication.title}</h5>
                    <p id="postDescription" class="fs-5 text-dark mb-3">${publication.content}</p>

                    <!-- Acciones de la publicación (Me gusta, Comentario) -->
                    <div class="d-flex justify-content-between mb-4" >
                        <button class="btn btnPublication btn-outline-primary like-button" data-publication-id="${publication._id}">
                            <i class="bi bi-heart"></i> Like
                            <span class="like-count ms-2">${publication.likes.length}</span> <!-- Número de Me gusta -->
                        </button>
                        <button class="see-who-liked-btn minimal-btn" data-publication-id="${publication._id}">
                            See who liked
                        </button>
                        <button class="btn btnPublication btn-outline-primary comment-btn">
                            <i class="bi bi-chat"></i> Comment
                        </button>
                    </div>

                    <!-- Sección de comentarios -->
                    <div class="mb-4 comments-section">
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
                        <input type="text" class="form-control me-2" placeholder="Add a comment...">
                        <button class="btn postButton btn-primary" data-comment-id="${publication._id}">Post</button>
                    </div>

                    <!-- Botón de regreso -->
                    <a href="/Application/views/viewPage.html?title=${title}" class="btn btnPublication btn-secondary mt-4 w-100">⬅ Back</a>
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
                    body: JSON.stringify({ user: author , comment: commentText })
                });
                if(response.ok){
                    const data = await response.json();
                    const commentsSection = buttonElement.closest('.container').querySelector('.comments-section');

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
                console.error(`Error al comentar en la publicación ${publicationIdComment}:`, error);
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
                    body: JSON.stringify({ username: author })
                });
                if (response.ok) {
                    const likeCountSpan = buttonElement.querySelector('.like-count');
                    likeCountSpan.textContent = parseInt(likeCountSpan.textContent) + 1;
                } else {
                    console.error(`Error al dar Me gusta a la publicación ${publicationId}.`);
                }
            } catch (error) {
                console.error(`Error al dar Me gusta a la publicación ${publicationId}:`, error);
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
                const response = await fetch(`${localStorage.getItem('URL')}/api/publication/likesName/${publicationId}`);
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
                    modalBody.innerHTML = '<p>No one has liked this post yet.</p>';
                }
                const likeModal = new bootstrap.Modal(document.getElementById('likeModal'));
                likeModal.show(); // Mostrar el modal después de que se haya llenado el contenido
            } catch (error) {
                console.error(`Error al obtener los Me gusta de la publicación ${publicationId}:`, error);
            }
        });
    });
};