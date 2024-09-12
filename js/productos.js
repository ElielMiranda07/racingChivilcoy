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
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Aquí consultas a Firestore

// 1. Función para cargar y mostrar los productos
async function cargarProductos() {
  const productosRef = firebase.firestore().collection("productos");

  try {
    // Obtener todos los documentos en la colección "noticias"
    const snapshot = await productosRef.get();

    // Contenedor donde se mostrarán las noticias
    const contenedorProductos = document.getElementById("contenedorProductos");

    // Recorrer cada documento y crear la plantilla HTML
    snapshot.forEach((doc) => {
      const producto = doc.data();

      // 2. Plantilla HTML para cada noticia
      const productoHTML = `<div class="col-xl-2 col-lg-4 col-md-5 col-5 my-1 producto">
              <div class="d-flex flex-column align-items-center">
                <img src="${producto.imagen}" alt="" class="mt-2">
                <h4 class="mt-2">${producto.titulo}</h4>
                <p class="mt-1 text-center">${producto.descripcion}</p>
              </div>
            </div>`;

      contenedorProductos.innerHTML += productoHTML;
    });
  } catch (error) {
    console.error("Error al cargar los productos: ", error);
  }
}

// Llamada a la función para cargar las noticias al cargar la página
window.onload = cargarProductos;
