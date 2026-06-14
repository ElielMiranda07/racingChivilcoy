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

<h2 class="colorPrincipal">Dashboard General</h2>

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
        Descargar Listado
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
        Descargar Listado
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
        Descargar Listado
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
        Descargar Listado
      </button>

    </div>

  </div>

</div>

<div class="mt-5">

  <h4 class="colorPrincipal">Estado General de Socios</h4>

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

////////////////////////////// EXPORTAR ARCHIVOS DASHBOARD //////////////////////////////

async function seleccionarFormatoExportacion() {
  const resultado = await Swal.fire({
    title: "Formato de exportación",

    html: `

<div class="text-start">

  <div class="form-check mb-3">

    <input
      class="form-check-input"
      type="radio"
      name="formatoExportacion"
      id="formatoExcel"
      value="excel"
      checked
    >

    <label class="form-check-label" for="formatoExcel">

      📊 <b>Excel</b>

      <br>

      <small class="text-muted">
        Ideal para editar, filtrar y analizar datos.
      </small>

    </label>

  </div>

  <div class="form-check mb-3">

    <input
      class="form-check-input"
      type="radio"
      name="formatoExportacion"
      id="formatoPdf"
      value="pdf"
    >

    <label class="form-check-label" for="formatoPdf">

      📄 <b>PDF Institucional</b>

      <br>

      <small class="text-muted">
        Con logo, colores y presentación profesional.
      </small>

    </label>

  </div>

  <div class="form-check">

    <input
      class="form-check-input"
      type="radio"
      name="formatoExportacion"
      id="formatoPrint"
      value="pdf_print"
    >

    <label class="form-check-label" for="formatoPrint">

      🖨️ <b>PDF para impresión</b>

      <br>

      <small class="text-muted">
        Optimizado para imprimir en papel.
      </small>

    </label>

  </div>

</div>

`,

    showCancelButton: true,

    confirmButtonText: "Continuar",

    cancelButtonText: "Cancelar",

    preConfirm: () => {
      return document.querySelector('input[name="formatoExportacion"]:checked')
        .value;
    },
  });

  return resultado.isConfirmed ? resultado.value : null;
}

const camposExportables = {
  nombre: "Nombre",
  dni: "DNI",
  telefono: "Teléfono",
  mail: "Email",

  estadoCuenta: "Estado de cuenta",

  deudaActual: "Deuda actual",
  mesesPagos: "Meses pagos",

  grupoFamiliar: "Grupo Familiar",
  rolGrupo: "Rol Grupo",

  actividades: "Actividades",
};

async function seleccionarCamposExportacion() {
  let html = `

<div class="text-start">

<div class="mb-3">

<button
class="btn btn-sm btn-success"
onclick="
document
.querySelectorAll('.campo-exportacion')
.forEach(c=>c.checked=true)
">

Seleccionar todos

</button>

<button
class="btn btn-sm btn-secondary ms-2"
onclick="
document
.querySelectorAll('.campo-exportacion')
.forEach(c=>c.checked=false)
">

Deseleccionar

</button>

</div>

`;

  Object.entries(camposExportables).forEach(([key, label]) => {
    html += `

<div class="form-check">

<input
class="form-check-input campo-exportacion"
type="checkbox"
value="${key}"
checked
id="campo_${key}">

<label
class="form-check-label"
for="campo_${key}">

${label}

</label>

</div>

`;
  });

  html += "</div>";

  const resultado = await Swal.fire({
    title: "Seleccionar columnas",

    html,

    width: 600,

    showCancelButton: true,

    confirmButtonText: "Generar Archivo",

    cancelButtonText: "Cancelar",

    preConfirm: () => {
      const seleccionados = [];

      document.querySelectorAll(".campo-exportacion:checked").forEach((c) => {
        seleccionados.push(c.value);
      });

      if (!seleccionados.length) {
        Swal.showValidationMessage("Seleccione al menos una columna");

        return false;
      }

      return seleccionados;
    },
  });

  return resultado.isConfirmed ? resultado.value : null;
}

async function exportarListadoDashboard(tipo) {
  // FORMATO

  const formato = await seleccionarFormatoExportacion();

  if (!formato) return;

  // COLUMNAS

  const camposSeleccionados = await seleccionarCamposExportacion();

  if (!camposSeleccionados) return;

  // LOADING

  Swal.fire({
    title: "Generando archivo...",

    text: "Espere unos segundos",

    allowOutsideClick: false,

    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    // QUERY

    let query = db.collection("socios");

    if (tipo === "todos") {
      query = query.orderBy("nombre");
    } else if (tipo === "al_dia") {
      query = query.where("estadoCuenta", "==", "al_dia").orderBy("nombre");
    } else if (tipo === "impagas") {
      query = query.where("estadoCuenta", "==", "deuda").orderBy("nombre");
    } else if (tipo === "morosos30") {
      query = query.where("estadoCuenta", "==", "moroso").orderBy("nombre");
    }

    // CONSULTA

    const snapshot = await query.get();

    // DATOS

    const datos = [];

    snapshot.forEach((doc) => {
      const socio = doc.data();

      const fila = {};

      camposSeleccionados.forEach((campo) => {
        const titulo = camposExportables[campo] || campo;

        let valor = "";

        // CAMPOS ESPECIALES

        switch (campo) {
          case "grupoFamiliar":
            valor = socio.grupoFamiliar ? "Sí" : "No";
            break;

          case "rolGrupo":
            valor = socio.grupoFamiliar?.rol || "";
            break;

          case "actividades":
            valor = Object.entries(socio.actividades || {})
              .filter(([_, actividad]) => actividad?.activo)
              .map(([nombre, actividad]) => {
                const nombreActividad =
                  cacheActividades?.[nombre]?.nombre || nombre;

                const categoria =
                  actividad.categoria
                    ?.replaceAll("_", " ")
                    ?.replace(/\b\w/g, (l) => l.toUpperCase()) || "";

                return `${nombreActividad} (${categoria})`;
              })
              .join(" - ");
            break;

          default:
            valor = socio[campo];
            break;
        }

        // OBJETOS

        if (valor && typeof valor === "object" && !Array.isArray(valor)) {
          valor = JSON.stringify(valor);
        }

        // ARRAYS

        if (Array.isArray(valor)) {
          valor = valor.join(", ");
        }

        // NULL

        if (valor === undefined || valor === null) {
          valor = "";
        }

        fila[titulo] = valor;
      });

      datos.push(fila);
    });

    // EXCEL

    const ws = XLSX.utils.json_to_sheet(datos);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Socios");

    // ANCHO AUTOMATICO

    ws["!cols"] = Object.keys(datos[0] || {}).map(() => ({
      wch: 25,
    }));

    // DESCARGAR

    if (formato === "excel") {
      XLSX.writeFile(wb, `socios_${tipo}_${Date.now()}.xlsx`);
    } else if (formato === "pdf") {
      generarPDFInstitucional(datos, camposSeleccionados, tipo);
    } else if (formato === "pdf_print") {
      generarPDFImpresion(datos, camposSeleccionados, tipo);
    }

    // SUCCESS

    Swal.fire({
      icon: "success",

      title: "Archivo generado",

      text: `${datos.length} socios exportados`,

      timer: 2500,

      showConfirmButton: false,
    });
  } catch (error) {
    console.error(error);

    Swal.fire({
      icon: "error",

      title: "Error al generar el archivo",
    });
  }
}

async function generarPDFInstitucional(datos, camposSeleccionados, tipo) {
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  const titulo = configuracionGeneral.general?.nombreClub || "Club";

  const fecha = new Date().toLocaleDateString("es-AR");

  const img = new Image();
  img.src = logoBase64;

  await new Promise((r) => (img.onload = r));

  const alto = 20;
  const ancho = (img.width / img.height) * alto;

  doc.addImage(logoBase64, undefined, 10, 10, ancho, alto);

  // Título

  doc.setFontSize(22);

  doc.setTextColor(colorPrincipal);

  doc.text(configuracionGeneral.general?.nombreClub || "Club", 105, 18, {
    align: "center",
  });

  doc.setFontSize(15);

  doc.setTextColor(40);

  doc.text("Listado de socios", 105, 28, { align: "center" });

  doc.setFontSize(10);

  doc.text(`Generado el ${new Date().toLocaleDateString("es-AR")}`, 105, 35, {
    align: "center",
  });

  // Encabezados

  const headers = [camposSeleccionados.map((c) => camposExportables[c])];

  // Filas

  const body = datos.map((fila) =>
    camposSeleccionados.map((c) => fila[camposExportables[c]]),
  );

  doc.autoTable({
    startY: 45,

    head: headers,

    body,

    theme: "grid",

    headStyles: {
      fillColor: colorPrincipal,
      textColor: 255,
      halign: "center",
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },

    styles: {
      fontSize: 9,
    },
  });

  // Resumen

  const y = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(12);

  doc.setTextColor(colorPrincipal);

  doc.text(`Total de socios: ${datos.length}`, 14, y);

  doc.save(`socios_${tipo}_${Date.now()}.pdf`);
}

function generarPDFImpresion(datos, camposSeleccionados, tipo) {
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  const fecha = new Date().toLocaleDateString("es-AR");

  doc.setFontSize(18);

  doc.setTextColor(0);

  doc.text("Listado de socios", 105, 18, {
    align: "center",
  });

  doc.setFontSize(9);

  doc.text(fecha, 105, 24, {
    align: "center",
  });

  const headers = [camposSeleccionados.map((c) => camposExportables[c])];

  const body = datos.map((fila) =>
    camposSeleccionados.map((c) => fila[camposExportables[c]]),
  );

  doc.autoTable({
    startY: 30,

    head: headers,

    body,

    theme: "grid",

    styles: {
      fontSize: 8,
      cellPadding: 2,
    },

    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
    },

    alternateRowStyles: {},

    margin: {
      left: 8,
      right: 8,
    },
  });

  doc.save(`socios_impresion_${tipo}_${Date.now()}.pdf`);
}
