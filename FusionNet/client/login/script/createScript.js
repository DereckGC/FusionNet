// Función para crear una cuenta
async function createAccount() {
    const name = document.getElementById('singname').value; // Obtener el nombre del campo de entrada
    const email = document.getElementById('singemail').value; // Obtener el email del campo de entrada
    const password = document.getElementById('singpass').value; // Obtener la contraseña del campo de entrada
    const biography = document.getElementById('singbio').value; // Obtener la biografía del campo de entrada
    const avatar = localStorage.getItem('avatar'); // Obtener el avatar desde el almacenamiento local

    // Limpiar mensajes de error anteriores
    clearForm();

    // Validar campos
    if (!name || name.includes(' ')) {
        document.getElementById('singname-error').style.display = 'block'; // Mostrar error si el nombre está vacío o contiene espacios
        return;
    }
    if (!email) {
        document.getElementById('singemail-error').style.display = 'block'; // Mostrar error si el email está vacío
        return;
    }
    if (!password) {
        document.getElementById('singpass-error').style.display = 'block'; // Mostrar error si la contraseña está vacía
        return;
    }
    if (!biography) {
        document.getElementById('singbio-error').style.display = 'block'; // Mostrar error si la biografía está vacía
        return;
    }
    if (!avatar) {
        document.getElementById('singup-error').style.display = 'block'; // Mostrar error si el avatar no está seleccionado
        document.getElementById('singup-error').textContent = 'Avatar is required'; // Mostrar mensaje de error específico
        return;
    }

    try {
        // Hacer una solicitud para crear la cuenta
        const response = await fetch(`${localStorage.getItem('URL')}/api/user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: name, email, password, biography, avatar }) // Enviar los datos de la cuenta
        });

        if (!response.ok) {
            const errorData = await response.json();
            document.getElementById('singup-error').style.display = 'block'; // Mostrar error si la respuesta no es OK
            document.getElementById('singup-error').textContent = errorData.message; // Mostrar mensaje de error específico
        } else {
            clearForm(); // Limpiar el formulario
            document.getElementById('singup-success').style.display = 'block'; // Mostrar mensaje de éxito
            document.getElementById('singup-success').textContent = 'Account created successfully'; // Mostrar mensaje de éxito específico
        }

        // Redirigir o realizar alguna acción después de la creación exitosa de la cuenta
    } catch (error) {
        console.error('Error creating account:', error); // Mostrar error en la consola
    }
}

// Función para limpiar el formulario y los mensajes de error
const clearForm = () => {
    document.getElementById('singup-error').style.display = 'none'; // Ocultar mensaje de error de registro
    document.getElementById('singup-success').style.display = 'none'; // Ocultar mensaje de éxito de registro
    document.getElementById('singname-error').style.display = 'none'; // Ocultar mensaje de error de nombre
    document.getElementById('singemail-error').style.display = 'none'; // Ocultar mensaje de error de email
    document.getElementById('singpass-error').style.display = 'none'; // Ocultar mensaje de error de contraseña
    document.getElementById('singbio-error').style.display = 'none'; // Ocultar mensaje de error de biografía
}