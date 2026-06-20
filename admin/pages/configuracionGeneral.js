async function cargarConfiguracion() {
  document.getElementById("configuracion").innerHTML = `
    ${cabeceraConfiguracion()}
    ${tabsConfiguracion()}
    ${contenidoConfiguracion()}
    ${botonGuardarConfiguracion()}
  `;

  cargarListaModulos();
}

function cabeceraConfiguracion() {
  return `
    <h2 class="mb-4 colorPrincipal">
      <i class="bi bi-gear-fill"></i>
      Configuración del Sistema
    </h2>
  `;
}

function tabsConfiguracion() {
  return `
    <ul class="nav nav-tabs mb-4">

      <li class="nav-item">
        <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tabGeneral">
          <i class="bi bi-building me-2"></i>General
        </button>
      </li>

      <li class="nav-item">
        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tabApariencia">
          <i class="bi bi-palette me-2"></i>Apariencia
        </button>
      </li>

      <li class="nav-item">
        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tabModulos">
          <i class="bi bi-grid me-2"></i>Módulos
        </button>
      </li>

      <li class="nav-item">
        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tabFacturacion">
          <i class="bi bi-cash-stack me-2"></i>Facturación
        </button>
      </li>

      <li class="nav-item">
        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tabDashboard">
          <i class="bi bi-bar-chart-line me-2"></i>Dashboard
        </button>
      </li>

      <li class="nav-item">
        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tabExportaciones">
          <i class="bi bi-download me-2"></i>Exportaciones
        </button>
      </li>

    </ul>
  `;
}

function contenidoConfiguracion() {
  return `
    <div class="tab-content">

      ${tabGeneral()}

      ${tabApariencia()}

      ${tabModulos()}

      ${tabFacturacion()}

      ${tabDashboard()}

      ${tabExportaciones()}

    </div>
  `;
}

function tabGeneral() {
  return `
  
<div class="tab-pane fade show active" id="tabGeneral">

  <div class="card shadow-sm border-0">

    <div class="card-body">

      <h4 class="colorPrincipal">Información del Club</h4>

      <hr>

      <div class="mb-3">

        <label class="form-label colorSecundario">

          Nombre del club

        </label>

        <input
          id="configNombreClub"
          class="form-control"
          value="${configuracionGeneral.general?.nombreClub || ""}"
        >

      </div>

      <div class="mb-3">

  <label class="form-label colorSecundario">

    Logo del club

  </label>

  <input
    type="file"
    id="configLogo"
    class="form-control"
    accept="image/*"
  >

  <div class="mt-3 text-center">

    <img
      id="previewLogo"
      src="${configuracionGeneral.general?.logo || ""}"
      class="img-fluid mt-3"
      style="max-height:120px;"
    >

  </div>

</div>

      <div class="mb-3">

        <label class="form-label colorSecundario">

          Dirección

        </label>

        <input
          id="configDireccion"
          class="form-control"
          value="${configuracionGeneral.general?.direccion || ""}"
        >

      </div>

      <div class="mb-3">

        <label class="form-label colorSecundario">

          Teléfono

        </label>

        <input
          id="configTelefono"
          class="form-control"
          value="${configuracionGeneral.general?.telefono || ""}"
        >

      </div>

      <div class="mb-3">

        <label class="form-label colorSecundario">

          Email

        </label>

        <input
          id="configEmail"
          class="form-control"
          value="${configuracionGeneral.general?.email || ""}"
        >

      </div>

    </div>

  </div>

</div>

`;
}

function tabApariencia() {
  return `

<div class="tab-pane fade" id="tabApariencia">

  <div class="card shadow-sm border-0">

    <div class="card-body">

      <h4 class="colorPrincipal">Apariencia</h4>

      <hr>

      <div class="row">

        <div class="col-md-4">

          <label class="colorSecundario">Color principal</label>

          <input
            type="color"
            id="colorPrincipal"
            class="form-control form-control-color"
            value="${configuracionGeneral.apariencia?.colorPrincipal || "#000000"}"
          >

        </div>

        <div class="col-md-4">

          <label class="colorSecundario">Color secundario</label>

          <input
            type="color"
            id="colorSecundario"
            class="form-control form-control-color"
            value="${configuracionGeneral.apariencia?.colorSecundario || "#000000"}"
          >

        </div>

        <div class="col-md-4">

          <label class="colorSecundario">Color acento</label>

          <input
            type="color"
            id="colorAcento"
            class="form-control form-control-color"
            value="${configuracionGeneral.apariencia?.colorAcento || "#198754"}"
          >

        </div>

      </div>

    </div>

  </div>

</div>

`;
}

function cargarListaModulos() {
  const orden = configuracionGeneral.menu?.length
    ? configuracionGeneral.menu
    : MODULOS.map((m) => m.id);

  let html = "";

  orden.forEach((id) => {
    const modulo = MODULOS.find((m) => m.id === id);

    if (!modulo) return;

    html += `
      <div
  class="card mb-2 moduloOrden"
  data-id="${modulo.id}">

  <div class="card-body py-3">

    <i class="bi bi-grip-vertical"></i>

    <div>

      <div class="fw-bold colorSecundario">

        ${modulo.nombre}

      </div>

      <small class="text-muted">

        Arrastrar para cambiar posición

      </small>

    </div>

  </div>

</div>
    `;
  });

  document.getElementById("listaModulos").innerHTML = html;

  Sortable.create(document.getElementById("listaModulos"), {
    animation: 200,

    ghostClass: "sortable-ghost",

    chosenClass: "sortable-chosen",

    dragClass: "sortable-drag",
  });
}

async function guardarOrdenMenu() {
  const orden = [];

  document.querySelectorAll(".moduloOrden").forEach((item) => {
    orden.push(item.dataset.id);
  });

  await db.collection("configuracion").doc("general").update({
    menu: orden,
  });

  Swal.fire({
    icon: "success",
    title: "Orden guardado",
  });
}

function obtenerOrdenMenuActual() {
  const orden = [];

  document.querySelectorAll(".moduloOrden").forEach((item) => {
    orden.push(item.dataset.id);
  });

  return orden;
}

function tabModulos() {
  console.log(configuracionGeneral.menu);
  console.log(MODULOS);

  return `

<div class="tab-pane fade" id="tabModulos">

  <div class="card shadow-sm border-0">

    <div class="card-body">

      <h4 class="colorPrincipal">
        Orden del menú
      </h4>

      <hr>

      <small class="text-muted">

        Arrastrá los módulos para cambiar el orden en la barra lateral.

      </small>

      <div
        id="listaModulos"
        class="mt-3">

      </div>

    </div>

  </div>

</div>

`;
}

function tabFacturacion() {
  return `

<div class="tab-pane fade" id="tabFacturacion">

  <div class="card shadow-sm border-0">

    <div class="card-body">

      <h4 class="colorPrincipal">Facturación</h4>

      <hr>

      <div class="mb-3">

        <label class="colorSecundario">

          <strong>Meses para Vitalicio</strong>

        </label>

        <input
          type="number"
          id="mesesVitalicio"
          class="form-control"
          value="${configuracionGeneral.facturacion?.mesesVitalicio || ""}"
        >

      </div>

      <div class="mb-3">

        <label class="colorSecundario">

          <strong>Interés mensual</strong>

        </label>

        <input
          type="number"
          id="interesMora"
          class="form-control"
          value="${configuracionGeneral.facturacion?.interesMora || ""}"
        >

      </div>

      <div class="mb-3">

          <label class="colorSecundario">

            <strong>Descuento en cuota social a grupos familiares 2, 3, 4, 5 y 6 miembros (expresado en %)</strong>

          </label>

          <div class="d-flex flex-column align-items-center">

          <div class="col-6 text-center mt-1">
            <label class="colorPrincipal">

              2

            </label>
            <input
              type="number"
              id="descuentoFamilia2"
              class="form-control"
              value="${configuracionGeneral.facturacion?.descuentoFamilia2 || ""}"
            >
          </div>

          <div class="col-6 text-center mt-1">
            <label class="colorPrincipal">

              3

            </label>
            <input
              type="number"
              id="descuentoFamilia3"
              class="form-control"
              value="${configuracionGeneral.facturacion?.descuentoFamilia3 || ""}"
            >
          </div>

          <div class="col-6 text-center mt-1">
            <label class="colorPrincipal">

              4

            </label>
            <input
              type="number"
              id="descuentoFamilia4"
              class="form-control"
              value="${configuracionGeneral.facturacion?.descuentoFamilia4 || ""}"
            >
          </div>

          <div class="col-6 text-center mt-1">
            <label class="colorPrincipal">

              5

            </label>
            <input
              type="number"
              id="descuentoFamilia5"
              class="form-control"
              value="${configuracionGeneral.facturacion?.descuentoFamilia5 || ""}"
            >
          </div>

          <div class="col-6 text-center mt-1">
            <label class="colorPrincipal">

              6

            </label>
            <input
              type="number"
              id="descuentoFamilia6"
              class="form-control"
              value="${configuracionGeneral.facturacion?.descuentoFamilia6 || ""}"
            >
          </div>
            
        </div>

      </div>

    </div>

  </div>

</div>

`;
}

function tabDashboard() {
  return `

<div class="tab-pane fade" id="tabDashboard">

  <div class="card shadow-sm border-0">

    <div class="card-body">

      <h4 class="colorPrincipal">Dashboard</h4>

      <hr>

      <div class="form-check">

        <input class="form-check-input" type="checkbox" id="dashSocios" ${configuracionGeneral.dashboard?.mostrarSocios ? "checked" : ""}>

        <label class="form-check-label colorSecundario">

          Mostrar estadísticas de socios

        </label>

      </div>

      <div class="form-check">

        <input class="form-check-input" type="checkbox" id="dashFacturacion" ${configuracionGeneral.dashboard?.mostrarFacturacion ? "checked" : ""}>

        <label class="form-check-label colorSecundario">

          Mostrar facturación

        </label>

      </div>

      <div class="form-check">

        <input class="form-check-input" type="checkbox" id="dashMorosos" ${configuracionGeneral.dashboard?.mostrarMorosos ? "checked" : ""}>

        <label class="form-check-label colorSecundario">

          Mostrar morosos

        </label>

      </div>

    </div>

  </div>

</div>

`;
}

function tabExportaciones() {
  return `

<div class="tab-pane fade" id="tabExportaciones">

  <div class="card shadow-sm border-0">

    <div class="card-body">

      <h4 class="colorPrincipal">Exportaciones</h4>

      <hr>

      <div class="mb-3">

        <label class="colorSecundario">

          Nombre por defecto del Excel

        </label>

        <input
          id="nombreExcel"
          class="form-control"
          value="${configuracionGeneral.exportaciones?.nombreExcel || ""}"
        >

      </div>

      <div class="mb-3">

        <label class="colorSecundario">

          Incluir logo en PDF

        </label>

        <select
          id="pdfLogo"
          class="form-select"
        >

          <option value="true"
            ${configuracionGeneral.exportaciones?.pdfLogo ? "selected" : ""}>
            Sí
          </option>

          <option value="false"
            ${!configuracionGeneral.exportaciones?.pdfLogo ? "selected" : ""}>
            No
          </option>

        </select>

      </div>

      <div class="mb-3">

        <label class="colorSecundario">

          Incluir Datos del Club

        </label>

        <select
          id="pdfDatosDelClub"
          class="form-select"
        >

          <option value="true"
            ${configuracionGeneral.exportaciones?.pdfDatosDelClub ? "selected" : ""}>
            Sí
          </option>

          <option value="false"
            ${!configuracionGeneral.exportaciones?.pdfDatosDelClub ? "selected" : ""}>
            No
          </option>

        </select>

      </div>

      <div class="mb-3">

        <label class="colorSecundario">

          Incluir Fecha de Emisión

        </label>

        <select
          id="pdfFecha"
          class="form-select"
        >

          <option value="true"
            ${configuracionGeneral.exportaciones?.pdfFecha ? "selected" : ""}>
            Sí
          </option>

          <option value="false"
            ${!configuracionGeneral.exportaciones?.pdfFecha ? "selected" : ""}>
            No
          </option>

        </select>

      </div>

      <div class="mb-3">

        <label class="colorSecundario">

          Incluir Resumen de Socios

        </label>

        <select
          id="pdfResumen"
          class="form-select"
        >

          <option value="true"
            ${configuracionGeneral.exportaciones?.pdfResumen ? "selected" : ""}>
            Sí
          </option>

          <option value="false"
            ${!configuracionGeneral.exportaciones?.pdfResumen ? "selected" : ""}>
            No
          </option>

        </select>

      </div>

      <div class="mb-3">

        <label class="colorSecundario">

          Incluir Paginación

        </label>

        <select
          id="pdfPaginacion"
          class="form-select"
        >

          <option value="true"
            ${configuracionGeneral.exportaciones?.pdfPaginacion ? "selected" : ""}>
            Sí
          </option>

          <option value="false"
            ${!configuracionGeneral.exportaciones?.pdfPaginacion ? "selected" : ""}>
            No
          </option>

        </select>

      </div>

    </div>

  </div>

</div>

`;
}

function botonGuardarConfiguracion() {
  return `
    <div class="mt-4 text-end">

      <button
        class="btn btn-success btn-lg"
        onclick="guardarConfiguracion()"
      >

        <i class="bi bi-floppy-fill"></i>

        Guardar configuración

      </button>

    </div>
  `;
}

function previewLogoConfiguracion(event) {
  const archivo = event.target.files[0];

  if (!archivo) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    document.getElementById("previewLogo").src = e.target.result;
  };

  reader.readAsDataURL(archivo);
}

async function guardarConfiguracion() {
  const inputLogo = document.getElementById("configLogo");
  let logoURL = configuracionGeneral.general?.logo || "";

  if (inputLogo.files.length > 0) {
    const archivo = inputLogo.files[0];

    const storageRef = firebase.storage().ref("configuracion/logo");

    await storageRef.put(archivo);

    logoURL = await storageRef.getDownloadURL();
  }
  try {
    const configuracion = {
      general: {
        nombreClub: document.getElementById("configNombreClub")?.value || "",

        logo: logoBase64,

        direccion: document.getElementById("configDireccion")?.value || "",

        telefono: document.getElementById("configTelefono")?.value || "",

        email: document.getElementById("configEmail")?.value || "",
      },

      apariencia: {
        colorPrincipal:
          document.getElementById("colorPrincipal")?.value || "#000000",

        colorSecundario:
          document.getElementById("colorSecundario")?.value || "#000000",

        colorAcento: document.getElementById("colorAcento")?.value || "#000000",
      },

      modulos: {
        dashboard: document.getElementById("modDashboard")?.checked || false,

        dashboardFacturacion:
          document.getElementById("modFacturacion")?.checked || false,

        importar: document.getElementById("modImportar")?.checked || false,

        buscar: document.getElementById("modBuscar")?.checked || false,

        precios: document.getElementById("modPrecios")?.checked || false,

        pagos: document.getElementById("modPagos")?.checked || false,

        notificaciones:
          document.getElementById("modNotificaciones")?.checked || false,
      },

      facturacion: {
        mesesVitalicio: Number(
          document.getElementById("mesesVitalicio")?.value || 0,
        ),

        interesMora: Number(document.getElementById("interesMora")?.value || 0),

        descuentoFamilia2: Number(
          document.getElementById("descuentoFamilia2")?.value || 0,
        ),

        descuentoFamilia3: Number(
          document.getElementById("descuentoFamilia3")?.value || 0,
        ),

        descuentoFamilia4: Number(
          document.getElementById("descuentoFamilia4")?.value || 0,
        ),

        descuentoFamilia5: Number(
          document.getElementById("descuentoFamilia5")?.value || 0,
        ),

        descuentoFamilia6: Number(
          document.getElementById("descuentoFamilia6")?.value || 0,
        ),
      },

      dashboard: {
        mostrarFacturacion:
          document.getElementById("dashFacturacion")?.checked || false,

        mostrarMorosos:
          document.getElementById("dashMorosos")?.checked || false,

        mostrarSocios: document.getElementById("dashSocios")?.checked || false,
      },

      exportaciones: {
        nombreExcel: document.getElementById("nombreExcel")?.value || "",

        pdfLogo: document.getElementById("pdfLogo")?.value === "true",

        pdfDatosDelClub:
          document.getElementById("pdfDatosDelClub")?.value === "true",

        pdfFecha: document.getElementById("pdfFecha")?.value === "true",

        pdfResumen: document.getElementById("pdfResumen")?.value === "true",

        pdfPaginacion:
          document.getElementById("pdfPaginacion")?.value === "true",
      },

      menu: obtenerOrdenMenuActual(),
    };

    await db
      .collection("configuracion")
      .doc("general")
      .set(configuracion, { merge: true });

    Swal.fire({
      icon: "success",
      title: "Configuración guardada",
      text: "Recargando el sistema...",
      timer: 2000,
      showConfirmButton: false,
    }).then(() => {
      window.location.reload();
    });
  } catch (error) {
    console.error(error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo guardar la configuración.",
    });
  }
}

document.addEventListener("change", (e) => {
  if (e.target.id !== "configLogo") return;

  const archivo = e.target.files[0];

  if (!archivo) return;

  const reader = new FileReader();

  reader.onload = function () {
    logoBase64 = reader.result;

    document.getElementById("previewLogo").src = logoBase64;
  };

  reader.readAsDataURL(archivo);
});

logoBase64 = configuracionGeneral.general?.logo || "";

const preview = document.getElementById("previewLogo");

if (preview) {
  preview.src = logoBase64;
}
