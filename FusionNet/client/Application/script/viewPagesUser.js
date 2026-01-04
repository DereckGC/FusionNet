// Obtiene los parámetros de la URL
const urlParams = new URLSearchParams(window.location.search);
let viewFolloedPages = null;

// Verifica si la URL tiene el parámetro 'pagesFollowed'
if (urlParams.has('pagesFollowed')) {
    viewFolloedPages = urlParams.get('pagesFollowed');
}

// Evento que se ejecuta cuando el DOM se ha cargado completamente
window.addEventListener('DOMContentLoaded', async function () {
    // Si se están viendo las páginas seguidas, cambia el título de la página
    if (viewFolloedPages) {
        document.getElementById('title').innerText = 'Followed Pages';
    }
    // Llama a la función para obtener las páginas
    await getPages();
});

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

// Función asincrónica para obtener las páginas
const getPages = async () => {
    try {
        let response;
        // Si no se están viendo las páginas seguidas, obtiene todas las páginas del usuario
        if (!viewFolloedPages) {
            response = await fetch(`${localStorage.getItem('URL')}/api/page/pages/${localStorage.getItem('user')}`);
        } else {
            // Si se están viendo las páginas seguidas, obtiene las páginas seguidas por el usuario
            response = await fetch(`${localStorage.getItem('URL')}/api/page/pagesFollowed/${localStorage.getItem('user')}`);
        }
        
        // Si la respuesta no es exitosa, muestra un mensaje de error
        if (!response.ok) {
            const message = await response.json();
            showToast(`⚠️ ${message.message}`);
            return []; // Retorna un array vacío en caso de error
        }
        const pages = await response.json();
        renderPages(pages); // Renderiza las páginas obtenidas
        return pages; // Retorna los datos de las páginas
    } catch (error) {
        const message = await response.json();
        showToast(`⚠️ ${message.message}`);
        return []; // Retorna un array vacío si hay un error
    }
};

// Función para crear la tarjeta de una página
const createPageCard = (page) => {
    return `
        <div class="card mb-4" style="width: 100%;">
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="${page.imageProfile || 'default-image.jpg'}" class="img-fluid rounded-start" alt="${page.title || 'Untitled'}">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title fw-bold fs-3">${page.title || 'Untitled'}</h5>
                        <p class="card-text fw-bold fs-5">${page.description || 'No description available'}</p>
                        <div class="d-flex align-items-center">
                            <img src="${page.author?.avatar || 'default-avatar.jpg'}" class="rounded-circle me-2 shadow" 
                                style="width: 50px; height: 50px;" 
                                alt="${page.author?.username || 'Unknown'}">
                            <div>
                                <p class="mb-0 fw-bold fs-5">${page.author?.username || 'Unknown'}</p>
                                <p class="mb-0 text-muted fs-6">${page.author?.email || 'No email available'}</p>
                            </div>
                        </div>
                        ${viewFolloedPages ? `<button class="btn btn-primary mt-3" onclick="seePage('${page.title}')">See Page</button>` : `<button class="btn btn-primary mt-3" onclick="goToEditPage('${page.title}')">Edit Page</button>`}
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Función para renderizar las páginas en el contenedor
const renderPages = (pages) => {
    const pagesContainer = document.getElementById('pages');
    pagesContainer.innerHTML = pages.map(page => createPageCard(page)).join('');
};

// Función para redirigir a la página de edición
const goToEditPage = (title) => {
    window.location.href = `/Application/views/editPage.html?title=${title}`;
}

// Función para redirigir a la página de visualización
const seePage = async (title) => {
    window.location.href = `/Application/views/viewPage.html?title=${title}`;
}
