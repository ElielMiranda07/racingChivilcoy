document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("formActualizarPartidoUno")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      let unoActualizarFyH = document.getElementById("unoActualizarFyH").value;
      let unoActualizarRival =
        document.getElementById("unoActualizarRival").value;
      let unoActualizarUbi = document.getElementById("unoActualizarUbi").value;

      document.getElementById("guardarFyH1").textContent = unoActualizarFyH;
      document.getElementById("guardarRival1").textContent = unoActualizarRival;
      document.getElementById("guardarUbi1").textContent = unoActualizarUbi;
    });
});

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("formActualizarPartidoDos")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      let dosActualizarFyH = document.getElementById("dosActualizarFyH").value;
      let dosActualizarRival =
        document.getElementById("dosActualizarRival").value;
      let dosActualizarUbi = document.getElementById("dosActualizarUbi").value;

      document.getElementById("guardarFyH2").textContent = dosActualizarFyH;
      document.getElementById("guardarRival2").textContent = dosActualizarRival;
      document.getElementById("guardarUbi2").textContent = dosActualizarUbi;
    });
});

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("formActualizarPartidoTres")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      let tresActualizarFyH =
        document.getElementById("tresActualizarFyH").value;
      let tresActualizarRival = document.getElementById(
        "tresActualizarRival"
      ).value;
      let tresActualizarUbi =
        document.getElementById("tresActualizarUbi").value;

      document.getElementById("guardarFyH3").textContent = tresActualizarFyH;
      document.getElementById("guardarRival3").textContent =
        tresActualizarRival;
      document.getElementById("guardarUbi3").textContent = tresActualizarUbi;
    });
});

// Configura Firebase normalmente
const firebaseConfig = {
  apiKey: "AIzaSyDCqe24Tu4-BKrxykDwTQvbDVIpoPBD8cY",
  authDomain: "reactss-26771.firebaseapp.com",
  projectId: "reactss-26771",
  storageBucket: "reactss-26771.appspot.com",
  messagingSenderId: "443520919767",
  appId: "1:443520919767:web:7a7a0cf32adad8d087e892",
  measurementId: "G-XBMQ9BWG70",
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Aquí consultas a Firestore

// Traer la colección "partidos" y mostrar en HTML
db.collection("partidos")
  .get()
  .then((querySnapshot) => {
    let contador = 1;
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Insertar datos en los contenedores del HTML
      document.getElementById(`guardarFyH${contador}`).textContent = data.fyh;
      document.getElementById(`guardarRival${contador}`).textContent =
        data.rival;
      document.getElementById(`guardarUbi${contador}`).textContent = data.ubi;

      contador++; // Para pasar al siguiente contenedor
    });
  })
  .catch((error) => {
    console.error("Error obteniendo los datos: ", error);
  });

// Guardar en Base de Datos la actualización de partidos
const form = document.getElementById("formGuardarPartidos");
const mensajeDeGuardar1 = document.getElementById("mensajeDeGuardar1");
const mensajeDeGuardar2 = document.getElementById("mensajeDeGuardar2");
const mensajeDeGuardar3 = document.getElementById("mensajeDeGuardar3");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  // Obtener los valores del formulario
  const fyh1 = document.getElementById("guardarFyH1").textContent;
  const rival1 = document.getElementById("guardarRival1").textContent;
  const ubi1 = document.getElementById("guardarUbi1").textContent;
  const partidoId1 = document.getElementById("partido1").textContent;

  const fyh2 = document.getElementById("guardarFyH2").textContent;
  const rival2 = document.getElementById("guardarRival2").textContent;
  const ubi2 = document.getElementById("guardarUbi2").textContent;
  const partidoId2 = document.getElementById("partido2").textContent;

  const fyh3 = document.getElementById("guardarFyH3").textContent;
  const rival3 = document.getElementById("guardarRival3").textContent;
  const ubi3 = document.getElementById("guardarUbi3").textContent;
  const partidoId3 = document.getElementById("partido3").textContent;

  // Validar Campos Llenos

  if (
    !fyh1 ||
    !rival1 ||
    !ubi1 ||
    !partidoId1 ||
    !fyh2 ||
    !rival2 ||
    !ubi2 ||
    !partidoId2 ||
    !fyh3 ||
    !rival3 ||
    !ubi3 ||
    !partidoId3
  ) {
    mensajeDeGuardar1.innerHTML = "Rellenar todos los campos";
    mensajeDeGuardar2.innerHTML = "Rellenar todos los campos";
    mensajeDeGuardar3.innerHTML = "Rellenar todos los campos";
    return;
  }

  // Actualizar el documento en Firestore
  db.collection("partidos")
    .doc(partidoId1)
    .set({
      fyh: fyh1,
      rival: rival1,
      ubi: ubi1,
    })
    .then(() => {
      mensajeDeGuardar1.innerHTML = " Actualizado correctamente.";
    })
    .catch((error) => {
      mensajeDeGuardar1.innerHTML =
        "Error actualizando el documento: " + JSON.stringify(error);
    });

  db.collection("partidos")
    .doc(partidoId2)
    .set({
      fyh: fyh2,
      rival: rival2,
      ubi: ubi2,
    })
    .then(() => {
      mensajeDeGuardar2.innerHTML = " Actualizado correctamente.";
    })
    .catch((error) => {
      mensajeDeGuardar2.innerHTML =
        "Error actualizando el documento: " + JSON.stringify(error);
    });

  db.collection("partidos")
    .doc(partidoId3)
    .set({
      fyh: fyh3,
      rival: rival3,
      ubi: ubi3,
    })
    .then(() => {
      mensajeDeGuardar3.innerHTML = "  Actualizado correctamente.";
    })
    .catch((error) => {
      mensajeDeGuardar3.innerHTML =
        "Error actualizando el documento: " + JSON.stringify(error);
    });
});

// FIN DE SECCIÍON PARTIDOS

// FIN DE SECCIÍON PARTIDOS

// FIN DE SECCIÍON PARTIDOS

//Inicio de sección Noticias

mensajeDeNoticia = document.getElementById("mensajeDeNoticia");

const formNoticia = document.getElementById("noticiaACargar");
formNoticia.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.getElementById("tituloACargar").value;
  const cuerpoNoticia = document.getElementById("cuerpoNoticiaACargar").value;
  const imagenPrincipal = document.getElementById("urlImagenPrincipalACargar")
    .files[0];
  const imagenSecundaria = document.getElementById("urlImagenSecundariaACargar")
    .files[0];
  const cuerpoNoticia2 = document.getElementById("cuerpoNoticiaACargar2").value;
  const copete = document.getElementById("copeteACargar").value;
  const categoria = document.querySelector('input[name="btnradio"]:checked').id;

  // 1. Obtener la cantidad actual de documentos en la colección "noticias"
  const noticiasRef = firebase.firestore().collection("noticias");
  const snapshot = await noticiasRef.get();
  const numeroNoticias = snapshot.size + 1;
  const nombreDocumento = `noticia ${numeroNoticias}`;

  // 2. Subir las imágenes a Firebase Storage
  const storageRef = firebase.storage().ref();
  const imagenRef = storageRef.child(`noticias/${imagenPrincipal.name}`);

  try {
    const snapshotImg1 = await imagenRef.put(imagenPrincipal);
    const downloadURL1 = await snapshotImg1.ref.getDownloadURL();

    let downloadURL2 = ""; // Valor predeterminado si no hay imagen secundaria

    if (imagenSecundaria) {
      const imagenRef2 = storageRef.child(`noticias/${imagenSecundaria.name}`);
      const snapshotImg2 = await imagenRef2.put(imagenSecundaria);
      downloadURL2 = await snapshotImg2.ref.getDownloadURL();
    }

    // 3. Guardar los datos en Firestore con el nombre de documento "noticia X"
    await noticiasRef.doc(nombreDocumento).set({
      titulo: titulo,
      copete: copete,
      cuerpoNoticia: cuerpoNoticia,
      cuerpoNoticia2: cuerpoNoticia2,
      imagenPrincipal: downloadURL1,
      imagenSecundaria: downloadURL2,
      fechaDeCarga: firebase.firestore.FieldValue.serverTimestamp(),
      categoria: categoria,
    });

    mensajeDeNoticia.innerHTML = `Noticia guardada con el nombre: ${nombreDocumento}`;

    setTimeout(() => {
      window.location.reload();
    }, 3000);
  } catch (error) {
    mensajeDeNoticia.innerHTML =
      `Error al guardar la noticia:` + JSON.stringify(error);
  }
});

// 1. Función para cargar y mostrar las noticias
async function cargarNoticias() {
  const noticiasRef = firebase.firestore().collection("noticias");

  try {
    // Obtener todos los documentos en la colección "noticias"
    const snapshot = await noticiasRef.get();

    // Contenedor donde se mostrarán las noticias
    const contenedorNoticias = document.getElementById("divContenedorNoticias");

    // Recorrer cada documento y crear la plantilla HTML
    snapshot.forEach((doc) => {
      const noticia = doc.data();
      const modalId = `${doc.id}`;
      const modalIdSinEspacios = modalId.replace(/\s+/g, "");

      // 2. Plantilla HTML para cada noticia
      const noticiaHTML = `<div class=" todas ${noticia.categoria} noticiaItem col-xl-4 col-lg-6 col-md-6 col-sm-12 col-12 my-2">
            <div class="noticias d-flex flex-column align-items-center text-center">
              <img src="${noticia.imagenPrincipal}" alt="" />
              <h2 class="mt-3 mb-3">${noticia.titulo}</h2>
              <p>
              ${noticia.copete}
              </p>
              <div>
                <button type="button" class="btn btn-sm btn-custom botonVerMas" data-bs-toggle="modal" data-bs-target="#${modalIdSinEspacios}">
                  Ver más
                </button>
              <div class="modal fade" id="${modalIdSinEspacios}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-scrollable">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h1 class="modal-title fs-5" id="exampleModalLabel">${noticia.titulo}</h1>
                      </div>
                      <div class="modal-body clearfix">
                        <img src="${noticia.imagenPrincipal}" alt="" class="imagenModal col-md-6 float-md-end mb-3 ms-md-3 p-0">
                        <p>
                          ${noticia.cuerpoNoticia}
                        </p>
                        <img src="${noticia.imagenSecundaria}" class="col-md-6 float-md-start mb-3 me-md-3 p-0" alt="">
                        <p>
                          ${noticia.cuerpoNoticia2}
                        </p>
                      </div>
                    <div class="modal-footer d-flex justify-content-center">
                      <button type="button" class="btn btn-sm btn-secondary botonVerMas" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`;
      contenedorNoticias.innerHTML += noticiaHTML;
    });
  } catch (error) {
    console.error("Error al cargar las noticias: ", error);
  }
}

//FINAL DE SECCIÓN NOTICIAS
//FINAL DE SECCIÓN NOTICIAS
//FINAL DE SECCIÓN NOTICIAS

//Incio de Sección Productos

mensajeDeProducto = document.getElementById("mensajeDeProducto");

const formProducto = document.getElementById("productoACargar");
formProducto.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.getElementById("tituloACargarProducto").value;
  const descripcionProducto = document.getElementById(
    "descripcionProducto"
  ).value;
  const imagenProducto = document.getElementById("imagenProducto").files[0];

  // 1. Obtener la cantidad actual de documentos en la colección "productos"
  const productosRef = firebase.firestore().collection("productos");
  const snapshot = await productosRef.get();
  const numeroProductos = snapshot.size + 1;
  const nombreDocumento = `producto ${numeroProductos}`;

  // 2. Subir las imágenes a Firebase Storage
  const storageRef = firebase.storage().ref();
  const imagenRef = storageRef.child(`productos/${imagenProducto.name}`);

  try {
    const snapshotImg1 = await imagenRef.put(imagenProducto);
    const downloadURL1 = await snapshotImg1.ref.getDownloadURL();

    // 3. Guardar los datos en Firestore con el nombre de documento "producto X"
    await productosRef.doc(nombreDocumento).set({
      titulo: titulo,
      imagen: downloadURL1,
      descripcion: descripcionProducto,
    });

    mensajeDeProducto.innerHTML = `Producto guardado con el nombre: ${nombreDocumento}`;

    setTimeout(() => {
      window.location.reload();
    }, 3000);
  } catch (error) {
    mensajeDeNoticia.innerHTML =
      `Error al guardar el producto:` + JSON.stringify(error);
  }
});

// 1. Función para cargar y mostrar los productos
async function cargarProductos() {
  const productosRef = firebase.firestore().collection("productos");

  try {
    // Obtener todos los documentos en la colección "noticias"
    const snapshot = await productosRef.get();

    // Contenedor donde se mostrarán las noticias
    const contenedorProductos = document.getElementById(
      "divContenedorProductos"
    );

    // Recorrer cada documento y crear la plantilla HTML
    snapshot.forEach((doc) => {
      const producto = doc.data();

      // 2. Plantilla HTML para cada noticia
      const productoHTML = `<div class="col-xl-2 col-lg-4 col-md-5 col-5 my-1 producto">
              <div class="d-flex flex-column align-items-center">
                <img src="${producto.imagen}" alt="" class="mt-2">
                <h4 class="mt-2">${producto.titulo}</h4>
                <p class="mt-1 text-center">${producto.descripcion}</p>
              </div>
            </div>`;

      contenedorProductos.innerHTML += productoHTML;
    });
  } catch (error) {
    console.error("Error al cargar los productos: ", error);
  }
}

// Llamada a la función para cargar las noticias al cargar la página
// Llamada a la función para cargar las noticias al cargar la página
window.onload = function () {
  cargarNoticias();
  cargarProductos();
};
