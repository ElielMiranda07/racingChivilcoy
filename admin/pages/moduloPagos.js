////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////// Módulo de Pagos ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function cargarModuloPagos() {
  document.getElementById("pagos").innerHTML = `

<h2 class="colorPrincipal">Buscar Pagos</h2>

<div class="card border-0 shadow-sm p-3 mb-4">

  <label class="form-label colorSecundario fw-bold">
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

  document.getElementById("buscarPagoDni")?.focus();
}

// BUSCAR PAGOS

async function buscarPagosPorDni() {
  const dni = document.getElementById("buscarPagoDni").value.trim();

  // ESPERAR DNI COMPLETO

  if (dni.length < 8) {
    document.getElementById("resultadoPagos").innerHTML = "";
    return;
  }

  try {
    // LOADING

    document.getElementById("resultadoPagos").innerHTML = `

<div class="text-center py-4">

  <div class="spinner-border"></div>

</div>

`;

    // CONSULTA

    const snapshot = await db
      .collection("pagos")
      .where("dni", "==", dni)
      .orderBy("fecha", "desc")
      .limit(10)
      .get();

    // SIN RESULTADOS

    if (snapshot.empty) {
      document.getElementById("resultadoPagos").innerHTML = `

<div class="alert alert-warning">

No se encontraron pagos

</div>

`;

      return;
    }

    // RENDER

    let html = "";

    snapshot.forEach((doc) => {
      const pago = doc.data();

      // FECHA

      let fechaTexto = "-";

      if (pago.fecha) {
        fechaTexto = pago.fecha.toDate().toLocaleString("es-AR");
      }

      let detalleGrupoHTML = "";

      if (
        pago.detalleGrupo &&
        Array.isArray(pago.detalleGrupo) &&
        pago.detalleGrupo.length > 0
      ) {
        detalleGrupoHTML = `

<hr>

<h6>Pago familiar</h6>

<div class="table-responsive">

<table class="table table-sm">

<thead>

<tr>

<th>Socio</th>
<th>Importe</th>
<th>Tipo</th>

</tr>

</thead>

<tbody>

${pago.detalleGrupo
  .map(
    (socio) => `

<tr>

<td>${socio.socioNombre}</td>

<td>
$${(socio.montoTotal || 0).toLocaleString("es-AR")}
</td>

<td>
${socio.pagaPorGrupo ? "Miembro" : "Titular"}
</td>

</tr>

`,
  )
  .join("")}

</tbody>

</table>

</div>

<div class="alert alert-info mb-0">

<strong>Total abonado por el grupo:</strong>

$${(pago.montoPagadoGrupo || 0).toLocaleString("es-AR")}

</div>

`;
      }

      // ITEMS

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

      // CARD

      html += `

<div class="card shadow border-0 mb-4">

  <div class="card-header bg-success text-white">

    <div class="d-flex justify-content-between align-items-center flex-wrap">

      <div>

        <h5 class="mb-0">
          ${pago.socioNombre || "-"}
        </h5>

        <small>
          DNI: ${pago.dni || "-"}
        </small>

      </div>

      <div class="text-end">

        <div class="fs-3 fw-bold">

          $${(pago.montoTotal || 0).toLocaleString("es-AR")}

        </div>

        <span class="badge bg-light text-dark">

          ${pago.estado || "-"}

        </span>

      </div>

    </div>

  </div>

  <div class="card-body">

    <!-- DATOS PRINCIPALES -->

<div class="row g-3 mb-4">

  <div class="col-md-3">

    <div class="border rounded p-2 h-100">

      <small class="text-muted d-block">
        Fecha
      </small>

      <strong>
        ${fechaTexto}
      </strong>

    </div>

  </div>

  <div class="col-md-3">

    <div class="border rounded p-2 h-100">

      <small class="text-muted d-block">
        Método
      </small>

      <strong>
        ${pago.metodo || "-"}
      </strong>

    </div>

  </div>

  <div class="col-md-3">

    <div class="border rounded p-2 h-100">

      <small class="text-muted d-block">
        Cobrado por
      </small>

      <strong>
        ${pago.cobradoPorNombre || "-"}
      </strong>

    </div>

  </div>

  <div class="col-md-3">

    <div class="border rounded p-2 h-100">

      <small class="text-muted d-block">
        Pagador
      </small>

      <strong>
        ${pago.pagadorNombre || pago.socioNombre || "-"}
      </strong>

    </div>

  </div>

</div>

<!-- TIPO DE PAGO -->

<div class="mb-4">

  ${
    pago.grupoPagoId
      ? pago.pagaPorGrupo
        ? `
<span class="badge bg-info fs-6">

  Pago Familiar - Miembro

</span>

<div class="small text-muted mt-2">

  Pagado por:
  <strong>${pago.pagadorNombre || "-"}</strong>

</div>
`
        : `
<span class="badge bg-primary fs-6">

  Pago Familiar - Titular

</span>

<div class="small text-muted mt-2">

  Titular responsable del grupo

</div>
`
      : `
<span class="badge bg-secondary fs-6">

  Pago Individual

</span>
`
  }

</div>

    <!-- DETALLE GRUPAL -->

    ${
      pago.detalleGrupo?.length
        ? `

<div class="card border-primary mb-4">

  <div class="card-header bg-primary text-white">

    <strong>

      Grupo Familiar

    </strong>

  </div>

  <div class="card-body">

    <div class="table-responsive">

      <table class="table table-hover align-middle">

        <thead>

          <tr>

            <th>Socio</th>
            <th>Rol</th>
            <th>Importe</th>

          </tr>

        </thead>

        <tbody>

          ${pago.detalleGrupo
            .map(
              (socio) => `

<tr>

  <td>

    ${socio.socioNombre}

  </td>

  <td>

    ${
      socio.pagaPorGrupo
        ? `<span class="badge bg-info">Miembro</span>`
        : `<span class="badge bg-success">Titular</span>`
    }

  </td>

  <td>

    <strong>

      $${(socio.montoTotal || 0).toLocaleString("es-AR")}

    </strong>

  </td>

</tr>

`,
            )
            .join("")}

        </tbody>

      </table>

    </div>

    <div class="alert alert-success mb-0">

      <strong>

        Total abonado por el grupo:

      </strong>

      $${(pago.montoPagadoGrupo || 0).toLocaleString("es-AR")}

    </div>

  </div>

</div>

`
        : ""
    }

    <!-- CONCEPTOS -->

    <div class="card border-0 bg-light">

      <div class="card-header">

        <strong>

          Conceptos cobrados

        </strong>

      </div>

      <ul class="list-group list-group-flush">

        ${itemsHTML}

      </ul>

    </div>

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
