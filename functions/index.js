const {
  onCall,
  onRequest,
  HttpsError,
} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const mercadopago = require("mercadopago");

const functions = require("firebase-functions");

const { MercadoPagoConfig, Preference, Payment } = mercadopago;

admin.initializeApp();

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// Crear Socios (MANUAL Y CSV) /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.procesarSocios = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("Debes estar logueado");
  }

  const db = admin.firestore();

  const socios = request.data.socios || [];

  const resultados = [];

  for (const socio of socios) {
    try {
      const dni = socio.dni.trim();

      // EXISTE?

      const existente = await db
        .collection("socios")
        .where("dni", "==", dni)
        .limit(1)
        .get();

      let uid;

      // NUEVO SOCIO

      if (existente.empty) {
        const email = `dni_${dni}@socios.racing`;

        const userRecord = await admin.auth().createUser({
          email,
          password: "Test1234!",
          displayName: socio.nombre,
        });

        uid = userRecord.uid;
      } else {
        uid = existente.docs[0].id;
      }

      // NUMERO DE SOCIO

      let numeroDeSocio;

      if (socio.numeroDeSocio) {
        numeroDeSocio = Number(socio.numeroDeSocio);
      } else {
        numeroDeSocio = await db.runTransaction(async (transaction) => {
          const ref = db.collection("configuracion").doc("general");

          const doc = await transaction.get(ref);

          let ultimoNumeroSocio = 0;

          if (doc.exists) {
            ultimoNumeroSocio = doc.data().ultimoNumeroSocio || 0;
          }

          ultimoNumeroSocio++;

          transaction.set(
            ref,
            {
              ultimoNumeroSocio,
            },
            {
              merge: true,
            },
          );

          return ultimoNumeroSocio;
        });
      }

      // ACTUALIZAR ULTIMO NUMERO SI VIENE
      // UNO MAYOR DESDE CSV

      if (socio.numeroDeSocio) {
        await db.runTransaction(async (transaction) => {
          const ref = db.collection("configuracion").doc("general");

          const doc = await transaction.get(ref);

          let ultimoNumeroSocio = doc.data()?.ultimoNumeroSocio || 0;

          if (numeroDeSocio > ultimoNumeroSocio) {
            transaction.set(
              ref,
              {
                ultimoNumeroSocio: numeroDeSocio,
              },
              {
                merge: true,
              },
            );
          }
        });
      }

      // GUARDAR SOCIO

      await db
        .collection("socios")
        .doc(uid)
        .set(
          {
            numeroDeSocio,

            activo: true,

            dni,

            nombre: socio.nombre,

            nombreBusqueda: socio.nombre.toLowerCase(),

            mail: socio.mail || "",

            telefono: socio.telefono || "",

            primerLogin: true,

            rol: "socio",

            ultimaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
          },
          {
            merge: true,
          },
        );

      resultados.push({
        dni,
        uid,
        numeroDeSocio,
        error: false,
      });
    } catch (e) {
      resultados.push({
        dni: socio.dni,
        error: true,
      });
    }
  }

  return {
    resultados,
  };
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////// PAGOS con MercadoPago ////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const client = new MercadoPagoConfig({
  accessToken:
    "APP_USR-8919643491409246-031712-f013abf1fdbabee8229620616a6cec1f-99185919",
});

const cors = require("cors")({ origin: true });

exports.crearPreferencia = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const db = admin.firestore();

      console.log("BODY crearPreferencia:", req.body);

      const authorization = req.headers.authorization || "";
      const idToken = authorization.startsWith("Bearer ")
        ? authorization.split("Bearer ")[1]
        : null;

      if (!idToken) {
        return res.status(401).json({
          error: "Token de autenticación requerido",
        });
      }

      const decodedToken = await admin.auth().verifyIdToken(idToken);

      const uid = decodedToken.uid;

      const pagosSeleccionados = req.body?.pagos;

      if (
        !Array.isArray(pagosSeleccionados) ||
        pagosSeleccionados.length === 0
      ) {
        return res.status(400).json({
          error: "No se recibieron ítems para pagar",
        });
      }

      const socioRef = db.collection("socios").doc(uid);
      const socioDoc = await socioRef.get();

      if (!socioDoc.exists) {
        return res.status(404).json({
          error: "Socio no existe",
        });
      }

      const socioPagador = {
        id: socioDoc.id,
        ...socioDoc.data(),
      };

      const pagosValidados = await validarPagosPWA({
        uid,
        socioPagador,
        pagosSeleccionados,
      });

      const montoTotal = pagosValidados.reduce((acc, pagoSocio) => {
        const totalSocio = pagoSocio.items.reduce((sub, item) => {
          return sub + Number(item.monto || 0);
        }, 0);

        return acc + totalSocio;
      }, 0);

      if (montoTotal <= 0) {
        return res.status(400).json({
          error: "El monto total debe ser mayor a cero",
        });
      }

      const pagoPendienteRef = db.collection("pagosPendientes").doc();

      const pagoPendienteId = pagoPendienteRef.id;

      await pagoPendienteRef.set({
        pagoPendienteId,

        uid,
        pagadorId: uid,
        pagadorNombre: socioPagador.nombreCompleto || socioPagador.nombre || "",

        origen: "pwa",
        metodo: "mercadopago",

        estado: "pendiente",

        montoTotal,

        pagos: pagosValidados,

        preferenceId: null,
        paymentId: null,

        creadoEn: admin.firestore.FieldValue.serverTimestamp(),
        aprobadoEn: null,
        actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
      });

      const preference = new Preference(client);

      const response = await preference.create({
        body: {
          items: [
            {
              title: "Pago de cuotas y actividades",
              quantity: 1,
              currency_id: "ARS",
              unit_price: montoTotal,
            },
          ],

          metadata: {
            uid,
            pagoPendienteId,
          },

          external_reference: pagoPendienteId,

          payer: {
            email:
              socioPagador.mail ||
              socioPagador.email ||
              decodedToken.email ||
              "test@test.com",
          },

          back_urls: {
            success: "https://socios-racing.vercel.app/success.html",
            failure: "https://socios-racing.vercel.app/failure.html",
            pending: "https://socios-racing.vercel.app/pending.html",
          },

          auto_return: "approved",

          notification_url:
            "https://us-central1-reactss-26771.cloudfunctions.net/webhookMercadoPago",
        },
      });

      await pagoPendienteRef.update({
        preferenceId: response.id,
        initPoint: response.init_point,
        actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("Preferencia creada:", {
        pagoPendienteId,
        preferenceId: response.id,
        montoTotal,
      });

      return res.json({
        init_point: response.init_point,
        pagoPendienteId,
      });
    } catch (error) {
      console.error("🔥 ERROR crearPreferencia:", error);

      return res.status(500).json({
        error: error.message,
      });
    }
  });
});

async function validarPagosPWA({ uid, socioPagador, pagosSeleccionados }) {
  const db = admin.firestore();

  const pagosPorSocio = {};

  for (const item of pagosSeleccionados) {
    const socioId = item.socioId;

    if (!socioId) {
      throw new Error("Ítem sin socioId");
    }

    if (!pagosPorSocio[socioId]) {
      pagosPorSocio[socioId] = {
        socioId,
        socioNombre: item.socioNombre || "",
        items: [],
      };
    }

    pagosPorSocio[socioId].items.push({
      tipo: item.tipo,
      concepto: item.concepto || item.tipo,
      periodo: item.periodo || null,
      monto: Number(item.monto || 0),
    });
  }

  const pagosValidados = [];

  for (const pagoSocio of Object.values(pagosPorSocio)) {
    const puedePagarEseSocio = puedePagadorPagarSocio({
      uid,
      socioPagador,
      socioIdAPagar: pagoSocio.socioId,
    });

    if (!puedePagarEseSocio) {
      throw new Error("No tenés permiso para pagar deudas de este socio");
    }

    const socioDoc = await db.collection("socios").doc(pagoSocio.socioId).get();

    if (!socioDoc.exists) {
      throw new Error(`Socio no existe: ${pagoSocio.socioId}`);
    }

    const socio = {
      id: socioDoc.id,
      ...socioDoc.data(),
    };

    const itemsValidados = validarItemsContraSocio({
      socio,
      items: pagoSocio.items,
    });

    pagosValidados.push({
      socioId: socio.id,
      socioNombre:
        socio.nombreCompleto || socio.nombre || pagoSocio.socioNombre || "",
      items: itemsValidados,
    });
  }

  return pagosValidados;
}

function puedePagadorPagarSocio({ uid, socioPagador, socioIdAPagar }) {
  if (uid === socioIdAPagar) {
    return true;
  }

  const esTitular = socioPagador.grupoFamiliar?.rol === "titular";

  const miembros = socioPagador.miembrosGrupo || [];

  return esTitular && miembros.includes(socioIdAPagar);
}

function validarItemsContraSocio({ socio, items }) {
  const itemsValidados = [];

  for (const item of items) {
    const montoCliente = Number(item.monto || 0);

    if (montoCliente <= 0) {
      throw new Error("Monto inválido");
    }

    if (item.tipo === "mora") {
      const concepto = item.concepto;

      const periodo = item.periodo;

      if (!concepto || !periodo) {
        throw new Error("Mora incompleta");
      }

      const listaMoras = socio.moras?.[concepto] || [];

      if (!Array.isArray(listaMoras)) {
        throw new Error(`No existe mora para ${concepto}`);
      }

      const moraEncontrada = listaMoras.find((mora) => {
        return mora.periodo === periodo;
      });

      if (!moraEncontrada) {
        throw new Error(`No existe mora ${concepto} del período ${periodo}`);
      }

      const montoReal = Number(moraEncontrada.monto || 0);

      if (montoReal !== montoCliente) {
        throw new Error("El monto de una mora no coincide con Firestore");
      }

      itemsValidados.push({
        tipo: "mora",
        concepto,
        periodo,
        monto: montoReal,
      });

      continue;
    }

    const tipo = item.tipo;

    const montoReal = Number(socio.deudas?.[tipo] || 0);

    if (!montoReal) {
      throw new Error(`No existe deuda actual para ${tipo}`);
    }

    if (montoReal !== montoCliente) {
      throw new Error(`El monto de ${tipo} no coincide con Firestore`);
    }

    itemsValidados.push({
      tipo,
      monto: montoReal,
    });
  }

  return itemsValidados;
}

async function procesarPagoPendienteMercadoPago({
  pagoPendienteId,
  paymentId,
}) {
  const db = admin.firestore();

  const pagoPendienteRef = db
    .collection("pagosPendientes")
    .doc(pagoPendienteId);

  const pagoPendienteDoc = await pagoPendienteRef.get();

  if (!pagoPendienteDoc.exists) {
    throw new Error("Pago pendiente no existe");
  }

  const pagoPendiente = pagoPendienteDoc.data();

  if (pagoPendiente.estado === "aprobado") {
    console.log("Pago pendiente ya procesado:", pagoPendienteId);
    return {
      ok: true,
      yaProcesado: true,
    };
  }

  if (pagoPendiente.estado === "procesando") {
    console.log("Pago pendiente en procesamiento:", pagoPendienteId);
    return {
      ok: true,
      procesando: true,
    };
  }

  await pagoPendienteRef.update({
    estado: "procesando",
    paymentId,
    actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
  });

  const grupoPagoId = db.collection("gruposPago").doc().id;

  const pagos = pagoPendiente.pagos || [];

  for (const pagoSocio of pagos) {
    await aplicarPago({
      socioId: pagoSocio.socioId,
      items: pagoSocio.items,

      metodo: "mercadopago",

      paymentId,

      pagadorId: pagoPendiente.pagadorId,
      pagadorNombre: pagoPendiente.pagadorNombre,

      pagaPorGrupo: pagos.length > 1,

      grupoPagoId,

      montoPagadoGrupo: pagoPendiente.montoTotal,
    });
  }

  await pagoPendienteRef.update({
    estado: "aprobado",
    paymentId,
    aprobadoEn: admin.firestore.FieldValue.serverTimestamp(),
    actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log("✅ Pago pendiente procesado:", {
    pagoPendienteId,
    paymentId,
    montoTotal: pagoPendiente.montoTotal,
  });

  return {
    ok: true,
    pagoPendienteId,
    paymentId,
  };
}

// PROCESAR PAGO COMPLETO

async function procesarPagoSocio(uid, paymentId = null) {
  const db = admin.firestore();

  const configDoc = await db.collection("configuracion").doc("general").get();

  const configuracion = configDoc.data() || {};

  const mesesVitalicio = configuracion.facturacion?.mesesVitalicio ?? 500;

  // TRAER SOCIO

  const socioRef = db.collection("socios").doc(uid);

  const socioDoc = await socioRef.get();

  if (!socioDoc.exists) {
    throw new Error("Socio no existe");
  }

  const socio = socioDoc.data();

  // EVITAR DOBLE PROCESAMIENTO

  if (paymentId && socio.paymentId === paymentId) {
    console.log("Pago ya procesado");

    return;
  }

  // FECHA / PERIODO

  const fecha = new Date();

  const anio = fecha.getFullYear();

  const mes = String(fecha.getMonth() + 1).padStart(2, "0");

  const periodo = `${anio}_${mes}`;

  // VARIABLES

  let totalCobradoAhora = 0;

  let sociosActualizados = 0;

  const batch = db.batch();

  // FUNCION ACTUALIZAR SOCIO

  function prepararActualizacion(ref, data) {
    const mesesActuales = data.socioVitalicio?.mesesPagos || 0;

    const nuevosMeses = mesesActuales + 1;

    const esVitalicio = nuevosMeses >= mesesVitalicio;

    totalCobradoAhora += data.deudaActual || 0;

    sociosActualizados++;

    batch.update(ref, {
      deudaActual: 0,

      deudaConsolidada: 0,

      deudas: {},

      ultimoPago: admin.firestore.FieldValue.serverTimestamp(),

      socioVitalicio: {
        mesesPagos: nuevosMeses,

        esVitalicio: esVitalicio,
      },
    });
  }

  // TITULAR DE GRUPO

  if (socio.grupoFamiliar?.rol === "titular") {
    prepararActualizacion(socioRef, socio);

    const miembros = socio.miembrosGrupo || [];

    for (const miembroId of miembros) {
      const miembroRef = db.collection("socios").doc(miembroId);

      const miembroDoc = await miembroRef.get();

      if (!miembroDoc.exists) continue;

      prepararActualizacion(miembroRef, miembroDoc.data());
    }
  }

  // SOCIO NORMAL
  else {
    prepararActualizacion(socioRef, socio);
  }

  // COMMIT SOCIOS

  await batch.commit();

  // ACTUALIZAR DASHBOARD GENERAL

  await db
    .collection("estadisticas")
    .doc("dashboard")
    .update({
      cuotasImpagas: admin.firestore.FieldValue.increment(-sociosActualizados),

      cuotasAlDia: admin.firestore.FieldValue.increment(sociosActualizados),
    });

  // ACTUALIZAR ESTADISTICAS MENSUALES

  const estadisticasRef = db.collection("estadisticasMensuales").doc(periodo);

  await db.runTransaction(async (transaction) => {
    const estadisticasDoc = await transaction.get(estadisticasRef);

    if (!estadisticasDoc.exists) return;

    const data = estadisticasDoc.data();

    transaction.update(estadisticasRef, {
      totalCobrado: (data.totalCobrado || 0) + totalCobradoAhora,

      pendiente: Math.max(0, (data.pendiente || 0) - totalCobradoAhora),
    });
  });

  // LOG

  console.log("✅ Pago procesado:", {
    uid,
    sociosActualizados,
    totalCobradoAhora,
  });
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////// Webhook MercadoPago /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.webhookMercadoPago = onRequest(async (req, res) => {
  try {
    console.log("🔥 WEBHOOK RECIBIDO");
    console.log("BODY:", req.body);
    console.log("QUERY:", req.query);

    const paymentId =
      req.body?.data?.id || req.query["data.id"] || req.query.id;

    if (!paymentId) {
      console.log("No hay paymentId");
      return res.status(200).send("OK");
    }

    const paymentClient = new Payment(client);

    const payment = await paymentClient.get({
      id: paymentId,
    });

    console.log("Payment status:", payment.status);

    if (payment.status !== "approved") {
      return res.status(200).send("OK");
    }

    const pagoPendienteId =
      payment.metadata?.pago_pendiente_id ||
      payment.metadata?.pagoPendienteId ||
      payment.external_reference;

    if (!pagoPendienteId) {
      console.log("No hay pagoPendienteId en metadata/external_reference");
      return res.status(200).send("OK");
    }

    await procesarPagoPendienteMercadoPago({
      pagoPendienteId,
      paymentId: String(payment.id),
    });

    console.log("✅ Pago aprobado y procesado:", pagoPendienteId);

    return res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Error webhook:", error);

    return res.status(200).send("OK");
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////// Confirmar pago MercadoPago /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.confirmarPago = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log("🔎 Confirmar pago request:", req.body);

      const paymentId = req.body?.paymentId;

      if (!paymentId) {
        return res.status(400).json({
          error: "paymentId requerido",
        });
      }

      const paymentClient = new Payment(client);

      const payment = await paymentClient.get({
        id: paymentId,
      });

      console.log("💳 Payment status:", payment.status);

      if (payment.status !== "approved") {
        return res.json({
          success: false,
          status: payment.status,
        });
      }

      const pagoPendienteId =
        payment.metadata?.pago_pendiente_id ||
        payment.metadata?.pagoPendienteId ||
        payment.external_reference;

      if (!pagoPendienteId) {
        return res.status(400).json({
          error: "pagoPendienteId no encontrado",
        });
      }

      await procesarPagoPendienteMercadoPago({
        pagoPendienteId,
        paymentId: String(payment.id),
      });

      console.log("✅ Pago confirmado manualmente:", pagoPendienteId);

      return res.json({
        success: true,
        message: "Pago acreditado correctamente",
        pagoPendienteId,
      });
    } catch (error) {
      console.error("❌ Error confirmarPago:", error);

      return res.status(500).json({
        error: error.message,
      });
    }
  });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////// Calcular Deudas mensuales de Socios ////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.calcularDeudas = onCall(async (request) => {
  // 🔐 SEGURIDAD

  if (!request.auth) {
    throw new Error("No autenticado");
  }

  const db = admin.firestore();

  // 🔒 VALIDAR ADMIN

  const userDoc = await db.collection("usuarios").doc(request.auth.uid).get();

  if (!userDoc.exists || userDoc.data().role !== "admin") {
    throw new Error("Solo admin");
  }

  // 📅 FECHA ACTUAL

  const fecha = new Date();

  const anio = fecha.getFullYear();

  const mes = String(fecha.getMonth() + 1).padStart(2, "0");

  const periodo = `${anio}_${mes}`;

  // 📅 PERIODO ANTERIOR

  const fechaAnterior = new Date(anio, Number(mes) - 2, 1);

  const anioAnterior = fechaAnterior.getFullYear();

  const mesAnterior = String(fechaAnterior.getMonth() + 1).padStart(2, "0");

  const periodoAnterior = `${anioAnterior}_${mesAnterior}`;

  // 1️⃣ TRAER CONFIGURACION

  const configDoc = await db.collection("configuracion").doc("general").get();

  const cuotaSocial = configDoc.data()?.cuotaSocial || 0;

  // 2️⃣ TRAER ACTIVIDADES + PRECIOS

  const actividadesSnap = await db.collection("actividades").get();

  const categoriasSnap = await db.collectionGroup("categorias").get();

  let precios = {};

  let actividadesActivas = {};

  let categoriasInfo = {};

  actividadesSnap.forEach((doc) => {
    const data = doc.data();

    // 🔥 IGNORAR PAUSADAS

    if (!data.activa) return;

    actividadesActivas[doc.id] = {
      nombre: data.nombre,
    };

    precios[doc.id] = {};
  });

  categoriasSnap.forEach((doc) => {
    const actividadId = doc.ref.parent.parent.id;

    if (!precios[actividadId]) return;

    precios[actividadId][doc.id] = doc.data().precio || 0;

    if (!categoriasInfo[actividadId]) {
      categoriasInfo[actividadId] = {};
    }

    categoriasInfo[actividadId][doc.id] = {
      nombre: doc.data().nombre || doc.id,
    };
  });

  // 3️⃣ TRAER SOCIOS

  const sociosSnap = await db.collection("socios").get();

  // 🔥 CACHE SOCIOS

  let sociosMap = {};

  sociosSnap.forEach((doc) => {
    sociosMap[doc.id] = {
      id: doc.id,
      ref: doc.ref,
      ...doc.data(),
    };
  });

  // 📊 ESTADISTICAS GLOBALES

  let estadisticasGlobales = {
    cuotaSocial: 0,

    totalGeneral: 0,

    actividades: {},
  };

  // DASHBOARD

  let cuotasAlDia = 0;

  let cuotasImpagas = 0;

  let morosos30 = 0;

  // 4️⃣ CALCULAR DEUDAS

  let batch = db.batch();

  let contador = 0;

  for (const socioId in sociosMap) {
    const socio = sociosMap[socioId];

    // 🔥 IGNORAR INACTIVOS

    if (socio.activo === false) continue;

    // 🔥 VITALICIOS

    const esVitalicio = socio.esVitalicio || false;

    // 🔥 MORAS EXISTENTES

    let moras = socio.moras || {};

    // 🔥 DEUDAS ANTERIORES

    const deudasAnteriores = socio.deudas || {};

    // 🔥 PASAR A MORAS CON PERIODO

    Object.entries(deudasAnteriores).forEach(([concepto, monto]) => {
      if (!monto || monto <= 0) return;

      // 🔥 NORMALIZAR FORMATO VIEJO

      if (!Array.isArray(moras[concepto])) {
        moras[concepto] = [];
      }

      // 🔥 EVITAR DUPLICADOS

      const yaExiste = moras[concepto].some(
        (m) => m.periodo === periodoAnterior,
      );

      if (yaExiste) return;

      // 🔥 CREAR MORA

      moras[concepto].push({
        periodo: periodoAnterior,

        monto,

        fecha: admin.firestore.Timestamp.fromDate(
          new Date(anioAnterior, Number(mesAnterior) - 1, 1),
        ),
      });
    });

    // 🔥 NUEVAS DEUDAS

    let deuda = 0;

    let detalleDeudas = {};

    // CUOTA SOCIAL

    if (!esVitalicio) {
      detalleDeudas["cuotaSocial"] = cuotaSocial;

      deuda += cuotaSocial;

      estadisticasGlobales.cuotaSocial += cuotaSocial;
    }

    // 🔥 CONTROL ACTIVIDADES UNICAS

    let actividadesContadas = {};

    // 🔥 CONTROL CATEGORIAS UNICAS

    let categoriasContadas = {};

    // ACTIVIDADES

    if (socio.actividades) {
      Object.entries(socio.actividades).forEach(([actId, actData]) => {
        if (!actData.activo) return;

        if (!actividadesActivas[actId]) return;

        const categoriaId = actData.categoria;

        // Crear actividad si no existe
        if (!estadisticasGlobales.actividades[actId]) {
          estadisticasGlobales.actividades[actId] = {
            total: 0,
            cantidadSocios: 0,
            nombre: actividadesActivas[actId]?.nombre || actId,
            categorias: {},
          };
        }

        // Crear categoría si no existe
        if (!estadisticasGlobales.actividades[actId].categorias[categoriaId]) {
          estadisticasGlobales.actividades[actId].categorias[categoriaId] = {
            nombre:
              categoriasInfo?.[actId]?.[categoriaId]?.nombre || categoriaId,
            total: 0,
            cantidadSocios: 0,
            cobrado: 0,
          };
        }

        const precio = precios[actId]?.[categoriaId];

        if (!precio) return;

        deuda += precio;

        detalleDeudas[actId] = precio;

        // FACTURACIÓN

        estadisticasGlobales.actividades[actId].total += precio;

        estadisticasGlobales.actividades[actId].categorias[categoriaId].total +=
          precio;

        // CONTAR SOCIOS POR ACTIVIDAD

        if (!actividadesContadas[actId]) {
          estadisticasGlobales.actividades[actId].cantidadSocios += 1;

          actividadesContadas[actId] = true;
        }

        // CONTAR SOCIOS POR CATEGORÍA

        const keyCategoria = `${actId}_${categoriaId}`;

        if (!categoriasContadas[keyCategoria]) {
          estadisticasGlobales.actividades[actId].categorias[
            categoriaId
          ].cantidadSocios += 1;

          categoriasContadas[keyCategoria] = true;
        }
      });
    }

    // 🔥 TOTAL MORAS

    let totalMoras = 0;

    Object.values(moras).forEach((lista) => {
      if (!Array.isArray(lista)) return;

      lista.forEach((mora) => {
        totalMoras += mora.monto || 0;
      });
    });

    // 🔥 ESTADO CUENTA

    let estadoCuenta = "al_dia";

    if (totalMoras > 0) {
      estadoCuenta = "moroso";
    } else if (deuda > 0) {
      estadoCuenta = "deuda";
    }

    // 🔥 DASHBOARD

    if (estadoCuenta === "al_dia") {
      cuotasAlDia++;
    } else if (estadoCuenta === "deuda") {
      cuotasImpagas++;
    } else if (estadoCuenta === "moroso") {
      morosos30++;
    }

    // 🔥 GUARDAR CACHE

    sociosMap[socioId].deudaActual = deuda;

    sociosMap[socioId].deudas = detalleDeudas;

    sociosMap[socioId].moras = moras;

    sociosMap[socioId].estadoCuenta = estadoCuenta;

    // 🔥 TOTAL GENERAL

    estadisticasGlobales.totalGeneral += deuda;
  }

  // 5️⃣ GUARDAR SOCIOS

  for (const socioId in sociosMap) {
    const socio = sociosMap[socioId];

    // GUARDAR

    batch.update(socio.ref, {
      deudaActual: socio.deudaActual || 0,

      deudas: socio.deudas || {},

      moras: socio.moras || {},

      estadoCuenta: socio.estadoCuenta || "al_dia",

      ultimoCalculo: admin.firestore.FieldValue.serverTimestamp(),
    });

    contador++;

    // LIMITE BATCH

    if (contador === 400) {
      await batch.commit();

      batch = db.batch();

      contador = 0;
    }
  }

  // 🔥 GUARDAR RESTANTE

  if (contador > 0) {
    await batch.commit();
  }

  // 6️⃣ ESTADISTICAS MENSUALES

  const estadisticasFinales = {
    cuotaSocial: estadisticasGlobales.cuotaSocial,

    totalGeneral: estadisticasGlobales.totalGeneral,

    actividades: estadisticasGlobales.actividades,

    totalCobrado: 0,

    pendiente: estadisticasGlobales.totalGeneral,

    fechaCalculo: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db
    .collection("estadisticasMensuales")
    .doc(periodo)
    .set(estadisticasFinales, {
      merge: true,
    });

  // 7️⃣ DASHBOARD GENERAL

  const totalSocios = sociosSnap.size;

  await db.collection("estadisticas").doc("dashboard").set(
    {
      totalSocios,

      cuotasAlDia,

      cuotasImpagas,

      morosos30,
    },
    {
      merge: true,
    },
  );

  // ✅ RESPUESTA

  return {
    ok: true,

    mensaje: "Deudas calculadas correctamente",

    procesados: sociosSnap.size,

    periodo,
  };
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////// Registrar Pago Manual //////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// IMPORTAR TU MODULO
const { aplicarPago } = require("./pagos/aplicarPago");

exports.registrarPagoManual = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Usuario no autenticado");
  }

  const db = admin.firestore();

  const usuarioDoc = await db
    .collection("usuarios")
    .doc(request.auth.uid)
    .get();

  if (!usuarioDoc.exists || usuarioDoc.data()?.role !== "admin") {
    throw new HttpsError("permission-denied", "Solo administradores");
  }

  const usuarioNombre = usuarioDoc.data()?.name || "";

  console.log("DATOS RECIBIDOS:", JSON.stringify(request.data, null, 2));

  const pagos = request.data?.pagos;

  if (!Array.isArray(pagos) || pagos.length === 0) {
    throw new HttpsError("invalid-argument", "No se recibieron pagos");
  }

  // TITULAR DEL GRUPO

  const primerSocioId = pagos[0].socioId;

  const primerSocioDoc = await db.collection("socios").doc(primerSocioId).get();

  if (!primerSocioDoc.exists) {
    throw new Error("Socio inexistente");
  }

  const primerSocio = primerSocioDoc.data();

  const pagoGrupal = pagos.length > 1;

  let titularId = primerSocioId;
  let titularNombre = primerSocio.nombreCompleto || primerSocio.nombre || "";

  if (primerSocio.grupoFamiliar?.id) {
    titularId = primerSocio.grupoFamiliar.id.replace("grupo_", "");

    const titularDoc = await db.collection("socios").doc(titularId).get();

    if (!titularDoc.exists) {
      throw new Error(`No existe el titular del grupo: ${titularId}`);
    }

    const titularData = titularDoc.data();

    titularNombre = titularData.nombreCompleto || titularData.nombre || "";
  }

  // TOTAL DEL PAGO DEL GRUPO

  const grupoPagoId = pagoGrupal ? db.collection("pagos").doc().id : null;
  let montoPagadoGrupo = 0;

  pagos.forEach((pago) => {
    pago.items.forEach((item) => {
      montoPagadoGrupo += Number(item.monto || 0);
    });
  });

  // PAGOS

  const resultados = [];

  for (const pago of pagos) {
    const esTitular = pago.socioId === titularId;

    const socioDoc = await db.collection("socios").doc(pago.socioId).get();

    const socioData = socioDoc.data();

    const pagadorIdReal = pagoGrupal ? titularId : pago.socioId;

    const pagadorNombreReal = pagoGrupal
      ? titularNombre
      : socioData.nombreCompleto || socioData.nombre || "";

    const resultado = await aplicarPago({
      socioId: pago.socioId,

      items: pago.items,

      metodo: "manual",

      cobradoPorId: request.auth.uid,

      cobradoPorNombre: usuarioNombre,

      pagadorId: pagadorIdReal,

      pagadorNombre: pagadorNombreReal,

      pagaPorGrupo: pagoGrupal ? !esTitular : false,

      grupoPagoId,

      montoPagadoGrupo: pagoGrupal && esTitular ? montoPagadoGrupo : null,
    });

    resultados.push(resultado);
  }

  // DETALLE DEL PAGO GRUPAL

  if (pagoGrupal) {
    const pagosGrupoSnapshot = await db
      .collection("pagos")
      .where("grupoPagoId", "==", grupoPagoId)
      .get();

    const detalleGrupo = [];

    let reciboTitularRef = null;

    pagosGrupoSnapshot.forEach((doc) => {
      const pago = doc.data();

      detalleGrupo.push({
        pagoId: pago.pagoId,
        socioId: pago.socioId,
        socioNombre: pago.socioNombre,
        montoTotal: pago.montoTotal,
        pagaPorGrupo: pago.pagaPorGrupo,
      });

      if (pago.socioId === titularId) {
        reciboTitularRef = doc.ref;
      }
    });

    if (reciboTitularRef) {
      await reciboTitularRef.update({
        detalleGrupo,
      });
    }
  }

  return {
    ok: true,
    grupoPagoId,
    titularId,
    montoPagadoGrupo,
    resultados,
  };
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////// Crear Usuario Sitema ///////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.crearUsuarioSistema = onCall(async (request) => {
  // AUTENTICACIÓN

  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Debe iniciar sesión.");
  }

  // VERIFICAR ADMIN

  const solicitante = await admin
    .firestore()
    .collection("usuarios")
    .doc(request.auth.uid)
    .get();

  if (!solicitante.exists) {
    throw new HttpsError("permission-denied", "Usuario inexistente.");
  }

  const datosSolicitante = solicitante.data();

  if (datosSolicitante.role !== "admin") {
    throw new HttpsError("permission-denied", "No posee permisos.");
  }

  // DATOS
  console.log("request.data:", request.data);

  const { nombre, email, password, accesos, permisos } = request.data;

  if (!nombre || !email || !password) {
    throw new HttpsError("invalid-argument", "Faltan datos.");
  }

  // CREAR AUTH

  const nuevoUsuario = await admin.auth().createUser({
    email,
    password,
    displayName: nombre,
  });

  // CREAR FIRESTORE

  await admin
    .firestore()
    .collection("usuarios")
    .doc(nuevoUsuario.uid)
    .set({
      name: nombre,

      email,

      role: "admin",

      accesos: accesos || {},

      permisos: permisos || {},

      creado: admin.firestore.FieldValue.serverTimestamp(),
    });

  return {
    ok: true,
    uid: nuevoUsuario.uid,
  };
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////// Notificaciones /////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
