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
const auth = firebase.auth();
const functions = firebase.app().functions("us-central1");
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

let usuarioActual = null;

firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    usuarioActual = null;
    return;
  }

  usuarioActual = user;
});

function esperarAuth() {
  return new Promise((resolve) => {
    const unsub = firebase.auth().onAuthStateChanged((user) => {
      unsub();
      resolve(user);
    });
  });
}

//Chequear si el usuario es ADMIN

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // El usuario está autenticado
    checkUserRole(user); // Llamar a tu función para verificar el rol
    console.log(user);
  } else {
    // No hay usuario autenticado, redirigir al inicio de sesión
    window.location.href = "../index.html"; // Redirige a la página de inicio de sesión
  }
});

function checkUserRole(user) {
  // Referencia al documento del usuario en Firestore
  const userRef = firebase.firestore().collection("usuarios").doc(user.uid);

  // Verificar si el usuario tiene el rol 'admin'
  userRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        if (userData.role === "admin") {
        } else {
          // Si no es admin, mostrar un mensaje y cerrar sesión
          Swal.fire(
            "No tienes permisos para acceder a esta página.",
            "",
            "warning",
          );

          firebase.auth().signOut(); // Cerrar sesión
        }
      } else {
        // Si no existe el documento, cerrar sesión
        Swal.fire("Usuario no registrado en la base de datos.", "", "warning");
        firebase.auth().signOut(); // Cerrar sesión
      }
    })
    .catch((error) => {
      console.error("Error al verificar el rol del usuario: ", error);
      Swal.fire("Error al verificar el rol del usuario.", "", "warning");
      firebase.auth().signOut(); // Cerrar sesión en caso de error
    });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// Selección de Módulos ///////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

function mostrar(modulo) {
  document
    .querySelectorAll(".modulo")
    .forEach((m) => m.classList.add("d-none"));

  document.getElementById(modulo).classList.remove("d-none");

  if (modulo === "dashboard") {
    cargarDashboard();
  }

  if (modulo === "dashboardFacturacion") {
    cargarDashboardFacturacion();
  }

  if (modulo === "buscar") {
    cargarBuscadorSocios();
  }

  if (modulo === "precios") {
    cargarModuloPrecios();
  }

  if (modulo === "pagos") {
    cargarModuloPagos();
  }

  if (modulo === "configuracion") {
    cargarConfiguracion();
  }

  if (modulo === "notificaciones") {
    cargarModuloNotificaciones();
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////// Variables Globales ////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let configuracionGeneral = {};
let cacheCategorias = {};
let cacheActividades = {};
let miembrosGrupoTemporal = [];
let timerBusquedaDni;
let timerBusquedaNombre;
let datosCSV = [];
let graficoFacturacion = null;
let graficoFacturacionLineal = null;

let colorPrincipal = "#000000";
let colorSecundario = "#ffffff";
let colorAcento = "#000000";

async function cargarConfiguracionSistema() {
  const doc = await db.collection("configuracion").doc("general").get();

  if (!doc.exists) return;

  configuracionGeneral = doc.data();
  console.log(configuracionGeneral);
}

function aplicarConfiguracionGeneral() {
  // Nombre del club
  const nombreClub = document.getElementById("nombreClub");

  if (nombreClub) {
    nombreClub.textContent = configuracionGeneral.general?.nombreClub || "";
  }

  // Logo
  const logoSidebar = document.getElementById("logoSidebar");

  if (logoSidebar && configuracionGeneral.general?.logo) {
    logoSidebar.src = configuracionGeneral.general.logo;
  }

  colorPrincipal = configuracionGeneral.apariencia?.colorPrincipal || "#000000";

  colorSecundario =
    configuracionGeneral.apariencia?.colorSecundario || "#ffffff";

  colorAcento = configuracionGeneral.apariencia?.colorAcento || "#000000";

  document.documentElement.style.setProperty(
    "--color-principal",
    colorPrincipal,
  );

  document.documentElement.style.setProperty(
    "--color-secundario",
    colorSecundario,
  );

  document.documentElement.style.setProperty("--color-acento", colorAcento);
}

async function iniciarSistema() {
  await cargarConfiguracionSistema();

  aplicarConfiguracionGeneral();
}

iniciarSistema();
