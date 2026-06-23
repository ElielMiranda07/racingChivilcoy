//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////// Importador CSV ///////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function cargarModuloImportar() {
  document.getElementById("importar").innerHTML = `

<h2 class="colorPrincipal">Crear socio manualmente</h2>

<div class="card p-4">

  <div class="row">

    <div class="col-md-12 mb-4">

      <label class="form-label fw-bold colorSecundario">
        <i class="bi bi-person-vcard"></i>
        Número de socio
      </label>

      <input
        type="text"
        id="numeroSocioPreview"
        class="form-control"
        readonly
      >

      <small class="text-muted">
        Se asignará automáticamente al crear el socio.
      </small>

    </div>

    <div class="col-md-6 mb-3">

      <label class="form-label fw-bold colorSecundario">
        Nombre y apellido
      </label>

      <input
        type="text"
        id="manualNombre"
        class="form-control">

    </div>

    <div class="col-md-6 mb-3">

      <label class="form-label fw-bold colorSecundario">
        DNI
      </label>

      <input
        type="text"
        id="manualDni"
        class="form-control">

    </div>

    <div class="col-md-6 mb-3">

      <label class="form-label fw-bold colorSecundario">
        Mail
      </label>

      <input
        type="email"
        id="manualMail"
        class="form-control fw-bold colorSecundario">

    </div>

    <div class="col-md-6 mb-3">

      <label class="form-label fw-bold colorSecundario">
        Teléfono
      </label>

      <input
        type="text"
        id="manualTelefono"
        class="form-control">

    </div>

  </div>

  <button
    class="btn btn-success mt-3"
    onclick="crearSocioManual()">

    Crear socio

  </button>

  <div id="estadoManual" class="mt-3"></div>

</div>

<hr class="my-5">

<h2 class="colorPrincipal">Importar CSV</h2>

<input type="file" id="csvFile" class="form-control">

<button class="btn btn-primary mt-2"
onclick="procesarCSV()">

Mostrar preview

</button>

<div id="preview" class="mt-3"></div>

<h4 class="colorPrincipal">Ejemplo de archivo CSV</h4>

<a 
href="../ejemplos/CSV_Modelo.csv"
download
class="btn btn-secondary mb-3">

Descargar CSV de ejemplo

</a>

`;

  document.getElementById("numeroSocioPreview").value = proximoSocio || "-";
}

function procesarCSV() {
  const file = document.getElementById("csvFile").files[0];

  if (!file) {
    Swal.fire({
      icon: "warning",
      title: "Seleccione un archivo",
    });
    return;
  }

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,

    complete: function (results) {
      datosCSV = results.data;

      mostrarPreview();
      analizarCSV();
    },
  });
}

function mostrarPreview() {
  let html = `
<h4>Preview</h4>

<table class="table table-sm">

<thead>
<tr>
<th>Nombre</th>
<th>DNI</th>
</tr>
</thead>

<tbody>
`;

  datosCSV.slice(0, 5).forEach((fila) => {
    html += `
<tr>
<td>${fila.nombre}</td>
<td>${fila.dni}</td>
</tr>
`;
  });

  html += `</tbody></table>`;

  document.getElementById("preview").innerHTML = html;
}

function analizarCSV() {
  let total = datosCSV.length;

  let dnis = new Set();
  let duplicados = 0;

  datosCSV.forEach((fila) => {
    if (dnis.has(fila.dni)) duplicados++;
    else dnis.add(fila.dni);
  });

  Swal.fire({
    icon: "info",
    title: "Importación",
    html: `
      Total registros: ${total}<br>
      Duplicados en CSV: ${duplicados}
    `,
  });

  let html = `

<button
  class="btn btn-success"
  onclick="importarSocios()"
>
  Procesar importación
</button>

<div class="progress mt-3">

  <div
    id="barraProgreso"
    class="progress-bar"
    style="width:0%"
  >
    0%
  </div>

</div>

<div id="reporteImportacion" class="mt-3"></div>

`;

  document.getElementById("preview").innerHTML += html;
}

const procesarSociosCloud = firebase
  .functions()
  .httpsCallable("procesarSocios");

async function crearSocioManual() {
  try {
    const nombre = document.getElementById("manualNombre").value.trim();

    const dni = document.getElementById("manualDni").value.trim();

    const mail = document.getElementById("manualMail").value.trim();

    const telefono = document.getElementById("manualTelefono").value.trim();

    if (!nombre || !dni) {
      Swal.fire("Completar nombre y DNI", "", "warning");

      return;
    }

    const res = await procesarSociosCloud({
      socios: [
        {
          nombre,
          dni,
          mail,
          telefono,
        },
      ],
    });

    const resultado = res.data.resultados[0];

    if (resultado.error) {
      throw new Error(resultado.error);
    }

    document.getElementById("manualNombre").value = "";

    document.getElementById("manualDni").value = "";

    document.getElementById("manualMail").value = "";

    document.getElementById("manualTelefono").value = "";

    Swal.fire({
      icon: "success",
      title: "Socio creado",
      html: `
      Número de socio:
      <strong>${resultado.numeroDeSocio}</strong>
      `,
    });
  } catch (error) {
    console.error(error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message,
    });
  }
}

async function importarSocios() {
  const boton = document.querySelector('button[onclick="importarSocios()"]');

  boton.disabled = true;

  try {
    const barra = document.getElementById("barraProgreso");

    barra.style.width = "20%";

    const res = await procesarSociosCloud({
      socios: datosCSV,
    });

    barra.style.width = "100%";

    const resultados = res.data.resultados;

    let creados = 0;
    let actualizados = 0;
    let errores = 0;

    resultados.forEach((r) => {
      if (r.error) {
        errores++;
      } else if (r.creado) {
        creados++;
      } else {
        actualizados++;
      }
    });

    Swal.fire({
      icon: "success",
      title: "Importación finalizada",
      html: `
        <strong>Socios creados:</strong> ${creados}<br>
        <strong>Socios actualizados:</strong> ${actualizados}<br>
        <strong>Errores:</strong> ${errores}
      `,
    });
  } catch (error) {
    console.error(error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message,
    });
  }

  boton.disabled = false;
}
