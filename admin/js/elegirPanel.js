// Configurar Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDCqe24Tu4-BKrxykDwTQvbDVIpoPBD8cY",
  authDomain: "reactss-26771.firebaseapp.com",
  projectId: "reactss-26771",
  storageBucket: "reactss-26771.appspot.com",
  messagingSenderId: "443520919767",
  appId: "1:443520919767:web:7a7a0cf32adad8d087e892",
  measurementId: "G-XBMQ9BWG70",
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();

let configuracionGeneral = {};

let colorPrincipal = "#000000";
let colorSecundario = "#ffffff";
let colorAcento = "#000000";

let logoClub = "./media/akdBlanco.png";
let nombreClub = "Racing Club Chivilcoy";

document.addEventListener("DOMContentLoaded", async () => {
  await cargarConfiguracionGeneral();

  validarSesionYAccesos();
});

async function cargarConfiguracionGeneral() {
  try {
    const doc = await db.collection("configuracion").doc("general").get();

    if (!doc.exists) {
      console.warn("No existe configuracion/general");
      aplicarConfiguracionGeneral();
      return;
    }

    configuracionGeneral = doc.data();

    aplicarConfiguracionGeneral();
  } catch (error) {
    console.error("Error al cargar configuración:", error);

    aplicarConfiguracionGeneral();
  }
}

function aplicarConfiguracionGeneral() {
  colorPrincipal = configuracionGeneral.apariencia?.colorPrincipal || "#000000";

  colorSecundario =
    configuracionGeneral.apariencia?.colorSecundario || "#ffffff";

  colorAcento = configuracionGeneral.apariencia?.colorAcento || "#000000";

  logoClub = configuracionGeneral.general?.logo || "./media/akdBlanco.png";

  nombreClub =
    configuracionGeneral.general?.nombreClub || "Racing Club Chivilcoy";

  document.documentElement.style.setProperty(
    "--color-principal",
    colorPrincipal,
  );

  document.documentElement.style.setProperty(
    "--color-secundario",
    colorSecundario,
  );

  document.documentElement.style.setProperty("--color-acento", colorAcento);

  const metaTheme = document.querySelector("meta[name='theme-color']");

  if (metaTheme) {
    metaTheme.setAttribute("content", colorPrincipal);
  }

  aplicarLogoClub();
  aplicarNombreClub();
}

function aplicarLogoClub() {
  document.querySelectorAll(".logo-club").forEach((img) => {
    img.src = logoClub;
  });
}

function aplicarNombreClub() {
  document.querySelectorAll(".nombre-club").forEach((el) => {
    el.textContent = nombreClub;
  });
}

function validarSesionYAccesos() {
  auth.onAuthStateChanged(async (user) => {
    const mensaje = document.getElementById("mensajePanel");

    ocultarBotonesPanel();

    if (!user) {
      window.location.href = "./backend.html";
      return;
    }

    try {
      const doc = await db.collection("usuarios").doc(user.uid).get();

      if (!doc.exists) {
        if (mensaje) {
          mensaje.textContent = "No tenés permisos de administrador.";
        }

        await auth.signOut();

        return;
      }

      const usuario = doc.data();

      const puedeWeb =
        usuario.role === "admin" || usuario.accesos?.web === true;

      const puedeApp =
        usuario.role === "admin" || usuario.accesos?.sistema === true;

      const btnWeb = document.getElementById("elegirWeb");
      const btnApp = document.getElementById("elegirApp");

      if (btnWeb && puedeWeb) {
        btnWeb.classList.remove("d-none");
      }

      if (btnApp && puedeApp) {
        btnApp.classList.remove("d-none");
      }

      if (!puedeWeb && !puedeApp) {
        if (mensaje) {
          mensaje.textContent = "No tenés accesos asignados.";
        }

        await auth.signOut();
      }
    } catch (error) {
      console.error("Error al validar accesos:", error);

      if (mensaje) {
        mensaje.textContent = "Error al validar accesos.";
      }

      await auth.signOut();
    }
  });
}

function ocultarBotonesPanel() {
  const btnWeb = document.getElementById("elegirWeb");
  const btnApp = document.getElementById("elegirApp");

  if (btnWeb) {
    btnWeb.classList.add("d-none");
  }

  if (btnApp) {
    btnApp.classList.add("d-none");
  }
}

function cerrarSesion() {
  auth.signOut().then(() => {
    window.location.href = "./backend.html";
  });
}
