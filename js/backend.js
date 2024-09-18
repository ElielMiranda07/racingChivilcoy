// Configurar Firebase normalmente
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASURAMENT_ID,
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Aquí consultas a Firestore

document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const usuarioInput = document.getElementById("inputUsuario").value;
    const contraseñaInput = document.getElementById("inputContraseña").value;

    db.collection("usuarioContraseña")
      .get()
      .then((snapshot) => {
        let usuarioEncontrado = false;
        let mensajeDatosIncorrectos = document.getElementById(
          "mensajeDatosIncorrectos"
        );

        snapshot.forEach((doc) => {
          const data = doc.data();
          const usuarioFirestore = data.usuario;
          const contraseñaFirestore = data.contraseña;

          if (
            usuarioInput === usuarioFirestore &&
            contraseñaInput === contraseñaFirestore
          ) {
            usuarioEncontrado = true;

            window.location.href = "./backend.admin.html";
          }
        });

        if (!usuarioEncontrado) {
          mensajeDatosIncorrectos.innerHTML =
            "Usuario y/o Contraseña incorrecto/s";
        }
      })
      .catch((error) => {
        console.error("Error obteniendo los datos: ", error);
      });
  });
