//Mail de formulario

document
  .getElementById("contactForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const telefono = document.getElementById("telefono").value;
    const email = document.getElementById("email").value;

    sendEmail(nombre, apellido, telefono, email);
  });

function sendEmail(nombre, apellido, telefono, email) {
  const statusDiv = document.getElementById("status");

  const serviceID = "service_6kra6k5";
  const templateID = "template_ged351x";

  emailjs
    .send(serviceID, templateID, {
      nombre: nombre,
      email: email,
      apellido: apellido,
      telefono: telefono,
    })
    .then(
      () => {
        statusDiv.innerHTML = "¡Mensaje enviado con éxito!";
        document.getElementById("contactForm").reset();
      },
      (err) => {
        console.error("Error al enviar el correo:", err);
        statusDiv.innerHTML =
          "Hubo un error al enviar el mensaje: " + JSON.stringify(err);
      }
    );
}

//Cambio de Footer

const alturaHeader = header.offsetHeight;

function adjustClassesBasedOnWidth() {
  const header = document.getElementById("header");
  const footerSmall = document.getElementById("footerSmall");
  const footerLarge = document.getElementById("footerLarge");
  const mainFormulario = document.getElementById("mainFormulario");

  if (window.innerWidth >= 768) {
    footerLarge.classList.remove("d-none");
    footerSmall.classList.add("d-none");

    const alturaHeader = header.offsetHeight;
    const alturaFooterLarge = footerLarge.offsetHeight;
    const alturaMainGrande =
      window.innerHeight - alturaHeader - alturaFooterLarge;
    mainFormulario.style.minHeight = `${alturaMainGrande}px`;
  } else {
    footerLarge.classList.add("d-none");
    footerSmall.classList.remove("d-none");

    const alturaHeader = header.offsetHeight;
    const alturaFooterSmall = footerSmall.offsetHeight;
    const alturaMainChico =
      window.innerHeight - alturaHeader - alturaFooterSmall;
    mainFormulario.style.minHeight = `${alturaMainChico}px`;
  }
}

window.addEventListener("resize", adjustClassesBasedOnWidth);
window.addEventListener("DOMContentLoaded", adjustClassesBasedOnWidth);
