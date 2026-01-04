// Al cargar el contenido de la página, obtener los datos del usuario y llenar el formulario
window.addEventListener('DOMContentLoaded', async function () {
    const name = localStorage.getItem('user'); // Obtener el nombre de usuario desde el almacenamiento local
    if (!name) {
        window.location.href = '/login/login.html'; // Redirigir a la página de inicio de sesión si no hay nombre de usuario
    }
    const user = await getUserData(name); // Obtener los datos del usuario
    document.getElementById('avatar').src = user.avatar; // Establecer el avatar del usuario en la imagen de perfil
    document.getElementById('username').value = user.username; // Establecer el nombre de usuario en el campo de entrada
    document.getElementById('email').value = user.email; // Establecer el email en el campo de entrada
    document.getElementById('biography').value = user.biography; // Establecer la biografía en el campo de entrada
    const avatarSelected = localStorage.getItem('avatarSelected'); // Obtener el avatar seleccionado desde el almacenamiento local
    document.getElementById('avatarName').value = avatarSelected; // Establecer el nombre del avatar en el campo de entrada
});

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

// Función para editar el perfil del usuario
const editProfile = async (event) => {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    // Obtener los valores de los inputs
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const biography = document.getElementById('biography').value.trim();
    const avatarName = document.getElementById('avatarName').value.trim();

    // Validar los campos
    let isValid = true;

    if (!username || username.includes(' ')) {
        showError('username-error'); // Mostrar error si el nombre de usuario está vacío o contiene espacios
        isValid = false;
    } else {
        hideError('username-error'); // Ocultar el mensaje de error
    }

    if (!email || !validateEmail(email)) {
        showError('email-error'); // Mostrar error si el email está vacío o no es válido
        isValid = false;
    } else {
        hideError('email-error'); // Ocultar el mensaje de error
    }

    if (!biography) {
        showError('biography-error'); // Mostrar error si la biografía está vacía
        isValid = false;
    } else {
        hideError('biography-error'); // Ocultar el mensaje de error
    }

    if (!password) {
        showError('password-error'); // Mostrar error si la contraseña está vacía
        isValid = false;
    } else {
        hideError('password-error'); // Ocultar el mensaje de error
    }

    if (!avatarName) {
        showError('avatarName-error'); // Mostrar error si el nombre del avatar está vacío
        isValid = false;
    } else {
        hideError('avatarName-error'); // Ocultar el mensaje de error
    }

    if (isValid) {
        try {
            const userUpdate = {
                username,
                email,
                password,
                biography,
                avatar: localStorage.getItem('avatar') // Obtener el avatar desde el almacenamiento local
            };

            // Hacer una solicitud para actualizar los datos del usuario
            const response = await fetch(`${localStorage.getItem('URL')}/api/user/${localStorage.getItem('user')}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userUpdate) // Enviar los datos actualizados del usuario
            });

            if (response.ok) {
                const user = await response.json();
                localStorage.setItem('user', user.username); // Actualizar el nombre de usuario en el almacenamiento local
                localStorage.setItem('avatarSelected', avatarName); // Actualizar el avatar seleccionado en el almacenamiento local
                localStorage.setItem('avatar', user.avatar); // Actualizar el avatar en el almacenamiento local
                localStorage.setItem('email', user.email); // Actualizar el email en el almacenamiento local
                localStorage.setItem('userID', user.id); // Actualizar el ID del usuario en el almacenamiento local
                const log = await fetch(`${localStorage.getItem('URL')}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password }) // Enviar los datos de inicio de sesión
                });
                window.location.href = '/Application/views/profile.html'; // Redirigir a la página de perfil
            } else {
                const message = await response.json();
                showFormError(message.message); // Mostrar mensaje de error del formulario
            }
            
        } catch (error) {
            const message = await response.json();
            showFormError(message.message); // Mostrar mensaje de error del formulario
        }
    } 
}

// Función para mostrar el mensaje de error
function showError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'block'; // Mostrar el mensaje de error
    }
}

// Función para ocultar el mensaje de error
function hideError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none'; // Ocultar el mensaje de error
    }
}

// Función para mostrar el mensaje de error del formulario
function showFormError(response) {
    const formError = document.getElementById('form-error');
    if (formError) {
        formError.textContent = response;
        formError.style.display = 'block'; // Mostrar el mensaje de error del formulario
        setTimeout(() => {
            formError.style.display = 'none'; // Ocultar después de 3 segundos
        }, 3000);
    } else {
        console.error('Element form-error not found');
    }
}

// Función para validar el email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email); // Retornar true si el email es válido, de lo contrario false
}