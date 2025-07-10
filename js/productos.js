//Cambio de Footer

function adjustClassesBasedOnWidth() {
  const footerSmall = document.getElementById("footerSmall");
  const footerLarge = document.getElementById("footerLarge");

  if (window.innerWidth >= 768) {
    footerLarge.classList.remove("d-none");
    footerSmall.classList.add("d-none");
  } else {
    footerLarge.classList.add("d-none");
    footerSmall.classList.remove("d-none");
  }
}

window.addEventListener("resize", adjustClassesBasedOnWidth);
window.addEventListener("DOMContentLoaded", adjustClassesBasedOnWidth);

// Configurar Firebase normalmente
const firebaseConfig = {
  apiKey: "AIzaSyDCqe24Tu4-BKrxykDwTQvbDVIpoPBD8cY",
  authDomain: "reactss-26771.firebaseapp.com",
  projectId: "reactss-26771",
  storageBucket: "reactss-26771.appspot.com",
  messagingSenderId: "443520919767",
  appId: "1:443520919767:web:7a7a0cf32adad8d087e892",
  measurementId: "G-XBMQ9BWG70",
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Aquí consultas a Firestore

// Función para cargar y mostrar los productos
async function cargarProductos() {
  const productosRef = firebase.firestore().collection("productos");

  try {
    const snapshot = await productosRef.get();
    const contenedorProductos = document.getElementById("contenedorProductos");

    let modalHTML = ""; // Para acumular los modales y evitar múltiples inserciones en el DOM
    let index = 0; // Contador manual para los índices
    snapshot.forEach((doc) => {
      const producto = doc.data();
      const modalId = `imageModal${index}`; // Generar un ID único para cada modal

      // Plantilla HTML para cada producto
      const productoHTML = `
        <div class="col-xl-2 col-lg-4 col-md-5 col-10 my-1 producto">
          <div class="d-flex flex-column align-items-center">
            <img src="${producto.imagen}" alt="" class="mt-2">
            <h4 class="mt-2">${producto.titulo}</h4>
            <p class="mt-1 text-center">${producto.descripcion}</p>
            <h5 class="mt-1">$${producto.precio}</h5>
            <div>
              <button
                type="button"
                class="btn btn-sm btn-custom mb-2"
                data-bs-toggle="modal"
                data-bs-target="#${modalId}">  <!-- Usar el id único -->
              
                Ver más
              </button>
            </div>
          </div>
        </div>`;

      // Crear el modal correspondiente a este producto
      modalHTML += `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="imageModalLabel${index}" aria-hidden="true">
          <div class="modal-dialog modal-xl">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="imageModalLabel${index}">${producto.titulo}</h5>
              </div>
              <div class="modal-body">
                <div class="d-flex justify-content-center mb-4">
                  <img id="imagenPrincipal${index}" src="${producto.imagen}" class="img-fluid" alt="Imagen grande" style="max-height: 400px" />
                </div>
                <div class="d-flex miniaturasContenedor">`;

      // Verificar y agregar solo las miniaturas que existan
      const imagenes = [
        producto.imagen,
        producto.imagen2,
        producto.imagen3,
        producto.imagen4,
        producto.imagen5,
        producto.imagen6,
      ];
      imagenes.forEach((img, i) => {
        if (img) {
          modalHTML += `<img src="${img}" class="img-thumbnail mx-2 miniatura" alt="Miniatura ${
            i + 1
          }" data-imagen="${img}" id="miniatura${index}-${i}" style="width: 100px; cursor: pointer" />`;
        }
      });

      modalHTML += `
                </div>
                <div class="modal-footer d-flex justify-content-center">
                  <button type="button" class="btn btn-sm btn-custom" data-bs-dismiss="modal">Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        </div>`;

      contenedorProductos.innerHTML += productoHTML; // Insertar los productos
      index++; // Incrementar el contador manual
    });

    document.body.insertAdjacentHTML("beforeend", modalHTML); // Insertar los modales al final del body

    // Esperar a que las imágenes se carguen para aplicar las clases correctas
    document.querySelectorAll(".miniatura").forEach((img) => {
      img.onload = function () {
        // Verificar si la imagen es más ancha que alta
        if (img.naturalWidth > img.naturalHeight) {
          img.classList.add("miniaturaAncha");
        } else {
          img.classList.add("miniaturaAngosta");
        }
      };
    });
  } catch (error) {
    console.error("Error al cargar los productos: ", error);
  }
}

// Inicializar los eventos en miniaturas al cargar el DOM
document.addEventListener("DOMContentLoaded", function () {
  cargarProductos();

  // Escuchar el evento de click en miniaturas cuando se cargue el modal
  document.body.addEventListener("click", function (event) {
    if (event.target.classList.contains("miniatura")) {
      const nuevaImagen = event.target.getAttribute("data-imagen");
      const imagenPrincipal = event.target
        .closest(".modal-body")
        .querySelector(".img-fluid");
      imagenPrincipal.setAttribute("src", nuevaImagen);
    }
  });
});
