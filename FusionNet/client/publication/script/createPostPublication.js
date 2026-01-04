// Obtiene los parámetros de la URL
const urlParams = new URLSearchParams(window.location.search);
const title = urlParams.get('title');

let id = ''; // Variable para almacenar el ID de la página

// Función que se ejecuta cuando la página se carga
window.onload = async () => {
    if (!title) {
        showToast("⚠️ No title parameter found in URL.");
        return;
    }

    try {
        // Realiza una solicitud para buscar la página por título
        const response = await fetch(`/api/page/search/${title}`);
        if (!response.ok) {
            showToast(`⚠️ Page not found`);
            setTimeout(() => {
                window.location.href = '/Application/views/pages.html';
            }, 3000);
            return;
        }

        const page = await response.json();
        
        document.getElementById('pageImage').src = page.imageProfile; // Muestra la imagen de perfil de la página
        id = page.id; // Almacena el ID de la página
    } catch (error) {
        showToast('⚠️ Error loading page');
        setTimeout(() => {
            window.location.href = '/Application/views/pages.html';
        }, 3000);
    }
};

// Añade un evento al input de imagen para mostrar una vista previa de la imagen seleccionada
document.getElementById("postImage").addEventListener("change", function (event) {
    const imagePreview = document.getElementById("imagePreview");
    imagePreview.innerHTML = ""; // Limpia las imágenes previas
    
    const file = event.target.files[0];
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
const createPost = async (event) => {
    event.preventDefault(); // Previene el comportamiento por defecto del formulario

    const title = document.getElementById("postTitle").value.trim(); // Obtiene el título del post
    const content = document.getElementById("postContent").value.trim(); // Obtiene el contenido del post
    const image = document.getElementById("postImage").files[0]; // Obtiene la imagen seleccionada

    if (!title || !content) {
        showToast("⚠️ Title and content cannot be empty.");
        return;
    }

    const formData = new FormData(); // Crea un nuevo objeto FormData
    formData.append("title", title); // Añade el título al FormData
    formData.append("content", content); // Añade el contenido al FormData
    if (image) {
        formData.append("multimedia", image); // Añade la imagen al FormData si existe
    }
    formData.append("author", id); // Añade el ID del autor al FormData

    try {
        // Envía una solicitud POST para crear la publicación
        const response = await fetch("/api/page/publication", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            const publication = await response.json(); // Obtiene la respuesta en formato JSON
            window.location.href = `/Application/views/pagesByUser.html`; // Redirige al usuario a la página de sus publicaciones
        } else {
            showToast("⚠️ Error creating post"); // Muestra un error si la solicitud falla
        }
    } catch (error) {
        console.error("Error creating publication", error); // Muestra un error si ocurre una excepción
        showToast("⚠️ Error creating publication");
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
