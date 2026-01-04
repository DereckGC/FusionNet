// Al cargar el contenido de la página, obtener los datos del usuario y llenar el formulario
window.onload = async () => {
    const user = await getUserData(localStorage.getItem('user')); // Obtener los datos del usuario desde el almacenamiento local
    if (!user) {
        showToast('⚠️ Error loading user data'); // Mostrar mensaje de error si no se pueden cargar los datos del usuario
        return;
    }

    document.getElementById('authorAvatar').src = user.avatar; // Establecer el avatar del usuario en la imagen de perfil
    document.getElementById('authorName').innerText = user.username; // Establecer el nombre de usuario en el campo de entrada
}

// Función para obtener los datos del usuario
const getUserData = async (username) => {
    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/user/${username}`); // Hacer una solicitud para obtener los datos del usuario
        if (response.ok) {
            const user = await response.json(); // Convertir la respuesta a JSON
            return user; // Retornar los datos del usuario
        }
    } catch (error) {
        console.error('Error in get user data', error); // Mostrar error en la consola
    }
}

// Función para crear una página
const createPage = async (event) => {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    const formData = new FormData(); // Crear un nuevo objeto FormData
    const imageProfile = document.getElementById('pageImage').files[0]; // Obtener la imagen de perfil seleccionada
    const title = document.getElementById('title').value; // Obtener el título del campo de entrada
    const description = document.getElementById('description').value; // Obtener la descripción del campo de entrada
    const phone = document.getElementById('phone').value; // Obtener el teléfono del campo de entrada
    const email = document.getElementById('email').value; // Obtener el email del campo de entrada
    const author = localStorage.getItem('user'); // Obtener el nombre de usuario desde el almacenamiento local

    // Validar campos
    if (!imageProfile || !title || !description || !phone || !email) {
        showToast('⚠️ All fields are required'); // Mostrar mensaje de error si algún campo está vacío
        return;
    }

    // Añadir los datos al FormData
    formData.append('imageProfile', imageProfile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('author', author);

    try {
        // Hacer una solicitud para crear la página
        const response = await fetch(`${localStorage.getItem('URL')}/api/page/create`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const page = await response.json(); // Convertir la respuesta a JSON
            window.location.href = `/Application/views/viewPage.html?title=${page.title}`; // Redirigir a la página creada
        } else {
            const message = await response.json();
            showToast(`⚠️ ${message.message}`); // Mostrar mensaje de error específico
        }
    } catch (error) {
        showToast('⚠️ Error creating page'); // Mostrar mensaje de error si ocurre un error al crear la página
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
        style: {
            background: "linear-gradient(to right, #8B6508, #DAA520)", // Dorado oscuro
            color: "white",
            fontWeight: "bold",
            borderRadius: "8px",
            padding: "10px 20px",
        }
    }).showToast();
};

// Función para previsualizar la imagen seleccionada
const previewImage = (event) => {
    const file = event.target.files[0]; // Obtener el archivo de imagen seleccionado
    if (file) {
        const reader = new FileReader(); // Crear un nuevo lector de archivos
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            preview.src = e.target.result; // Establecer la imagen cargada como el src de la vista previa
            preview.style.display = 'block'; // Asegurar que la imagen sea visible
        };
        reader.readAsDataURL(file); // Leer la imagen y convertirla en una URL para mostrarla
    }
}