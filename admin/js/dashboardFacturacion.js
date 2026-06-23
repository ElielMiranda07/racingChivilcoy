/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////// Dashboard Facturación /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function cargarDashboardFacturacion(periodo = null) {
  // PERIODO ACTUAL

  if (!periodo) {
    const fecha = new Date();

    const mes = String(fecha.getMonth() + 1).padStart(2, "0");

    periodo = `${fecha.getFullYear()}_${mes}`;
  }

  // TRAER ESTADISTICAS

  const doc = await db.collection("estadisticasMensuales").doc(periodo).get();

  // NO EXISTE

  if (!doc.exists) {
    document.getElementById("dashboardFacturacion").innerHTML = `

Swal.fire({
  icon: "warning",
  title: "Sin datos",
  text: "No hay estadísticas para el período seleccionado",
});

`;

    return;
  }

  const data = doc.data();

  // ACTIVIDADES

  let actividadesHTML = "";

  let morasHTML = "";

  Object.entries(data.moras || {}).forEach(([key, mora]) => {
    let categoriasHTML = "";

    if (mora.categorias) {
      Object.entries(mora.categorias).forEach(([categoria, datos]) => {
        categoriasHTML += `

<div class="d-flex justify-content-between border-top">

  <div>

    <small class="fw-semibold">

      ${categoria}

    </small>

    <br>

    <span class="text-muted">

      ${datos.cantidad || 0} cobradas

    </span>

  </div>

  <div class="text-end">

    <strong>

      $${(datos.cobrado || 0).toLocaleString("es-AR")}

    </strong>

  </div>

</div>

`;
      });
    }

    morasHTML += `

<div class="col-md-4">

  <div class="card border-0 shadow h-100">

    <div class="card-body">

      <div class="d-flex justify-content-between align-items-center mb-3">

        <div>

          <h5 class="mb-0">

            ${
              key === "cuotaSocial"
                ? "Cuota Social"
                : key.charAt(0).toUpperCase() + key.slice(1)
            }

          </h5>

          <small class="text-muted">

            Moras cobradas

          </small>

        </div>

        <span class="badge bg-danger">

          ${mora.cantidad || 0}

        </span>

      </div>

      <div class="text-center mb-3">

        <h3 class="text-success mb-0">

          $${(mora.cobrado || 0).toLocaleString("es-AR")}

        </h3>

      </div>

      ${
        mora.categorias
          ? `

<div class="border-top pt-2">

  <small class="text-muted fw-bold">

    Por categoría

  </small>

  ${categoriasHTML}

</div>

`
          : ""
      }

    </div>

  </div>

</div>

`;
  });

  Object.entries(data.actividades || {}).forEach(([id, act]) => {
    let categoriasHTML = "";

    Object.entries(act.categorias || {}).forEach(([catId, cat]) => {
      categoriasHTML += `
    
      <div
        class="d-flex justify-content-between align-items-center small border-top"
      >
        <div>
          <strong>${cat.nombre}</strong><br>

          <span class="text-muted">
            ${cat.cantidadSocios || 0} socios
          </span>
        </div>

        <div class="text-end">
          $${(cat.total || 0).toLocaleString("es-AR")}
        </div>
      </div>

    `;
    });

    actividadesHTML += `

<div class="col-md-4">

  <div class="card border-0 shadow p-1 h-100">

    <div class="d-flex justify-content-between align-items-start">

      <div>

        <h6 class="text-muted mb-1">
          ${act.nombre}
        </h6>

        <h2 class="fw-bold mb-0">
          $${(act.total || 0).toLocaleString("es-AR")}
        </h2>

      </div>

      <span class="badge bg-primary">
        ${act.cantidadSocios || 0} socios
      </span>

    </div>

    ${
      categoriasHTML
        ? `
      ${categoriasHTML}
    `
        : ""
    }

  </div>

</div>

`;
  });

  // RENDER

  if (graficoFacturacion) {
    graficoFacturacion.destroy();
    graficoFacturacion = null;
  }

  if (graficoFacturacionLineal) {
    graficoFacturacionLineal.destroy();
    graficoFacturacionLineal = null;
  }

  document.getElementById("dashboardFacturacion").innerHTML = `

<div
  class="d-flex justify-content-between align-items-center mb-4"
>

  <div>

    <h2 class="mb-0 colorPrincipal">
      Dashboard Facturación
    </h2>

    <small class="text-muted">
      ${formatearPeriodo(periodo)}
    </small>

  </div>

  <select
    id="selectorPeriodoFacturacion"
    class="form-select"
    style="max-width: 250px;"
    onchange="cambiarPeriodoFacturacion()"
  >
  </select>

</div>

<div class="row g-3">

  <div class="col-md-3">

    <div class="card p-3 bg-dark text-white h-100">

      <h5>Total Facturación</h5>

      <h2>
        $${(data.totalGeneral || 0).toLocaleString("es-AR")}
      </h2>

    </div>

  </div>

  <div class="col-md-3">

    <div class="card p-3 bg-success text-white h-100">

      <h5>Total Cobrado</h5>

      <h2>
        $${(data.totalCobrado || 0).toLocaleString("es-AR")}
      </h2>

    </div>

  </div>

  <div class="col-md-3">

    <div class="card p-3 bg-danger text-white h-100">

      <h5>Pendiente</h5>

      <h2>
        $${(data.pendiente || 0).toLocaleString("es-AR")}
      </h2>

    </div>

  </div>

  <div class="col-md-3">

    <div class="card p-3 bg-primary text-white h-100">

      <h5>Cuota Social</h5>

      <h2>
        $${(data.cuotaSocial || 0).toLocaleString("es-AR")}
      </h2>

    </div>

  </div>

  ${actividadesHTML}

  <hr class="my-4">

<h4 class="mb-3 colorPrincipal">

  Moras cobradas

</h4>

<div class="row g-3">

  ${morasHTML}

</div>

</div>

<div class="mt-5">

  <h4 class="colorPrincipal">
    Distribución de Facturación
  </h4>

  <div
    class="mx-auto"
    style="
      max-width: 500px;
      height: 500px;
    "
  >
    <canvas id="graficoFacturacion"></canvas>
  </div>

</div>

<div class="mt-5">

  <h4 class="colorPrincipal">
    Evolución Últimos 6 Períodos
  </h4>

  <div
    class="mx-auto"
    style="
      width: 100%;
      max-width: 900px;
      height: 450px;
    "
  >
    <canvas id="graficoFacturacionLineal"></canvas>
  </div>

</div>

`;

  // CARGAR SELECTOR

  await cargarOpcionesPeriodos(periodo);

  // GRAFICOS

  dibujarGraficoFacturacion(data);

  dibujarGraficoFacturacionLineal();
}

function formatearPeriodo(periodo) {
  const [anio, mes] = periodo.split("_");

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return `${meses[Number(mes) - 1]} ${anio}`;
}

async function cambiarPeriodoFacturacion() {
  const periodo = document.getElementById("selectorPeriodoFacturacion").value;

  await cargarDashboardFacturacion(periodo);
}

async function cargarOpcionesPeriodos(periodoSeleccionado) {
  const snapshot = await db
    .collection("estadisticasMensuales")
    .orderBy(firebase.firestore.FieldPath.documentId(), "desc")
    .get();

  const selector = document.getElementById("selectorPeriodoFacturacion");

  if (!selector) return;

  selector.innerHTML = "";

  snapshot.forEach((doc) => {
    selector.innerHTML += `
      <option value="${doc.id}">
        ${formatearPeriodo(doc.id)}
      </option>
    `;
  });

  selector.value = periodoSeleccionado;
}

// GRAFICO DONA

function dibujarGraficoFacturacion(data) {
  const ctx = document.getElementById("graficoFacturacion");

  // DESTRUIR EXISTENTE

  if (graficoFacturacion) {
    graficoFacturacion.destroy();
    graficoFacturacion = null;
  }

  // ARRAYS

  let labels = ["Cuota Social"];

  let valores = [data.cuotaSocial || 0];

  // ACTIVIDADES

  Object.values(data.actividades || {}).forEach((act) => {
    labels.push(act.nombre);

    valores.push(act.total || 0);
  });

  // CREAR

  graficoFacturacion = new Chart(ctx, {
    type: "doughnut",

    data: {
      labels: labels,

      datasets: [
        {
          data: valores,

          backgroundColor: [
            "#131748",
            "#8bc4e5",
            "#ffee00",
            "#00c853",
            "#ff5252",
            "#7c4dff",
            "#ff9800",
            "#0091ea",
            "#ff6d00",
            "#00bfa5",
          ],
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      plugins: {
        legend: {
          position: "top",
        },
      },
    },
  });
}

async function dibujarGraficoFacturacionLineal() {
  // TRAER PERIODOS

  const snapshot = await db
    .collection("estadisticasMensuales")
    .orderBy(firebase.firestore.FieldPath.documentId(), "desc")
    .limit(6)
    .get();

  // ARRAYS

  const labels = [];

  const totalFacturado = [];

  const totalCobrado = [];

  // RECORRER

  snapshot.forEach((doc) => {
    const data = doc.data();

    labels.push(doc.id);

    totalFacturado.push(data.totalGeneral || 0);

    totalCobrado.push(data.totalCobrado || 0);
  });

  // INVERTIR

  labels.reverse();

  totalFacturado.reverse();

  totalCobrado.reverse();

  // CANVAS

  const canvas = document.getElementById("graficoFacturacionLineal");

  // SI NO EXISTE

  if (!canvas) return;

  // DESTRUIR EXISTENTE

  const graficoExistente = Chart.getChart(canvas);

  if (graficoExistente) {
    graficoExistente.destroy();
  }

  // CREAR

  graficoFacturacionLineal = new Chart(canvas, {
    type: "line",

    data: {
      labels: labels,

      datasets: [
        // FACTURACION TOTAL

        {
          label: "Facturación Total",

          data: totalFacturado,

          borderColor: colorPrincipal,

          backgroundColor: colorPrincipal,

          tension: 0.3,
        },

        // TOTAL COBRADO

        {
          label: "Total Cobrado",

          data: totalCobrado,

          borderColor: colorSecundario,

          backgroundColor: colorSecundario,

          tension: 0.3,
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      plugins: {
        legend: {
          position: "top",
        },
      },

      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
