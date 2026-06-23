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

const MODULOS = [
  {
    id: "dashboard",
    nombre: "Dashboard General",
    permiso: "dashboard",
    cargar: "cargarDashboard",
  },

  {
    id: "dashboardFacturacion",
    nombre: "Dashboard Facturación",
    permiso: "facturacion",
    cargar: "cargarDashboardFacturacion",
  },

  {
    id: "importar",
    nombre: "Crear socios",
    permiso: "importar",
    cargar: "cargarModuloImportar",
  },

  {
    id: "buscar",
    nombre: "Buscar socio",
    permiso: "buscar",
    cargar: "cargarBuscadorSocios",
  },

  {
    id: "precios",
    nombre: "Precios",
    permiso: "precios",
    cargar: "cargarModuloPrecios",
  },

  {
    id: "pagos",
    nombre: "Pagos",
    permiso: "pagos",
    cargar: "cargarModuloPagos",
  },

  {
    id: "notificaciones",
    nombre: "Notificaciones",
    permiso: "notificaciones",
    cargar: "cargarModuloNotificaciones",
  },

  {
    id: "usuarios",
    nombre: "Usuarios",
    permiso: "usuarios",
    cargar: "cargarModuloUsuarios",
  },

  {
    id: "pileta",
    nombre: "Pileta",
    permiso: "pileta",
    cargar: "cargarModuloPileta",
  },

  {
    id: "analisis",
    nombre: "Analisis",
    permiso: "analisis",
    cargar: "cargarModuloAnalisis",
  },

  {
    id: "configuracion",
    nombre: "Configuración",
    permiso: "configuracion",
    cargar: "cargarConfiguracion",
  },
];

function obtenerOrdenModulos() {
  const ordenGuardado = configuracionGeneral.menu || [];

  return [
    ...ordenGuardado,
    ...MODULOS.map((m) => m.id).filter((id) => !ordenGuardado.includes(id)),
  ];
}

function mostrar(modulo) {
  const moduloActual = MODULOS.find((m) => m.id === modulo);

  if (moduloActual && permisosUsuario[moduloActual.permiso] === false) {
    Swal.fire({
      icon: "error",
      title: "Sin permisos",
      text: "No tiene acceso a este módulo",
    });

    return;
  }

  document
    .querySelectorAll(".modulo")
    .forEach((m) => m.classList.add("d-none"));

  document.getElementById(modulo).classList.remove("d-none");

  if (
    moduloActual?.cargar &&
    typeof window[moduloActual.cargar] === "function"
  ) {
    window[moduloActual.cargar]();
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
let logoBase64 = "";
let permisosUsuario = {};
let proximoSocio;

let colorPrincipal = "#000000";
let colorSecundario = "#ffffff";
let colorAcento = "#000000";

async function cargarConfiguracionSistema() {
  const doc = await db.collection("configuracion").doc("general").get();

  if (!doc.exists) return;

  configuracionGeneral = doc.data();

  logoBase64 = configuracionGeneral.general?.logo || "";

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

  if (logoSidebar) {
    logoSidebar.src = configuracionGeneral.general?.logo || "";
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

  proximoSocio = (configuracionGeneral.ultimoNumeroSocio || 0) + 1;

  actualizarNumeroSocioPreview();

  console.log("Próximo socio:", proximoSocio);
}

async function cargarPermisosUsuario() {
  const uid = firebase.auth().currentUser.uid;

  const doc = await db.collection("usuarios").doc(uid).get();

  permisosUsuario = doc.data().permisos || {};

  renderMenu();
}

async function iniciarSistema() {
  await cargarConfiguracionSistema();

  aplicarConfiguracionGeneral();

  await cargarPermisosUsuario();
}

iniciarSistema();

function renderMenu() {
  let html = "";
  let html2 = "";

  const orden = obtenerOrdenModulos();

  orden.forEach((idModulo) => {
    const modulo = MODULOS.find((m) => m.id === idModulo);

    if (!modulo) return;

    if (permisosUsuario[modulo.permiso] === false) return;

    // CONFIGURACIÓN

    if (modulo.id === "configuracion") {
      html2 += `
        <button
          class="btn text-white mt-auto mb-1"
          onclick="mostrar('configuracion')"
          style="
            font-size:1.8rem;
            transition:
              transform .2s,
              color .2s;
          "

          onmouseover="
            this.style.transform='rotate(30deg) scale(1.1)';
            this.style.color=colorPrincipal;
          "

          onmouseout="
            this.style.transform='rotate(0deg) scale(1)';
            this.style.color='white';
          "

          title="Configuración">

          <i class="bi bi-gear-fill"></i>

        </button>
      `;
    }

    // RESTO DE LOS MÓDULOS
    else {
      html += `
        <button
          class="btn btn-custom w-100 mb-2"
          onclick="mostrar('${modulo.id}')">

          <strong>${modulo.nombre}</strong>

        </button>
      `;
    }
  });

  document.getElementById("menuModulos").innerHTML = html;
  document.getElementById("configuracionContainer").innerHTML = html2;
}

function actualizarNumeroSocioPreview() {
  const input = document.getElementById("numeroSocioPreview");

  if (input) {
    input.value = proximoSocio || "-";
  }
}
