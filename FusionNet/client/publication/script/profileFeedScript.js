// Cargar las publicaciones del perfil
const loadPublications = async () => {
    const response = await fetch(`${localStorage.getItem('URL')}/api/publication/Ian`); // Hacer una solicitud para obtener las publicaciones
    const publications = await response.json(); // Convertir la respuesta a JSON
    const publicationsContainer = document.getElementById('postContainer'); // Obtener el contenedor de publicaciones
    publicationsContainer.innerHTML = ''; // Limpiar el contenido anterior

    // Iterar sobre cada publicación
    publications.forEach(publication => {
        const hasImage = publication.multimedia && publication.multimedia.trim() !== ""; // Verificar si la publicación tiene una imagen
        const previewText = publication.content ? publication.content.substring(0, 100) + "..." : "No content available"; // Obtener una vista previa del contenido

        const publicationElement = document.createElement('div'); // Crear un nuevo elemento div para la publicación
        publicationElement.className = 'col'; // Usar el tamaño automático de Bootstrap para 3 por fila
        publicationElement.innerHTML = `
            <div class="imgContainer ${hasImage ? '' : 'no-image'}">
                ${hasImage 
                    ? `<img src="${publication.multimedia}" class="post-img">` // Mostrar la imagen si existe
                    : `<div class="text-preview">${previewText}</div>`} // Mostrar una vista previa del texto si no hay imagen
            </div>
        `;
        publicationsContainer.appendChild(publicationElement); // Añadir la publicación al contenedor
    });
};

// Cargar las publicaciones cuando la ventana se cargue
window.onload = loadPublications;