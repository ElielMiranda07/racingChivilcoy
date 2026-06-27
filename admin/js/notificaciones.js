async function cargarModuloNotificaciones() {
  document.getElementById("notificaciones").innerHTML = `

<div class="container-fluid">

  <div class="d-flex justify-content-between align-items-center mb-4">

    <div>

      <h2 class="mb-0 colorPrincipal">

        <i class="bi bi-bell-fill me-2"></i>

        Notificaciones

      </h2>

      <small class="text-muted colorSecundario fw-bold">

        Gestión de envíos automáticos y manuales

      </small>

    </div>

  </div>

  <ul class="nav nav-tabs mb-4">

    <li class="nav-item">

      <button
        class="nav-link active fw-bold"
        data-bs-toggle="tab"
        data-bs-target="#tabEnviar"
      >

        <i class="bi bi-send-fill me-2"></i>

        Enviar ahora

      </button>

    </li>

    <li class="nav-item">

      <button
        class="nav-link fw-bold"
        data-bs-toggle="tab"
        data-bs-target="#tabAutomaticas"
      >

        <i class="bi bi-cpu-fill me-2"></i>

        Automáticas

      </button>

    </li>

    <li class="nav-item">

      <button
        class="nav-link fw-bold"
        data-bs-toggle="tab"
        data-bs-target="#tabProgramadas"
      >

        <i class="bi bi-calendar-event-fill me-2"></i>

        Programadas

      </button>

    </li>

    <li class="nav-item">

      <button
        class="nav-link fw-bold"
        data-bs-toggle="tab"
        data-bs-target="#tabHistorial"
      >

        <i class="bi bi-clock-history me-2"></i>

        Historial

      </button>

    </li>

  </ul>

  <div class="mb-3">
  <label class="form-label">
    UID de socio para prueba
  </label>

  <input
    id="notificacionSocioIdTest"
    class="form-control"
    placeholder="Pegá acá el ID del documento del socio"
  >
</div>

  <div class="tab-content">

    <div
      class="tab-pane fade show active"
      id="tabEnviar"
    >

      ${tabEnviarNotificacion()}

    </div>

    <div
      class="tab-pane fade"
      id="tabAutomaticas"
    >

      ${tabAutomaticas()}

    </div>

    <div
      class="tab-pane fade"
      id="tabProgramadas"
    >

      ${tabProgramadas()}

    </div>

    <div
      class="tab-pane fade"
      id="tabHistorial"
    >

      ${tabHistorial()}

    </div>

  </div>

</div>

`;
}

function tabEnviarNotificacion() {
  return `

<div class="card shadow-sm border-0">

  <div class="card-body">

    <h4>

      Envío masivo

    </h4>

    <hr>

    <div class="mb-3">

      <label class="form-label">

        Título

      </label>

      <input
        id="notificacionTitulo"
        class="form-control"
      >

    </div>

    <div class="mb-3">

      <label class="form-label">

        Mensaje

      </label>

      <textarea
        id="notificacionMensaje"
        class="form-control"
        rows="4"
      ></textarea>

    </div>

    <div class="row">

      <div class="col-md-4">

        <label class="form-label">

          Actividad

        </label>

        <select
          id="filtroActividad"
          class="form-select"
        >

          <option value="todos">

            Todas

          </option>

        </select>

      </div>

      <div class="col-md-4">

        <label class="form-label">

          Categoría

        </label>

        <select
          id="filtroCategoria"
          class="form-select"
        >

          <option value="todos">

            Todas

          </option>

        </select>

      </div>

      <div class="col-md-4">

        <label class="form-label">

          Estado

        </label>

        <select
          id="filtroEstado"
          class="form-select"
        >

          <option value="todos">Todos</option>
          <option value="morosos">Morosos</option>
          <option value="aldia">Al día</option>
          <option value="vitalicios">Vitalicios</option>

        </select>

      </div>

    </div>

    <div class="text-end mt-4">

      <button
        class="btn btn-primary"
        onclick="enviarNotificacionManual()"
      >

        <i class="bi bi-send-fill me-2"></i>

        Enviar

      </button>

    </div>

  </div>

</div>

`;
}

function tabEnviarNotificacion() {
  return `

<div class="card shadow-sm border-0">

  <div class="card-body">

    <h4>

      Envío masivo

    </h4>

    <hr>

    <div class="mb-3">

      <label class="form-label">

        Título

      </label>

      <input
        id="notificacionTitulo"
        class="form-control"
      >

    </div>

    <div class="mb-3">

      <label class="form-label">

        Mensaje

      </label>

      <textarea
        id="notificacionMensaje"
        class="form-control"
        rows="4"
      ></textarea>

    </div>

    <div class="row">

      <div class="col-md-4">

        <label class="form-label">

          Actividad

        </label>

        <select
          id="filtroActividad"
          class="form-select"
        >

          <option value="todos">

            Todas

          </option>

        </select>

      </div>

      <div class="col-md-4">

        <label class="form-label">

          Categoría

        </label>

        <select
          id="filtroCategoria"
          class="form-select"
        >

          <option value="todos">

            Todas

          </option>

        </select>

      </div>

      <div class="col-md-4">

        <label class="form-label">

          Estado

        </label>

        <select
          id="filtroEstado"
          class="form-select"
        >

          <option value="todos">Todos</option>
          <option value="morosos">Morosos</option>
          <option value="aldia">Al día</option>
          <option value="vitalicios">Vitalicios</option>

        </select>

      </div>

    </div>

    <div class="text-end mt-4">

      <button
        class="btn btn-primary"
        onclick="enviarNotificacionManual()"
      >

        <i class="bi bi-send-fill me-2"></i>

        Enviar

      </button>

    </div>

  </div>

</div>

`;
}

function tabAutomaticas() {
  return `

<div class="card shadow-sm border-0">

  <div class="card-body">

    <h4>

      Notificaciones automáticas

    </h4>

    <hr>

    <div id="listaNotificacionesAutomaticas">

    </div>

    <button
      class="btn btn-success mt-3"
      onclick="nuevaNotificacionAutomatica()"
    >

      <i class="bi bi-plus-circle me-2"></i>

      Nueva regla

    </button>

  </div>

</div>

`;
}

function tabProgramadas() {
  return `

<div class="card shadow-sm border-0">

  <div class="card-body">

    <h4>

      Campañas programadas

    </h4>

    <hr>

    <div id="listaCampanasProgramadas">

    </div>

    <button
      class="btn btn-success mt-3"
      onclick="nuevaCampanaProgramada()"
    >

      <i class="bi bi-plus-circle me-2"></i>

      Nueva campaña

    </button>

  </div>

</div>

`;
}

function tabHistorial() {
  return `

<div class="card shadow-sm border-0">

  <div class="card-body">

    <h4>

      Historial de envíos

    </h4>

    <hr>

    <div id="historialNotificaciones">

      <div class="alert alert-secondary mb-0">

        No hay notificaciones registradas.

      </div>

    </div>

  </div>

</div>

`;
}

async function enviarNotificacionManual() {
  const titulo = document.getElementById("notificacionTitulo")?.value.trim();
  const mensaje = document.getElementById("notificacionMensaje")?.value.trim();
  const socioId = document
    .getElementById("notificacionSocioIdTest")
    ?.value.trim();

  if (!titulo || !mensaje) {
    alert("Completá título y mensaje.");
    return;
  }

  if (!socioId) {
    alert("Por ahora ingresá un UID de socio para probar.");
    return;
  }

  const confirmar = confirm(
    `¿Enviar notificación de prueba al socio ${socioId}?`,
  );

  if (!confirmar) return;

  try {
    const user = firebase.auth().currentUser;

    if (!user) {
      alert("Sesión expirada.");
      return;
    }

    const idToken = await user.getIdToken();

    const response = await fetch(
      "https://us-central1-reactss-26771.cloudfunctions.net/enviarNotificacionSocio",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          socioId,
          titulo,
          mensaje,
          link: "https://socios-racing.vercel.app/dashboard.html",
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al enviar notificación");
    }

    alert(
      `Notificación procesada.\nEnviadas: ${data.enviados}\nFallidas: ${data.fallidos}`,
    );
  } catch (error) {
    console.error("Error enviando notificación:", error);

    alert(error.message || "Error al enviar la notificación.");
  }
}
