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
          alert("No tienes permisos para acceder a esta página.");
          firebase.auth().signOut(); // Cerrar sesión
        }
      } else {
        // Si no existe el documento, cerrar sesión
        alert("Usuario no registrado en la base de datos.");
        firebase.auth().signOut(); // Cerrar sesión
      }
    })
    .catch((error) => {
      console.error("Error al verificar el rol del usuario: ", error);
      alert("Error al verificar el rol del usuario.");
      firebase.auth().signOut(); // Cerrar sesión en caso de error
    });
}

////////////////////// Selección de Módulos //////////////////////

function mostrar(modulo) {
  document
    .querySelectorAll(".modulo")
    .forEach((m) => m.classList.add("d-none"));

  document.getElementById(modulo).classList.remove("d-none");

  if (modulo === "dashboard") {
    cargarDashboard();
  }

  if (modulo === "buscar") {
    cargarBuscadorSocios();
  }

  if (modulo === "precios") {
    cargarModuloPrecios();
  }
}

////////////////////// DASHBOARD //////////////////////

async function sociosPorVencer() {
  const hoy = new Date();

  const en7dias = new Date();
  en7dias.setDate(hoy.getDate() + 7);

  const snapshot = await db
    .collection("socios")
    .where("vencimientoCuota", ">=", hoy.toISOString().split("T")[0])
    .where("vencimientoCuota", "<=", en7dias.toISOString().split("T")[0])
    .get();

  return snapshot.size;
}

async function cargarDashboard() {
  await actualizarDiasVencido();

  await recalcularEstadisticas();

  const doc = await db.collection("estadisticas").doc("dashboard").get();

  const data = doc.data();

  document.getElementById("dashboard").innerHTML = `

<h2>Dashboard</h2>

<div class="row g-3">

<div class="col-md-3">
<div class="card p-3">

<h3>${data.totalSocios}</h3>
Socios totales

<button class="btn btn-primary mt-2"
onclick="abrirListado('todos')">
Ver listado
</button>

</div>
</div>

<div class="col-md-3">
<div class="card p-3">

<h3>${data.cuotasAlDia}</h3>
Cuotas al día

<button class="btn btn-success mt-2"
onclick="abrirListado('al_dia')">
Ver listado
</button>

</div>
</div>

<div class="col-md-3">
<div class="card p-3">

<h3>${data.cuotasVencidas}</h3>
Cuotas vencidas

<button class="btn btn-danger mt-2"
onclick="abrirListado('vencida')">
Ver listado
</button>

</div>
</div>

<div class="col-md-3">
<div class="card p-3 bg-danger text-white">

<h3>${data.morosos30}</h3>
Morosos +30 días

<button class="btn btn-light mt-2"
onclick="abrirListadoMorosos()">
Ver listado
</button>

</div>
</div>

<div class="col-md-3">
<div class="card p-3 bg-warning">

<h3>${data.porVencer7}</h3>
Vencen en 7 días

<button class="btn btn-dark mt-2"
onclick="abrirListadoPorVencer()">
Ver listado
</button>

</div>
</div>

</div>

<div class="mt-5">

<h4>Estado de cuotas</h4>

<canvas id="graficoCuotas"></canvas>

</div>

`;

  dibujarGrafico(
    data.cuotasAlDia,
    data.cuotasVencidas,
    data.porVencer7,
    data.morosos30,
  );
}

let ultimoDoc = null;
let tipoListado = null;

async function abrirListado(tipo) {
  tipoListado = tipo;
  ultimoDoc = null;

  document.getElementById("listaSocios").innerHTML = "";

  await cargarMasSocios();

  const modal = new bootstrap.Modal(document.getElementById("modalSocios"));

  modal.show();
}

async function cargarMasSocios() {
  let query = db.collection("socios").orderBy("nombre").limit(20);

  if (tipoListado !== "todos") {
    query = db
      .collection("socios")
      .where("estadoCuota", "==", tipoListado)
      .orderBy("nombre")
      .limit(20);
  }

  if (ultimoDoc) {
    query = query.startAfter(ultimoDoc);
  }

  const snapshot = await query.get();

  if (snapshot.empty) {
    document.getElementById("btnCargarMas").style.display = "none";
    return;
  }

  ultimoDoc = snapshot.docs[snapshot.docs.length - 1];

  let html = "";

  snapshot.forEach((doc) => {
    const socio = doc.data();

    html += `

<div class="border-bottom py-2">

<strong>${socio.nombre}</strong><br>

DNI: ${socio.dni}<br>

Estado: ${socio.estadoCuota}

</div>

`;
  });

  document.getElementById("listaSocios").innerHTML += html;
}

async function abrirListadoPorVencer() {
  const hoy = new Date();

  const en7dias = new Date();
  en7dias.setDate(hoy.getDate() + 7);

  const snapshot = await db
    .collection("socios")
    .where("vencimientoCuota", ">=", hoy.toISOString().split("T")[0])
    .where("vencimientoCuota", "<=", en7dias.toISOString().split("T")[0])
    .get();

  let html = "";

  snapshot.forEach((doc) => {
    const socio = doc.data();

    html += `

<div class="border-bottom py-2">

<strong>${socio.nombre}</strong><br>

DNI: ${socio.dni}<br>

Vence: ${socio.vencimientoCuota}

</div>

`;
  });

  document.getElementById("listaSocios").innerHTML = html;

  const modal = new bootstrap.Modal(document.getElementById("modalSocios"));
  modal.show();
}

async function abrirListadoMorosos() {
  const hoy = new Date();
  const hace30 = new Date();

  hace30.setDate(hoy.getDate() - 30);

  const snapshot = await db
    .collection("socios")
    .where("estadoCuota", "==", "vencida")
    .where("vencimientoCuota", "<=", hace30.toISOString().split("T")[0])
    .get();

  let html = "";

  snapshot.forEach((doc) => {
    const socio = doc.data();

    html += `

<div class="border-bottom py-2">

<strong>${socio.nombre}</strong><br>

DNI: ${socio.dni}<br>

Vencimiento: ${socio.vencimientoCuota}

</div>

`;
  });

  document.getElementById("listaSocios").innerHTML = html;

  const modal = new bootstrap.Modal(document.getElementById("modalSocios"));
  modal.show();
}

function calcularDiasVencido(vencimiento) {
  const hoy = new Date();
  const fechaVenc = new Date(vencimiento);

  const diff = hoy - fechaVenc;

  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

  return dias > 0 ? dias : 0;
}

async function actualizarDiasVencido() {
  const snapshot = await db.collection("socios").get();

  const batch = db.batch();

  snapshot.forEach((doc) => {
    const socio = doc.data();

    const dias = calcularDiasVencido(socio.vencimientoCuota);

    batch.update(doc.ref, {
      diasVencido: dias,
    });
  });

  await batch.commit();
}

async function recalcularEstadisticas() {
  const snapshot = await db.collection("socios").get();

  let total = 0;
  let alDia = 0;
  let vencidas = 0;
  let morosos30 = 0;
  let porVencer7 = 0;

  const hoy = new Date();
  const en7dias = new Date();

  en7dias.setDate(hoy.getDate() + 7);

  snapshot.forEach((doc) => {
    const socio = doc.data();

    if (!socio.activo) return;

    total++;

    if (socio.estadoCuota === "al_dia") {
      alDia++;
    }

    if (socio.estadoCuota === "vencida") {
      vencidas++;
    }

    if (socio.diasVencido > 30) {
      morosos30++;
    }

    const venc = new Date(socio.vencimientoCuota);

    if (venc >= hoy && venc <= en7dias) {
      porVencer7++;
    }
  });

  await db.collection("estadisticas").doc("dashboard").set({
    totalSocios: total,
    cuotasAlDia: alDia,
    cuotasVencidas: vencidas,
    morosos30: morosos30,
    porVencer7: porVencer7,
  });
}

function dibujarGrafico(alDia, vencidos, porVencer, morosos) {
  const ctx = document.getElementById("graficoCuotas");

  new Chart(ctx, {
    type: "doughnut",

    data: {
      labels: ["Al día", "Vencidas", "Por Vencer", "Vencidos +30 días"],

      datasets: [
        {
          data: [alDia, vencidos, porVencer, morosos],

          backgroundColor: ["#8bc4e5", "#131748", "#ffee00", "#ff0000"],
        },
      ],
    },
  });
}

////////////////////// Importador CSV //////////////////////

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
    alert("Seleccione un archivo");
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
<th>Estado</th>
</tr>
</thead>

<tbody>
`;

  datosCSV.slice(0, 5).forEach((fila) => {
    html += `
<tr>
<td>${fila.nombre}</td>
<td>${fila.dni}</td>
<td>${fila.estadoCuota}</td>
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

  let html = `

<div class="alert alert-info">

Total registros: ${total}<br>

Duplicados en CSV: ${duplicados}

</div>

<button class="btn btn-success"
onclick="importarSocios()">
Procesar importación
</button>

<div class="progress mt-3">

<div id="barraProgreso"
class="progress-bar"
style="width:0%">
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
  const user = await esperarAuth();

  console.log("Usuario antes de importar:", firebase.auth().currentUser);

  if (!user) {
    alert("Debes estar logueado");
    return;
  }

  console.log("Importación ejecutada por:", user.uid);

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
          dni: dni,
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

        let uid = mapaSocios[dni];

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
            diasVencido: 0,
            dni: dni,
            estadoCuota: fila.estadoCuota || "al_dia",
            nombre: fila.nombre,
            mail: fila.mail || "",
            telefono: fila.telefono || "",
            primerLogin: true,
            rol: "socio",
            ultimaActualizacion: firebase.firestore.Timestamp.now(),
            vencimientoCuota: fila.vencimientoCuota || "",
          },
          { merge: true },
        );

        procesados++;

        if (procesados % 400 === 0) {
          await batch.commit();
          batch = db.batch();
        }

        let progreso = Math.round((procesados / datosCSV.length) * 100);

        barra.style.width = progreso + "%";
        barra.innerText = progreso + "%";
      } catch (e) {
        console.error(e);
        errores++;
      }
    }
  }

  await batch.commit();

  document.getElementById("reporteImportacion").innerHTML = `

<div class="alert alert-success">

Importación finalizada<br><br>

Socios creados: ${creados}<br>

Socios actualizados: ${actualizados}<br>

Errores: ${errores}

</div>

`;
}

document.getElementById("importar").innerHTML = `

<h2>Ejemplo de archivo CSV</h2>

<a 
href="../ejemplos/CSV_Modelo.csv"
download
class="btn btn-secondary mb-3">

Descargar CSV de ejemplo

</a>

<h2>Importar CSV</h2>

<input type="file" id="csvFile" class="form-control">

<button class="btn btn-primary mt-2"
onclick="procesarCSV()">

Mostrar preview

</button>

<div id="preview" class="mt-3"></div>

`;

////////////////////// Buscar y editar SOCIOS //////////////////////
////////////////////// Buscar y editar SOCIOS //////////////////////

////////////////////// CACHE ACTIVIDADES //////////////////////

let cache_actividades = {};

async function cargarActividadesCache() {
  if (Object.keys(cache_actividades).length > 0) return;

  const actividadesSnap = await db
    .collection("actividades")
    .where("activa", "==", true)
    .get();

  const categoriasSnap = await db.collectionGroup("categorias").get();

  // cargar actividades
  actividadesSnap.forEach((doc) => {
    cache_actividades[doc.id] = {
      nombre: doc.data().nombre,
      categorias: [],
    };
  });

  // cargar categorias
  categoriasSnap.forEach((doc) => {
    const actividadId = doc.ref.parent.parent.id;

    if (!cache_actividades[actividadId]) return;

    cache_actividades[actividadId].categorias.push({
      id: doc.id,
      ...doc.data(),
    });
  });
}

////////////////////// BUSCADOR SOCIOS //////////////////////

function cargarBuscadorSocios() {
  document.getElementById("buscar").innerHTML = `

<h2>Buscar socio</h2>

<input
id="busquedaSocio"
class="form-control"
placeholder="Buscar por DNI"
inputmode="numeric"
pattern="[0-9]*"
oninput="debounceBuscar()">

<div id="resultado" class="mt-3"></div>

`;
}

let timerBusqueda;

function debounceBuscar() {
  clearTimeout(timerBusqueda);

  timerBusqueda = setTimeout(() => {
    buscarSocioPorDni();
  }, 300);
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

  if (snapshot.empty) {
    document.getElementById("resultado").innerHTML = `
      <div class="alert alert-warning">
        No se encontró ningún socio
      </div>
    `;

    return;
  }

  let html = `<div class="list-group">`;

  snapshot.forEach((doc) => {
    const socio = doc.data();
    const id = doc.id;

    html += `

<div class="list-group-item d-flex justify-content-between align-items-center">

<div>

<b>${socio.nombre}</b><br>

DNI: ${socio.dni}<br>

Estado: ${socio.estadoCuota || "sin estado"}

</div>

<button
class="btn btn-warning btn-sm"
onclick="editarSocio('${id}')">

Editar

</button>

</div>

`;
  });

  html += `</div>`;

  document.getElementById("resultado").innerHTML = html;
}

////////////////////// EDITAR SOCIO //////////////////////

async function editarSocio(id) {
  mostrar("editar");

  await cargarActividadesCache();

  const doc = await db.collection("socios").doc(id).get();
  const socio = doc.data();

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
<input id="nombreEdit"
class="form-control"
value="${socio.nombre}">

<label class="mt-3">Estado cuota</label>
<select id="estadoEdit"
class="form-control">

<option value="al_dia">Al día</option>
<option value="vencida">Vencida</option>

</select>

<label class="mt-3">Grupo familiar</label>

<select id="grupoFamiliarEdit" class="form-control">

<option value="">Sin grupo</option>
<option value="3">3 integrantes</option>
<option value="4">4 integrantes</option>
<option value="5">5 integrantes</option>
<option value="6">6 integrantes</option>

</select>

<h4 class="mt-4">Actividades</h4>

${actividadesHTML}

<button class="btn btn-success mt-3"
onclick="guardarSocio('${id}')">

Guardar

</button>

`;

  document.getElementById("estadoEdit").value = socio.estadoCuota || "al_dia";

  document.getElementById("grupoFamiliarEdit").value =
    socio.grupoFamiliar || "";
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

  await db
    .collection("socios")
    .doc(id)
    .update({
      nombre: document.getElementById("nombreEdit").value,

      estadoCuota: document.getElementById("estadoEdit").value,

      grupoFamiliar:
        Number(document.getElementById("grupoFamiliarEdit").value) || null,

      actividades: actividades,

      ultimaActualizacion: firebase.firestore.Timestamp.now(),
    });

  await recalcularEstadisticas();

  alert("Socio actualizado");

  // volver automáticamente al buscador
  mostrar("buscar");
  cargarBuscadorSocios();
}

////////////////////// MODULO PRECIOS //////////////////////

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

////////////////////////////////////////////////////////////
//////////////////// CUOTA SOCIAL //////////////////////////
////////////////////////////////////////////////////////////

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

  alert("Cuota actualizada");
}

////////////////////////////////////////////////////////////
//////////////////// ACTIVIDADES ///////////////////////////
////////////////////////////////////////////////////////////

async function cargarActividades() {
  const contenedor = document.getElementById("listaActividades");

  contenedor.innerHTML = "";

  CACHE_ACTIVIDADES = {};
  CACHE_CATEGORIAS = {};

  const actividadesSnap = await db.collection("actividades").get();

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

////////////////////////////////////////////////////////////
//////////////////// RENDER CATEGORIAS /////////////////////
////////////////////////////////////////////////////////////

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
  const confirmar = confirm("¿Eliminar esta categoría?");

  if (!confirmar) return;

  await db
    .collection("actividades")
    .doc(actividadId)
    .collection("categorias")
    .doc(categoriaId)
    .delete();

  cargarActividades();
}

////////////////////////////////////////////////////////////
//////////////////// CREAR ACTIVIDAD ///////////////////////
////////////////////////////////////////////////////////////

async function crearActividad() {
  const nombre = document.getElementById("nuevaActividadNombre").value;

  const id = nombre.toLowerCase().replaceAll(" ", "_");

  await db.collection("actividades").doc(id).set({
    nombre: nombre,
    activa: true,
  });

  document.getElementById("nuevaActividadNombre").value = "";

  cargarActividades();
}

////////////////////////////////////////////////////////////
//////////////////// PAUSAR ACTIVIDAD //////////////////////
////////////////////////////////////////////////////////////

async function toggleActividad(id, estadoActual) {
  await db.collection("actividades").doc(id).update({
    activa: !estadoActual,
  });

  cargarActividades();
}

////////////////////////////////////////////////////////////
//////////////////// CREAR CATEGORIA ///////////////////////
////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////
//////////////////// ACTUALIZAR PRECIO /////////////////////
////////////////////////////////////////////////////////////

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

  alert("Precio actualizado");
}
