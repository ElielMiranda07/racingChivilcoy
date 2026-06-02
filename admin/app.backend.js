// Configura Firebase normalmente
const firebaseConfig = {
  apiKey: "AIzaSyDCqe24Tu4-BKrxykDwTQvbDVIpoPBD8cY",
  authDomain: "reactss-26771.firebaseapp.com",
  projectId: "reactss-26771",
  storageBucket: "reactss-26771.appspot.com",
  messagingSenderId: "443520919767",
  appId: "1:443520919767:web:7a7a0cf32adad8d087e892",
  measurementId: "G-XBMQ9BWG70",
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const functions = firebase.app().functions("us-central1");
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

let usuarioActual = null;

firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    console.log("No hay usuario aún");
    usuarioActual = null;
    return;
  }

  console.log("Usuario listo:", user.uid);

  usuarioActual = user; // 🔥 CLAVE
});

function esperarAuth() {
  return new Promise((resolve) => {
    const unsub = firebase.auth().onAuthStateChanged((user) => {
      unsub();
      resolve(user);
    });
  });
}

//Chequear si el usuario es ADMIN

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // El usuario está autenticado
    checkUserRole(user); // Llamar a tu función para verificar el rol
    console.log(user);
  } else {
    // No hay usuario autenticado, redirigir al inicio de sesión
    window.location.href = "../index.html"; // Redirige a la página de inicio de sesión
  }
});

function checkUserRole(user) {
  // Referencia al documento del usuario en Firestore
  const userRef = firebase.firestore().collection("usuarios").doc(user.uid);

  // Verificar si el usuario tiene el rol 'admin'
  userRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        if (userData.role === "admin") {
        } else {
          // Si no es admin, mostrar un mensaje y cerrar sesión
          Swal.fire(
            "No tienes permisos para acceder a esta página.",
            "",
            "warning",
          );

          firebase.auth().signOut(); // Cerrar sesión
        }
      } else {
        // Si no existe el documento, cerrar sesión
        Swal.fire("Usuario no registrado en la base de datos.", "", "warning");
        firebase.auth().signOut(); // Cerrar sesión
      }
    })
    .catch((error) => {
      console.error("Error al verificar el rol del usuario: ", error);
      Swal.fire("Error al verificar el rol del usuario.", "", "warning");
      firebase.auth().signOut(); // Cerrar sesión en caso de error
    });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// Selección de Módulos ///////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

function mostrar(modulo) {
  document
    .querySelectorAll(".modulo")
    .forEach((m) => m.classList.add("d-none"));

  document.getElementById(modulo).classList.remove("d-none");

  if (modulo === "dashboard") {
    cargarDashboard();
  }

  if (modulo === "dashboardFacturacion") {
    cargarDashboardFacturacion();
  }

  if (modulo === "buscar") {
    cargarBuscadorSocios();
  }

  if (modulo === "precios") {
    cargarModuloPrecios();
  }

  if (modulo === "pagos") {
    cargarModuloPagos();
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////// DASHBOARD /////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function cargarDashboard() {
  // TRAER ESTADISTICAS

  const doc = await db.collection("estadisticas").doc("dashboard").get();

  // NO EXISTE

  if (!doc.exists) {
    document.getElementById("dashboard").innerHTML = `

Swal.fire({
  icon: "warning",
  title: "Sin estadísticas",
  text: "No hay estadísticas disponibles",
});

`;

    return;
  }

  // DATA

  const data = doc.data();

  const totalSocios = data.totalSocios || 0;

  const cuotasAlDia = data.cuotasAlDia || 0;

  const cuotasImpagas = data.cuotasImpagas || 0;

  const morosos30 = data.morosos30 || 0;

  // RENDER

  document.getElementById("dashboard").innerHTML = `

<h2>Dashboard General</h2>

<div class="row g-3">

  <div class="col-md-3">

    <div class="card p-3 bg-dark text-white h-100">

      <h5>Socios Totales</h5>

      <h2>
        ${totalSocios}
      </h2>

      <button
        class="btn btn-light mt-3"
        onclick="exportarListadoDashboard('todos')"
      >
        Descargar Excel
      </button>

    </div>

  </div>


  <div class="col-md-3">

    <div class="card p-3 bg-success text-white h-100">

      <h5>Cuotas al Día</h5>

      <h2>
        ${cuotasAlDia}
      </h2>

      <button
        class="btn btn-light mt-3"
        onclick="exportarListadoDashboard('al_dia')"
      >
        Descargar Excel
      </button>

    </div>

  </div>


  <div class="col-md-3">

    <div class="card p-3 bg-warning text-dark h-100">

      <h5>Cuotas Impagas</h5>

      <h2>
        ${cuotasImpagas}
      </h2>

      <button
        class="btn btn-dark mt-3"
        onclick="exportarListadoDashboard('impagas')"
      >
        Descargar Excel
      </button>

    </div>

  </div>


  <div class="col-md-3">

    <div class="card p-3 bg-danger text-white h-100">

      <h5>Morosos +30 días</h5>

      <h2>
        ${morosos30}
      </h2>

      <button
        class="btn btn-light mt-3"
        onclick="exportarListadoDashboard('morosos30')"
      >
        Descargar Excel
      </button>

    </div>

  </div>

</div>

<div class="mt-5">

  <h4>Estado General de Socios</h4>

  <div
    class="mx-auto"
    style="
      max-width: 500px;
      height: 500px;
    "
  >
    <canvas id="graficoDashboard"></canvas>
  </div>

</div>

`;

  // GRAFICO

  dibujarGraficoDashboard(totalSocios, cuotasAlDia, cuotasImpagas, morosos30);
}

// GRAFICO DASHBOARD

function dibujarGraficoDashboard(
  totalSocios,
  cuotasAlDia,
  cuotasImpagas,
  morosos30,
) {
  const canvas = document.getElementById("graficoDashboard");

  if (!canvas) return;

  if (graficoFacturacionLineal) {
    graficoFacturacionLineal.destroy();
    graficoFacturacionLineal = null;
  }

  new Chart(canvas, {
    type: "doughnut",

    data: {
      labels: ["Al día", "Deuda actual", "Morosos"],

      datasets: [
        {
          data: [cuotasAlDia, cuotasImpagas, morosos30],

          backgroundColor: ["#00c853", "#ffc107", "#dc3545"],
        },
      ],
    },

    options: {
      responsive: true,

      plugins: {
        legend: {
          position: "top",
        },

        tooltip: {
          callbacks: {
            label(context) {
              const valor = context.raw || 0;

              const porcentaje =
                totalSocios > 0 ? ((valor / totalSocios) * 100).toFixed(1) : 0;

              return `${valor} socios (${porcentaje}%)`;
            },
          },
        },
      },
    },
  });
}

// EXPORTAR EXCEL DASHBOARD

async function exportarListadoDashboard(tipo) {
  // CONFIRMAR

  const confirmar = await Swal.fire({
    title: "¿Descargar Excel?",

    text: "Se generará un listado completo de socios.",

    icon: "question",

    showCancelButton: true,

    confirmButtonText: "Descargar",

    cancelButtonText: "Cancelar",
  });

  if (!confirmar.isConfirmed) return;

  // LOADING

  Swal.fire({
    title: "Generando Excel...",

    text: "Espere unos segundos",

    allowOutsideClick: false,

    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    // QUERY

    let query = db.collection("socios");

    // TODOS

    if (tipo === "todos") {
      query = query.orderBy("nombre");
    }

    // AL DIA
    else if (tipo === "al_dia") {
      query = query.where("estadoCuenta", "==", "al_dia").orderBy("nombre");
    }

    // IMPAGAS
    else if (tipo === "impagas") {
      query = query.where("estadoCuenta", "==", "deuda").orderBy("nombre");
    }

    // MOROSOS +30
    else if (tipo === "morosos30") {
      query = query.where("estadoCuenta", "==", "moroso").orderBy("nombre");
    }

    // CONSULTA

    const snapshot = await query.get();

    // DATOS

    const datos = [];

    snapshot.forEach((doc) => {
      const socio = doc.data();

      datos.push({
        Nombre: socio.nombre || "",

        DNI: socio.dni || "",

        Estado: socio.estadoCuenta || "",

        "Deuda Actual": socio.deudaActual || 0,

        "Meses Pagos": socio.mesesPagos || 0,

        Telefono: socio.telefono || "",
      });
    });

    // CREAR EXCEL

    const ws = XLSX.utils.json_to_sheet(datos);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Socios");

    // DESCARGAR

    XLSX.writeFile(wb, `socios_${tipo}.xlsx`);

    // SUCCESS

    Swal.fire({
      icon: "success",

      title: "Excel descargado",

      timer: 2000,

      showConfirmButton: false,
    });
  } catch (error) {
    console.error(error);

    Swal.fire({
      icon: "error",

      title: "Error al generar Excel",
    });
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////// Dashboard Facturación /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let graficoFacturacion = null;
let graficoFacturacionLineal = null;

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

  Object.entries(data.actividades || {}).forEach(([id, act]) => {
    actividadesHTML += `

<div class="col-md-3">

  <div class="card border-0 shadow-sm p-3 h-100">

    <div class="d-flex justify-content-between align-items-start">

      <div>

        <h6 class="text-muted mb-2">
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

    <h2 class="mb-0">
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

</div>

<div class="mt-5">

  <h4>
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

  <h4>
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

          borderColor: "#131748",

          backgroundColor: "#131748",

          tension: 0.3,
        },

        // TOTAL COBRADO

        {
          label: "Total Cobrado",

          data: totalCobrado,

          borderColor: "#00c853",

          backgroundColor: "#00c853",

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

let datosCSV = [];

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

    ////////////////////////////////////////////////////
    // ACTUALIZAR TOTAL SOCIOS REAL
    ////////////////////////////////////////////////////

    const totalSocios = (await db.collection("socios").get()).size;

    await db.collection("estadisticas").doc("dashboard").set(
      {
        totalSocios,
      },
      {
        merge: true,
      },
    );

    ////////////////////////////////////////////////////
    // RESULTADO
    ////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////// Buscar y editar SOCIOS ////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////// CACHE ACTIVIDADES //////////////////////

let cache_actividades = {};

let miembrosGrupoTemporal = [];

async function cargarActividadesCache() {
  if (Object.keys(cache_actividades).length > 0) return;

  const actividadesSnap = await db
    .collection("actividades")
    .where("activa", "==", true)
    .get();

  const categoriasSnap = await db.collectionGroup("categorias").get();

  // CARGAR ACTIVIDADES

  actividadesSnap.forEach((doc) => {
    cache_actividades[doc.id] = {
      nombre: doc.data().nombre,
      categorias: [],
    };
  });

  // CARGAR CATEGORIAS

  categoriasSnap.forEach((doc) => {
    const actividadId = doc.ref.parent.parent.id;

    if (!cache_actividades[actividadId]) return;

    cache_actividades[actividadId].categorias.push({
      id: doc.id,
      ...doc.data(),
    });
  });
}

//////////////////// RENDER RESULTADOS /////////////////////

async function renderResultadosBusqueda(snapshot) {
  if (snapshot.empty) {
    Swal.fire({
      icon: "warning",
      title: "Sin resultados",
      text: "No se encontró ningún socio",
    });

    return;
  }

  // GENERAR HTML

  const itemsHtml = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const socio = doc.data();

      const id = doc.id;

      // CALCULAR DEUDA

      let deudaTotal = calcularTotalDeudaSocio(socio);

      // TITULAR -> SUMAR GRUPO

      if (socio.grupoFamiliar?.rol === "titular") {
        deudaTotal = await calcularDeudaGrupo(socio);
      }

      return `

<div class="list-group-item">

<div class="d-flex justify-content-between align-items-center">

<div>

<b>${socio.nombre}</b><br>

DNI: ${socio.dni}<br>

<span class="text-danger fw-bold">

Deuda total:
$${deudaTotal.toLocaleString("es-AR")}

</span>

${
  socio.esVitalicio
    ? `
<br>
<span class="badge bg-warning text-dark">
Socio Vitalicio
</span>
`
    : ""
}

</div>

<div class="d-flex gap-2">

<button
class="btn btn-success btn-sm"
onclick="abrirModalPago('${id}')">

Gestionar pagos

</button>

<button
class="btn btn-warning btn-sm"
onclick="editarSocio('${id}')">

Editar

</button>

</div>

</div>

</div>

`;
    }),
  );

  // RENDER FINAL

  document.getElementById("resultado").innerHTML = `

<div class="list-group">

${itemsHtml.join("")}

</div>

`;
}

////////////////////// BUSCADOR SOCIOS /////////////////////

function cargarBuscadorSocios() {
  document.getElementById("buscar").innerHTML = `

<h2>Buscar socio</h2>

<div class="row g-2">

  <div class="col-md-6">

    <input
      id="busquedaSocio"
      class="form-control"
      placeholder="Buscar por DNI"
      inputmode="numeric"
      pattern="[0-9]*"
      oninput="debounceBuscarDni()">

  </div>

  <div class="col-md-6">

    <input
      id="busquedaNombre"
      class="form-control"
      placeholder="Buscar por nombre y apellido"
      oninput="debounceBuscarNombre()">

  </div>

</div>

<div id="resultado" class="mt-3"></div>

`;
}

let timerBusquedaDni;
let timerBusquedaNombre;

function debounceBuscarDni() {
  clearTimeout(timerBusquedaDni);

  timerBusquedaDni = setTimeout(() => {
    buscarSocioPorDni();
  }, 300);
}

function debounceBuscarNombre() {
  clearTimeout(timerBusquedaNombre);

  timerBusquedaNombre = setTimeout(() => {
    buscarSocioPorNombre();
  }, 400);
}

async function buscarSocioPorDni() {
  const dni = document.getElementById("busquedaSocio").value.trim();

  if (dni.length < 5) {
    document.getElementById("resultado").innerHTML = "";
    return;
  }

  const snapshot = await db
    .collection("socios")
    .where("dni", ">=", dni)
    .where("dni", "<=", dni + "\uf8ff")
    .limit(10)
    .get();

  renderResultadosBusqueda(snapshot);
}

async function buscarSocioPorNombre() {
  const nombre = document
    .getElementById("busquedaNombre")
    .value.trim()
    .toLowerCase();

  if (nombre.length < 3) {
    document.getElementById("resultado").innerHTML = "";
    return;
  }

  const snapshot = await db
    .collection("socios")
    .where("nombreBusqueda", ">=", nombre)
    .where("nombreBusqueda", "<=", nombre + "\uf8ff")
    .limit(10)
    .get();

  renderResultadosBusqueda(snapshot);
}

//////////////////// CALCULAR DEUDA ////////////////////////

function calcularTotalDeudaSocio(socio) {
  let total = socio.deudaActual || 0;

  Object.values(socio.moras || {}).forEach((lista) => {
    if (!Array.isArray(lista)) return;

    lista.forEach((mora) => {
      total += mora.monto || 0;
    });
  });

  return total;
}

async function calcularDeudaGrupo(socio) {
  let total = calcularTotalDeudaSocio(socio);

  if (socio.grupoFamiliar?.rol === "titular") {
    const miembros = socio.miembrosGrupo || [];

    for (const miembroId of miembros) {
      const doc = await db.collection("socios").doc(miembroId).get();

      if (!doc.exists) continue;

      total += calcularTotalDeudaSocio(doc.data());
    }
  }

  return total;
}

function calcularDeudaGrupoLocal(socio, sociosMap) {
  let total = calcularTotalDeudaSocio(socio);

  // TITULAR

  if (socio.grupoFamiliar?.rol === "titular") {
    const miembros = socio.miembrosGrupo || [];

    miembros.forEach((miembroId) => {
      const miembro = sociosMap[miembroId];

      if (!miembro) return;

      total += calcularTotalDeudaSocio(miembro);
    });
  }

  return total;
}

//////////////////// ABRIR MODAL PAGO //////////////////////

async function abrirModalPago(id) {
  try {
    const doc = await db.collection("socios").doc(id).get();

    if (!doc.exists) {
      Swal.fire({
        icon: "warning",
        title: "Socio no encontrado",
      });
      return;
    }

    const socio = {
      id: doc.id,
      ...doc.data(),
    };

    // SOCIOS

    let socios = [socio];

    if (socio.grupoFamiliar?.rol === "titular") {
      for (const miembroId of socio.miembrosGrupo || []) {
        const miembroDoc = await db.collection("socios").doc(miembroId).get();

        if (!miembroDoc.exists) continue;

        socios.push({
          id: miembroDoc.id,
          ...miembroDoc.data(),
        });
      }
    }

    // HTML

    let html = "";

    socios.forEach((persona) => {
      html += `

<div class="border rounded p-3 mb-3">

<h5>${persona.nombre}</h5>

`;

      // CUOTA SOCIAL ACTUAL

      if (persona.deudas?.cuotaSocial) {
        html += `

<div class="form-check">

<input
class="form-check-input item-pago"
type="checkbox"
data-socio="${persona.id}"
data-tipo="cuotaSocial"
data-monto="${persona.deudas.cuotaSocial}"
data-es-cuota-social="true"
id="actual-cuota-${persona.id}">

<label
class="form-check-label"
for="actual-cuota-${persona.id}">

Cuota social actual
($${persona.deudas.cuotaSocial.toLocaleString("es-AR")})

</label>

</div>

`;
      }

      // ACTIVIDADES ACTUALES

      Object.entries(persona.deudas || {}).forEach(([key, value]) => {
        if (key === "cuotaSocial") return;

        html += `

<div class="form-check">

<input
class="form-check-input item-pago"
type="checkbox"
data-socio="${persona.id}"
data-tipo="${key}"
data-monto="${value}"
id="actual-${persona.id}-${key}">

<label
class="form-check-label"
for="actual-${persona.id}-${key}">

${cache_actividades[key]?.nombre || key}
($${value.toLocaleString("es-AR")})

</label>

</div>

`;
      });

      // MORAS

      Object.entries(persona.moras || {}).forEach(([concepto, listaMoras]) => {
        listaMoras.forEach((mora, index) => {
          html += `

<div class="form-check">

<input
class="form-check-input item-pago"
type="checkbox"
data-socio="${persona.id}"
data-tipo="mora"
data-mora-key="${concepto}"
data-periodo="${mora.periodo}"
data-monto="${mora.monto}"
id="mora-${persona.id}-${concepto}-${index}">

<label
class="form-check-label"
for="mora-${persona.id}-${concepto}-${index}">

Mora ${concepto}
(${mora.periodo})
($${mora.monto.toLocaleString("es-AR")})

</label>

</div>

`;
        });
      });

      html += `</div>`;
    });

    // MODAL

    document.getElementById("modales").innerHTML = `

<div
class="modal fade"
id="modalPago"
tabindex="-1">

<div class="modal-dialog modal-lg">

<div class="modal-content">

<div class="modal-header">

<h5 class="modal-title">
Gestionar pagos
</h5>

<button
type="button"
class="btn-close"
data-bs-dismiss="modal">
</button>

</div>

<div class="modal-body">

${html}

<hr>

<h4>
Total:
$<span id="totalPagoModal">0</span>
</h4>

</div>

<div class="modal-footer">

<button
class="btn btn-success"
onclick="procesarPagoSeleccionado()">

Procesar pago

</button>

</div>

</div>

</div>

</div>

`;

    const modal = new bootstrap.Modal(document.getElementById("modalPago"));

    modal.show();

    document.querySelectorAll(".item-pago").forEach((checkbox) => {
      checkbox.addEventListener("change", actualizarTotalModal);
    });

    actualizarTotalModal();
  } catch (error) {
    console.error(error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error al abrir pagos",
    });
  }
}

//////////////////// TOTAL MODAL ///////////////////////////

function actualizarTotalModal() {
  let total = 0;

  document.querySelectorAll(".item-pago:checked").forEach((item) => {
    total += Number(item.dataset.monto || 0);
  });

  document.getElementById("totalPagoModal").innerText =
    total.toLocaleString("es-AR");
}

//////////////////// PROCESAR PAGO /////////////////////////

const registrarPagoManual = functions.httpsCallable("registrarPagoManual");

async function procesarPagoSeleccionado() {
  try {
    const seleccionados = document.querySelectorAll(".item-pago:checked");

    if (seleccionados.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Selección requerida",
        text: "Seleccione al menos un item",
      });
      return;
    }

    // TOTAL

    let total = 0;

    seleccionados.forEach((item) => {
      total += Number(item.dataset.monto || 0);
    });

    const confirmar = await Swal.fire({
      icon: "question",

      title: "¿Registrar pago?",

      html: `
    Total: <strong>$${total.toLocaleString("es-AR")}</strong>
  `,

      showCancelButton: true,

      confirmButtonText: "Registrar",

      cancelButtonText: "Cancelar",

      reverseButtons: true,
    });

    if (!confirmar.isConfirmed) return;

    // AGRUPAR POR SOCIO

    const pagosPorSocio = {};

    seleccionados.forEach((item) => {
      const socioId = item.dataset.socio;

      if (!pagosPorSocio[socioId]) {
        pagosPorSocio[socioId] = {
          socioId,
          items: [],
        };
      }

      const monto = Number(item.dataset.monto || 0);

      // MORA

      if (item.dataset.tipo === "mora") {
        pagosPorSocio[socioId].items.push({
          tipo: "mora",

          concepto: item.dataset.moraKey,

          periodo: item.dataset.periodo,

          monto,
        });
      }

      // ACTUAL
      else {
        pagosPorSocio[socioId].items.push({
          tipo: item.dataset.tipo,

          monto,
        });
      }
    });

    // ARRAY FINAL

    const pagos = Object.values(pagosPorSocio);

    console.log("Pagos a enviar:", pagos);

    // CLOUD FUNCTION

    const resultado = await registrarPagoManual({
      pagos,
    });

    console.log(resultado.data);

    // CERRAR

    bootstrap.Modal.getInstance(document.getElementById("modalPago"))?.hide();

    // MENSAJE

    Swal.fire({
      icon: "success",
      title: "Pago registrado",
      html: `
    Total: $${total.toLocaleString("es-AR")}
  `,
    });

    // REFRESCAR BUSQUEDA

    const dni = document.getElementById("busquedaSocio")?.value.trim();

    const nombre = document.getElementById("busquedaNombre")?.value.trim();

    if (dni && dni.length >= 5) {
      buscarSocioPorDni();
    } else if (nombre && nombre.length >= 3) {
      buscarSocioPorNombre();
    }
  } catch (error) {
    console.error(error);

    Swal.fire({
      icon: "error",
      title: "Error al registrar pago",
      text: error?.message || "Error desconocido",
    });
  }
}

////////////////////// EDITAR SOCIO //////////////////////

async function editarSocio(id) {
  mostrar("editar");

  await cargarActividadesCache();

  const doc = await db.collection("socios").doc(id).get();

  const socio = doc.data();

  miembrosGrupoTemporal = [];

  // cargar miembros ya existentes
  if (socio.miembrosGrupo?.length) {
    for (const miembroId of socio.miembrosGrupo) {
      const miembroDoc = await db.collection("socios").doc(miembroId).get();

      if (!miembroDoc.exists) continue;

      const miembro = miembroDoc.data();

      miembrosGrupoTemporal.push({
        id: miembroDoc.id,
        nombre: miembro.nombre,
        dni: miembro.dni,
      });
    }
  }

  let actividadesHTML = "";

  Object.entries(cache_actividades).forEach(([actId, act]) => {
    const activo =
      socio.actividades &&
      socio.actividades[actId] &&
      socio.actividades[actId].activo;

    const checked = activo ? "checked" : "";

    let categoriasHTML = "";

    act.categorias.forEach((cat) => {
      const seleccionado =
        socio.actividades &&
        socio.actividades[actId] &&
        socio.actividades[actId].categoria === cat.id
          ? "checked"
          : "";

      categoriasHTML += `

<div class="form-check ms-3">

<input 
class="form-check-input"
type="radio"
name="cat-${actId}"
value="${cat.id}"
${seleccionado}>

<label class="form-check-label">
${cat.nombre}
</label>

</div>

`;
    });

    actividadesHTML += `

<div class="border p-2 mb-2">

<div class="form-check">

<input 
class="form-check-input actividad-check"
type="checkbox"
value="${actId}"
id="act-${actId}"
${checked}>

<label class="form-check-label">
${act.nombre}
</label>

</div>

${categoriasHTML}

</div>

`;
  });

  document.getElementById("editar").innerHTML = `

<h2>Editar socio</h2>

<label>Nombre</label>

<input
id="nombreEdit"
class="form-control"
value="${socio.nombre}">

<h4 class="mt-4">Actividades</h4>

${actividadesHTML}

<hr class="my-4">

<h4>Grupo Familiar</h4>

<div class="form-check mb-3">

  <input
    class="form-check-input"
    type="checkbox"
    id="titularGrupoCheck"
    onchange="toggleGrupoFamiliar()"
    ${socio.grupoFamiliar?.rol === "titular" ? "checked" : ""}>

  <label class="form-check-label">
    Cabeza de grupo familiar
  </label>

</div>

<div
  id="grupoFamiliarContainer"
  style="display: ${socio.grupoFamiliar?.rol === "titular" ? "block" : "none"}">

  <input
    type="text"
    id="buscarDniGrupo"
    class="form-control mb-2"
    placeholder="Buscar DNI exacto">

  <button
    class="btn btn-primary btn-sm mb-3"
    onclick="buscarSocioGrupo('${id}')">

    Agregar socio

  </button>

  <div id="resultadoBusquedaGrupo"></div>

  <hr>

  <h6>Miembros agregados</h6>

  <div id="listaGrupo"></div>

</div>

<button
class="btn btn-success mt-3"
onclick="guardarSocio('${id}')">

Guardar

</button>

`;

  renderMiembrosGrupo();
}

////////////////////// TOGGLE GRUPO //////////////////////

function toggleGrupoFamiliar() {
  const check = document.getElementById("titularGrupoCheck");

  document.getElementById("grupoFamiliarContainer").style.display =
    check.checked ? "block" : "none";
}

////////////////////// BUSCAR SOCIO GRUPO //////////////////////

async function buscarSocioGrupo(socioActualId) {
  const dni = document.getElementById("buscarDniGrupo").value.trim();

  if (dni.length !== 8) {
    Swal.fire({
      icon: "warning",
      title: "DNI requerido",
      text: "Ingresar DNI exacto",
    });
    return;
  }

  const snapshot = await db
    .collection("socios")
    .where("dni", "==", dni)
    .limit(1)
    .get();

  if (snapshot.empty) {
    document.getElementById("resultadoBusquedaGrupo").innerHTML = `
      Swal.fire({
  icon: "warning",
  title: "No encontrado",
});
    `;

    return;
  }

  const doc = snapshot.docs[0];

  // evitar agregarse a sí mismo
  if (doc.id === socioActualId) {
    Swal.fire({
      icon: "warning",
      title: "Operación no permitida",
      text: "No podés agregarte a vos mismo",
    });
    return;
  }

  const socio = doc.data();

  // evitar duplicados
  const existe = miembrosGrupoTemporal.find((m) => m.id === doc.id);

  if (existe) {
    Swal.fire({
      icon: "info",
      title: "Ya agregado",
    });
    return;
  }

  miembrosGrupoTemporal.push({
    id: doc.id,
    nombre: socio.nombre,
    dni: socio.dni,
  });

  renderMiembrosGrupo();

  document.getElementById("buscarDniGrupo").value = "";
}

////////////////////// RENDER MIEMBROS //////////////////////

function renderMiembrosGrupo() {
  let html = "";

  miembrosGrupoTemporal.forEach((m, index) => {
    html += `

<div class="d-flex justify-content-between align-items-center border p-2 mb-2">

<div>
<b>${m.nombre}</b><br>
DNI: ${m.dni}
</div>

<button
class="btn btn-danger btn-sm"
onclick="eliminarMiembroGrupo(${index})">

Eliminar

</button>

</div>

`;
  });

  document.getElementById("listaGrupo").innerHTML = html;
}

////////////////////// ELIMINAR MIEMBRO //////////////////////

function eliminarMiembroGrupo(index) {
  miembrosGrupoTemporal.splice(index, 1);

  renderMiembrosGrupo();
}

////////////////////// RECALCULAR GRUPO //////////////////////

async function recalcularGrupoFamiliar(titularId) {
  const titularRef = db.collection("socios").doc(titularId);

  const titularDoc = await titularRef.get();

  if (!titularDoc.exists) return;

  const titular = titularDoc.data();

  let deudaTotal = titular.deudaActual || 0;

  const miembros = titular.miembrosGrupo || [];

  const batch = db.batch();

  // 🔥 RECORRER MIEMBROS

  for (const miembroId of miembros) {
    const miembroRef = db.collection("socios").doc(miembroId);

    const miembroDoc = await miembroRef.get();

    if (!miembroDoc.exists) continue;

    const miembro = miembroDoc.data();

    deudaTotal += miembro.deudaActual || 0;

    // 🔥 MIEMBROS SIEMPRE EN 0 CONSOLIDADO

    batch.update(miembroRef, {
      deudaConsolidada: 0,
    });
  }

  // 🔥 TITULAR RECIBE TOTAL

  batch.update(titularRef, {
    deudaConsolidada: deudaTotal,
  });

  await batch.commit();
}

////////////////////// GUARDAR SOCIO //////////////////////

async function guardarSocio(id) {
  const checks = document.querySelectorAll(".actividad-check");

  let actividades = {};

  checks.forEach((check) => {
    if (check.checked) {
      const actId = check.value;

      const radio = document.querySelector(
        `input[name="cat-${actId}"]:checked`,
      );

      actividades[actId] = {
        activo: true,
        categoria: radio ? radio.value : null,
      };
    }
  });

  // 🔥 TRAER ESTADO ANTERIOR

  const socioDocAnterior = await db.collection("socios").doc(id).get();

  const socioAnterior = socioDocAnterior.data();

  const miembrosAnteriores = socioAnterior.miembrosGrupo || [];

  // 🔥 NUEVO ESTADO

  const esTitular =
    document.getElementById("titularGrupoCheck")?.checked || false;

  let grupoId = null;

  if (esTitular) {
    grupoId = `grupo_${id}`;
  }

  // 🔥 ACTUALIZAR TITULAR

  await db
    .collection("socios")
    .doc(id)
    .update({
      nombre: document.getElementById("nombreEdit").value,

      nombreBusqueda: document.getElementById("nombreEdit").value.toLowerCase(),

      actividades: actividades,

      grupoFamiliar: esTitular
        ? {
            id: grupoId,
            rol: "titular",
          }
        : null,

      miembrosGrupo: esTitular ? miembrosGrupoTemporal.map((m) => m.id) : [],

      // 🔥 SI DEJA DE SER TITULAR

      deudaConsolidada: esTitular
        ? socioAnterior.deudaConsolidada || 0
        : socioAnterior.deudaActual || 0,

      ultimaActualizacion: firebase.firestore.Timestamp.now(),
    });

  // 🔥 LIMPIAR MIEMBROS ELIMINADOS

  for (const miembroId of miembrosAnteriores) {
    const sigueExistiendo = miembrosGrupoTemporal.find(
      (m) => m.id === miembroId,
    );

    if (!sigueExistiendo) {
      const miembroRef = db.collection("socios").doc(miembroId);

      const miembroDoc = await miembroRef.get();

      if (!miembroDoc.exists) continue;

      const miembro = miembroDoc.data();

      await miembroRef.update({
        grupoFamiliar: null,

        deudaConsolidada: miembro.deudaActual || 0,
      });
    }
  }

  // 🔥 ACTUALIZAR MIEMBROS NUEVOS

  if (esTitular) {
    for (const miembro of miembrosGrupoTemporal) {
      await db
        .collection("socios")
        .doc(miembro.id)
        .update({
          grupoFamiliar: {
            id: grupoId,
            rol: "miembro",
          },

          deudaConsolidada: 0,
        });
    }

    // 🔥 RECALCULAR CONSOLIDADO

    await recalcularGrupoFamiliar(id);
  }

  // 🔥 SI YA NO ES TITULAR

  if (!esTitular && miembrosAnteriores.length > 0) {
    for (const miembroId of miembrosAnteriores) {
      const miembroRef = db.collection("socios").doc(miembroId);

      const miembroDoc = await miembroRef.get();

      if (!miembroDoc.exists) continue;

      const miembro = miembroDoc.data();

      await miembroRef.update({
        grupoFamiliar: null,

        deudaConsolidada: miembro.deudaActual || 0,
      });
    }
  }

  Swal.fire({
    icon: "success",
    title: "Socio actualizado",
    timer: 2000,
    showConfirmButton: false,
  });

  mostrar("buscar");

  cargarBuscadorSocios();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////// MODULO PRECIOS ///////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////// CALCULO DE DEUDAS (((MANUAL))) /////////////////////

function getUsuarioSeguro() {
  return new Promise((resolve) => {
    const user = firebase.auth().currentUser;

    if (user) {
      resolve(user);
      return;
    }

    const unsub = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        unsub();
        resolve(user);
      }
    });
  });
}

const calcularDeudas = functions.httpsCallable("calcularDeudas");

async function ejecutarCalculo() {
  const btn = document.getElementById("btnCalcular");
  const estado = document.getElementById("estadoCalculo");

  try {
    // 🔥 USAR USUARIO SEGURO
    const user = await getUsuarioSeguro();

    btn.disabled = true;
    btn.innerText = "Calculando...";

    estado.innerHTML = `<span class="text-warning">Procesando...</span>`;

    const res = await calcularDeudas();

    console.log(res.data);

    estado.innerHTML = `
      <span class="text-success">
        ✔ ${res.data.procesados || 0} deudas calculadas correctamente
      </span>
    `;
  } catch (e) {
    console.error(e);

    if (e.code === "unauthenticated") {
      estado.innerHTML = `<span class="text-danger">❌ Usuario no autenticado</span>`;
    } else if (e.code === "permission-denied") {
      estado.innerHTML = `<span class="text-danger">❌ No tenés permisos</span>`;
    } else {
      estado.innerHTML = `<span class="text-danger">❌ Error al calcular</span>`;
    }
  } finally {
    btn.disabled = false;
    btn.innerText = "Calcular deuda de todos los socios";
  }
}

let CACHE_ACTIVIDADES = {};
let CACHE_CATEGORIAS = {};

async function cargarModuloPrecios() {
  const contenedor = document.getElementById("precios");

  contenedor.innerHTML = `
  
  <h3>Calcular Deudas</h3>
  <div class="card p-3 mt-4">
  

    <button 
      class="btn btn-danger"
      onclick="ejecutarCalculo()"
      id="btnCalcular">

      Calcular deuda de todos los socios

    </button>

    <div id="estadoCalculo" class="mt-2"></div>
  </div>

  <h4>Configuración</h4>

  <div class="mb-4">
    <label>Cuota social</label>

    <input type="number" id="cuotaSocial" class="form-control mb-2">

    <button class="btn btn-success" onclick="guardarCuota()">
      Actualizar cuota
    </button>
  </div>

  <hr>

  <h5>Actividades</h5>

  <div id="listaActividades"></div>

  <hr>

  <h5>Nueva actividad</h5>

  <input 
    type="text"
    id="nuevaActividadNombre"
    class="form-control mb-2"
    placeholder="Nombre actividad">

  <button class="btn btn-primary" onclick="crearActividad()">
    Crear actividad
  </button>

  `;

  await cargarCuota();
  await cargarActividades();
}

//////////////////// CUOTA SOCIAL //////////////////////////

async function cargarCuota() {
  const doc = await db.collection("configuracion").doc("general").get();

  if (doc.exists) {
    document.getElementById("cuotaSocial").value = doc.data().cuotaSocial || 0;
  }
}

async function guardarCuota() {
  const cuota = Number(document.getElementById("cuotaSocial").value);

  await db.collection("configuracion").doc("general").set({
    cuotaSocial: cuota,
  });

  Swal.fire(
    "Cuota Actualizada",
    "Los datos se guardaron correctamente",
    "success",
  );
}

//////////////////// ACTIVIDADES ///////////////////////////

async function cargarActividades() {
  const contenedor = document.getElementById("listaActividades");

  contenedor.innerHTML = "";

  CACHE_ACTIVIDADES = {};
  CACHE_CATEGORIAS = {};

  const actividadesSnap = await db
    .collection("actividades")
    .where("eliminada", "!=", true)
    .get();

  // guardar actividades en cache
  actividadesSnap.forEach((doc) => {
    CACHE_ACTIVIDADES[doc.id] = doc.data();
  });

  // traer TODAS las categorías en una sola consulta
  const categoriasSnap = await db.collectionGroup("categorias").get();

  categoriasSnap.forEach((doc) => {
    const actividadId = doc.ref.parent.parent.id;

    if (!CACHE_CATEGORIAS[actividadId]) {
      CACHE_CATEGORIAS[actividadId] = [];
    }

    CACHE_CATEGORIAS[actividadId].push({
      id: doc.id,
      ...doc.data(),
    });
  });

  let html = "";

  Object.entries(CACHE_ACTIVIDADES).forEach(([id, data]) => {
    const estado = data.activa ? "Activa" : "Pausada";
    const claseEstado = data.activa ? "text-success" : "text-danger";
    const textoBoton = data.activa ? "Pausar" : "Activar";

    html += `

    <div class="card mb-3 p-3">

      <div class="d-flex justify-content-between align-items-center">

        <strong>${data.nombre}</strong>

        <span class="${claseEstado}">
          ${estado}
        </span>

      </div>

      <div class="d-flex gap-2 my-2">

  <button 
    class="btn btn-warning btn-sm"
    onclick="toggleActividad('${id}', ${data.activa})">

    ${textoBoton}

  </button>

  <button 
    class="btn btn-danger btn-sm"
    onclick="eliminarActividad('${id}', '${data.nombre}')">

    Eliminar

  </button>

</div>

      <hr>

      <h6>Categorías</h6>

      ${renderCategorias(id)}

      <div class="mt-2">

        <input 
          type="text"
          placeholder="Nombre categoría"
          id="catNombre-${id}"
          class="form-control mb-1">

        <input 
          type="number"
          placeholder="Precio"
          id="catPrecio-${id}"
          class="form-control mb-1">

        <button 
          class="btn btn-primary btn-sm"
          onclick="crearCategoria('${id}')">

          Agregar categoría

        </button>

      </div>

    </div>

    `;
  });

  contenedor.innerHTML = html;
}

//////////////////// RENDER CATEGORIAS /////////////////////

function renderCategorias(actividadId) {
  const categorias = CACHE_CATEGORIAS[actividadId] || [];

  let html = "";

  categorias.forEach((cat) => {
    html += `

    <div class="d-flex gap-2 mb-2">

      <input 
        type="text"
        value="${cat.nombre}"
        class="form-control"
        disabled>

      <input 
        type="number"
        value="${cat.precio}"
        id="precioCat-${actividadId}-${cat.id}"
        class="form-control">

      <button 
        class="btn btn-success btn-sm"
        onclick="actualizarCategoria('${actividadId}','${cat.id}')">

        Guardar

      </button>

      <button 
        class="btn btn-danger btn-sm"
        onclick="eliminarCategoria('${actividadId}','${cat.id}')">

        Eliminar

      </button>

    </div>

    `;
  });

  return html;
}

async function eliminarCategoria(actividadId, categoriaId) {
  const confirmar = await Swal.fire({
    icon: "warning",

    title: "¿Eliminar categoría?",

    text: "Esta acción no se puede deshacer.",

    showCancelButton: true,

    confirmButtonText: "Eliminar",

    cancelButtonText: "Cancelar",
  });

  if (!confirmar.isConfirmed) return;

  await db
    .collection("actividades")
    .doc(actividadId)
    .collection("categorias")
    .doc(categoriaId)
    .delete();

  cargarActividades();
}

//////////////////// CREAR ACTIVIDAD ///////////////////////

async function crearActividad() {
  const nombre = document.getElementById("nuevaActividadNombre").value.trim();

  if (!nombre) return;

  const id = nombre.toLowerCase().replaceAll(" ", "_");

  const ref = db.collection("actividades").doc(id);

  const doc = await ref.get();

  // 🔥 SI YA EXISTE Y ESTABA ELIMINADA

  if (doc.exists) {
    const data = doc.data();

    if (data.eliminada) {
      await ref.update({
        nombre,
        activa: true,
        eliminada: false,
      });

      Swal.fire({
        icon: "success",
        title: "Actividad restaurada",
        timer: 2000,
        showConfirmButton: false,
      });

      cargarActividades();

      return;
    }

    Swal.fire({
      icon: "warning",
      title: "Actividad duplicada",
      text: "La actividad ya existe",
    });

    return;
  }

  // 🔥 CREAR NUEVA

  await ref.set({
    nombre,
    activa: true,
    eliminada: false,
  });

  document.getElementById("nuevaActividadNombre").value = "";

  cargarActividades();
}

//////////////////// PAUSAR ACTIVIDAD //////////////////////

async function toggleActividad(id, estadoActual) {
  const accion = estadoActual ? "pausar" : "activar";

  const confirmar = await Swal.fire({
    icon: "question",

    title: "Confirmar acción",

    text: `¿Seguro que querés ${accion} esta actividad?`,

    showCancelButton: true,

    confirmButtonText: "Sí",

    cancelButtonText: "Cancelar",
  });

  if (!confirmar.isConfirmed) return;

  await db.collection("actividades").doc(id).update({
    activa: !estadoActual,
  });

  cargarActividades();
}

//////////////////// ELIMINAR ACTIVIDAD ////////////////////

async function eliminarActividad(id, nombre) {
  const confirmar = await Swal.fire({
    icon: "warning",

    title: "¿Eliminar actividad?",

    html: `
    <strong>${nombre}</strong><br><br>
    La actividad dejará de aparecer pero NO se borrará el historial.
  `,

    showCancelButton: true,

    confirmButtonText: "Eliminar",

    cancelButtonText: "Cancelar",
  });

  if (!confirmar.isConfirmed) return;

  await db.collection("actividades").doc(id).update({
    eliminada: true,
    activa: false,
  });

  cargarActividades();
}

//////////////////// CREAR CATEGORIA ///////////////////////

async function crearCategoria(actividadId) {
  const nombre = document.getElementById(`catNombre-${actividadId}`).value;

  const precio = Number(
    document.getElementById(`catPrecio-${actividadId}`).value,
  );

  const id = nombre.toLowerCase().replaceAll(" ", "_");

  await db
    .collection("actividades")
    .doc(actividadId)
    .collection("categorias")
    .doc(id)
    .set({
      nombre: nombre,
      precio: precio,
    });

  cargarActividades();
}

//////////////////// ACTUALIZAR PRECIO /////////////////////

async function actualizarCategoria(actividadId, categoriaId) {
  const precio = Number(
    document.getElementById(`precioCat-${actividadId}-${categoriaId}`).value,
  );

  await db
    .collection("actividades")
    .doc(actividadId)
    .collection("categorias")
    .doc(categoriaId)
    .update({
      precio: precio,
    });

  Swal.fire(
    "Precio Actualizado",
    "Los datos se guardaron correctamente",
    "success",
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////// Módulo de Pagos ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function cargarModuloPagos() {
  document.getElementById("pagos").innerHTML = `

<h2>Buscar Pagos</h2>

<div class="card border-0 shadow-sm p-3 mb-4">

  <label class="form-label">
    DNI del socio
  </label>

  <input
    type="text"
    id="buscarPagoDni"
    class="form-control"
    maxlength="8"
    placeholder="Ingrese DNI"
    oninput="buscarPagosPorDni()"
  >

</div>

<div id="resultadoPagos"></div>

`;
}

///////////////////////////////////////////////////////////
// BUSCAR PAGOS
///////////////////////////////////////////////////////////

async function buscarPagosPorDni() {
  const dni = document.getElementById("buscarPagoDni").value.trim();

  /////////////////////////////////////////////////////////
  // ESPERAR DNI COMPLETO
  /////////////////////////////////////////////////////////

  if (dni.length < 8) {
    document.getElementById("resultadoPagos").innerHTML = "";
    return;
  }

  try {
    /////////////////////////////////////////////////////////
    // LOADING
    /////////////////////////////////////////////////////////

    document.getElementById("resultadoPagos").innerHTML = `

<div class="text-center py-4">

  <div class="spinner-border"></div>

</div>

`;

    /////////////////////////////////////////////////////////
    // CONSULTA
    /////////////////////////////////////////////////////////

    const snapshot = await db
      .collection("pagos")
      .where("dni", "==", dni)
      .orderBy("fecha", "desc")
      .limit(10)
      .get();

    /////////////////////////////////////////////////////////
    // SIN RESULTADOS
    /////////////////////////////////////////////////////////

    if (snapshot.empty) {
      document.getElementById("resultadoPagos").innerHTML = `

<div class="alert alert-warning">

No se encontraron pagos

</div>

`;

      return;
    }

    /////////////////////////////////////////////////////////
    // RENDER
    /////////////////////////////////////////////////////////

    let html = "";

    snapshot.forEach((doc) => {
      const pago = doc.data();

      ///////////////////////////////////////////////////////
      // FECHA
      ///////////////////////////////////////////////////////

      let fechaTexto = "-";

      if (pago.fecha) {
        fechaTexto = pago.fecha.toDate().toLocaleString("es-AR");
      }

      ///////////////////////////////////////////////////////
      // ITEMS
      ///////////////////////////////////////////////////////

      let itemsHTML = "";

      (pago.items || []).forEach((item) => {
        itemsHTML += `

<li class="list-group-item">

  <strong>
    ${item.concepto}
  </strong>

  - ${item.origen}

  - ${item.periodo}

  <span class="float-end">

    $${(item.monto || 0).toLocaleString("es-AR")}

  </span>

</li>

`;
      });

      ///////////////////////////////////////////////////////
      // CARD
      ///////////////////////////////////////////////////////

      html += `

<div class="card shadow-sm border-0 mb-3">

  <div class="card-body">

    <div class="d-flex justify-content-between flex-wrap">

      <div>

        <h5 class="mb-1">
          ${pago.socioNombre || "-"}
        </h5>

        <div class="text-muted">
          DNI: ${pago.dni || "-"}
        </div>

      </div>

      <div class="text-end">

        <h4 class="mb-0 text-success">

          $${(pago.montoTotal || 0).toLocaleString("es-AR")}

        </h4>

      </div>

    </div>

    <hr>

    <div class="row">

      <div class="col-md-3">

        <strong>Fecha</strong><br>

        ${fechaTexto}

      </div>

      <div class="col-md-3">

        <strong>Método</strong><br>

        ${pago.metodo || "-"}

      </div>

      <div class="col-md-3">

        <strong>Estado</strong><br>

        ${pago.estado || "-"}

      </div>

      <div class="col-md-3">

        <strong>Operador</strong><br>

        ${pago.usuarioNombre || "-"}

      </div>

    </div>

    <hr>

    <h6>Conceptos cobrados</h6>

    <ul class="list-group">

      ${itemsHTML}

    </ul>

  </div>

</div>

`;
    });

    document.getElementById("resultadoPagos").innerHTML = html;
  } catch (error) {
    console.error(error);

    Swal.fire({
      icon: "error",
      title: "Error al buscar pagos",
    });
  }
}
