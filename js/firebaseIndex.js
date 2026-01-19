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

// Aquí puedes hacer consultas a Firestore

// Traer la colección "partidos" y mostrar en HTML
const ahora = firebase.firestore.Timestamp.now();

db.collection("partidos")
  .where("fechaYHora", ">=", ahora)
  .orderBy("fechaYHora", "asc")
  .limit(3)
  .get()
  .then((snapshot) => {
    let index = 1;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const fecha = data.fechaYHora.toDate();

      const fechaStr = fecha.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
      });
      const horaStr = fecha.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const contenedor = document.getElementById(`partido${index}`);
      if (!contenedor) return;

      contenedor.classList.remove("d-none");

      document.getElementById(
        `fyh${index}`
      ).textContent = `${fechaStr} - ${horaStr}`;

      document.getElementById(
        `equipos${index}`
      ).textContent = `${data.equipoLocal} - ${data.equipoVisitante}`;

      document.getElementById(`ubi${index}`).textContent = data.lugar;

      index++;
    });

    for (; index <= 3; index++) {
      const cont = document.getElementById(`partido${index}`);
      if (cont) cont.classList.add("d-none");
    }
  })
  .catch((error) => {
    console.error("Error obteniendo próximos partidos:", error);
  });

// Traer Fixture

const tablaPartidosFuturos = document.getElementById("tablaPartidosFuturos");

async function cargarTodosLosPartidosFuturos() {
  tablaPartidosFuturos.innerHTML = `
    <tr>
      <td colspan="4" class="text-center">Cargando partidos...</td>
    </tr>
  `;

  try {
    const ahora = new Date();

    const snapshot = await db
      .collection("partidos")
      .orderBy("fechaYHora", "asc")
      .get();

    tablaPartidosFuturos.innerHTML = "";

    let hayPartidos = false;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const fecha = data.fechaYHora.toDate();

      // ⛔ ignorar partidos pasados
      if (fecha < ahora) return;

      hayPartidos = true;

      const fechaStr = fecha.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
      });

      const horaStr = fecha.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const fila = `
        <tr>
          <td>${fechaStr}</td>
          <td>${horaStr}</td>
          <td>${data.equipoLocal} - ${data.equipoVisitante}</td>
          <td>${data.lugar || "-"}</td>
        </tr>
      `;

      tablaPartidosFuturos.insertAdjacentHTML("beforeend", fila);
    });

    if (!hayPartidos) {
      tablaPartidosFuturos.innerHTML = `
        <tr>
          <td colspan="4" class="text-center">
            No hay partidos futuros
          </td>
        </tr>
      `;
    }
  } catch (error) {
    console.error("Error al cargar partidos futuros:", error);
    tablaPartidosFuturos.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger">
          Error al cargar los partidos
        </td>
      </tr>
    `;
  }
}

const modalPartidos = document.getElementById("miModal");

modalPartidos.addEventListener("shown.bs.modal", () => {
  cargarTodosLosPartidosFuturos();
});

//Traer las últimas DOS Noticias

async function cargarUltimasNoticias() {
  const noticiasRef = firebase.firestore().collection("noticias");

  try {
    // Obtener las dos últimas noticias ordenadas por la estampa de tiempo en orden descendente
    const snapshot = await noticiasRef
      .orderBy("fechaDeCarga", "desc")
      .limit(2)
      .get();

    // Contenedor donde se mostrarán las noticias
    const contenedorNoticias = document.getElementById("ultimasNoticias");

    // Limpiar el contenedor antes de agregar nuevas noticias
    contenedorNoticias.innerHTML = "";

    // Recorrer cada documento y crear la plantilla HTML
    snapshot.forEach((doc) => {
      const noticia = doc.data();
      const modalId = `${doc.id}`;
      const modalIdSinEspacios = modalId.replace(/\s+/g, "");

      // Plantilla HTML para cada noticia
      const noticiaHTML = `<div class="d-flex justify-content-center col-12 col-md-5 ps-2 pe-2">
              <div class="noticias d-flex flex-column align-items-center text-center my-2">
                <img src="${noticia.imagenPrincipal}" alt=""/>
                <h3 class="mt-3 mb-3">${noticia.titulo}</h3>
                <p>
                ${noticia.copete}
                </p>
                <div>
                  <button type="button" class="btn btn-sm btn-custom" data-bs-toggle="modal" data-bs-target="#${modalIdSinEspacios}">
                    Ver más
                  </button>
                  <div class="modal fade" id="${modalIdSinEspacios}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg modal-dialog-scrollable">
                      <div class="modal-content">
                        <div class="modal-header">
                          <h1 class="modal-title fs-5 index" id="exampleModalLabel">${
                            noticia.titulo
                          }</h1>
                        </div>
                        <div class="modal-body clearfix textoModalNoticias">
                          <img src="${
                            noticia.imagenPrincipal
                          }" alt="" class="imagenModal col-md-6 float-md-end mb-3 ms-md-3 p-0">
                          <p>
                            ${noticia.cuerpoNoticia}
                          </p>
                           ${
                             noticia.imagenSecundaria
                               ? `
                  <img src="${noticia.imagenSecundaria}"
                    class="col-md-6 float-md-start mb-3 me-md-3 p-0">
                  <p>${noticia.cuerpoNoticia2}</p>
                  `
                               : `
                  <p class="mt-3">${noticia.cuerpoNoticia2}</p>
                  `
                           }
                        </div>
                        <div class="modal-footer d-flex justify-content-center">
                          <button type="button" class="btn btn-custom" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>`;
      contenedorNoticias.innerHTML += noticiaHTML;
    });
  } catch (error) {
    console.error("Error al cargar las noticias: ", error);
  }
}

// Traer Imagenes de Productos para Carrusel
async function cargarImagenesProductos() {
  const productosRef = firebase.firestore().collection("productos");

  try {
    // Obtener todos los documentos en la colección "productos"
    const snapshot = await productosRef.get();

    // Contenedor donde se mostrarán los productos
    const contenedorProductos = document.getElementById("carruselProductos");

    // Recorrer cada documento y crear la plantilla HTML
    snapshot.forEach((doc) => {
      const producto = doc.data();

      // Plantilla HTML para cada producto
      const productoHTML = `<div class="item"><img src="${producto.imagen}" alt=""></div>`;
      contenedorProductos.insertAdjacentHTML("beforeend", productoHTML);
    });

    // Inicializa el carrusel después de cargar las imágenes
    inicializarCarruselProductos();
  } catch (error) {
    console.error("Error al cargar los productos: ", error);
  }
}

// Inicializar el carrusel de productos
function inicializarCarruselProductos() {
  $(".owl-carouselP").owlCarousel({
    loop: true,
    margin: 10,
    nav: true,
    items: 1,
    responsiveClass: true,
    autoplay: true,
    autoplayTimeout: 3500,
    autoplayHoverPause: true,
    smartSpeed: 1000,
    responsive: {
      0: {
        items: 2,
        nav: false,
        loop: true,
        dots: false,
      },
      576: {
        items: 3,
        nav: false,
        loop: true,
        dots: false,
      },
      768: {
        items: 3,
        nav: false,
        loop: true,
        dots: false,
      },
      992: {
        items: 4,
        nav: false,
        loop: true,
        dots: false,
      },
      1200: {
        items: 5,
        nav: false,
        loop: true,
        dots: false,
      },
      1440: {
        items: 6,
        nav: false,
        loop: true,
        dots: false,
      },
    },
  });
}

// Llamar funciones para Noticias y Productos
window.onload = function () {
  cargarUltimasNoticias();
  cargarImagenesProductos();
};
