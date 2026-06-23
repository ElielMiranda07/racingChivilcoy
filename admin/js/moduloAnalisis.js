async function cargarModuloAnalisis() {
  document.getElementById("analisis").innerHTML = `

<div class="container-fluid">

  <h2 class="colorPrincipal mb-4">

    <i class="bi bi-graph-up-arrow"></i>

    Análisis

  </h2>

  <div class="card p-4 mb-4">

    <!-- FILA SUPERIOR -->

    <div class="row g-3">

      <div class="col-md-3">

        <label class="fw-bold colorSecundario">

          Serie A

        </label>

        <select
          id="serieA"
          class="form-select">

          <option value="">
            Seleccionar
          </option>

        </select>

      </div>

      <div class="col-md-3">

        <label class="fw-bold colorSecundario">

          Serie B

        </label>

        <select
          id="serieB"
          class="form-select">

          <option value="">
            Seleccionar
          </option>

        </select>

      </div>

      <div class="col-md-3">

        <label class="fw-bold colorSecundario">

          Serie C

        </label>

        <select
          id="serieC"
          class="form-select">

          <option value="">
            Seleccionar
          </option>

        </select>

      </div>

      <div class="col-md-1">

        <label class="fw-bold colorSecundario">

          Periodo

        </label>

        <select
          id="periodo"
          class="form-select">

          <option value="mes">

            Mensual

          </option>

          <option value="anio">

            Anual

          </option>

        </select>

      </div>

      <div class="col-md-1">

        <label class="fw-bold colorSecundario">

          Cantidad

        </label>

        <select
          id="cantidadPeriodos"
          class="form-select">

          <option value="6">6</option>

          <option value="12" selected>12</option>

          <option value="24">24</option>

          <option value="999">Todo</option>

        </select>

      </div>

      <div class="col-md-1">

        <label class="fw-bold colorSecundario">

          Gráfico

        </label>

        <select
          id="tipoGrafico"
          class="form-select">

          <option value="line">

            Líneas

          </option>

          <option value="bar">

            Barras

          </option>

        </select>

      </div>

    </div>

    <hr>

    <!-- FILA INFERIOR -->

    <div class="row g-3 align-items-end">

      <div class="col-md-3">

        <label class="fw-bold colorSecundario">

          Operación temporal

        </label>

        <select
          id="operacion"
          class="form-select">

          <option value="normal">

            Normal

          </option>

          <option value="acumulado">

            Acumulado

          </option>

          <option value="variacion">

            Variación %

          </option>

        </select>

      </div>

      <div class="col-md-3">

        <label class="fw-bold colorSecundario">

          Operación entre series

        </label>

        <select
          id="operacionSeries"
          class="form-select">

          <option value="">

            Ninguna

          </option>

          <option value="sumar">

            A + B

          </option>

          <option value="restar">

            A - B

          </option>

          <option value="dividir">

            A / B

          </option>

          <option value="porcentaje">

            A como % de B

          </option>

        </select>

      </div>

      <div class="col-md-2">

        <label class="fw-bold colorSecundario">

          Promedio móvil

        </label>

        <select
          id="promedioMovil"
          class="form-select">

          <option value="0">

            Sin promedio

          </option>

          <option value="3">

            3 períodos

          </option>

          <option value="6">

            6 períodos

          </option>

        </select>

      </div>

      <div class="col-md-2">

        <button
          class="btn btn-success w-100"
          onclick="generarGraficoAnalisis()">

          Generar

        </button>

      </div>

    </div>

  </div>

  <!-- GRAFICO PRINCIPAL -->

  <div class="card p-4 mb-4">

    <h4 class="colorPrincipal mb-3">

      <i class="bi bi-activity"></i>

      Evolución

    </h4>

    <canvas id="graficoAnalisis"></canvas>

    <div class="d-flex flex-column align-items-center mt-2 mb-1">
      <button
        class="btn btn-primary"
        onclick="exportarGraficoPNG()">

        Descargar PNG

      </button>
    </div>

  </div>

  <!-- RESUMEN -->

  <div class="card p-4">

    <h4 class="colorPrincipal mb-3">

      <i class="bi bi-table"></i>

      Resumen

    </h4>

    <div id="resumenAnalisis">

    </div>

  </div>

</div>

`;

  cargarVariablesAnalisis();

  generarGraficoAnalisis();
}

const VARIABLES_ANALISIS = [
  {
    id: "totalGeneral",
    nombre: "Facturación total",
    campo: "totalGeneral",
  },

  {
    id: "totalCobrado",
    nombre: "Total cobrado",
    campo: "totalCobrado",
  },

  {
    id: "pendiente",
    nombre: "Pendiente",
    campo: "pendiente",
  },

  {
    id: "cobradoCuotaSocial",
    nombre: "Cuota social cobrada",
    campo: "cobradoCuotaSocial",
  },

  {
    id: "cobradoActividades",
    nombre: "Actividades cobradas",
    campo: "cobradoActividades",
  },

  {
    id: "cobradoMoras",
    nombre: "Moras cobradas",
    campo: "cobradoMoras",
  },

  {
    id: "cuotaSocial",
    nombre: "Cuota social total",
    campo: "cuotaSocial",
  },
];

function cargarVariablesAnalisis() {
  let opciones = `
<option value="">
Seleccionar
</option>
`;

  VARIABLES_ANALISIS.forEach((v) => {
    opciones += `
<option value="${v.campo}">
${v.nombre}
</option>
`;
  });

  document.getElementById("serieA").innerHTML = opciones;

  document.getElementById("serieB").innerHTML = opciones;

  document.getElementById("serieC").innerHTML = opciones;
}

let graficoAnalisis = null;

function calcularAcumulado(array) {
  let suma = 0;

  return array.map((x) => {
    suma += x;

    return suma;
  });
}

function calcularVariacion(array) {
  let resultado = [0];

  for (let i = 1; i < array.length; i++) {
    let anterior = array[i - 1];

    if (anterior === 0) {
      resultado.push(0);

      continue;
    }

    resultado.push(((array[i] - anterior) / anterior) * 100);
  }

  return resultado;
}

function calcularPromedioMovil(array, ventana) {
  if (ventana === 0) return array;

  return array.map((_, i) => {
    let inicio = Math.max(0, i - ventana + 1);

    let trozo = array.slice(inicio, i + 1);

    return trozo.reduce((a, b) => a + b, 0) / trozo.length;
  });
}

async function generarGraficoAnalisis() {
  const serieA = document.getElementById("serieA").value;

  const serieB = document.getElementById("serieB").value;

  const serieC = document.getElementById("serieC").value;

  const tipoGrafico = document.getElementById("tipoGrafico").value;

  const periodo = document.getElementById("periodo").value;

  const cantidad = Number(document.getElementById("cantidadPeriodos").value);

  const operacion = document.getElementById("operacion").value;

  const promedioMovil = Number(document.getElementById("promedioMovil").value);

  const snapshot = await db
    .collection("estadisticasMensuales")
    .orderBy("fechaCalculo")
    .get();

  let labels = [];

  let datosA = [];

  let datosB = [];

  let datosC = [];

  let datosCalculados = [];

  // MENSUAL

  if (periodo === "mes") {
    let docs = snapshot.docs;

    if (cantidad !== 999) {
      docs = docs.slice(-cantidad);
    }

    docs.forEach((doc) => {
      const datos = doc.data();

      labels.push(doc.id.replace("_", "/"));

      datosA.push(datos[serieA] || 0);

      datosB.push(datos[serieB] || 0);

      datosC.push(datos[serieC] || 0);
    });
  }

  // ANUAL

  if (periodo === "anio") {
    let años = {};

    snapshot.forEach((doc) => {
      const datos = doc.data();

      let anio = doc.id.split("_")[0];

      if (!años[anio]) {
        años[anio] = {
          A: 0,
          B: 0,
          C: 0,
        };
      }

      años[anio].A += datos[serieA] || 0;

      años[anio].B += datos[serieB] || 0;

      años[anio].C += datos[serieC] || 0;
    });

    labels = Object.keys(años);

    datosA = labels.map((a) => años[a].A);

    datosB = labels.map((a) => años[a].B);

    datosC = labels.map((a) => años[a].C);
  }

  // OPERACIONES

  if (operacion === "acumulado") {
    datosA = calcularAcumulado(datosA);

    datosB = calcularAcumulado(datosB);

    datosC = calcularAcumulado(datosC);
  }

  if (operacion === "variacion") {
    datosA = calcularVariacion(datosA);

    datosB = calcularVariacion(datosB);

    datosC = calcularVariacion(datosC);
  }

  datosA = calcularPromedioMovil(datosA, promedioMovil);

  datosB = calcularPromedioMovil(datosB, promedioMovil);

  datosC = calcularPromedioMovil(datosC, promedioMovil);

  const operacionSeries = document.getElementById("operacionSeries").value;

  if (operacionSeries === "sumar") {
    datosCalculados = datosA.map((x, i) => x + datosB[i]);
  }

  if (operacionSeries === "restar") {
    datosCalculados = datosA.map((x, i) => x - datosB[i]);
  }

  if (operacionSeries === "dividir") {
    datosCalculados = datosA.map((x, i) =>
      datosB[i] === 0 ? 0 : x / datosB[i],
    );
  }

  if (operacionSeries === "porcentaje") {
    datosCalculados = datosA.map((x, i) =>
      datosB[i] === 0 ? 0 : (x / datosB[i]) * 100,
    );
  }

  // GRAFICO

  if (graficoAnalisis) {
    graficoAnalisis.destroy();
  }

  graficoAnalisis = new Chart(document.getElementById("graficoAnalisis"), {
    type: tipoGrafico,

    data: {
      labels,

      datasets: [
        {
          label: document.getElementById("serieA").selectedOptions[0].text,

          data: datosA,

          borderWidth: 3,

          tension: 0.3,
        },

        {
          label: document.getElementById("serieB").selectedOptions[0].text,

          data: datosB,

          borderWidth: 3,

          tension: 0.3,
        },

        {
          label: document.getElementById("serieC").selectedOptions[0].text,

          data: datosC,

          borderWidth: 3,

          tension: 0.3,
        },

        ...(datosCalculados.length
          ? [
              {
                label: "Serie calculada",

                data: datosCalculados,

                borderWidth: 4,

                borderDash: [5, 5],

                tension: 0.3,
              },
            ]
          : []),

        {
          label: "Tendencia",

          data: calcularPrediccion(datosA),

          borderDash: [10, 5],

          borderWidth: 2,
        },
      ],
    },

    options: {
      responsive: true,

      plugins: {
        legend: {
          position: "bottom",
        },
      },

      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  generarRankingActividades();
  generarResumenAnalisis(labels, datosA, datosB, datosC);
}

async function generarRankingActividades() {
  const ultimoMes = (
    await db
      .collection("estadisticasMensuales")
      .orderBy("fechaCalculo", "desc")
      .limit(1)
      .get()
  ).docs[0];

  if (!ultimoMes) return;

  const actividades = ultimoMes.data().actividades;

  let labels = [];

  let valores = [];

  Object.keys(actividades).forEach((nombre) => {
    labels.push(actividades[nombre].nombre);

    valores.push(actividades[nombre].cobrado || 0);
  });
}

function generarResumenAnalisis(labels, datosA, datosB, datosC) {
  function resumen(nombre, datos) {
    if (datos.length === 0) return "";

    let max = Math.max(...datos);
    let min = Math.min(...datos);

    let promedio = datos.reduce((a, b) => a + b, 0) / datos.length;

    let variacion = ((datos[datos.length - 1] - datos[0]) / datos[0]) * 100;

    return `

<tr>

<td>${nombre}</td>

<td>${max.toLocaleString()}</td>

<td>${min.toLocaleString()}</td>

<td>${promedio.toFixed(0)}</td>

<td>${variacion.toFixed(1)}%</td>

</tr>

`;
  }

  document.getElementById("resumenAnalisis").innerHTML = `

<table class="table table-striped">

<thead>

<tr>

<th class="colorSecundario">Serie</th>

<th class="colorSecundario">Máximo</th>

<th class="colorSecundario">Mínimo</th>

<th class="colorSecundario">Promedio</th>

<th class="colorSecundario">Variación total</th>

</tr>

</thead>

<tbody>

${resumen(document.getElementById("serieA").selectedOptions[0].text, datosA)}

${resumen(document.getElementById("serieB").selectedOptions[0].text, datosB)}

${resumen(document.getElementById("serieC").selectedOptions[0].text, datosC)}

</tbody>

</table>

`;
}

function calcularPrediccion(datos) {
  let x = [];
  let y = [];

  datos.forEach((valor, i) => {
    x.push(i);
    y.push(valor);
  });

  let n = x.length;

  let pendiente =
    (n * x.reduce((a, b, i) => a + b * y[i], 0) -
      x.reduce((a, b) => a + b, 0) * y.reduce((a, b) => a + b, 0)) /
    (n * x.reduce((a, b) => a + b * b, 0) -
      Math.pow(
        x.reduce((a, b) => a + b, 0),
        2,
      ));

  let intercepto =
    (y.reduce((a, b) => a + b, 0) - pendiente * x.reduce((a, b) => a + b, 0)) /
    n;

  return x.map((i) => intercepto + pendiente * i);
}

async function exportarGraficoPNG() {
  const { value: nombre } = await Swal.fire({
    title: "Guardar gráfico",
    input: "text",
    inputLabel: "Nombre del archivo",
    inputValue: "grafico_analisis",
    inputPlaceholder: "Ingrese un nombre",
    showCancelButton: true,
    confirmButtonText: "Descargar",
    cancelButtonText: "Cancelar",

    inputValidator: (value) => {
      if (!value) {
        return "Debe ingresar un nombre";
      }
    },
  });

  if (!nombre) return;

  let link = document.createElement("a");

  link.download = `${nombre}.png`;

  link.href = document.getElementById("graficoAnalisis").toDataURL("image/png");

  link.click();
}
