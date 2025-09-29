//Calcular Edad

function calcularEdad(fechaNacimiento) {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  // Ajustar si todavía no cumplió años este año
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad;
}

document.addEventListener("DOMContentLoaded", () => {
  const elementos = document.querySelectorAll("h5[data-nacimiento]");

  elementos.forEach((el) => {
    const fechaNacimiento = el.dataset.nacimiento;
    const edad = calcularEdad(fechaNacimiento);
    el.textContent = "Edad: " + edad;
  });
});

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
