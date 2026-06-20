const admin = require("firebase-admin");

async function aplicarPago({
  socioId,
  items,
  metodo = "manual",

  cobradoPorId = null,
  cobradoPorNombre = "",

  paymentId = null,

  pagadorId = null,
  pagadorNombre = "",

  pagaPorGrupo = false,

  grupoPagoId = null,

  montoPagadoGrupo = null,
}) {
  const db = admin.firestore();

  const fecha = new Date();

  const anio = fecha.getFullYear();

  const mes = String(fecha.getMonth() + 1).padStart(2, "0");

  const periodo = `${anio}_${mes}`;

  const batch = db.batch();

  const socioRef = db.collection("socios").doc(socioId);

  const socioDoc = await socioRef.get();

  const configDoc = await admin
    .firestore()
    .collection("configuracion")
    .doc("general")
    .get();

  const config = configDoc.data() || {};

  const mesesVitalicio = config.facturacion?.mesesVitalicio ?? 500;

  if (!socioDoc.exists) {
    throw new Error("Socio no existe");
  }

  const socio = socioDoc.data();

  const estadoAnterior = socio.estadoCuenta || "al_dia";

  let deudaActual = socio.deudaActual || 0;

  let deudas = { ...(socio.deudas || {}) };

  let moras = { ...(socio.moras || {}) };

  let mesesPagos = socio.mesesPagos || 0;

  let totalActual = 0;

  let totalSocio = 0;

  let cobradoCuotaSocial = 0;

  let cobradoActividades = 0;

  let cobradoMoras = 0;

  let cobradoPorActividad = {};

  let cobradoPorCategoria = {};

  let itemsPago = [];

  let periodosAfectados = new Set();

  let cobradoMorasPorConcepto = {};

  // ITEMS

  for (const item of items) {
    const monto = Number(item.monto || 0);

    totalSocio += monto;

    // DEUDA ACTUAL

    if (item.tipo !== "mora") {
      totalActual += monto;

      deudaActual -= monto;

      if (item.tipo === "cuotaSocial") {
        mesesPagos += 1;

        cobradoCuotaSocial += monto;
      } else {
        cobradoActividades += monto;

        cobradoPorActividad[item.tipo] =
          (cobradoPorActividad[item.tipo] || 0) + monto;
      }

      delete deudas[item.tipo];

      itemsPago.push({
        concepto: item.tipo,
        periodo,
        monto,
        origen: "actual",
      });

      periodosAfectados.add(periodo);
    }

    // MORA

    if (item.tipo === "mora") {
      cobradoMoras += monto;

      const moraKey = item.concepto;

      if (!moraKey) {
        throw new Error("Mora sin concepto");
      }

      const periodoMora = item.periodo;

      if (moraKey === "cuotaSocial") {
        mesesPagos += 1;
      }

      if (Array.isArray(moras[moraKey])) {
        moras[moraKey] = moras[moraKey].filter(
          (m) => m.periodo !== periodoMora,
        );

        if (moras[moraKey].length === 0) {
          delete moras[moraKey];
        }
      }

      const refMora = db.collection("estadisticasMensuales").doc(periodoMora);

      const categoria =
        socio.actividades?.[moraKey]?.categoria || "sin_categoria";

      let updateMora = {
        totalCobrado: admin.firestore.FieldValue.increment(monto),

        pendiente: admin.firestore.FieldValue.increment(-monto),

        cobradoMoras: admin.firestore.FieldValue.increment(monto),
      };

      if (!updateMora.moras) {
        updateMora.moras = {};
      }

      if (!updateMora.moras[moraKey]) {
        updateMora.moras[moraKey] = {};
      }

      updateMora.moras[moraKey].cantidad =
        admin.firestore.FieldValue.increment(1);

      updateMora.moras[moraKey].cobrado =
        admin.firestore.FieldValue.increment(monto);

      if (!updateMora.moras[moraKey].categorias) {
        updateMora.moras[moraKey].categorias = {};
      }

      if (!updateMora.moras[moraKey].categorias[categoria]) {
        updateMora.moras[moraKey].categorias[categoria] = {};
      }

      updateMora.moras[moraKey].categorias[categoria].cantidad =
        admin.firestore.FieldValue.increment(1);

      updateMora.moras[moraKey].categorias[categoria].cobrado =
        admin.firestore.FieldValue.increment(monto);

      batch.set(refMora, updateMora, {
        merge: true,
      });

      itemsPago.push({
        concepto: moraKey,
        periodo: periodoMora,
        monto,
        origen: "mora",

        actividad: moraKey !== "cuotaSocial" ? moraKey : null,
      });

      periodosAfectados.add(periodoMora);

      cobradoMorasPorConcepto[moraKey] =
        (cobradoMorasPorConcepto[moraKey] || 0) + monto;
    }
  }

  // RECALCULAR ESTADO

  let totalMorasPendientes = 0;

  Object.values(moras).forEach((lista) => {
    if (!Array.isArray(lista)) return;

    lista.forEach((mora) => {
      totalMorasPendientes += mora.monto || 0;
    });
  });

  const deudaPendiente = Math.max(0, deudaActual) + totalMorasPendientes;

  // SOCIO

  let estadoNuevo = "al_dia";

  if (totalMorasPendientes > 0) {
    estadoNuevo = "moroso";
  } else if (deudaActual > 0) {
    estadoNuevo = "deuda";
  }

  batch.update(socioRef, {
    deudaActual: Math.max(0, deudaActual),

    deudas,

    moras,

    estadoCuenta: estadoNuevo,

    mesesPagos,

    esVitalicio: mesesPagos >= mesesVitalicio,

    ultimoPago: admin.firestore.FieldValue.serverTimestamp(),
  });

  const dashboardRef = db.collection("estadisticas").doc("dashboard");

  if (estadoAnterior !== estadoNuevo) {
    const cambios = {
      cuotasAlDia: 0,
      cuotasImpagas: 0,
      morosos30: 0,
    };

    if (estadoAnterior === "al_dia") {
      cambios.cuotasAlDia--;
    }

    if (estadoAnterior === "deuda") {
      cambios.cuotasImpagas--;
    }

    if (estadoAnterior === "moroso") {
      cambios.morosos30--;
    }

    if (estadoNuevo === "al_dia") {
      cambios.cuotasAlDia++;
    }

    if (estadoNuevo === "deuda") {
      cambios.cuotasImpagas++;
    }

    if (estadoNuevo === "moroso") {
      cambios.morosos30++;
    }

    batch.set(
      dashboardRef,
      {
        cuotasAlDia: admin.firestore.FieldValue.increment(cambios.cuotasAlDia),

        cuotasImpagas: admin.firestore.FieldValue.increment(
          cambios.cuotasImpagas,
        ),

        morosos30: admin.firestore.FieldValue.increment(cambios.morosos30),
      },
      {
        merge: true,
      },
    );
  }

  // RECIBO

  const pagoRef = db.collection("pagos").doc();

  const pagoData = {
    pagoId: pagoRef.id,

    grupoPagoId,

    socioId,

    dni: socio.dni || "",

    socioNombre: socio.nombreCompleto || socio.nombre || "",

    montoTotal: totalSocio,

    metodo,

    estado: "aprobado",

    cobradoPorId,
    cobradoPorNombre,

    paymentId,

    fecha: admin.firestore.FieldValue.serverTimestamp(),

    periodoPago: periodo,

    periodosAfectados: [...periodosAfectados],

    items: itemsPago,

    pagadorId: pagadorId || socioId,

    pagadorNombre: pagadorNombre || socio.nombreCompleto || socio.nombre || "",

    pagaPorGrupo,
  };

  // SOLO EL PAGO PRINCIPAL
  if (montoPagadoGrupo !== null) {
    pagoData.montoPagadoGrupo = montoPagadoGrupo;
  }

  batch.set(pagoRef, pagoData);

  // ESTADISTICAS PERIODO ACTUAL

  const estadisticasRef = db.collection("estadisticasMensuales").doc(periodo);

  let updateEstadisticas = {
    totalCobrado: admin.firestore.FieldValue.increment(totalActual),

    pendiente: admin.firestore.FieldValue.increment(-totalActual),

    cobradoCuotaSocial:
      admin.firestore.FieldValue.increment(cobradoCuotaSocial),

    cobradoActividades:
      admin.firestore.FieldValue.increment(cobradoActividades),
  };

  Object.entries(cobradoPorActividad).forEach(([actividad, monto]) => {
    updateEstadisticas[`actividades.${actividad}.cobrado`] =
      admin.firestore.FieldValue.increment(monto);
  });

  batch.set(estadisticasRef, updateEstadisticas, {
    merge: true,
  });

  // COMMIT

  await batch.commit();

  return {
    ok: true,
    socioId,
    totalCobrado: totalSocio,
  };
}

module.exports = {
  aplicarPago,
};
