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

async function cargarModuloPrecios() {
  const contenedor = document.getElementById("precios");

  contenedor.innerHTML = `
  
  <h3 class="colorPrincipal">Calcular Deudas</h3>
  <div class="card p-3 mt-4">
  

    <button 
      class="btn btn-danger"
      onclick="ejecutarCalculo()"
      id="btnCalcular">

      Calcular deuda de todos los socios

    </button>

    <div id="estadoCalculo" class="mt-2"></div>
  </div>

  <h4 class="colorPrincipal">Configuración</h4>

  <div class="mb-4">
    <label class="colorSecundario fw-bold">Cuota social</label>

    <input type="number" id="cuotaSocial" class="form-control mb-2">

    <button class="btn btn-success" onclick="guardarCuota()">
      Actualizar cuota
    </button>
  </div>

  <hr>

  <h5 class="colorPrincipal">Actividades</h5>

  <div id="listaActividades"></div>

  <hr>

  <h5 class="colorPrincipal">Nueva actividad</h5>

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

  cacheActividades = {};
  cacheCategorias = {};

  const actividadesSnap = await db
    .collection("actividades")
    .where("eliminada", "!=", true)
    .get();

  // guardar actividades en cache
  actividadesSnap.forEach((doc) => {
    cacheActividades[doc.id] = doc.data();
  });

  // traer TODAS las categorías en una sola consulta
  const categoriasSnap = await db.collectionGroup("categorias").get();

  categoriasSnap.forEach((doc) => {
    const actividadId = doc.ref.parent.parent.id;

    if (!cacheCategorias[actividadId]) {
      cacheCategorias[actividadId] = [];
    }

    cacheCategorias[actividadId].push({
      id: doc.id,
      ...doc.data(),
    });
  });

  let html = "";

  Object.entries(cacheActividades).forEach(([id, data]) => {
    const estado = data.activa ? "Activa" : "Pausada";
    const claseEstado = data.activa ? "text-success" : "text-danger";
    const textoBoton = data.activa ? "Pausar" : "Activar";

    html += `

    <div class="card mb-3 p-3">

      <div class="d-flex justify-content-between align-items-center">

        <strong  class="colorSecundario">${data.nombre}</strong>

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

      <h6 class="colorSecundario fw-bold">Categorías</h6>

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
  const categorias = cacheCategorias[actividadId] || [];

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
