//Achicar Header

const header = document.getElementById("header");
const nav = document.getElementById("nav");

function handleScroll() {
  if (window.scrollY > 50) {
    header.classList.add("headerReducido");
    header.classList.remove("header");
    nav.classList.add("custom-navbarReducido");
    nav.classList.remove("custom-navbar");
  } else {
    header.classList.remove("headerReducido");
    header.classList.add("header");
    nav.classList.remove("custom-navbarReducido");
    nav.classList.add("custom-navbar");
  }
}

window.addEventListener("scroll", handleScroll);

//Carrusel Sponsors

$(".owl-carousel").owlCarousel({
  loop: true,
  margin: 10,
  responsiveClass: true,
  items: 3,
  autoplay: true,
  autoplayTimeout: 3500,
  autoplayHoverPause: true,
  smartSpeed: 1000,
  dots: false,
  responsive: {
    0: {
      items: 3,
      nav: false,
    },
    600: {
      items: 3,
      nav: false,
    },
    1000: {
      items: 3,
      nav: false,
    },
  },
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

//Carrusel Productos

$(".owl-carouselP").owlCarousel({
  loop: true,
  margin: 10,
  responsiveClass: true,
  autoplay: true,
  autoplayTimeout: 3500,
  autoplayHoverPause: true,
  smartSpeed: 1000,
  responsive: {
    0: {
      items: 3,
      nav: false,
      loop: true,
    },
    600: {
      items: 5,
      nav: false,
      loop: true,
    },
    1000: {
      items: 5,
      nav: false,
      loop: true,
    },
  },
});
