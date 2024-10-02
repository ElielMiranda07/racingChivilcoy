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
