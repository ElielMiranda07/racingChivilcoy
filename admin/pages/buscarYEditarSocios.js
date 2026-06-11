////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////// Buscar y editar SOCIOS ////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////// CACHE ACTIVIDADES //////////////////////

async function cargarActividadesCache() {
  if (Object.keys(cacheActividades).length > 0) return;

  const actividadesSnap = await db
    .collection("actividades")
    .where("activa", "==", true)
    .get();

  const categoriasSnap = await db.collectionGroup("categorias").get();

  // CARGAR ACTIVIDADES

  actividadesSnap.forEach((doc) => {
    cacheActividades[doc.id] = {
      nombre: doc.data().nombre,
      categorias: [],
    };
  });

  // CARGAR CATEGORIAS

  categoriasSnap.forEach((doc) => {
    const actividadId = doc.ref.parent.parent.id;

    if (!cacheActividades[actividadId]) return;

    cacheActividades[actividadId].categorias.push({
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

  document.getElementById("busquedaSocio")?.focus();
}

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

      const tieneCuotaSocial = !!persona.deudas?.cuotaSocial;

      const tieneActividades = Object.keys(persona.deudas || {}).some(
        (key) => key !== "cuotaSocial",
      );

      const tieneMoras = Object.keys(persona.moras || {}).length > 0;

      const tieneDeudas = tieneCuotaSocial || tieneActividades || tieneMoras;

      // SIN DEUDAS

      if (!tieneDeudas) {
        html += `

<div class="alert alert-success mb-0">

No hay deudas pendientes para este socio.

</div>

`;

        html += `</div>`;
        return;
      }

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

${cacheActividades[key]?.nombre || key}
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

  Object.entries(cacheActividades).forEach(([actId, act]) => {
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
