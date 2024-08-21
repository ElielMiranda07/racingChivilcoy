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
