//Ajustar Tamaño de la pantalla principal

function adjustSectionHeight() {
  const header = document.getElementById("header");
  const section = document.getElementById("section1");
  const article = document.getElementById("article21");
  //Posición de Boton Asociate
  const botonAsociate = document.getElementById("btnDeAsociate");

  const headerHeight = header.offsetHeight;
  const articleHeight = article.offsetHeight;

  if (window.innerWidth <= 768) {
    const availableHeightChica =
      window.innerHeight - headerHeight - articleHeight;
    section.style.height = `${availableHeightChica}px`;
    const botonAsociateChica =
      window.innerHeight - headerHeight - articleHeight;
    botonAsociate.style.transform = `translateY(calc(${botonAsociateChica}px - 20vh))`;
  } else {
    const availableHeightGrande = window.innerHeight - headerHeight;
    section.style.height = `${availableHeightGrande}px`;

    const botonAsociateGrande = window.innerHeight - headerHeight;
    botonAsociate.style.transform = `translateY(calc(${botonAsociateGrande}px - 10vh))`;
  }
}

window.addEventListener("load", adjustSectionHeight);
window.addEventListener("resize", adjustSectionHeight);

//Eliminar Clases Responsive

//Media 576

window.addEventListener("resize", function () {
  if (window.innerWidth >= 576) {
  } else {
  }
});

//Media 768

function adjustClassesBasedOnWidth() {
  const partido3 = document.getElementById("partido3");
  const botonAsociate = document.getElementById("btnDeAsociate");
  const proximosPartidos = document.getElementById("proximosPartidos");
  const partido1 = document.getElementById("partido1");
  const partido2 = document.getElementById("partido2");
  const footerSmall = document.getElementById("footerSmall");
  const footerLarge = document.getElementById("footerLarge");

  if (window.innerWidth >= 768) {
    partido3.classList.remove("d-none");
    partido3.classList.add("d-flex", "flex-column");
    botonAsociate.classList.remove("btn-sm");
    botonAsociate.classList.add("btn-lg");
    proximosPartidos.classList.remove("col-4");
    partido1.classList.remove("col-4");
    partido2.classList.remove("col-4");
    proximosPartidos.classList.add("col-3");
    partido1.classList.add("col-3");
    partido2.classList.add("col-3");
    footerLarge.classList.remove("d-none");
    footerSmall.classList.add("d-none");
  } else {
    partido3.classList.add("d-none");
    partido3.classList.remove("d-flex", "flex-column");
    botonAsociate.classList.add("btn-sm");
    botonAsociate.classList.remove("btn-lg");
    proximosPartidos.classList.add("col-4");
    partido1.classList.add("col-4");
    partido2.classList.add("col-4");
    proximosPartidos.classList.remove("col-3");
    partido1.classList.remove("col-3");
    partido2.classList.remove("col-3");
    footerLarge.classList.add("d-none");
    footerSmall.classList.remove("d-none");
  }
}

window.addEventListener("resize", adjustClassesBasedOnWidth);
window.addEventListener("DOMContentLoaded", adjustClassesBasedOnWidth);

//Carrusel Sponsors

document.querySelectorAll(".sponsors-marquee").forEach((marquee) => {
  const track = marquee.querySelector(".marquee-track");
  track.innerHTML += track.innerHTML;
});

//Cobertor de Map

const mapCobertor = document.querySelector(".mapCobertor");
const toggleMapButton = document.getElementById("toggleMap");
const botonContainer = document.querySelector(".botonContainer");

toggleMapButton.addEventListener("click", () => {
  const isHidden = mapCobertor.classList.toggle("hidden");
  toggleMapButton.textContent = isHidden ? "Cerrar Mapa" : "Abrir Mapa";
  botonContainer.classList.toggle("center", !isHidden);
});

//Cobertor de Map2

const mapCobertor2 = document.querySelector(".mapCobertor2");
const toggleMapButton2 = document.getElementById("toggleMap2");
const botonContainer2 = document.querySelector(".botonContainer2");

toggleMapButton2.addEventListener("click", () => {
  const isHidden = mapCobertor2.classList.toggle("hidden");
  toggleMapButton2.textContent = isHidden ? "Cerrar Mapa" : "Abrir Mapa";
  botonContainer2.classList.toggle("center", !isHidden);
});
