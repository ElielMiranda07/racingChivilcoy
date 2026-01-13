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

//Inscribite por WhatsApp

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
    const contadorRef = db.collection("clicksInscribirse").doc("contador");

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
        .collection("clicksInscribirse")
        .doc(`click ${nuevoNumero}`);
      transaction.set(nuevoClickRef, {
        numero: nuevoNumero,
        nombre: nombre,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });

    // Crear el mensaje dinámico
    const mensaje = `Hola! Quería inscribirme, mi nombre es ${encodeURIComponent(
      nombre
    )}`;
    const telefono = "5492346531265";
    const enlaceWhatsApp = `https://wa.me/${telefono}?text=${mensaje}`;

    // Redirigir a WhatsApp
    window.open(enlaceWhatsApp, "_blank");
  } catch (error) {
    console.error("Error al registrar el click:", error);
    alert("Ocurrió un error al registrar el click. Intentalo de nuevo.");
  }
});
