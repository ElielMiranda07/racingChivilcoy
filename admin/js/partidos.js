let unsubscribePartidos = null;

function renderModuloPartidos() {
  const contenedor = document.getElementById("contenedorModulo");

  if (!contenedor) return;

  if (typeof unsubscribePartidos === "function") {
    unsubscribePartidos();
    unsubscribePartidos = null;
  }

  contenedor.innerHTML = `
    <div class="row g-4">

      <div class="col-12 col-xl-5">
        <div class="admin-card h-100">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h3 class="admin-section-title mb-1">
                Administrar partido
              </h3>

              <p class="text-muted mb-0">
                Cargá o editá los próximos partidos que se mostrarán en la web.
              </p>
            </div>

            <div class="partidos-icon-box">
              <i class="bi bi-calendar-plus-fill"></i>
            </div>
          </div>

          <form id="formPartido" class="mt-4">
            <input type="hidden" id="partidoId" />

            <div class="mb-3">
              <label class="form-label admin-form-label">
                Equipo local
              </label>

              <input
                type="text"
                id="equipoLocal"
                class="form-control admin-input"
                placeholder="Ej: Racing Club"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label admin-form-label">
                Equipo visitante
              </label>

              <input
                type="text"
                id="equipoVisitante"
                class="form-control admin-input"
                placeholder="Ej: Argentino"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label admin-form-label">
                Fecha y hora
              </label>

              <input
                type="datetime-local"
                id="fechaYHora"
                class="form-control admin-input"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label admin-form-label">
                Lugar
              </label>

              <input
                type="text"
                id="lugar"
                class="form-control admin-input"
                placeholder="Ej: Estadio Norte"
                required
              />
            </div>

            <div class="d-grid gap-2">
              <button
                id="btnGuardarPartido"
                type="submit"
                class="btn-admin-primary"
              >
                Guardar partido
              </button>

              <button
                id="btnCancelarEdicionPartido"
                type="button"
                class="btn-admin-outline d-none"
              >
                Cancelar edición
              </button>
            </div>

            <p id="mensajePartido" class="admin-module-message mt-3 mb-0"></p>
          </form>
        </div>
      </div>

      <div class="col-12 col-xl-7">
        <div class="admin-card h-100">
          <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h3 class="admin-section-title mb-1">
                Listado de partidos
              </h3>

              <p class="text-muted mb-0">
                Partidos cargados actualmente en Firestore.
              </p>
            </div>

            <button
              id="btnRecargarPartidos"
              type="button"
              class="btn-admin-outline"
            >
              <i class="bi bi-arrow-clockwise me-1"></i>
              Recargar
            </button>
          </div>

          <div class="table-responsive admin-table-wrapper">
            <table class="table table-hover align-middle admin-table mb-0">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Local</th>
                  <th>Visitante</th>
                  <th>Ubicación</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>

              <tbody id="tbodyPartidos">
                <tr>
                  <td colspan="6" class="text-center text-muted py-4">
                    Cargando partidos...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  `;

  inicializarModuloPartidos();
}

function inicializarModuloPartidos() {
  const form = document.getElementById("formPartido");
  const btnCancelar = document.getElementById("btnCancelarEdicionPartido");
  const btnRecargar = document.getElementById("btnRecargarPartidos");

  if (form) {
    form.addEventListener("submit", guardarPartido);
  }

  if (btnCancelar) {
    btnCancelar.addEventListener("click", limpiarFormularioPartido);
  }

  if (btnRecargar) {
    btnRecargar.addEventListener("click", escucharPartidos);
  }

  escucharPartidos();
}

async function guardarPartido(e) {
  e.preventDefault();

  const partidoId = document.getElementById("partidoId")?.value;
  const equipoLocal = document.getElementById("equipoLocal")?.value.trim();
  const equipoVisitante = document
    .getElementById("equipoVisitante")
    ?.value.trim();

  const fechaInput = document.getElementById("fechaYHora")?.value;
  const lugar = document.getElementById("lugar")?.value.trim();

  if (!equipoLocal || !equipoVisitante || !fechaInput || !lugar) {
    mostrarMensajePartido("Completá todos los campos.", "error");
    return;
  }

  const fecha = new Date(fechaInput);

  if (Number.isNaN(fecha.getTime())) {
    mostrarMensajePartido("La fecha ingresada no es válida.", "error");
    return;
  }

  const fechaYHora = firebase.firestore.Timestamp.fromDate(fecha);

  const data = {
    equipoLocal,
    equipoVisitante,
    fechaYHora,
    lugar,
    actualizadoEn: firebase.firestore.FieldValue.serverTimestamp(),
  };

  try {
    const btnGuardar = document.getElementById("btnGuardarPartido");

    if (btnGuardar) {
      btnGuardar.disabled = true;
      btnGuardar.textContent = partidoId ? "Actualizando..." : "Guardando...";
    }

    if (partidoId) {
      await db.collection("partidos").doc(partidoId).update(data);

      mostrarMensajePartido("Partido actualizado correctamente.", "ok");
    } else {
      await db.collection("partidos").add({
        ...data,
        creadoEn: firebase.firestore.FieldValue.serverTimestamp(),
      });

      mostrarMensajePartido("Partido creado correctamente.", "ok");
    }

    limpiarFormularioPartido(false);
  } catch (error) {
    console.error("Error al guardar partido:", error);

    mostrarMensajePartido("Error al guardar el partido.", "error");
  } finally {
    const btnGuardar = document.getElementById("btnGuardarPartido");

    if (btnGuardar) {
      btnGuardar.disabled = false;
      btnGuardar.textContent = "Guardar partido";
    }
  }
}

function escucharPartidos() {
  const tbody = document.getElementById("tbodyPartidos");

  if (!tbody) return;

  if (typeof unsubscribePartidos === "function") {
    unsubscribePartidos();
    unsubscribePartidos = null;
  }

  tbody.innerHTML = `
    <tr>
      <td colspan="6" class="text-center text-muted py-4">
        Cargando partidos...
      </td>
    </tr>
  `;

  unsubscribePartidos = db
    .collection("partidos")
    .orderBy("fechaYHora", "asc")
    .onSnapshot(
      (snapshot) => {
        renderListadoPartidos(snapshot);
      },
      (error) => {
        console.error("Error al escuchar partidos:", error);

        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center text-danger py-4">
              Error al cargar los partidos.
            </td>
          </tr>
        `;
      },
    );
}

function renderListadoPartidos(snapshot) {
  const tbody = document.getElementById("tbodyPartidos");

  if (!tbody) return;

  if (snapshot.empty) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">
          Todavía no hay partidos cargados.
        </td>
      </tr>
    `;

    return;
  }

  let html = "";

  snapshot.forEach((doc) => {
    const data = doc.data();

    const fecha = data.fechaYHora?.toDate ? data.fechaYHora.toDate() : null;

    const fechaStr = fecha ? fecha.toLocaleDateString("es-AR") : "-";

    const horaStr = fecha
      ? fecha.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

    html += `
      <tr>
        <td>
          <strong>${fechaStr}</strong>
        </td>

        <td>${horaStr}</td>

        <td>${data.equipoLocal || "-"}</td>

        <td>${data.equipoVisitante || "-"}</td>

        <td>${data.lugar || "-"}</td>

        <td class="text-center">
          <div class="d-flex justify-content-center gap-2 flex-wrap">
            <button
              class="btn btn-sm btn-warning fw-bold"
              type="button"
              onclick="editarPartido('${doc.id}')"
            >
              <i class="bi bi-pencil-square me-1"></i>
              Editar
            </button>

            <button
              class="btn btn-sm btn-danger fw-bold"
              type="button"
              onclick="eliminarPartido('${doc.id}')"
            >
              <i class="bi bi-trash-fill me-1"></i>
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

async function editarPartido(id) {
  try {
    const doc = await db.collection("partidos").doc(id).get();

    if (!doc.exists) {
      mostrarMensajePartido("El partido ya no existe.", "error");
      return;
    }

    const data = doc.data();

    const fecha = data.fechaYHora?.toDate ? data.fechaYHora.toDate() : null;

    document.getElementById("partidoId").value = doc.id;
    document.getElementById("equipoLocal").value = data.equipoLocal || "";
    document.getElementById("equipoVisitante").value =
      data.equipoVisitante || "";
    document.getElementById("lugar").value = data.lugar || "";

    if (fecha) {
      document.getElementById("fechaYHora").value =
        convertirFechaADatetimeLocal(fecha);
    }

    const btnGuardar = document.getElementById("btnGuardarPartido");
    const btnCancelar = document.getElementById("btnCancelarEdicionPartido");

    if (btnGuardar) {
      btnGuardar.textContent = "Actualizar partido";
    }

    if (btnCancelar) {
      btnCancelar.classList.remove("d-none");
    }

    mostrarMensajePartido("Editando partido seleccionado.", "info");

    document.getElementById("formPartido")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  } catch (error) {
    console.error("Error al editar partido:", error);

    mostrarMensajePartido("Error al cargar el partido.", "error");
  }
}

async function eliminarPartido(id) {
  const confirmar = confirm("¿Eliminar este partido?");

  if (!confirmar) return;

  try {
    await db.collection("partidos").doc(id).delete();

    mostrarMensajePartido("Partido eliminado correctamente.", "ok");
  } catch (error) {
    console.error("Error eliminando partido:", error);

    mostrarMensajePartido("Error al eliminar el partido.", "error");
  }
}

function limpiarFormularioPartido(limpiarMensaje = true) {
  const form = document.getElementById("formPartido");
  const partidoId = document.getElementById("partidoId");
  const btnGuardar = document.getElementById("btnGuardarPartido");
  const btnCancelar = document.getElementById("btnCancelarEdicionPartido");

  if (form) form.reset();

  if (partidoId) partidoId.value = "";

  if (btnGuardar) {
    btnGuardar.textContent = "Guardar partido";
  }

  if (btnCancelar) {
    btnCancelar.classList.add("d-none");
  }

  if (limpiarMensaje) {
    mostrarMensajePartido("", "info");
  }
}

function convertirFechaADatetimeLocal(fecha) {
  const offset = fecha.getTimezoneOffset();

  const fechaLocal = new Date(fecha.getTime() - offset * 60 * 1000);

  return fechaLocal.toISOString().slice(0, 16);
}

function mostrarMensajePartido(mensaje, tipo) {
  const el = document.getElementById("mensajePartido");

  if (!el) return;

  el.textContent = mensaje || "";

  el.classList.remove(
    "text-success",
    "text-danger",
    "text-muted",
    "text-primary",
  );

  if (tipo === "ok") {
    el.classList.add("text-success");
  } else if (tipo === "error") {
    el.classList.add("text-danger");
  } else if (tipo === "info") {
    el.classList.add("text-primary");
  } else {
    el.classList.add("text-muted");
  }
}
