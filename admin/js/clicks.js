function renderModuloClicks() {
  const contenedor = document.getElementById("contenedorModulo");

  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="row g-4">

      <div class="col-12 col-lg-6">
        <div class="admin-card h-100">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h3 class="admin-section-title mb-1">
                Panel de Asociación
              </h3>

              <p class="text-muted mb-0">
                Clicks realizados hacia WhatsApp desde la web.
              </p>
            </div>

            <div class="clicks-icon-box">
              <i class="bi bi-whatsapp"></i>
            </div>
          </div>

          <div class="clicks-counter-box my-4">
            <span class="clicks-label">
              Total de clicks
            </span>

            <strong id="contadorClicks">
              Cargando...
            </strong>
          </div>

          <button
            id="verDetalles"
            class="btn-admin-primary w-100"
            type="button"
          >
            Ver detalles
          </button>
        </div>
      </div>

      <div class="col-12 col-lg-6">
        <div class="admin-card h-100">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h3 class="admin-section-title mb-1">
                Iniciales
              </h3>

              <p class="text-muted mb-0">
                Clicks realizados en el botón de inscripción a Iniciales.
              </p>
            </div>

            <div class="clicks-icon-box">
              <i class="bi bi-person-plus-fill"></i>
            </div>
          </div>

          <div class="clicks-counter-box my-4">
            <span class="clicks-label">
              Total de clicks
            </span>

            <strong id="contadorClicksIniciales">
              Cargando...
            </strong>
          </div>

          <button
            id="verDetallesIniciales"
            class="btn-admin-primary w-100"
            type="button"
          >
            Ver detalles
          </button>
        </div>
      </div>

    </div>

    <!-- MODAL WHATSAPP -->
    <div
      class="modal fade"
      id="modalDetalles"
      tabindex="-1"
      aria-labelledby="modalDetallesLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content admin-modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalDetallesLabel">
              Detalles de clicks a WhatsApp
            </h5>

            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Cerrar"
            ></button>
          </div>

          <div class="modal-body">
            <div class="table-responsive">
              <table class="table table-hover align-middle admin-table">
                <thead>
                  <tr>
                    <th>Número de click</th>
                    <th>Nombre del usuario</th>
                  </tr>
                </thead>

                <tbody id="tablaClicks">
                  <tr>
                    <td colspan="2" class="text-center text-muted">
                      Cargando...
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL INICIALES -->
    <div
      class="modal fade"
      id="modalDetallesIniciales"
      tabindex="-1"
      aria-labelledby="modalDetallesInicialesLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content admin-modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalDetallesInicialesLabel">
              Detalles de clicks a Inscribirse a Iniciales
            </h5>

            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Cerrar"
            ></button>
          </div>

          <div class="modal-body">
            <div class="table-responsive">
              <table class="table table-hover align-middle admin-table">
                <thead>
                  <tr>
                    <th>Número de click</th>
                    <th>Nombre del usuario</th>
                  </tr>
                </thead>

                <tbody id="tablaClicksIniciales">
                  <tr>
                    <td colspan="2" class="text-center text-muted">
                      Cargando...
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  inicializarModuloClicks();
}

function inicializarModuloClicks() {
  cargarContadorClicks({
    coleccion: "clicksAsociate",
    contadorId: "contadorClicks",
  });

  cargarContadorClicks({
    coleccion: "clicksInscribirse",
    contadorId: "contadorClicksIniciales",
  });

  const verDetallesBtn = document.getElementById("verDetalles");

  if (verDetallesBtn) {
    verDetallesBtn.addEventListener("click", async () => {
      await cargarDetallesClicks({
        coleccion: "clicksAsociate",
        tablaId: "tablaClicks",
      });

      const modal = new bootstrap.Modal(
        document.getElementById("modalDetalles"),
      );

      modal.show();
    });
  }

  const verDetallesInicialesBtn = document.getElementById(
    "verDetallesIniciales",
  );

  if (verDetallesInicialesBtn) {
    verDetallesInicialesBtn.addEventListener("click", async () => {
      await cargarDetallesClicks({
        coleccion: "clicksInscribirse",
        tablaId: "tablaClicksIniciales",
      });

      const modal = new bootstrap.Modal(
        document.getElementById("modalDetallesIniciales"),
      );

      modal.show();
    });
  }
}

async function cargarContadorClicks({ coleccion, contadorId }) {
  const contadorElement = document.getElementById(contadorId);

  if (!contadorElement) return;

  try {
    const contadorRef = db.collection(coleccion).doc("contador");

    const doc = await contadorRef.get();

    if (doc.exists) {
      contadorElement.textContent = Number(
        doc.data().ultimoNumero || 0,
      ).toLocaleString("es-AR");
    } else {
      contadorElement.textContent = "0";
    }
  } catch (error) {
    console.error(`Error al obtener contador ${coleccion}:`, error);

    contadorElement.textContent = "Error";
  }
}

async function cargarDetallesClicks({ coleccion, tablaId }) {
  const tabla = document.getElementById(tablaId);

  if (!tabla) return;

  try {
    tabla.innerHTML = `
      <tr>
        <td colspan="2" class="text-center text-muted">
          Cargando...
        </td>
      </tr>
    `;

    const snapshot = await db
      .collection(coleccion)
      .orderBy("numero", "desc")
      .get();

    const clicks = snapshot.docs.filter((doc) => doc.id !== "contador");

    if (clicks.length === 0) {
      tabla.innerHTML = `
        <tr>
          <td colspan="2" class="text-center text-muted">
            No hay registros aún.
          </td>
        </tr>
      `;

      return;
    }

    let filas = "";

    clicks.forEach((doc) => {
      const data = doc.data();

      filas += `
        <tr>
          <td>
            <span class="click-number">
              ${data.numero || "-"}
            </span>
          </td>

          <td>
            ${data.nombre || "Sin nombre"}
          </td>
        </tr>
      `;
    });

    tabla.innerHTML = filas;
  } catch (error) {
    console.error(`Error al obtener detalles ${coleccion}:`, error);

    tabla.innerHTML = `
      <tr>
        <td colspan="2" class="text-center text-danger">
          Error al cargar los datos.
        </td>
      </tr>
    `;
  }
}
