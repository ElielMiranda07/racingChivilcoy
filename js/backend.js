// Configurar Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDCqe24Tu4-BKrxykDwTQvbDVIpoPBD8cY",
  authDomain: "reactss-26771.firebaseapp.com",
  projectId: "reactss-26771",
  storageBucket: "reactss-26771.appspot.com",
  messagingSenderId: "443520919767",
  appId: "1:443520919767:web:7a7a0cf32adad8d087e892",
  measurementId: "G-XBMQ9BWG70",
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

//Login con Google
document.getElementById("loginGoogle").addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth
    .signInWithPopup(provider)
    .then((result) => {
      // Usuario autenticado correctamente
      const user = result.user;
      console.log("Usuario autenticado:", user);

      // Verificar y crear el usuario en Firestore si es nuevo
      checkAndCreateUser(user);
    })
    .catch((error) => {
      console.error("Error al iniciar sesión:", error);
    });
});

// Verificar si el usuario existe en Firestore y crearlo si no existe
function checkAndCreateUser(user) {
  const userRef = db.collection("usuarios").doc(user.uid);

  // Verificar si el usuario ya está en Firestore
  userRef.get().then((doc) => {
    if (!doc.exists) {
      // El usuario no existe, crearlo en Firestore
      userRef
        .set({
          name: user.displayName,
          email: user.email,
          role: "user", // Rol predeterminado
        })
        .then(() => {
          console.log("Usuario creado exitosamente en Firestore");
          checkUserRole(user); // Después de crear, verificar el rol
        })
        .catch((error) => {
          console.error("Error al crear el usuario en Firestore:", error);
        });
    } else {
      console.log("El usuario ya existe en Firestore");
      checkUserRole(user); // El usuario ya existe, verificar el rol
    }
  });
}

// Verificar el rol del usuario después de autenticarse
function checkUserRole(user) {
  const userRef = db.collection("usuarios").doc(user.uid);

  userRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        if (userData.role === "admin") {
          // Redirigir a la página de administración si es admin
          window.location.href = "../pages/backend.admin.html";
        } else {
          // Si no es admin, mostrar mensaje y cerrar sesión
          alert("No tienes permisos para acceder a esta página.");
          auth.signOut();
        }
      } else {
        // Si no existe el documento, cerrar sesión
        alert("Usuario no registrado en la base de datos.");
        auth.signOut();
      }
    })
    .catch((error) => {
      console.error("Error al verificar el rol del usuario:", error);
      alert("Error al verificar el rol del usuario.");
      auth.signOut(); // Cerrar sesión en caso de error
    });
}
// Aquí consultas a Firestore
