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

// Aquí consultas a Firestore

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

//Asociate por WhatsApp

const botonWhatsApp = document.getElementById("botonWhatsApp");
const nombreInput = document.getElementById("nombreAsociar");

botonWhatsApp.addEventListener("click", async () => {
  const nombre = nombreInput.value.trim();
  if (nombre === "") {
    alert("Por favor ingresá tu nombre antes de continuar.");
    return;
  }

  try {
    // Referencia al documento contador
    const contadorRef = db.collection("clicksAsociate").doc("contador");

    // Ejecutar la operación en una transacción
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(contadorRef);
      let nuevoNumero = 1;

      if (doc.exists) {
        nuevoNumero = doc.data().ultimoNumero + 1;
      }

      // Actualizar el contador
      transaction.set(contadorRef, { ultimoNumero: nuevoNumero });

      // Crear el nuevo click con ese número
      const nuevoClickRef = db
        .collection("clicksAsociate")
        .doc(`click ${nuevoNumero}`);
      transaction.set(nuevoClickRef, {
        numero: nuevoNumero,
        nombre: nombre,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });

    // Crear el mensaje dinámico
    const mensaje = `Hola! Quería asociarme, mi nombre es ${encodeURIComponent(
      nombre
    )}`;
    const telefono = "5492346591745";
    const enlaceWhatsApp = `https://wa.me/${telefono}?text=${mensaje}`;

    // Redirigir a WhatsApp
    window.open(enlaceWhatsApp, "_blank");
  } catch (error) {
    console.error("Error al registrar el click:", error);
    alert("Ocurrió un error al registrar el click. Intentalo de nuevo.");
  }
});

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
