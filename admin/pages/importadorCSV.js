//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////// Importador CSV ///////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////// Crear socio MANUAL //////////////////////

async function crearSocioManual() {
  try {
    const nombre = document.getElementById("manualNombre").value.trim();

    const dni = document.getElementById("manualDni").value.trim();

    const mail = document.getElementById("manualMail").value.trim();

    const telefono = document.getElementById("manualTelefono").value.trim();

    // VALIDACIONES

    if (!nombre || !dni) {
      Swal.fire("Completar nombre y DNI", "", "warning");

      return;
    }

    // VERIFICAR EXISTENTE

    const existente = await db
      .collection("socios")
      .where("dni", "==", dni)
      .limit(1)
      .get();

    if (!existente.empty) {
      Swal.fire("Ya existe un socio con ese DNI", "", "warning");

      return;
    }

    // CREAR AUTH

    const res = await crearUsuariosBatch({
      socios: [
        {
          dni,
          nombre,
        },
      ],
    });

    const resultado = res.data.resultados[0];

    if (resultado.error) {
      throw new Error("Error creando usuario");
    }

    // GUARDAR FIRESTORE

    await db
      .collection("socios")
      .doc(resultado.uid)
      .set({
        activo: true,

        dni: dni,

        nombre: nombre,

        nombreBusqueda: nombre.toLowerCase(),

        mail: mail || "",

        telefono: telefono || "",

        primerLogin: true,

        rol: "socio",

        ultimaActualizacion: firebase.firestore.Timestamp.now(),
      });

    await db
      .collection("estadisticas")
      .doc("dashboard")
      .update({
        totalSocios: firebase.firestore.FieldValue.increment(1),
      });

    // LIMPIAR FORM

    document.getElementById("manualNombre").value = "";

    document.getElementById("manualDni").value = "";

    document.getElementById("manualMail").value = "";

    document.getElementById("manualTelefono").value = "";

    // MENSAJE

    document.getElementById("estadoManual").innerHTML = `

Swal.fire({
  icon: "success",
  title: "Socio creado correctamente",
  timer: 2000,
  showConfirmButton: false,
});

`;
  } catch (e) {
    console.error(e);

    document.getElementById("estadoManual").innerHTML = `

Swal.fire({
  icon: "error",
  title: "Error al crear socio",
});

`;
  }
}

function dividirEnBloques(array, tamaño) {
  const bloques = [];

  for (let i = 0; i < array.length; i += tamaño) {
    bloques.push(array.slice(i, i + tamaño));
  }

  return bloques;
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

console.log("usuario actual", firebase.auth().currentUser);

const crearUsuariosBatch = firebase
  .functions()
  .httpsCallable("crearUsuariosSociosBatch");

async function importarSocios() {
  const boton = document.querySelector('button[onclick="importarSocios()"]');

  boton.disabled = true;

  boton.innerHTML = `
    <span class="spinner-border spinner-border-sm"></span>
    Importando...
  `;

  try {
    const user = await esperarAuth();

    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Acceso requerido",
        text: "Debes estar logueado",
      });

      return;
    }

    const barra = document.getElementById("barraProgreso");

    const snapshot = await db.collection("socios").get();

    const mapaSocios = {};

    snapshot.forEach((doc) => {
      const socio = doc.data();
      mapaSocios[socio.dni] = doc.id;
    });

    let creados = 0;
    let actualizados = 0;
    let errores = 0;

    let batch = db.batch();
    let procesados = 0;

    const bloques = dividirEnBloques(datosCSV, 50);

    for (const bloque of bloques) {
      const sociosAcrear = [];

      for (const fila of bloque) {
        const dni = fila.dni.trim();

        if (!mapaSocios[dni]) {
          sociosAcrear.push({
            dni,
            nombre: fila.nombre,
          });
        }
      }

      if (sociosAcrear.length > 0) {
        const res = await crearUsuariosBatch({
          socios: sociosAcrear,
        });

        res.data.resultados.forEach((r) => {
          if (!r.error) {
            mapaSocios[r.dni] = r.uid;
            creados++;
          } else {
            errores++;
          }
        });
      }

      for (const fila of bloque) {
        try {
          const dni = fila.dni.trim();

          const uid = mapaSocios[dni];

          if (!uid) {
            errores++;
            continue;
          }

          if (mapaSocios[dni] && !sociosAcrear.find((s) => s.dni === dni)) {
            actualizados++;
          }

          const ref = db.collection("socios").doc(uid);

          batch.set(
            ref,
            {
              activo: true,
              dni,
              nombre: fila.nombre,
              nombreBusqueda: fila.nombre.toLowerCase(),
              mail: fila.mail || "",
              telefono: fila.telefono || "",
              primerLogin: true,
              rol: "socio",
              ultimaActualizacion: firebase.firestore.Timestamp.now(),
            },
            { merge: true },
          );

          procesados++;

          if (procesados % 400 === 0) {
            await batch.commit();
            batch = db.batch();
          }

          const progreso = Math.round((procesados / datosCSV.length) * 100);

          barra.style.width = progreso + "%";
          barra.innerText = progreso + "%";
        } catch (e) {
          console.error(e);
          errores++;
        }
      }
    }

    await batch.commit();

    // ACTUALIZAR TOTAL SOCIOS REAL

    const totalSocios = (await db.collection("socios").get()).size;

    await db.collection("estadisticas").doc("dashboard").set(
      {
        totalSocios,
      },
      {
        merge: true,
      },
    );

    // RESULTADO

    Swal.fire({
      icon: "success",
      title: "Importación finalizada",
      html: `
        <strong>Socios creados:</strong> ${creados}<br>
        <strong>Socios actualizados:</strong> ${actualizados}<br>
        <strong>Errores:</strong> ${errores}
      `,
      confirmButtonText: "Aceptar",
    });

    boton.innerHTML = "Finalizado";
  } catch (error) {
    console.error(error);

    Swal.fire({
      icon: "error",
      title: "Error en la importación",
      text: error.message || "Ocurrió un error inesperado",
    });

    boton.innerHTML = "Error";
  } finally {
    boton.disabled = false;
  }
}

document.getElementById("importar").innerHTML = `



<h2>Crear socio manualmente</h2>

<div class="card p-4">

  <div class="row">

    <div class="col-md-6 mb-3">

      <label class="form-label">
        Nombre y apellido
      </label>

      <input
        type="text"
        id="manualNombre"
        class="form-control">

    </div>

    <div class="col-md-6 mb-3">

      <label class="form-label">
        DNI
      </label>

      <input
        type="text"
        id="manualDni"
        class="form-control">

    </div>

    <div class="col-md-6 mb-3">

      <label class="form-label">
        Mail
      </label>

      <input
        type="email"
        id="manualMail"
        class="form-control">

    </div>

    <div class="col-md-6 mb-3">

      <label class="form-label">
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

<h2>Importar CSV</h2>

<input type="file" id="csvFile" class="form-control">

<button class="btn btn-primary mt-2"
onclick="procesarCSV()">

Mostrar preview

</button>

<div id="preview" class="mt-3"></div>

<h4>Ejemplo de archivo CSV</h4>

<a 
href="../ejemplos/CSV_Modelo.csv"
download
class="btn btn-secondary mb-3">

Descargar CSV de ejemplo

</a>

`;
