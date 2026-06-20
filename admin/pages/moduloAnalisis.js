async function cargarModuloAnalisis() {
  document.getElementById("analisis").innerHTML = `

<div class="container-fluid">

  <h2 class="colorPrincipal mb-4">

    <i class="bi bi-graph-up-arrow"></i>

    Análisis

  </h2>

  <div class="card p-4 mb-4">

    <div class="row">

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

      <div class="col-md-2">

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

      <div class="col-md-2">

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

      <div class="col-md-2">

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

<div class="col-md-2">

<label class="fw-bold colorSecundario">

Operación

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

      <div class="col-md-2 d-flex align-items-end">

        <button
          class="btn btn-success w-100"
          onclick="generarGraficoAnalisis()">

          Generar

        </button>

      </div>

    </div>

  </div>

  <div class="card p-4">

    <canvas id="graficoAnalisis"></canvas>

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

async function generarGraficoAnalisis() {
  const serieA = document.getElementById("serieA").value;

  const serieB = document.getElementById("serieB").value;

  const tipoGrafico = document.getElementById("tipoGrafico").value;

  const periodo = document.getElementById("periodo").value;

  const cantidad = Number(document.getElementById("cantidadPeriodos").value);

  const operacion = document.getElementById("operacion").value;

  const snapshot = await db
    .collection("estadisticasMensuales")
    .orderBy("fechaCalculo")
    .get();

  let labels = [];

  let datosA = [];

  let datosB = [];

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
        };
      }

      años[anio].A += datos[serieA] || 0;

      años[anio].B += datos[serieB] || 0;
    });

    labels = Object.keys(años);

    datosA = labels.map((a) => años[a].A);

    datosB = labels.map((a) => años[a].B);
  }

  // OPERACIONES

  if (operacion === "acumulado") {
    datosA = calcularAcumulado(datosA);

    datosB = calcularAcumulado(datosB);
  }

  if (operacion === "variacion") {
    datosA = calcularVariacion(datosA);

    datosB = calcularVariacion(datosB);
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
}
