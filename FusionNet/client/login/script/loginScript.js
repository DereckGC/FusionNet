// Al cargar el contenido de la página, establecer la URL y verificar la sesión
window.addEventListener('DOMContentLoaded', async function () {
    localStorage.setItem('URL', ''); // Establecer la URL en el almacenamiento local
    await fetchSession(); // Verificar la sesión
});

// Función para verificar la sesión del usuario
const fetchSession = async () => {
    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/auth/checkAuth`); // Hacer una solicitud para verificar la autenticación
        if (response.ok) {
            const data = await response.json(); // Convertir la respuesta a JSON
            const user = data.user; // Obtener los datos del usuario
            localStorage.setItem('user', user.username); // Guardar el nombre de usuario en el almacenamiento local
            localStorage.setItem('avatar', user.avatar); // Guardar el avatar en el almacenamiento local
            localStorage.setItem('email', user.email); // Guardar el email en el almacenamiento local
            localStorage.setItem('userID', user.id); // Guardar el ID del usuario en el almacenamiento local
            window.location.href = '/application/views/home.html'; // Redirigir a la página de inicio
        } else {
            const refresh = await fetch(`${localStorage.getItem('URL')}/api/auth/refreshToken`); // Intentar refrescar el token
            if (refresh.ok) {
                return fetchSession(); // Volver a verificar la sesión
            }
        }
    } catch (error) {
        console.error('Error fetching session:', error); // Mostrar error en la consola
    }
};

// Función para iniciar sesión
async function login() {
    const email = document.getElementById('logemail').value; // Obtener el email del campo de entrada
    const password = document.getElementById('logpass').value; // Obtener la contraseña del campo de entrada

    // Limpiar mensajes de error anteriores
    document.getElementById('logemail-error').style.display = 'none';
    document.getElementById('logpass-error').style.display = 'none';
    document.getElementById('login-error').style.display = 'none';

    // Validar campos
    if (!email) {
        document.getElementById('logemail-error').style.display = 'block'; // Mostrar error si el email está vacío
        return;
    }
    if (!password) {
        document.getElementById('logpass-error').style.display = 'block'; // Mostrar error si la contraseña está vacía
        return;
    }

    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }) // Enviar los datos de inicio de sesión
        });

        if (!response.ok) {
            document.getElementById('login-error').style.display = 'block'; // Mostrar error si la respuesta no es OK
        } else {
            fetchSession(); // Verificar la sesión después de iniciar sesión
        }
        // Redirigir o realizar alguna acción después del inicio de sesión exitoso
    } catch (error) {
        console.error('Error logging in:', error); // Mostrar error en la consola
        alert(error.message); // Mostrar alerta con el mensaje de error
    }
}