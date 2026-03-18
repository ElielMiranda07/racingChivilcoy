const { onCall, onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const mercadopago = require("mercadopago");

const { MercadoPagoConfig, Preference, Payment } = mercadopago;

admin.initializeApp();

///////////// Esportar socios individualmente /////////////

exports.crearUsuarioSocio = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("Debes estar logueado");
  }

  const dni = request.data.dni;
  const nombre = request.data.nombre;

  const email = `dni_${dni}@socios.racing`;

  const userRecord = await admin.auth().createUser({
    email: email,
    password: "Test1234!",
    displayName: nombre,
  });

  return {
    uid: userRecord.uid,
  };
});

///////////// Exportar socios en Bloques /////////////

exports.crearUsuariosSociosBatch = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("Debes estar logueado");
  }

  const socios = request.data.socios;

  const resultados = [];

  for (const socio of socios) {
    try {
      const dni = socio.dni.trim();
      const nombre = socio.nombre;

      const email = `dni_${dni}@socios.racing`;

      const userRecord = await admin.auth().createUser({
        email,
        password: "Test1234!",
        displayName: nombre,
      });

      resultados.push({
        dni,
        uid: userRecord.uid,
      });
    } catch (error) {
      resultados.push({
        dni: socio.dni,
        error: true,
      });
    }
  }

  return { resultados };
});

///////////// PAGOS con MercadoPago /////////////

const client = new MercadoPagoConfig({
  accessToken:
    "APP_USR-8919643491409246-031712-f013abf1fdbabee8229620616a6cec1f-99185919",
});

const cors = require("cors")({ origin: true });

exports.crearPreferencia = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log("BODY:", req.body);

      const uid = req.body?.uid;

      if (!uid) {
        return res.status(400).json({ error: "UID no recibido" });
      }

      // 🔥 Validar que el usuario exista
      const userRef = admin.firestore().collection("socios").doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: "Usuario no existe" });
      }

      const preference = new Preference(client);

      const response = await preference.create({
        body: {
          items: [
            {
              title: "Cuota mensual",
              quantity: 1,
              currency_id: "ARS",
              unit_price: 10, // después podés hacerlo dinámico
            },
          ],

          metadata: { uid },

          // 🔥 MUY IMPORTANTE EN PRODUCCIÓN
          payer: {
            email: userDoc.data().email || "test@test.com",
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

      console.log("PREFERENCIA OK:", response.id);

      res.json({
        init_point: response.init_point,
      });
    } catch (error) {
      console.error("🔥 ERROR crearPreferencia:", error);
      res.status(500).json({ error: error.message });
    }
  });
});

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

    if (payment.status === "approved") {
      const uid = payment.metadata?.uid;

      if (!uid) {
        console.log("No hay UID en metadata");
        return res.status(200).send("OK");
      }

      const ref = admin.firestore().collection("socios").doc(uid);
      const doc = await ref.get();

      if (!doc.exists) {
        console.log("Usuario no existe en Firestore");
        return res.status(200).send("OK");
      }

      // 🔥 Evitar duplicados
      if (doc.data().estadoCuota === "al_dia") {
        console.log("Ya estaba al día");
        return res.status(200).send("OK");
      }

      await ref.update({
        estadoCuota: "al_dia",
        ultimoPago: new Date(),
      });

      console.log("✅ Pago aprobado y actualizado:", uid);
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Error webhook:", error);
    res.status(200).send("OK"); // 👈 IMPORTANTE (MP reintenta si tirás error)
  }
});

exports.confirmarPago = onRequest(async (req, res) => {
  try {
    console.log("🔎 Confirmar pago request:", req.body);

    const paymentId = req.body?.paymentId;

    if (!paymentId) {
      return res.status(400).json({ error: "paymentId requerido" });
    }

    const paymentClient = new Payment(client);

    const payment = await paymentClient.get({
      id: paymentId,
    });

    console.log("💳 Payment:", payment);

    if (payment.status !== "approved") {
      return res.json({
        success: false,
        status: payment.status,
      });
    }

    const uid = payment.metadata?.uid;

    if (!uid) {
      return res.status(400).json({ error: "UID no encontrado en metadata" });
    }

    const ref = admin.firestore().collection("socios").doc(uid);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Usuario no existe" });
    }

    // 🔥 Evitar duplicados
    if (doc.data().estadoCuota === "al_dia") {
      console.log("⚠️ Ya estaba al día:", uid);

      return res.json({
        success: true,
        message: "Ya estaba al día",
      });
    }

    await ref.update({
      estadoCuota: "al_dia",
      ultimoPago: new Date(),
      paymentId: paymentId,
    });

    console.log("✅ Pago confirmado manualmente:", uid);

    res.json({
      success: true,
      message: "Pago acreditado correctamente",
    });
  } catch (error) {
    console.error("❌ Error confirmarPago:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});
