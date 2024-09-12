// Configurar Firebase normalmente
const firebaseConfig = {
  apiKey: "AIzaSyDCqe24Tu4-BKrxykDwTQvbDVIpoPBD8cY",
  authDomain: "reactss-26771.firebaseapp.com",
  projectId: "reactss-26771",
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
