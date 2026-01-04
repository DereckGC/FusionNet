// Al cargar la página, marcar el avatar seleccionado
document.addEventListener('DOMContentLoaded', () => {
    const selectedAvatar = localStorage.getItem('avatarSelected'); // Obtener el avatar seleccionado desde el almacenamiento local
    if (selectedAvatar) {
        const cards = document.querySelectorAll('.card'); // Obtener todas las tarjetas de avatar
        cards.forEach(card => {
            const img = card.querySelector('img'); // Obtener la imagen dentro de la tarjeta
            const avatarName = img.alt; // Obtener el nombre del avatar desde el atributo alt de la imagen
            if (avatarName === selectedAvatar) {
                card.classList.add('selected'); // Marcar la tarjeta como seleccionada si coincide con el avatar seleccionado
            }
        });
    }
});

// Función para seleccionar un avatar
function selectAvatar(card, avatar, avatarName) {
    // Remover la clase 'selected' de todas las tarjetas
    const cards = document.querySelectorAll('.card');
    cards.forEach(c => c.classList.remove('selected'));

    // Agregar la clase 'selected' a la tarjeta seleccionada
    card.classList.add('selected');

    // Guardar el avatar seleccionado en el localStorage
    localStorage.setItem('avatar', avatar);
    localStorage.setItem('avatarSelected', avatarName);
}