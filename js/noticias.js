function filtrarNoticias(categoria) {
  const noticiaItem = document.querySelectorAll(".noticiaItem");

  noticiaItem.forEach((item) => {
    if (categoria === "todas") {
      item.hidden = false;
    } else {
      if (item.classList.contains(categoria)) {
        item.hidden = false;
      } else {
        item.hidden = true;
      }
    }
  });
}

//Cambio de Footer + Cambio de Botones

function adjustClassesBasedOnWidth() {
  const footerSmall = document.getElementById("footerSmall");
  const footerLarge = document.getElementById("footerLarge");
  const botones = document.querySelectorAll(".btn-sm");

  if (window.innerWidth >= 768) {
    footerLarge.classList.remove("d-none");
    footerSmall.classList.add("d-none");
    botones.forEach((boton) => {
      boton.classList.remove("btn-sm");
      boton.classList.add("btn-md");
    });
  } else {
    footerLarge.classList.add("d-none");
    footerSmall.classList.remove("d-none");
    botones.forEach((boton) => {
      boton.classList.add("btn-sm");
      boton.classList.remove("btn-md");
    });
  }
}

window.addEventListener("resize", adjustClassesBasedOnWidth);
window.addEventListener("DOMContentLoaded", adjustClassesBasedOnWidth);

// Configura Firebase normalmente
const firebaseConfig = {
  apiKey: "AIzaSyDCqe24Tu4-BKrxykDwTQvbDVIpoPBD8cY",
  authDomain: "reactss-26771.firebaseapp.com",
  projectId: "reactss-26771",
  storageBucket: "reactss-26771.appspot.com",
  messagingSenderId: "443520919767",
  appId: "1:443520919767:web:7a7a0cf32adad8d087e892",
  measurementId: "G-XBMQ9BWG70",
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Aquí consultas a Firestore

// 1. Función para cargar y mostrar las noticias
async function cargarNoticias() {
  const noticiasRef = firebase.firestore().collection("noticias");

  try {
    // Obtener todos los documentos en la colección "noticias"
    const snapshot = await noticiasRef.get();

    // Contenedor donde se mostrarán las noticias
    const contenedorNoticias = document.getElementById("contenedorNoticias");

    // Recorrer cada documento y crear la plantilla HTML
    snapshot.forEach((doc) => {
      const noticia = doc.data();
      const modalId = `${doc.id}`;
      const modalIdSinEspacios = modalId.replace(/\s+/g, "");

      console.log(modalId);
      // 2. Plantilla HTML para cada noticia
      const noticiaHTML = `<div class=" todas ${noticia.categoria} noticiaItem col-xl-4 col-lg-6 col-md-6 col-sm-12 col-12 my-2">
            <div class="noticias d-flex flex-column align-items-center text-center">
              <img src="${noticia.imagenPrincipal}" alt="" />
              <h2 class="mt-3 mb-3">${noticia.titulo}</h2>
              <p>
              ${noticia.copete}
              </p>
              <div>
                <button type="button" class="btn btn-sm btn-custom botonVerMas" data-bs-toggle="modal" data-bs-target="#${modalIdSinEspacios}">
                  Ver más
                </button>
              <div class="modal fade" id="${modalIdSinEspacios}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-scrollable">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h1 class="modal-title fs-5" id="exampleModalLabel">${noticia.titulo}</h1>
                      </div>
                      <div class="modal-body clearfix">
                        <img src="${noticia.imagenPrincipal}" alt="" class="imagenModal col-md-6 float-md-end mb-3 ms-md-3 p-0">
                        <p>
                          ${noticia.cuerpoNoticia}
                        </p>
                        <img src="${noticia.imagenSecundaria}" class="col-md-6 float-md-start mb-3 me-md-3 p-0" alt="">
                        <p>
                          ${noticia.cuerpoNoticia2}
                        </p>
                      </div>
                    <div class="modal-footer d-flex justify-content-center">
                      <button type="button" class="btn btn-sm btn-secondary botonVerMas" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`;
      /*`
        <div class="noticia">
          <h2>${noticia.titulo}</h2>
          <img src="${noticia.imagenPrincipal}" alt="${noticia.titulo}">
          <p>${noticia.copete}</p>
          <p>${noticia.cuerpoNoticia}</p>
          <p>${noticia.cuerpoNoticia2}</p>
          <img src="${noticia.imagenSecundaria}" alt="${noticia.titulo}">
          <span>Categoría: ${noticia.categoria}</span>
          <span>Fecha de Carga: ${noticia.fechaDeCarga?.toDate().toLocaleString()}</span>
        </div>
      `;*/

      // 3. Insertar la plantilla en el DOM
      contenedorNoticias.innerHTML += noticiaHTML;
    });
  } catch (error) {
    console.error("Error al cargar las noticias: ", error);
  }
}

// Llamada a la función para cargar las noticias al cargar la página
window.onload = cargarNoticias;
