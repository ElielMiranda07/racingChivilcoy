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

  const serviceID = "service_u5ls0bl";
  const templateID = "template_ikl8anc";

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
        statusDiv.innerHTML =
          "Hubo un error al enviar el mensaje: " + JSON.stringify(err);
      }
    );
}
