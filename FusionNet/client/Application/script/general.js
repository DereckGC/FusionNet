// Al cargar el contenido de la página, verificar la sesión
window.addEventListener('DOMContentLoaded', async function () {
    await session(); // Llamar a la función para verificar la sesión
});

// Función para verificar la sesión del usuario
const session = async () => {
    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/auth/checkAuth`); // Hacer una solicitud para verificar la autenticación
        if (response.ok) {
            const data = await response.json(); // Convertir la respuesta a JSON
            const user = await data.user; // Obtener los datos del usuario
            const username = user.username; // Obtener el nombre de usuario
            document.getElementById('imageProfile').src = user.avatar; // Establecer el avatar del usuario en la imagen de perfil
        } else {
            const refresh = await fetch(`${localStorage.getItem('URL')}/api/auth/refreshToken`); // Intentar refrescar el token
            if (refresh.ok) {
                return session(); // Volver a verificar la sesión
            } else {
                window.location.href = '/login/login.html'; // Redirigir a la página de inicio de sesión si no se puede refrescar el token
            }
        }
    } catch (error) {
        console.error('Error fetching session:', error); // Mostrar error en la consola
    }
};

// Función para cerrar sesión
async function logout() {
    try {
        const response = await fetch(`${localStorage.getItem('URL')}/api/auth/logout`); // Hacer una solicitud para cerrar sesión
        if (response.ok) {
            window.location.href = '/login/login.html'; // Redirigir a la página de inicio de sesión después de cerrar sesión
        }
    } catch (error) {
        console.log(error); // Mostrar error en la consola
    }
}