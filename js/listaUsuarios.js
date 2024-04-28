document.addEventListener("DOMContentLoaded", () => {
    // Inicializar tabla de usuarios
    cargarTabla();

    // Configura eventos de validación en tiempo real para cada campo del formulario
    document.getElementById("txtNombre").addEventListener("input", (e) => validarCampo(e.target, 2, 60));
    document.getElementById("txtPassword").addEventListener("input", validarContraseña);
    document.getElementById("txtConfirmarPassword").addEventListener("input", validarConfirmarContraseña);
    document.getElementById("txtTelefono").addEventListener("input", validarTelefono);
    document.getElementById("txtEmail").addEventListener("input", validarEmail);

    // Configura evento del botón Aceptar para validar y agregar usuarios
    document.getElementById("btnAceptar").addEventListener("click", validarYAgregarUsuario);
    document.getElementById("btnAceptarEdicion").addEventListener("click", aceptarEdicionUsuario);

    // Vincular el evento de clic del botón de aceptar en el modal de restablecimiento de contraseña
    document.getElementById("btnRestablecerContraseña").addEventListener("click", restablecerContraseñaUsuario);

    // Vincular eventos de input para validar campos en tiempo real
    document.getElementById("nuevaContraseña").addEventListener("input", validarCamposContraseña);
    document.getElementById("confirmarContraseña").addEventListener("input", validarCamposContraseña);

    // Vincular el evento de clic del botón Limpiar para restablecer el formulario
    document.getElementById("btnLimpiar").addEventListener("click", () => {
        // Obtener el formulario de agregar usuario
        const formulario = document.getElementById("frmUsuario");
        
        // Resetear el formulario
        formulario.reset();
        
        // Limpiar validaciones previas en los campos
        const campos = ["txtNombre", "txtEmail", "txtPassword", "txtConfirmarPassword", "txtTelefono"];
        campos.forEach(id => {
            const campo = document.getElementById(id);
            campo.setCustomValidity("");
            campo.classList.remove("valido");
            campo.classList.remove("novalido");
        });

        // Ocultar el mensaje de error (si está visible)
        document.getElementById("msg").style.display = "none";
    });

       // En esta parte, decimos que cada que se presione el boton de agregar se quiten las validaciones
       //anteriores, ya sean que se hayan quedado de las buenas o las malas
       //nos asegura siempre limpieza en el formulario
       const modalAgregarUsuario = document.getElementById("mdlUsuario");
       modalAgregarUsuario.addEventListener("shown.bs.modal", () => {
           // Restablecer el formulario completo
           document.getElementById("frmUsuario").reset();
   
           // Limpiar validaciones previas en los campos
           const campos = ["txtNombre", "txtEmail", "txtPassword", "txtConfirmarPassword", "txtTelefono"];
           campos.forEach(id => {
               const campo = document.getElementById(id);
               campo.setCustomValidity("");
               campo.classList.remove("valido");
               campo.classList.remove("novalido");
           });
   
           // Ocultar el mensaje de error (si está visible)
           document.getElementById("msg").style.display = "none";
       });
   });


// Evento para el botón de confirmación de eliminación
document.getElementById("btnConfirmarEliminar").addEventListener("click", () => {
    if (indiceEliminar >= 0) {
        eliminarUsuario(indiceEliminar);
        indiceEliminar = -1; // Restablecer el índice del usuario a eliminar
    }
    // Cerrar el modal de confirmación
    let modal = bootstrap.Modal.getInstance(document.getElementById("confirmarEliminar"));
    modal.hide();
});

// Función para aceptar los cambios del usuario editado
function aceptarEdicionUsuario() {
    // Obtener el formulario de edición y los valores de los campos
    let frmEdicion = document.getElementById("frmEditarUsuario");
    let nombre = document.getElementById("editarNombre").value;
    let correo = document.getElementById("editarCorreo").value;
    let telefono = document.getElementById("editarTelefono").value;

    // Validar que el formulario sea válido
    if (!frmEdicion.checkValidity()) {
        frmEdicion.reportValidity();
        return;
    }

    // Obtener la lista de usuarios desde localStorage
    let usuarios = JSON.parse(localStorage.getItem("listaUsuarios")) || [];

    // Buscar el usuario que estamos editando
    let usuarioEditado = usuarios.find(user => user.correo === window.usuarioEditadoCorreo);

    // Verificar que el correo editado no pertenezca a otro usuario distinto al que se está editando
    let correoEnUso = usuarios.some(user => user.correo === correo && user.correo !== window.usuarioEditadoCorreo);
    if (correoEnUso) {
        alert("El correo electrónico ya está en uso por otro usuario.");
        return;
    }

    // Actualizar los datos del usuario editado
    if (usuarioEditado) {
        usuarioEditado.nombre = nombre;
        usuarioEditado.correo = correo;
        usuarioEditado.telefono = telefono;

        // Guardar los cambios en localStorage
        localStorage.setItem("listaUsuarios", JSON.stringify(usuarios));

        // Actualizar la tabla de usuarios
        cargarTabla();

        // Cerrar el modal de edición
        let modalEdicion = bootstrap.Modal.getInstance(document.getElementById("editarUsuarioModal"));
        modalEdicion.hide();
    }
}


// Función para validar un campo basado en su longitud mínima y máxima
function validarCampo(campo, min, max) {
    campo.setCustomValidity("");
    campo.classList.remove("valido");
    campo.classList.remove("novalido");

    let valor = campo.value.trim();

    if (valor === "") {
        campo.setCustomValidity("");
    } else if (valor.length < min || valor.length > max) {
        campo.setCustomValidity(`El campo debe tener entre ${min} y ${max} caracteres`);
        campo.classList.add("novalido");
    } else {
        campo.classList.add("valido");
    }
}

// Función para validar el campo de email
function validarEmail(e) {
    let email = e.target;
    email.setCustomValidity("");
    email.classList.remove("valido");
    email.classList.remove("novalido");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let valor = email.value.trim();

    if (valor === "") {
        // Si el campo está vacío, no mostramos mensaje de validación
        email.setCustomValidity("");
    } else if (!emailRegex.test(valor)) {
        // Si el correo no es válido, mostramos un mensaje de error
        email.setCustomValidity("Correo electrónico no válido");
        email.classList.add("novalido");
    } else {
        // Si el correo es válido, marcamos el campo como válido
        email.classList.add("valido");
    }
}


// Función para validar el campo de contraseña
function validarContraseña() {
    let password = document.getElementById("txtPassword");
    let confirmarPassword = document.getElementById("txtConfirmarPassword");

    // Resetear mensajes y clases de validación
    password.setCustomValidity("");
    password.classList.remove("valido");
    password.classList.remove("novalido");

    // Validar la longitud de la contraseña
    let valor = password.value.trim();

    if (valor === "") {
        password.setCustomValidity("");
    } else if (valor.length < 6 || valor.length > 20) {
        password.setCustomValidity("La contraseña debe tener entre 6 y 20 caracteres");
        password.classList.add("novalido");
    } else {
        password.classList.add("valido");
    }

    // Validar la coincidencia de contraseñas si se ha escrito algo en confirmarPassword
    if (confirmarPassword.value !== "" && valor !== confirmarPassword.value) {
        password.setCustomValidity("Las contraseñas no coinciden");
        password.classList.add("novalido");
        confirmarPassword.setCustomValidity("Las contraseñas no coinciden");
        confirmarPassword.classList.add("novalido");
    }
}

// Función para validar el campo de confirmar contraseña
function validarConfirmarContraseña() {
    let confirmarPassword = document.getElementById("txtConfirmarPassword");
    let password = document.getElementById("txtPassword");

    // Resetear mensajes y clases de validación
    confirmarPassword.setCustomValidity("");
    confirmarPassword.classList.remove("valido");
    confirmarPassword.classList.remove("novalido");

    // Validar la coincidencia de contraseñas
    if (confirmarPassword.value !== "" && password.value !== confirmarPassword.value) {
        confirmarPassword.setCustomValidity("Las contraseñas no coinciden");
        confirmarPassword.classList.add("novalido");
    } else if (confirmarPassword.value !== "") {
        confirmarPassword.classList.add("valido");
    }
}

// Función para validar y agregar un usuario cuando se hace clic en el botón Aceptar
function validarYAgregarUsuario(e) {
    // Obtener el formulario y los campos necesarios
    let form = e.target.form;
    let txtNombre = document.getElementById("txtNombre");
    let txtPassword = document.getElementById("txtPassword");
    let txtConfirmarPassword = document.getElementById("txtConfirmarPassword");

    // Verificar que las contraseñas coincidan
    if (txtPassword.value !== txtConfirmarPassword.value) {
        let mensaje = "Las contraseñas no coinciden";
        txtPassword.setCustomValidity(mensaje);
        txtConfirmarPassword.setCustomValidity(mensaje);
        txtPassword.classList.add("novalido");
        txtConfirmarPassword.classList.add("novalido");
        e.preventDefault();
        return;
    }

    // Verificar que el campo de nombre no esté vacío
    if (txtNombre.value.trim() === "") {
        // Mostrar un mensaje de advertencia al usuario
        document.getElementById("msg").innerText = "El nombre es obligatorio.";
        document.getElementById("msg").style.display = "block";
        // Prevenir el envío del formulario
        e.preventDefault();
        return;
    }

    // Verificar si el formulario es válido
    if (form.checkValidity()) {
        agregarUsuario(e);
    } else {
        e.preventDefault();
    }
}

// Función para agregar un usuario a la lista de usuarios y a la tabla
function agregarUsuario(e) {
    // Obtener los valores del formulario
    let nombre = document.getElementById("txtNombre").value;
    let email = document.getElementById("txtEmail").value;
    let password = document.getElementById("txtPassword").value;
    let telefono = document.getElementById("txtTelefono").value;

    // Crear un objeto de usuario
    let usuario = {
        nombre: nombre,
        correo: email,
        contrasenia: password,
        telefono: telefono
    };

    // Obtener la lista de usuarios de localStorage
    let usuarios = JSON.parse(localStorage.getItem("listaUsuarios")) || [];

    // Verificar si el correo ya existe en la lista de usuarios
    let existe = usuarios.some((user) => user.correo === usuario.correo);
    if (existe) {
        document.getElementById("msg").innerText = "El correo ya está en uso, por favor ingrese uno diferente.";
        document.getElementById("msg").style.display = "block";
        e.preventDefault();
        return;
    }

    // Agregar el nuevo usuario a la lista de usuarios
    usuarios.push(usuario);
    localStorage.setItem("listaUsuarios", JSON.stringify(usuarios));

    // Cerrar el modal
    let modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("mdlUsuario"));
    modal.hide();

    // Limpiar el formulario y ocultar mensajes
    e.target.form.reset();
    document.getElementById("msg").style.display = "none";

    // Recargar la tabla de usuarios
    cargarTabla();
}

// Variables globales para almacenar el índice del usuario a eliminar
let indiceEliminar = -1;

// Evento para el botón de confirmación de eliminación
document.getElementById("btnConfirmarEliminar").addEventListener("click", () => {
    console.log("Botón de confirmación de eliminación presionado");
    if (indiceEliminar >= 0) {
        eliminarUsuario(indiceEliminar);
        indiceEliminar = -1; // Restablecer el índice del usuario a eliminar
    }
    // Cerrar el modal de confirmación
    let modal = bootstrap.Modal.getInstance(document.getElementById("confirmarEliminar"));
    modal.hide();
    console.log("Modal de confirmación cerrado");
});

function cargarTabla() {
    // Obtener la lista de usuarios desde localStorage
    let usuarios = JSON.parse(localStorage.getItem("listaUsuarios")) || [];

    // Obtener el elemento tbody de la tabla
    let tbody = document.querySelector("#tblUsuarios tbody");

    // Limpiar el contenido actual de la tabla
    tbody.innerHTML = "";

    // Iterar a través de los usuarios y crear filas para la tabla
    usuarios.forEach((usuario, index) => {
        // Crear una fila para el usuario
        let fila = document.createElement("tr");

        // Crear celdas para cada atributo del usuario
        let celdaNombre = document.createElement("td");
        // El nombre del usuario actúa como un enlace para abrir el modal de edición
        celdaNombre.innerHTML = `<a href="#" data-bs-toggle="modal" data-bs-target="#editarUsuarioModal" onclick="editarUsuario('${usuario.correo}')">${usuario.nombre}</a>`;
        fila.appendChild(celdaNombre);

        let celdaCorreo = document.createElement("td");
        celdaCorreo.innerText = usuario.correo;
        fila.appendChild(celdaCorreo);

        let celdaTelefono = document.createElement("td");
        celdaTelefono.innerText = usuario.telefono;
        fila.appendChild(celdaTelefono);

        // Crear celda para el botón de eliminación
        let celdaEliminar = document.createElement("td");
        let botonEliminar = document.createElement("button");
        botonEliminar.innerText = "Eliminar";
        botonEliminar.classList.add("btn", "btn-danger");
        // Asignar los atributos de Bootstrap para mostrar el modal de confirmación
        botonEliminar.setAttribute("data-bs-toggle", "modal");
        botonEliminar.setAttribute("data-bs-target", "#confirmarEliminar");
        // Asignar un evento de clic para configurar el índice del usuario a eliminar
        botonEliminar.addEventListener("click", () => {
            indiceEliminar = index;
            console.log("Índice del usuario a eliminar:", indiceEliminar);         
        });

        // En la función cargarTabla(), dentro del bucle que crea filas para los usuarios:
        let celdaRestablecer = document.createElement("td");
        let botonRestablecer = document.createElement("button");
        botonRestablecer.innerText = "Restablecer Contraseña";
        botonRestablecer.classList.add("btn", "btn-warning");
        botonRestablecer.setAttribute("data-bs-toggle", "modal");
        botonRestablecer.setAttribute("data-bs-target", "#restablecerContraseñaModal");
        botonRestablecer.addEventListener("click", () => {
            // Al hacer clic en el botón, abrir el modal de restablecimiento de contraseña
            // y guardar el índice del usuario seleccionado
            indiceRestablecer = index;  // Variable global para identificar el usuario seleccionado
        });
        celdaEliminar.appendChild(botonEliminar);
        fila.appendChild(celdaEliminar);

        celdaRestablecer.appendChild(botonRestablecer);
        fila.appendChild(celdaRestablecer);

        // Añadir la fila a la tabla
        tbody.appendChild(fila);
    });
}

// Función para validar los campos de nueva contraseña y confirmación EN EL MODAL DE REESTABLECER CONTRASEÑA
function validarCamposContraseña() {
    let nuevaContraseña = document.getElementById("nuevaContraseña");
    let confirmarContraseña = document.getElementById("confirmarContraseña");

    nuevaContraseña.setCustomValidity("");
    confirmarContraseña.setCustomValidity("");

    // Validar la longitud de la nueva contraseña
    if (nuevaContraseña.value.length < 6 || nuevaContraseña.value.length > 20) {
        nuevaContraseña.setCustomValidity("La contraseña debe tener entre 6 y 20 caracteres.");
    }

    // Validar que las contraseñas coincidan
    if (nuevaContraseña.value !== confirmarContraseña.value) {
        confirmarContraseña.setCustomValidity("Las contraseñas no coinciden.");
    }
}
    // Función para validar el campo de teléfono
    function validarTelefono(e) {
        let telefono = e.target;
        telefono.setCustomValidity("");
        telefono.classList.remove("valido");
        telefono.classList.remove("novalido");

        // Expresión regular para verificar que el campo contenga exactamente 10 dígitos numéricos
        const soloNumeros = /^\d{10}$/;
        
        if (!soloNumeros.test(telefono.value.trim())) {
            // Si el campo no contiene exactamente 10 dígitos numéricos, mostrar mensaje de error
            telefono.setCustomValidity("El teléfono debe tener 10 dígitos");
            telefono.classList.add("novalido");
        } else {
            // Si el campo cumple con los requisitos, marcar como válido
            telefono.classList.add("valido");
        }
    }

// Función para editar un usuario
function editarUsuario(correo) {
    // Obtener la lista de usuarios desde localStorage
    let usuarios = JSON.parse(localStorage.getItem("listaUsuarios")) || [];

    // Encontrar el usuario con el correo especificado
    let usuario = usuarios.find(user => user.correo === correo);
    if (usuario) {
        // Llenar los campos del modal de edición con los datos del usuario
        document.getElementById("editarNombre").value = usuario.nombre;
        document.getElementById("editarCorreo").value = usuario.correo;
        document.getElementById("editarTelefono").value = usuario.telefono;

        // Guardar el correo del usuario en una variable global para identificar al usuario en la edición
        window.usuarioEditadoCorreo = usuario.correo;
    }
}
//EN EL MODAL DE REESTABLECER CONTRASEÑA
function restablecerContraseñaUsuario() {
    // Obtener los campos del modal de restablecimiento de contraseña
    let nuevaContraseña = document.getElementById("nuevaContraseña").value;
    let confirmarContraseña = document.getElementById("confirmarContraseña").value;

    // Verificar si las contraseñas coinciden
    if (nuevaContraseña !== confirmarContraseña) {
        alert("Las contraseñas no coinciden. Por favor, intenta de nuevo.");
        return;
    }

    // Obtener la lista de usuarios desde localStorage
    let usuarios = JSON.parse(localStorage.getItem("listaUsuarios")) || [];

    // Cambiar la contraseña del usuario seleccionado
    if (indiceRestablecer >= 0 && indiceRestablecer < usuarios.length) {
        usuarios[indiceRestablecer].contrasenia = nuevaContraseña;

        // Guardar los cambios en localStorage
        localStorage.setItem("listaUsuarios", JSON.stringify(usuarios));

        // Cerrar el modal
        let modal = bootstrap.Modal.getInstance(document.getElementById("restablecerContraseñaModal"));
        modal.hide();
    } else {
        alert("No se pudo restablecer la contraseña. Por favor, inténtalo de nuevo.");
    }
}

function vaciarCamposModalContraseña() {
    // Vaciar los campos de contraseña
    document.getElementById("nuevaContraseña").value = "";
    document.getElementById("confirmarContraseña").value = "";
}

// Vincula la función a `shown.bs.modal` del modal de restablecimiento de contraseña
let modalContraseña = document.getElementById("restablecerContraseñaModal");
modalContraseña.addEventListener("shown.bs.modal", vaciarCamposModalContraseña);

// Función para validar los campos de nueva contraseña y confirmación en tiempo real
function validarCamposContraseña() {
    // Obtener los campos de nueva contraseña y confirmar contraseña
    let nuevaContraseña = document.getElementById("nuevaContraseña");
    let confirmarContraseña = document.getElementById("confirmarContraseña");

    // Obtener los contenedores de advertencia
    let advertenciaNuevaContraseña = document.getElementById("advertenciaNuevaContraseña");
    let advertenciaConfirmarContraseña = document.getElementById("advertenciaConfirmarContraseña");

    // Resetear mensajes y clases de validación
    nuevaContraseña.setCustomValidity("");
    nuevaContraseña.classList.remove("is-invalid");
    nuevaContraseña.classList.remove("is-valid");
    confirmarContraseña.setCustomValidity("");
    confirmarContraseña.classList.remove("is-invalid");
    confirmarContraseña.classList.remove("is-valid");
    advertenciaNuevaContraseña.textContent = "";
    advertenciaConfirmarContraseña.textContent = "";

    // Validar si el campo de nueva contraseña está vacío
    if (nuevaContraseña.value.trim() === "") {
        nuevaContraseña.setCustomValidity("La nueva contraseña no puede estar vacía.");
        nuevaContraseña.classList.add("is-invalid");
        advertenciaNuevaContraseña.textContent = "La nueva contraseña no puede estar vacía.";
    } else {
        // Validar la longitud de la nueva contraseña
        let valorNuevaContraseña = nuevaContraseña.value.trim();
        if (valorNuevaContraseña.length < 6 || valorNuevaContraseña.length > 20) {
            nuevaContraseña.setCustomValidity("La contraseña debe tener entre 6 y 20 caracteres.");
            nuevaContraseña.classList.add("is-invalid");
            advertenciaNuevaContraseña.textContent = "La contraseña debe tener entre 6 y 20 caracteres.";
        } else {
            nuevaContraseña.classList.add("is-valid");
        }
    }

    // Validar si el campo de confirmar contraseña está vacío
    if (confirmarContraseña.value.trim() === "") {
        confirmarContraseña.setCustomValidity("La confirmación de contraseña no puede estar vacía.");
        confirmarContraseña.classList.add("is-invalid");
        advertenciaConfirmarContraseña.textContent = "La confirmación de contraseña no puede estar vacía.";
    } else {
        // Validar que las contraseñas coincidan
        let valorConfirmarContraseña = confirmarContraseña.value.trim();
        if (nuevaContraseña.value.trim() !== valorConfirmarContraseña) {
            confirmarContraseña.setCustomValidity("Las contraseñas no coinciden.");
            confirmarContraseña.classList.add("is-invalid");
            advertenciaConfirmarContraseña.textContent = "Las contraseñas no coinciden.";
        } else {
            confirmarContraseña.classList.add("is-valid");
        }
    }
}


// Función para eliminar un usuario de la lista
function eliminarUsuario(index) {
    // Obtener la lista de usuarios desde localStorage
    let usuarios = JSON.parse(localStorage.getItem("listaUsuarios")) || [];

    // Eliminar el usuario en el índice especificado
    usuarios.splice(index, 1);

    // Guardar la lista de usuarios actualizada en localStorage
    localStorage.setItem("listaUsuarios", JSON.stringify(usuarios));

    // Recargar la tabla de usuarios para reflejar los cambios
    cargarTabla();
}