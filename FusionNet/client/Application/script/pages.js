// Evento que se ejecuta cuando el DOM se ha cargado completamente
window.addEventListener('DOMContentLoaded', async function () {
    await getPages(); // Carga las páginas al cargar la página
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
        const response = await fetch(`${localStorage.getItem('URL')}/api/page`);
        if (!response.ok) {
            const message = await response.json();
            showToast(`⚠️ ${message.message}`);
            return []; // Retornar un array vacío en caso de error
        }
        const pages = await response.json();
        renderPages(pages); // Renderiza las páginas obtenidas
        return pages; // Retorna los datos de las páginas
    } catch (error) {
        showToast('⚠️ Error loading pages');
        return []; // Retornar un array vacío si hay un error
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
                        <button class="btn btn-primary mt-3" onclick="seePage('${page.title}')">See Page</button>
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

// Función asincrónica para buscar una página
const searchPage = async () => {
    const search = document.getElementById('searchPage').value.trim();
    if (!search) {
        showToast('⚠️ Search field is empty');
        const pages = await getPages(); // Ahora getPages() devuelve un array
        renderPages(pages);
        return;
    }

    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/page/search/${search}`);
        if (!response.ok) {
            showToast(`⚠️ Page not found`);
            const pages = await getPages(); // Ahora getPages() devuelve un array
            renderPages(pages);
            return; 
        }
        const page = await response.json();
        renderPages([page]); // Renderiza la página encontrada
        
    } catch (error) {
        console.error("❌ Error in searchPage:", error);
        const pages = await getPages(); // Ahora devuelve un array vacío si hay error
        renderPages(pages);
    }
};

// Función para redirigir a la vista de una página específica
const seePage = async (title) => {
    window.location.href = `/Application/views/viewPage.html?title=${title}`;
}

// Función para redirigir a la vista de creación de página
const goToCreatePage = () => {  
    window.location.href = '/Application/views/createPage.html';
}

// Función para redirigir a la vista de páginas por usuario
const goToViewPagesByUser = () => {
    window.location.href = `/Application/views/pagesByUser.html`;
}