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
const storage = firebase.storage();

// Aquí consultas a Firestore

//Chequear si el usuario es ADMIN

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // El usuario está autenticado
    checkUserRole(user); // Llamar a tu función para verificar el rol
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
          alert("No tienes permisos para acceder a esta página.");
          firebase.auth().signOut(); // Cerrar sesión
        }
      } else {
        // Si no existe el documento, cerrar sesión
        alert("Usuario no registrado en la base de datos.");
        firebase.auth().signOut(); // Cerrar sesión
      }
    })
    .catch((error) => {
      console.error("Error al verificar el rol del usuario: ", error);
      alert("Error al verificar el rol del usuario.");
      firebase.auth().signOut(); // Cerrar sesión en caso de error
    });
}

let usuarioActual = null;

let configuracionGeneral = {};

let colorPrincipal = "#000000";
let colorSecundario = "#ffffff";
let colorAcento = "#000000";

let logoClub = "./media/akdBlanco.png";
let nombreClub = "Racing Club Chivilcoy";

const modulosAdminWeb = {
  clicks: {
    titulo: "Contadores de clicks",
    subtitulo: "Métricas de interacción del sitio web",
    render: "renderModuloClicks",
  },

  partidos: {
    titulo: "Carga de partidos",
    subtitulo: "Administración de partidos y calendario deportivo",
    render: "renderModuloPartidos",
  },

  noticias: {
    titulo: "Carga de noticias",
    subtitulo: "Alta, edición y publicación de novedades",
    render: "renderModuloNoticias",
  },

  productos: {
    titulo: "Carga de productos",
    subtitulo: "Gestión de productos, sponsors o catálogo web",
    render: "renderModuloProductos",
  },
};

document.addEventListener("DOMContentLoaded", async () => {
  await cargarConfiguracionGeneral();

  configurarSidebar();

  validarSesionAdminWeb();
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

function validarSesionAdminWeb() {
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "./index.html";
      return;
    }

    try {
      const doc = await db.collection("usuarios").doc(user.uid).get();

      if (!doc.exists) {
        alert("No tenés permisos de administrador.");
        await auth.signOut();
        return;
      }

      const usuario = doc.data();

      const puedeEntrarWeb =
        usuario.role === "admin" || usuario.accesos?.web === true;

      if (!puedeEntrarWeb) {
        alert("No tenés permisos para administrar la web.");
        await auth.signOut();
        return;
      }

      usuarioActual = {
        uid: user.uid,
        email: user.email,
        ...usuario,
      };

      cargarDatosUsuarioTopbar();

      cargarModulo("clicks");
    } catch (error) {
      console.error("Error al validar admin web:", error);

      alert("Error al validar permisos.");

      await auth.signOut();
    }
  });
}

function cargarDatosUsuarioTopbar() {
  const nombre =
    usuarioActual?.name || usuarioActual?.nombre || "Administrador";
  const email = usuarioActual?.email || "-";

  const nombreEl = document.getElementById("adminNombre");
  const emailEl = document.getElementById("adminEmail");

  if (nombreEl) nombreEl.textContent = nombre;
  if (emailEl) emailEl.textContent = email;
}

function configurarSidebar() {
  document.querySelectorAll(".sidebar-link").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modulo = btn.dataset.modulo;

      cargarModulo(modulo);

      cerrarSidebarMobile();
    });
  });

  const btnToggle = document.getElementById("btnToggleSidebar");

  if (btnToggle) {
    btnToggle.addEventListener("click", () => {
      document.getElementById("adminSidebar")?.classList.toggle("open");
    });
  }
}

function cargarModulo(nombreModulo) {
  const modulo = modulosAdminWeb[nombreModulo];

  if (!modulo) {
    console.warn("Módulo no encontrado:", nombreModulo);
    return;
  }

  document.querySelectorAll(".sidebar-link").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.modulo === nombreModulo);
  });

  const titulo = document.getElementById("tituloModulo");
  const subtitulo = document.getElementById("subtituloModulo");

  if (titulo) titulo.textContent = modulo.titulo;
  if (subtitulo) subtitulo.textContent = modulo.subtitulo;

  const contenedor = document.getElementById("contenedorModulo");

  if (contenedor) {
    contenedor.innerHTML = `
      <div class="admin-loading-card">
        <div class="spinner-border" role="status"></div>

        <p class="mt-3 mb-0">
          Cargando módulo...
        </p>
      </div>
    `;
  }

  const renderFunction = window[modulo.render];

  if (typeof renderFunction !== "function") {
    if (contenedor) {
      contenedor.innerHTML = `
        <div class="admin-card">
          <h3 class="admin-section-title">
            Módulo pendiente
          </h3>

          <p class="text-muted mb-0">
            Todavía no existe la función ${modulo.render}().
          </p>
        </div>
      `;
    }

    return;
  }

  renderFunction();
}

function cerrarSidebarMobile() {
  const sidebar = document.getElementById("adminSidebar");

  if (sidebar) {
    sidebar.classList.remove("open");
  }
}

function cerrarSesion() {
  auth.signOut().then(() => {
    window.location.href = "./index.html";
  });
}
