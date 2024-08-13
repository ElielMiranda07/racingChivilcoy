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
