const crearUsuarioSistema = functions.httpsCallable("crearUsuarioSistema");

async function cargarModuloUsuarios() {
  document.getElementById("usuarios").innerHTML = `

<div class="container-fluid">

  <h2 class="mb-4">

    <i class="bi bi-people-fill"></i>

    Usuarios y Accesos

  </h2>

  <ul class="nav nav-tabs mb-4">

    <li class="nav-item">
      <button
        class="nav-link active"
        data-bs-toggle="tab"
        data-bs-target="#tabUsuarios">

        👥 Usuarios

      </button>
    </li>

    <li class="nav-item">
      <button
        class="nav-link"
        data-bs-toggle="tab"
        data-bs-target="#tabCrearUsuario">

        ➕ Crear Usuario

      </button>
    </li>

  </ul>

  <div class="tab-content">

    <div
      class="tab-pane fade show active"
      id="tabUsuarios">

      ${await tabUsuarios()}

    </div>

    <div
      class="tab-pane fade"
      id="tabCrearUsuario">

      ${tabCrearUsuario()}

    </div>

  </div>

</div>

`;

  await cargarUsuariosSistema();
}

async function tabUsuarios() {
  return `

<div class="card shadow-sm border-0">

  <div class="card-body">

    <div class="d-flex justify-content-between align-items-center mb-3">

      <h4 class="mb-0">
        Usuarios del sistema
      </h4>

    </div>

    <hr>

    <div id="tablaUsuarios">

      <div class="text-center py-4">

        Cargando...

      </div>

    </div>

  </div>

</div>

`;
}

async function cargarUsuariosSistema() {
  const snapshot = await db.collection("usuarios").orderBy("name").get();

  let html = "";

  snapshot.forEach((doc) => {
    const usuario = doc.data();

    html += `

<div class="card mb-3">

  <div class="card-body">

    <div class="d-flex justify-content-between">

      <div>

        <h5 class="mb-1">

          ${usuario.name}

        </h5>

        <small class="text-muted">

          ${usuario.email}

        </small>

      </div>

      <div>

        <button
          class="btn btn-sm btn-primary"
          onclick="editarUsuario('${doc.id}')">

          Editar

        </button>

      </div>

    </div>

    <hr>

    ${renderAccesosSoloLectura(usuario.accesos)}

    <hr>

    ${renderPermisosSoloLectura(usuario.permisos)}

  </div>

</div>

`;
  });

  document.getElementById("tablaUsuarios").innerHTML = html;
}

function renderPermisosSoloLectura(permisos = {}) {
  const nombres = {
    dashboard: "Dashboard",
    facturacion: "Facturación",
    buscar: "Buscar",
    importar: "Crear",
    pagos: "Pagos",
    precios: "Precios",
    notificaciones: "Notificaciones",
    configuracion: "Configuración",
    usuarios: "Usuarios",
    pileta: "Pileta",
    analisis: "Analisis",
  };

  let html = `<div class="row">`;

  Object.entries(nombres).forEach(([key, label]) => {
    html += `

<div class="col-md-4 mb-2">

  ${permisos[key] ? "✅" : "⬜"}

  ${label}

</div>

`;
  });

  html += "</div>";

  return html;
}

async function editarUsuario(uid) {
  const doc = await db.collection("usuarios").doc(uid).get();

  const usuario = doc.data();

  Swal.fire({
    title: false,

    width: 800,

    html: `

<div class="text-start">

  <h3
    class="mb-1"
    style="color:${colorPrincipal}">

    ${usuario.name}

  </h3>

  <div class="text-muted mb-4">

    ${usuario.email}

  </div>

  <div class="card border-0 bg-light mb-4">

    <div class="card-body">

      <h5
        class="mb-3"
        style="color:${colorPrincipal}">

        Accesos

      </h5>

      ${selectorAccesosUsuario(usuario.accesos)}

    </div>

  </div>

  <div class="card border-0 bg-light">

    <div class="card-body">

      <h5
        class="mb-3"
        style="color:${colorPrincipal}">

        Permisos

      </h5>

      ${selectorPermisosUsuario(usuario.permisos)}

    </div>

  </div>

</div>

`,

    showCancelButton: true,

    confirmButtonText: "Guardar cambios",

    cancelButtonText: "Cancelar",

    confirmButtonColor: colorPrincipal,

    reverseButtons: true,

    focusConfirm: false,

    customClass: {
      popup: "shadow-lg rounded-4",
      confirmButton: "px-4",
      cancelButton: "px-4",
    },

    preConfirm: () => guardarPermisosUsuario(uid),
  });
}

function selectorAccesosUsuario(accesos = {}) {
  return `

<div class="row mb-4">

  <div class="col-md-6">

    <div class="form-check">

      <input
        type="checkbox"
        class="form-check-input acceso-check"
        data-acceso="sistema"
        ${accesos.sistema ? "checked" : ""}>

      <label class="form-check-label">

        Sistema de Socios

      </label>

    </div>

  </div>

  <div class="col-md-6">

    <div class="form-check">

      <input
        type="checkbox"
        class="form-check-input acceso-check"
        data-acceso="web"
        ${accesos.web ? "checked" : ""}>

      <label class="form-check-label">

        Administrador Web

      </label>

    </div>

  </div>

</div>

`;
}

async function guardarPermisosUsuario(uid) {
  const permisos = {};

  document.querySelectorAll(".permiso-check").forEach((check) => {
    permisos[check.id] = check.checked;
  });

  const accesos = {};

  document.querySelectorAll(".acceso-check").forEach((check) => {
    accesos[check.dataset.acceso] = check.checked;
  });

  await db.collection("usuarios").doc(uid).update({
    permisos,
    accesos,
  });

  await cargarUsuariosSistema();

  return true;
}

function tabCrearUsuario() {
  return `

<div class="card shadow-sm border-0">

  <div class="card-body">

    <h4>

      Nuevo usuario

    </h4>

    <hr>

    <div class="row">

      <div class="col-md-6 mb-3">

        <label>

          Nombre

        </label>

        <input
          id="nuevoNombre"
          class="form-control">

      </div>

      <div class="col-md-6 mb-3">

        <label>

          Email

        </label>

        <input
          id="nuevoEmail"
          class="form-control">

      </div>

      <div class="col-md-6 mb-3">

        <label>

          Contraseña

        </label>

        <input
          id="nuevoPassword"
          class="form-control">

      </div>

    </div>

    <h5 class="mt-4">
  Accesos
</h5>

<hr>

<div class="row mb-4">

  <div class="col-md-3">

    <div class="form-check">

      <input
        type="checkbox"
        class="form-check-input acceso-check"
        id="accesoSistema"
        data-acceso="sistema"
        checked>

      <label class="form-check-label">
        Sistema
      </label>

    </div>

  </div>

  <div class="col-md-3">

    <div class="form-check">

      <input
        type="checkbox"
        class="form-check-input acceso-check"
        id="accesoWeb"
        data-acceso="web">

      <label class="form-check-label">
        Web
      </label>

    </div>

  </div>

</div>

    <h5 class="mt-4">

      Permisos

    </h5>

    <hr>

    ${selectorPermisosUsuario()}

    <div class="text-end mt-4">

      <button
        class="btn btn-success"
        onclick="crearNuevoUsuario()">

        Crear Usuario

      </button>

    </div>

  </div>

</div>

`;
}

async function crearNuevoUsuario() {
  try {
    const nombre = document.getElementById("nuevoNombre").value.trim();
    const email = document.getElementById("nuevoEmail").value.trim();
    const password = document.getElementById("nuevoPassword").value;

    const permisos = {};

    const accesos = {};

    document.querySelectorAll(".acceso-check").forEach((check) => {
      accesos[check.dataset.acceso] = check.checked;
    });

    document.querySelectorAll(".permiso-check").forEach((check) => {
      permisos[check.id] = check.checked;
    });

    Swal.fire({
      title: "Creando usuario...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const resultado = await crearUsuarioSistema({
      nombre,
      email,
      password,
      accesos,
      permisos,
    });

    Swal.fire({
      icon: "success",
      title: "Usuario creado",
      text: resultado.data.message,
    });

    cargarModuloUsuarios();
  } catch (error) {
    console.error(error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message,
    });
  }
}

function selectorPermisosUsuario(permisos = {}) {
  return `

<div class="row">

  <div class="col-md-4">

    <div class="form-check">

      <input
        type="checkbox"
        class="permiso-check"
        id="dashboard"
         ${permisos.dashboard ? "checked" : ""}>

      <label class="form-check-label">

        Dashboard General

      </label>

    </div>

  </div>

  <div class="col-md-4">

    <div class="form-check">

      <input
        type="checkbox"
        class="permiso-check"
        id="facturacion"
         ${permisos.facturacion ? "checked" : ""}>

      <label class="form-check-label">

        Dashboard Facturación

      </label>

    </div>

  </div>

  <div class="col-md-4">

    <div class="form-check">

      <input
        type="checkbox"
        class="permiso-check"
        id="buscar"
         ${permisos.buscar ? "checked" : ""}>

      <label class="form-check-label">

        Buscar Socios

      </label>

    </div>

  </div>

  <div class="col-md-4">

    <div class="form-check">

      <input
        type="checkbox"
        class="permiso-check"
        id="importar"
         ${permisos.importar ? "checked" : ""}>

      <label class="form-check-label">

        Crear Socios

      </label>

    </div>

  </div>

  <div class="col-md-4">

    <div class="form-check">

      <input
        type="checkbox"
        class="permiso-check"
        id="pagos"
         ${permisos.pagos ? "checked" : ""}>

      <label class="form-check-label">

        Pagos

      </label>

    </div>

  </div>

  <div class="col-md-4">

    <div class="form-check">

      <input
        type="checkbox"
        class="permiso-check"
        id="precios"
         ${permisos.precios ? "checked" : ""}>

      <label class="form-check-label">

        Precios

      </label>

    </div>

  </div>

  <div class="col-md-4">

    <div class="form-check">

      <input
        type="checkbox"
        class="permiso-check"
        id="notificaciones"
         ${permisos.notificaciones ? "checked" : ""}>

      <label class="form-check-label">

        Notificaciones

      </label>

    </div>

  </div>

  <div class="col-md-4">

    <div class="form-check">

      <input
        type="checkbox"
        class="permiso-check"
        id="configuracion"
         ${permisos.configuracion ? "checked" : ""}>

      <label class="form-check-label">

        Configuración

      </label>

    </div>

  </div>

  <div class="col-md-4">

    <div class="form-check">

      <input
        type="checkbox"
        class="permiso-check"
        id="usuarios"
         ${permisos.usuarios ? "checked" : ""}>

      <label class="form-check-label">

        Usuarios

      </label>

    </div>

  </div>

  <div class="col-md-4">

    <div class="form-check">

      <input
        type="checkbox"
        class="permiso-check"
        id="pileta"
         ${permisos.pileta ? "checked" : ""}>

      <label class="form-check-label">

        Pileta

      </label>

    </div>

  </div>

  <div class="col-md-4">

    <div class="form-check">

      <input
        type="checkbox"
        class="permiso-check"
        id="analisis"
         ${permisos.analisis ? "checked" : ""}>

      <label class="form-check-label">

        Analisis

      </label>

    </div>

  </div>

</div>

`;
}

function renderAccesosSoloLectura(accesos = {}) {
  return `

<div class="mb-3">

  <strong>

    Accesos

  </strong>

  <br>

  ${accesos.sistema ? `<span class="badge bg-primary me-2">Sistema</span>` : ""}

  ${accesos.web ? `<span class="badge bg-success me-2">Web</span>` : ""}

</div>

`;
}
