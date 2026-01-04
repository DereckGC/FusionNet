const urlParams = new URLSearchParams(window.location.search);
const title = urlParams.get('title');

window.onload = async () => {
    const user = await getUserData(localStorage.getItem('user'));
    if (!user) {
        showToast('⚠️ Error loading user data');
        return;
    }

    document.getElementById('authorAvatar').src = user.avatar;
    document.getElementById('authorName').innerText = user.username;

    const page = await getPage();
    if (!page) {
        showToast('⚠️ Error loading page');
        return;
    }

    document.getElementById('title').value = page.title;
    document.getElementById('description').value = page.description;
    document.getElementById('phone').value = page.phone;
    document.getElementById('email').value = page.email;

    // Mostrar la imagen actual si existe
    if (page.imageProfile) {
        document.getElementById('imagePreview').src = page.imageProfile;
        document.getElementById('imagePreview').style.display = 'block';
    } else {
        document.getElementById('imagePreview').style.display = 'none';
    }
}

const getUserData = async (username) => {
    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/user/${username}`);
        if (response.ok) {
            const user = await response.json();
            return user;
        }
    } catch (error) {
        console.error('Error in get user data', error);
    }
}

const getPage = async () => {
    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/page/search/${title}`);
        if (!response.ok) {
            showToast(`⚠️ Page not found`);
            return;
        }
        const page = await response.json();
        return page;
    } catch (error) {
        showToast('⚠️ Error loading page');
    }
}

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

const editPage = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    
    const imageProfile = document.getElementById('pageImage').files[0];  // Imagen seleccionada
    const newTitle = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;   
    const apiURL = localStorage.getItem('URL');

    // Validar si los campos necesarios están completos
    if (!newTitle || !description || !phone || !email) {
        showToast('⚠️ All fields are required');
        return;
    }

    // Si hay una imagen, la agregamos al formulario
    if (imageProfile) {
        formData.append('imageProfile', imageProfile);
    }

    formData.append('newTitle', newTitle);
    formData.append('description', description);
    formData.append('phone', phone);
    formData.append('email', email);

    try {
        
        const response = await fetch(`${apiURL}/api/page/${title}`, {
            method: 'PUT',
            body: formData // NO agregamos headers, fetch lo maneja automáticamente
        });

        if (response.ok) {
            const page = await response.json();
            window.location.href = `/Application/views/viewPage.html?title=${page.title}`;
        } else {
            const message = await response.json();
            showToast(`⚠️ ${message.message}`);
        }
       
    } catch (error) {
        console.error('❌ Error editing page:', error);
        showToast('⚠️ Error editing page');
    }
}

const previewImage = (event) => {
    const file = event.target.files[0];  // Obtiene el archivo de imagen seleccionado
    if (file) {
        const reader = new FileReader();  // Crea un nuevo lector de archivos
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            preview.src = e.target.result;  // Establece la imagen cargada como el src de la vista previa
            preview.style.display = 'block';  // Asegura que la imagen sea visible
        };
        reader.readAsDataURL(file);  // Lee la imagen y la convierte en una URL para mostrarla
    }
}

const goToAddPublication = () => {
    window.location.href = `/publication/views/createPostPublication.html?title=${title}`;
}

const deletePage = async () => {
    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/page/${title}`, {
            method: 'DELETE'
        });
        if(response.ok){
            window.location.href = '/Application/views/pagesByUser.html';
        }
    } catch (error) {
        console.error('Error deleting page:', error);
    }
}