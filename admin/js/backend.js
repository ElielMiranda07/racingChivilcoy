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

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();

const provider = new firebase.auth.GoogleAuthProvider();

let configuracionGeneral = {};

let colorPrincipal = "#000000";
let colorSecundario = "#ffffff";
let colorAcento = "#000000";

let logoClub = "./media/akdBlanco.png";
let nombreClub = "Racing Club Chivilcoy";

document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.getElementById("loginGoogle");

  if (btnLogin) {
    btnLogin.addEventListener("click", loginGoogle);
  }

  verificarSesionActiva();
});

async function loginGoogle() {
  const mensaje = document.getElementById("mensajeLogin");

  try {
    if (mensaje) {
      mensaje.textContent = "";
    }

    const result = await auth.signInWithPopup(provider);

    const user = result.user;

    console.log("Usuario autenticado:", user);

    await validarUsuarioAdministrador(user);
  } catch (error) {
    console.error("Error al iniciar sesión:", error);

    if (mensaje) {
      mensaje.textContent = "No se pudo iniciar sesión con Google.";
    } else {
      alert("No se pudo iniciar sesión con Google.");
    }
  }
}

async function verificarSesionActiva() {
  await cargarConfiguracionGeneral();

  auth.onAuthStateChanged(async (user) => {
    if (!user) return;

    await validarUsuarioAdministrador(user);
  });
}

async function validarUsuarioAdministrador(user) {
  const mensaje = document.getElementById("mensajeLogin");

  try {
    const userRef = db.collection("usuarios").doc(user.uid);

    const doc = await userRef.get();

    if (!doc.exists) {
      await auth.signOut();

      if (mensaje) {
        mensaje.textContent = "No tenés permisos para acceder al panel.";
      } else {
        alert("No tenés permisos para acceder al panel.");
      }

      return;
    }

    const userData = doc.data();

    const esAdminGeneral = userData.role === "admin";

    const tieneAccesoWeb = userData.accesos?.web === true;

    const tieneAccesoSistema = userData.accesos?.sistema === true;

    const tieneAlgunAcceso =
      esAdminGeneral || tieneAccesoWeb || tieneAccesoSistema;

    if (!tieneAlgunAcceso) {
      await auth.signOut();

      if (mensaje) {
        mensaje.textContent = "Tu usuario no tiene accesos asignados.";
      } else {
        alert("Tu usuario no tiene accesos asignados.");
      }

      return;
    }

    window.location.href = "./elegirPanel.html";
  } catch (error) {
    console.error("Error al validar permisos:", error);

    await auth.signOut();

    if (mensaje) {
      mensaje.textContent = "Error al verificar permisos.";
    } else {
      alert("Error al verificar permisos.");
    }
  }
}

async function cargarConfiguracionGeneral() {
  try {
    const doc = await db.collection("configuracion").doc("general").get();

    if (!doc.exists) {
      console.warn("No existe configuracion/general");
      return;
    }

    configuracionGeneral = doc.data();

    aplicarConfiguracionGeneral();
  } catch (error) {
    console.error("Error al cargar configuración:", error);
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
