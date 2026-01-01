// -----------------------------------------------------------
// FUNCIÓN DE BÚSQUEDA CON RESALTADO EN EL CONTENIDO
// -----------------------------------------------------------
function buscar(e) {
    e.preventDefault();

    let texto = document.getElementById("campoBusqueda").value.toLowerCase();
    let contenedor = document.getElementById("contenido");

    // Si no existe el contenedor no hacemos nada
    if (!contenedor) return;

    // Guardar el contenido original una sola vez
    if (!contenedor.dataset.original) {
        contenedor.dataset.original = contenedor.innerHTML;
    }

    // Restaurar contenido antes de resaltar de nuevo
    contenedor.innerHTML = contenedor.dataset.original;

    // Si no se escribe nada, salir
    if (texto.trim() === "") return;

    // Expresión regular para buscar el texto ignorando may/min
    let regex = new RegExp(texto, "gi");

    // Resaltar coincidencias con un span
    contenedor.innerHTML = contenedor.innerHTML.replace(regex, match => {
        return `<span class="resaltado">${match}</span>`;
    });
}



// -----------------------------------------------------------
// FUNCIONES PARA MANEJO DE DATOS EN LOCALSTORAGE (JSON)
// -----------------------------------------------------------

// Cargar contactos guardados
function cargarDatos() {
    return JSON.parse(localStorage.getItem("contactos")) || [];
}

// Guardar contactos en localStorage
function guardarDatos(data) {
    localStorage.setItem("contactos", JSON.stringify(data));
}



// -----------------------------------------------------------
// MOSTRAR LOS CONTACTOS EN LA TABLA HTML
// -----------------------------------------------------------
function mostrarDatos() {
    let datos = cargarDatos();
    let tabla = document.getElementById("tablaDatos");
    tabla.innerHTML = ""; // limpiar tabla

    // Crear filas dinámicamente
    datos.forEach((item, i) => {
        tabla.innerHTML += `
        <tr>
            <td>${item.nombre}</td>
            <td>${item.apellido}</td>
            <td>${item.celular}</td>
            <td>${item.correo}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editar(${i})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="eliminar(${i})">Eliminar</button>
            </td>
        </tr>
        `;
    });
}



// -----------------------------------------------------------
// GUARDAR NUEVO CONTACTO O ACTUALIZAR UNO EXISTENTE
// -----------------------------------------------------------
document.getElementById("formContacto").addEventListener("submit", function (e) {
    e.preventDefault();

    let datos = cargarDatos();

    // Crear objeto con los datos del formulario
    let obj = {
        nombre: document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        celular: document.getElementById("celular").value,
        correo: document.getElementById("correo").value
    };

    let id = document.getElementById("id").value;

    if (id === "") {
        // Crear nuevo contacto
        datos.push(obj);
    } else {
        // Editar contacto existente
        datos[id] = obj;
        document.getElementById("id").value = "";
    }

    guardarDatos(datos);
    mostrarDatos();
    this.reset(); // limpiar formulario
});



// -----------------------------------------------------------
// CARGAR CONTACTO EN EL FORMULARIO PARA EDITAR
// -----------------------------------------------------------
function editar(i) {
    let datos = cargarDatos();
    let item = datos[i];

    document.getElementById("id").value = i;
    document.getElementById("nombre").value = item.nombre;
    document.getElementById("apellido").value = item.apellido;
    document.getElementById("celular").value = item.celular;
    document.getElementById("correo").value = item.correo;
}



// -----------------------------------------------------------
// ELIMINAR CONTACTO POR ÍNDICE
// -----------------------------------------------------------
function eliminar(i) {
    let datos = cargarDatos();
    datos.splice(i, 1); // eliminar 1 elemento en posición i
    guardarDatos(datos);
    mostrarDatos();
}



// -----------------------------------------------------------
// LIMPIAR FORMULARIO
// -----------------------------------------------------------
function limpiar() {
    document.getElementById("id").value = "";
}



// -----------------------------------------------------------
// EXPORTAR CONTACTOS COMO ARCHIVO JSON DESCARGABLE
// -----------------------------------------------------------
document.getElementById('btnExportar').addEventListener('click', function () {

    const data = JSON.parse(localStorage.getItem("contactos")) || [];

    if (data.length === 0) {
        alert("No hay contactos para exportar.");
        return;
    }

    // Convertir datos a JSON legible
    const json = JSON.stringify(data, null, 4);

    // Crear archivo descargable
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "contactos.json";
    a.click(); // descargar

    URL.revokeObjectURL(url);
});



// -----------------------------------------------------------
// IMPORTAR CONTACTOS DESDE ARCHIVO JSON
// -----------------------------------------------------------

// Abrir selector de archivos
document.getElementById('btnCargar').addEventListener('click', function () {
    document.getElementById('fileInput').click();
});

// Leer archivo seleccionado
document.getElementById('fileInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {
        try {
            let contenido = event.target.result;

            // Quitar BOM si existe
            contenido = contenido.replace(/^\uFEFF/, "");

            // Parsear JSON
            const lista = JSON.parse(contenido);

            // Validar que sea una lista
            if (!Array.isArray(lista)) {
                alert("El archivo debe contener una LISTA de contactos.");
                return;
            }

            // Guardar contactos importados
            localStorage.setItem("contactos", JSON.stringify(lista));

            // Recargar para actualizar tabla
            location.reload();

        } catch (error) {
            alert("El archivo seleccionado NO es un JSON válido.\n" + error);
        }
    };

    reader.readAsText(file, "UTF-8");
});



// -----------------------------------------------------------
// INICIALIZAR TABLA AL CARGAR LA PÁGINA
// -----------------------------------------------------------
mostrarDatos();
