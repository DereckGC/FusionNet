// Añade un evento al input de imagen para mostrar una vista previa de la imagen seleccionada
document.getElementById("postImage").addEventListener("change", function (event) {
    const imagePreview = document.getElementById("imagePreview");
    imagePreview.innerHTML = ""; // Limpia las imágenes previas
    
    const file = event.target.files[0]; // Obtiene el archivo seleccionado
    if (file && file.type.startsWith("image/")) { // Verifica que el archivo sea una imagen
        const reader = new FileReader();
        reader.onload = function () {
            const img = document.createElement("img");
            img.src = reader.result; // Asigna la imagen cargada como fuente
            img.style.maxWidth = "100%";
            img.style.maxHeight = "300px";
            img.style.borderRadius = "10px";
            img.style.marginTop = "10px";
            imagePreview.appendChild(img); // Añade la imagen al contenedor de vista previa
        };
        reader.readAsDataURL(file); // Lee el archivo como una URL de datos
    }
});

// Función asincrónica para crear una nueva publicación
const createPostUser = async (event) => {
    event.preventDefault(); // Previene el comportamiento por defecto del formulario
   
    const title = document.getElementById("postTitle").value; // Obtiene el título del post
    const content = document.getElementById("postContent").value; // Obtiene el contenido del post
    const image = document.getElementById("postImage").files[0]; // Obtiene la imagen seleccionada
    const author = localStorage.getItem("user"); // Obtiene el nombre del autor desde el almacenamiento local
    const formData = new FormData(); // Crea un nuevo objeto FormData
    formData.append("content", content); // Añade el contenido al FormData
    formData.append("multimedia", image); // Añade la imagen al FormData
    formData.append("title", title); // Añade el título al FormData
    formData.append("author", author); // Añade el autor al FormData
    
    try {
        // Envía una solicitud POST para crear la publicación
        const response = await fetch(`${localStorage.getItem('URL')}/api/publication/create`, {
            method: "POST",
            body: formData,
        });
        if (response.ok) {
            const publication = await response.json(); // Obtiene la respuesta en formato JSON
            // Redirige al usuario a la página de sus publicaciones con el ID de la nueva publicación
            window.location.href = `/Application/views/loadMyPublications.html?id=${publication.id}/`;
        } else {
            console.error("Error creating publication"); // Muestra un error si la solicitud falla
        }
    } catch (error) {
        console.error("Error creating publication", error); // Muestra un error si ocurre una excepción
    }
}