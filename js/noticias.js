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

let paginaActual = 1;
const noticiasPorPagina = 9;
let categoriaActual = "todas";

function filtrarNoticias(categoria) {
  categoriaActual = categoria;
  paginaActual = 1;

  document.querySelectorAll(".btn-custom").forEach((button) => {
    button.classList.remove("filtroActivo");
  });

  const botonSeleccionado = document.querySelector(
    `button[onclick="filtrarNoticias('${categoria}')"]`
  );

  if (botonSeleccionado) {
    botonSeleccionado.classList.add("filtroActivo");
  }

  renderNoticias(); // ⭐
}

// Aquí consultas a Firestore

// 1. Función para cargar y mostrar las noticias
async function cargarNoticias() {
  const noticiasRef = firebase.firestore().collection("noticias");

  try {
    const snapshot = await noticiasRef.orderBy("fechaDeCarga", "desc").get();
    const contenedorNoticias = document.getElementById("contenedorNoticias");
    contenedorNoticias.innerHTML = ""; // ⭐ limpiar

    snapshot.forEach((doc) => {
      const noticia = doc.data();
      const modalId = doc.id.replace(/\s+/g, "");

      const noticiaHTML = `
      <div class="todas ${
        noticia.categoria
      } noticiaItem col-xl-3 col-lg-5 col-md-5 col-sm-11 col-11 m-2">
        <div class="noticias d-flex flex-column align-items-center text-center">
          <img class="mt-1" src="${noticia.imagenPrincipal}" alt="">
          <h2 class="mt-3 mb-3">${noticia.titulo}</h2>
          <p>${noticia.copete}</p>

          <button type="button" class="btn btn-sm btn-custom mb-1 botonVerMas"
            data-bs-toggle="modal" data-bs-target="#${modalId}">
            Ver más
          </button>

          <div class="modal fade" id="${modalId}" tabindex="-1">
            <div class="modal-dialog modal-lg modal-dialog-scrollable">
              <div class="modal-content">
                <div class="modal-header">
                  <h1 class="modal-title fs-5">${noticia.titulo}</h1>
                </div>

                <div class="modal-body clearfix">
                  <img src="${noticia.imagenPrincipal}"
                       class="imagenModal col-md-6 float-md-end mb-3 ms-md-3 p-0">
                  <p>${noticia.cuerpoNoticia}</p>

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
                  <button type="button" class="btn btn-sm btn-secondary"
                          data-bs-dismiss="modal">
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;

      contenedorNoticias.innerHTML += noticiaHTML;
    });

    renderNoticias(); // ⭐ activar filtro + paginado

    // ⭐ abrir modal desde URL
    const params = new URLSearchParams(window.location.search);
    const noticiaParam = params.get("noticia");

    if (noticiaParam) {
      const modalEl = document.getElementById(noticiaParam.replace(/\s+/g, ""));
      if (modalEl) {
        new bootstrap.Modal(modalEl).show();
      }
    }
  } catch (error) {
    console.error("Error al cargar noticias:", error);
  }
}

function renderNoticias() {
  const noticias = Array.from(document.querySelectorAll(".noticiaItem"));

  const filtradas = noticias.filter((n) => {
    if (categoriaActual === "todas") return true;
    return n.classList.contains(categoriaActual);
  });

  const totalPaginas = Math.ceil(filtradas.length / noticiasPorPagina);
  const inicio = (paginaActual - 1) * noticiasPorPagina;
  const fin = inicio + noticiasPorPagina;

  noticias.forEach((n) => (n.hidden = true));

  filtradas.slice(inicio, fin).forEach((n) => (n.hidden = false));

  renderPaginacion(totalPaginas);
}

function renderPaginacion(totalPaginas) {
  const pagDiv = document.getElementById("paginacion");
  pagDiv.innerHTML = "";

  if (totalPaginas <= 1) return;

  // ⬅ Anterior
  const prev = document.createElement("button");
  prev.textContent = "«";
  prev.className = "btn btn-sm btn-custom botonVerMas";
  prev.disabled = paginaActual === 1;
  prev.onclick = () => {
    paginaActual--;
    renderNoticias();
    window.scrollTo({ top: 0, behavior: "smooth" }); // ⭐
  };
  pagDiv.appendChild(prev);

  // Números
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `btn btn-sm ${
      i === paginaActual ? "filtroActivo" : "botonVerMas"
    }`;
    btn.onclick = () => {
      paginaActual = i;
      renderNoticias();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    pagDiv.appendChild(btn);
  }

  // ➡ Siguiente
  const next = document.createElement("button");
  next.textContent = "»";
  next.className = "btn btn-sm btn-custom";
  next.disabled = paginaActual === totalPaginas;
  next.onclick = () => {
    paginaActual++;
    renderNoticias();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  pagDiv.appendChild(next);
}

// Llamada a la función para cargar las noticias al cargar la página
window.onload = cargarNoticias;
