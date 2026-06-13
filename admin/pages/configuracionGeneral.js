async function cargarConfiguracion() {
  document.getElementById("configuracion").innerHTML = `
    ${cabeceraConfiguracion()}
    ${tabsConfiguracion()}
    ${contenidoConfiguracion()}
    ${botonGuardarConfiguracion()}
  `;
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
    onchange="previewLogoConfiguracion(event)"
  >

  <div class="mt-3 text-center">

    <img
      id="previewLogo"
      src="${configuracionGeneral.general?.logo || ""}"
      class="img-fluid border rounded p-2"
      style="max-height: 150px;"
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

function tabModulos() {
  return `

<div class="tab-pane fade" id="tabModulos">

  <div class="card shadow-sm border-0">

    <div class="card-body">

      <h4 class="colorPrincipal">Módulos</h4>

      <hr>

      <div class="form-check">

        <input class="form-check-input" type="checkbox" id="modDashboard" ${configuracionGeneral.modulos?.dashboard ? "checked" : ""}>

        <label class="form-check-label colorSecundario">

          Dashboard General

        </label>

      </div>

      <div class="form-check">

        <input class="form-check-input" type="checkbox" id="modFacturacion" ${configuracionGeneral.modulos?.dashboardFacturacion ? "checked" : ""}>

        <label class="form-check-label colorSecundario">

          Dashboard Facturación

        </label>

      </div>

      <div class="form-check">

        <input class="form-check-input" type="checkbox" id="modImportar" ${configuracionGeneral.modulos?.importar ? "checked" : ""}>

        <label class="form-check-label colorSecundario">

          Crear socios

        </label>

      </div>

      <div class="form-check">

        <input class="form-check-input" type="checkbox" id="modBuscar" ${configuracionGeneral.modulos?.buscar ? "checked" : ""}>

        <label class="form-check-label colorSecundario">

          Buscar socios

        </label>

      </div>

      <div class="form-check">

        <input class="form-check-input" type="checkbox" id="modPrecios" ${configuracionGeneral.modulos?.precios ? "checked" : ""}>

        <label class="form-check-label colorSecundario">

          Precios

        </label>

      </div>

      <div class="form-check">

        <input class="form-check-input" type="checkbox" id="modPagos" ${configuracionGeneral.modulos?.pagos ? "checked" : ""}>

        <label class="form-check-label colorSecundario">

          Pagos

        </label>

      </div>

      <div class="form-check">

        <input class="form-check-input" type="checkbox" id="modNotificaciones" ${configuracionGeneral.modulos?.notificaciones ? "checked" : ""}>

        <label class="form-check-label colorSecundario">

          Notificaciones

        </label>

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

          Meses para Vitalicio

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

          Días para Mora

        </label>

        <input
          type="number"
          id="diasMora"
          class="form-control"
          value="${configuracionGeneral.facturacion?.diasMora || ""}"
        >

      </div>

      <div class="mb-3">

        <label class="colorSecundario">

          Interés mensual

        </label>

        <input
          type="number"
          id="interesMora"
          class="form-control"
          value="${configuracionGeneral.facturacion?.interesMora || ""}"
        >

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

        logo: logoURL,

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
      },

      facturacion: {
        mesesVitalicio: Number(
          document.getElementById("mesesVitalicio")?.value || 0,
        ),

        diasMora: Number(document.getElementById("diasMora")?.value || 0),

        interesMora: Number(document.getElementById("interesMora")?.value || 0),
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
      },
    };

    await db
      .collection("configuracion")
      .doc("general")
      .set(configuracion, { merge: true });

    Swal.fire({
      icon: "success",
      title: "Configuración guardada",
      text: "Los cambios se guardaron correctamente.",
      timer: 2000,
      showConfirmButton: false,
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
