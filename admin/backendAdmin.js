document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("formActualizarPartidoUno")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const action = event.submitter.value; // Capturar qué botón fue presionado

      if (action === "actualizarUno") {
        let actualizarFyH = document.getElementById("actualizarFyH").value;
        let actualizarRival = document.getElementById("actualizarRival").value;
        let actualizarUbi = document.getElementById("actualizarUbi").value;

        document.getElementById("guardarFyH1").textContent = actualizarFyH;
        document.getElementById("guardarRival1").textContent = actualizarRival;
        document.getElementById("guardarUbi1").textContent = actualizarUbi;
      } else if (action === "actualizarDos") {
        let actualizarFyH = document.getElementById("actualizarFyH").value;
        let actualizarRival = document.getElementById("actualizarRival").value;
        let actualizarUbi = document.getElementById("actualizarUbi").value;

        document.getElementById("guardarFyH2").textContent = actualizarFyH;
        document.getElementById("guardarRival2").textContent = actualizarRival;
        document.getElementById("guardarUbi2").textContent = actualizarUbi;
      } else {
        let actualizarFyH = document.getElementById("actualizarFyH").value;
        let actualizarRival = document.getElementById("actualizarRival").value;
        let actualizarUbi = document.getElementById("actualizarUbi").value;

        document.getElementById("guardarFyH3").textContent = actualizarFyH;
        document.getElementById("guardarRival3").textContent = actualizarRival;
        document.getElementById("guardarUbi3").textContent = actualizarUbi;
      }
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
const auth = firebase.auth();

// Aquí consultas a Firestore

//Chequear si el usuario es ADMIN

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // El usuario está autenticado
    checkUserRole(user); // Llamar a tu función para verificar el rol
  } else {
    // No hay usuario autenticado, redirigir al inicio de sesión
    window.location.href = "../index.html"; // Redirige a la página de inicio de sesión
  }
});

function checkUserRole(user) {
  // Referencia al documento del usuario en Firestore
  const userRef = firebase.firestore().collection("usuarios").doc(user.uid);

  // Verificar si el usuario tiene el rol 'admin'
  userRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        if (userData.role === "admin") {
        } else {
          // Si no es admin, mostrar un mensaje y cerrar sesión
          alert("No tienes permisos para acceder a esta página.");
          firebase.auth().signOut(); // Cerrar sesión
        }
      } else {
        // Si no existe el documento, cerrar sesión
        alert("Usuario no registrado en la base de datos.");
        firebase.auth().signOut(); // Cerrar sesión
      }
    })
    .catch((error) => {
      console.error("Error al verificar el rol del usuario: ", error);
      alert("Error al verificar el rol del usuario.");
      firebase.auth().signOut(); // Cerrar sesión en caso de error
    });
}

////////// Contador de Clicks WhatsApp ///////////

const contadorElement = document.getElementById("contadorClicks");
const verDetallesBtn = document.getElementById("verDetalles");
const tablaClicks = document.getElementById("tablaClicks");

// 🟢 Mostrar el contador actual
async function cargarContador() {
  try {
    const contadorRef = db.collection("clicksAsociate").doc("contador");
    const doc = await contadorRef.get();

    if (doc.exists) {
      contadorElement.textContent = doc.data().ultimoNumero;
    } else {
      contadorElement.textContent = "0";
    }
  } catch (error) {
    console.error("Error al obtener el contador:", error);
    contadorElement.textContent = "Error";
  }
}

// 🟢 Cargar los detalles al abrir el modal
async function cargarDetalles() {
  try {
    tablaClicks.innerHTML = `
        <tr><td colspan="2" class="text-center text-muted">Cargando...</td></tr>
      `;

    const snapshot = await db
      .collection("clicksAsociate")
      .orderBy("numero", "desc")
      .get();

    // Filtrar el documento "contador" (no es un click)
    const clicks = snapshot.docs.filter((doc) => doc.id !== "contador");

    if (clicks.length === 0) {
      tablaClicks.innerHTML = `
          <tr><td colspan="2" class="text-center text-muted">No hay registros aún</td></tr>
        `;
      return;
    }

    // Construir tabla
    let filas = "";
    clicks.forEach((doc) => {
      const data = doc.data();
      filas += `
          <tr>
            <td>${data.numero}</td>
            <td>${data.nombre}</td>
          </tr>
        `;
    });

    tablaClicks.innerHTML = filas;
  } catch (error) {
    console.error("Error al obtener los detalles:", error);
    tablaClicks.innerHTML = `
        <tr><td colspan="2" class="text-center text-danger">Error al cargar los datos</td></tr>
      `;
  }
}

// 🟢 Abrir modal y cargar datos solo al hacer click
verDetallesBtn.addEventListener("click", () => {
  cargarDetalles();
  const modal = new bootstrap.Modal(document.getElementById("modalDetalles"));
  modal.show();
});

// Cargar el contador al entrar
cargarContador();

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

  // Referencia a la colección "noticias"
  const noticiasRef = firebase.firestore().collection("noticias");

  try {
    // 1. Obtener todas las noticias y encontrar el mayor número
    const snapshot = await noticiasRef.orderBy("numero", "desc").limit(1).get();
    let siguienteNumero = 1; // Valor por defecto si no hay noticias previas

    if (!snapshot.empty) {
      const ultimaNoticia = snapshot.docs[0].data();
      siguienteNumero = ultimaNoticia.numero + 1; // Sumar 1 al último número
    }

    const nombreDocumento = `noticia ${siguienteNumero}`; // Nombre del documento

    // 2. Subir las imágenes a Firebase Storage
    const storageRef = firebase.storage().ref();
    const imagenRef = storageRef.child(`noticias/${imagenPrincipal.name}`);

    const snapshotImg1 = await imagenRef.put(imagenPrincipal);
    const downloadURL1 = await snapshotImg1.ref.getDownloadURL();

    let downloadURL2 = ""; // Valor predeterminado si no hay imagen secundaria

    if (imagenSecundaria) {
      const imagenRef2 = storageRef.child(`noticias/${imagenSecundaria.name}`);
      const snapshotImg2 = await imagenRef2.put(imagenSecundaria);
      downloadURL2 = await snapshotImg2.ref.getDownloadURL();
    }

    // 3. Guardar los datos en Firestore con el campo "numero"
    await noticiasRef.doc(nombreDocumento).set({
      titulo: titulo,
      copete: copete,
      cuerpoNoticia: cuerpoNoticia,
      cuerpoNoticia2: cuerpoNoticia2,
      imagenPrincipal: downloadURL1,
      imagenSecundaria: downloadURL2,
      fechaDeCarga: firebase.firestore.FieldValue.serverTimestamp(),
      categoria: categoria,
      numero: siguienteNumero, // Guardar el número de la noticia
    });

    mensajeDeNoticia.innerHTML = `Noticia guardada con el nombre: ${nombreDocumento} (Número: ${siguienteNumero})`;

    // Recargar la página después de unos segundos
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  } catch (error) {
    mensajeDeNoticia.innerHTML =
      `Error al guardar la noticia: ` + JSON.stringify(error);
  }
});

// Función para eliminar una noticia por ID (nombre del documento)
async function eliminarNoticia(idDocumento) {
  if (confirm("¿Estás seguro de que deseas eliminar esta noticia?")) {
    try {
      const productosRef = firebase.firestore().collection("noticias");
      await productosRef.doc(idDocumento).delete(); // Eliminar el documento
      alert("Noticia eliminada correctamente");
      window.location.reload(); // Recargar la página para actualizar la lista
    } catch (error) {
      console.error("Error al eliminar la noticia: ", error);
      alert("Error al eliminar la noticia.");
    }
  }
}

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
      const docId = doc.id; // Obtener el ID del documento

      // 2. Plantilla HTML para cada noticia
      const noticiaHTML = `<div class=" todas ${noticia.categoria} noticiaItem col-xl-4 col-lg-6 col-md-6 col-sm-12 col-12 my-2">
            <div class="noticias d-flex flex-column align-items-center text-center">
              <img src="${noticia.imagenPrincipal}" alt="" />
              <h2 class="mt-3 mb-3">${noticia.titulo}</h2>
              <p>
              ${noticia.copete}
              </p>
              <div>
                <div>
                  <button type="button" class="btn btn-sm btn-custom botonVerMas" data-bs-toggle="modal" data-bs-target="#${modalIdSinEspacios}">
                    Ver más
                  </button>
                </div>
                <div>
                  <!-- Botón para eliminar la noticia -->
                  <button
                    type="button"
                    class="btn btn-sm btn-danger mt-2"
                    onclick="eliminarNoticia('${docId}')">
                    Eliminar
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    class="btn btn-sm btn-info mt-2"
                    onclick="compartirNoticia('${modalIdSinEspacios}')">
                    Compartir esta noticia
                  </button>
                </div>
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

// Llamada a la función para cargar las noticias al cargar la página
window.onload = function () {
  cargarNoticias();
};

function compartirNoticia(modalId) {
  // Reemplazá esto con la URL real de tu sitio
  const baseUrl = "https://www.racingclubchivilcoy.com.ar/pages/noticias.html";
  const urlCompleta = `${baseUrl}?noticia=${modalId}`;

  // Copiar al portapapeles
  navigator.clipboard
    .writeText(urlCompleta)
    .then(() => {
      alert("¡Enlace copiado al portapapeles!");
    })
    .catch((err) => {
      console.error("Error al copiar el enlace: ", err);
      alert("Ocurrió un error al copiar el enlace.");
    });
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
  const precio = document.getElementById("precioACargarProducto").value;
  const descripcionProducto = document.getElementById(
    "descripcionProducto"
  ).value;
  const imagenProducto = document.getElementById("imagenProducto").files[0];
  const imagenProducto2 = document.getElementById("imagenProducto2").files[0];
  const imagenProducto3 = document.getElementById("imagenProducto3").files[0];
  const imagenProducto4 = document.getElementById("imagenProducto4").files[0];
  const imagenProducto5 = document.getElementById("imagenProducto5").files[0];
  const imagenProducto6 = document.getElementById("imagenProducto6").files[0];

  const productosRef = firebase.firestore().collection("productos");

  try {
    const querySnapshot = await productosRef
      .orderBy("numero", "desc")
      .limit(1)
      .get();
    let nuevoNumero = 1;
    if (!querySnapshot.empty) {
      const ultimoProducto = querySnapshot.docs[0].data();
      nuevoNumero = parseInt(ultimoProducto.numero) + 1;
    }
    const nombreDocumento = `producto ${nuevoNumero}`;
    const storageRef = firebase.storage().ref();

    const uploadAndGetURL = async (file) => {
      const ref = storageRef.child(`productos/${Date.now()}_${file.name}`);
      const snapshot = await ref.put(file);
      return await snapshot.ref.getDownloadURL();
    };

    const downloadURL1 = await uploadAndGetURL(imagenProducto);
    const downloadURL2 = imagenProducto2
      ? await uploadAndGetURL(imagenProducto2)
      : "";
    const downloadURL3 = imagenProducto3
      ? await uploadAndGetURL(imagenProducto3)
      : "";
    const downloadURL4 = imagenProducto4
      ? await uploadAndGetURL(imagenProducto4)
      : "";
    const downloadURL5 = imagenProducto5
      ? await uploadAndGetURL(imagenProducto5)
      : "";
    const downloadURL6 = imagenProducto6
      ? await uploadAndGetURL(imagenProducto6)
      : "";

    await productosRef.doc(nombreDocumento).set({
      titulo,
      precio: precio,
      descripcion: descripcionProducto,
      imagen: downloadURL1,
      imagen2: downloadURL2,
      imagen3: downloadURL3,
      imagen4: downloadURL4,
      imagen5: downloadURL5,
      imagen6: downloadURL6,
      numero: nuevoNumero,
    });

    mensajeDeProducto.innerHTML = `Producto guardado con el nombre: ${nombreDocumento}`;

    setTimeout(() => {
      window.location.reload();
    }, 3000);
  } catch (error) {
    mensajeDeProducto.innerHTML = `Error al guardar el producto: ${JSON.stringify(
      error
    )}`;
  }
});

// Submit del formulario de modificación
document
  .getElementById("formModificarProducto")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!confirm("¿Estás seguro de que querés modificar este producto?"))
      return;

    const docId = document.getElementById("docIdProducto").value;
    const productosRef = firebase
      .firestore()
      .collection("productos")
      .doc(docId);
    const storageRef = firebase.storage().ref();

    const titulo = document.getElementById("tituloModificar").value;
    const precio = document.getElementById("precioModificar").value;
    const descripcion = document.getElementById("descripcionModificar").value;

    const files = [],
      eliminar = [];
    for (let i = 1; i <= 6; i++) {
      files.push(document.getElementById(`imagenModificar${i}`).files[0]);
      eliminar.push(document.getElementById(`eliminarImagen${i}`).checked);
    }

    const originalesRaw = document.getElementById("formModificarProducto")
      .dataset.originales;
    const urlsOriginales = originalesRaw ? JSON.parse(originalesRaw) : {};
    const nuevasURLs = [];

    for (let i = 0; i < 6; i++) {
      const key = i === 0 ? "imagen" : `imagen${i + 1}`;
      const file = files[i];
      const eliminarEsta = eliminar[i];
      const urlOriginal = urlsOriginales[key] || "";

      if (eliminarEsta && urlOriginal) {
        try {
          const path = decodeURIComponent(
            new URL(urlOriginal).pathname.split("/o/")[1].split("?")[0]
          );
          await storageRef.child(path).delete();
        } catch (err) {
          console.warn(`No se pudo eliminar imagen ${key}:`, err);
        }
        nuevasURLs.push("");
      } else if (file) {
        if (urlOriginal) {
          try {
            const path = decodeURIComponent(
              new URL(urlOriginal).pathname.split("/o/")[1].split("?")[0]
            );
            await storageRef.child(path).delete();
          } catch (err) {
            console.warn(`No se pudo eliminar imagen anterior: ${key}`, err);
          }
        }

        const nombre = `productos/${Date.now()}_${file.name}`;
        const snapshot = await storageRef.child(nombre).put(file);
        const url = await snapshot.ref.getDownloadURL();
        nuevasURLs.push(url);
      } else {
        nuevasURLs.push(urlOriginal);
      }
    }

    try {
      await productosRef.update({
        titulo,
        precio,
        descripcion,
        imagen: nuevasURLs[0],
        imagen2: nuevasURLs[1],
        imagen3: nuevasURLs[2],
        imagen4: nuevasURLs[3],
        imagen5: nuevasURLs[4],
        imagen6: nuevasURLs[5],
      });

      alert("Producto modificado con éxito.");
      window.location.reload();
    } catch (error) {
      console.error("Error al modificar producto:", error);
      alert("Hubo un error al guardar los cambios.");
    }
  });

// Función para eliminar un producto por ID (nombre del documento)
async function eliminarProducto(idDocumento) {
  if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
    try {
      await firebase
        .firestore()
        .collection("productos")
        .doc(idDocumento)
        .delete();
      alert("Producto eliminado correctamente");
      window.location.reload();
    } catch (error) {
      console.error("Error al eliminar el producto: ", error);
      alert("Error al eliminar el producto.");
    }
  }
}

// Función para modificar un producto por ID (nombre del documento)
async function modificarProducto(docId) {
  const docRef = firebase.firestore().collection("productos").doc(docId);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    const data = docSnap.data();

    document.getElementById("docIdProducto").value = docId;
    document.getElementById("tituloModificar").value = data.titulo;
    document.getElementById("precioModificar").value = data.precio;
    document.getElementById("descripcionModificar").value = data.descripcion;

    document.getElementById("formModificarProducto").dataset.originales =
      JSON.stringify({
        imagen: data.imagen || "",
        imagen2: data.imagen2 || "",
        imagen3: data.imagen3 || "",
        imagen4: data.imagen4 || "",
        imagen5: data.imagen5 || "",
        imagen6: data.imagen6 || "",
      });

    for (let i = 1; i <= 6; i++) {
      const inputFile = document.getElementById(`imagenModificar${i}`);
      const imgPreview = document.getElementById(`previewModificar${i}`);
      const checkEliminar = document.getElementById(`eliminarImagen${i}`);

      const url = i === 1 ? data.imagen : data[`imagen${i}`];

      if (url) {
        imgPreview.src = url;
        imgPreview.style.display = "inline-block";
      } else {
        imgPreview.src = "";
        imgPreview.style.display = "none";
      }

      inputFile.value = "";
      checkEliminar.checked = false;
    }

    const modal = new bootstrap.Modal(
      document.getElementById("modalModificarProducto")
    );
    modal.show();
  }
}
// Mostrar vista previa al seleccionar nuevas imágenes
for (let i = 1; i <= 6; i++) {
  const input = document.getElementById(`imagenModificar${i}`);
  const preview = document.getElementById(`previewModificar${i}`);

  input.addEventListener("change", function () {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = "inline-block";
      };
      reader.readAsDataURL(input.files[0]);
    }
  });
}
// Función para cargar y mostrar los productos
async function cargarProductos() {
  const productosRef = firebase.firestore().collection("productos");

  try {
    const snapshot = await productosRef.get();
    const contenedorProductos = document.getElementById(
      "divContenedorProductos"
    );
    let modalHTML = "",
      index = 0;

    snapshot.forEach((doc) => {
      const producto = doc.data();
      const modalId = `imageModal${index}`;
      const docId = doc.id;

      contenedorProductos.innerHTML += `
        <div class="col-xl-2 col-lg-4 col-md-5 col-5 my-1 producto">
          <div class="d-flex flex-column align-items-center">
            <img src="${producto.imagen}" alt="" class="mt-2">
            <h4 class="mt-2">${producto.titulo}</h4>
            <p class="mt-1 text-center">${producto.descripcion}</p>
            <h5 class="mt-1">$${producto.precio}</h5>
            <div>
              <button type="button" class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#${modalId}">Ver más</button>
            </div>
            <div class="my-1">
              <button type="button" class="btn btn-sm btn-success mt-2" onclick="modificarProducto('${docId}')">Modificar</button>
              <button type="button" class="btn btn-sm btn-danger mt-2" onclick="eliminarProducto('${docId}')">Eliminar</button>
            </div>
          </div>
        </div>
      `;

      modalHTML += `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="imageModalLabel${index}" aria-hidden="true">
          <div class="modal-dialog modal-xl">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="imageModalLabel${index}">${
        producto.titulo
      }</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
              </div>
              <div class="modal-body text-center">
                <img src="${producto.imagen}" class="img-fluid mb-2"><br>
                ${
                  producto.imagen2
                    ? `<img src="${producto.imagen2}" class="img-fluid mb-2"><br>`
                    : ""
                }
                ${
                  producto.imagen3
                    ? `<img src="${producto.imagen3}" class="img-fluid mb-2"><br>`
                    : ""
                }
                ${
                  producto.imagen4
                    ? `<img src="${producto.imagen4}" class="img-fluid mb-2"><br>`
                    : ""
                }
                ${
                  producto.imagen5
                    ? `<img src="${producto.imagen5}" class="img-fluid mb-2"><br>`
                    : ""
                }
                ${
                  producto.imagen6
                    ? `<img src="${producto.imagen6}" class="img-fluid mb-2"><br>`
                    : ""
                }
              </div>
            </div>
          </div>
        </div>`;
      index++;
    });

    // Agregamos todos los modales al final del body
    document.body.insertAdjacentHTML("beforeend", modalHTML);
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

// Inicializar los eventos en miniaturas al cargar el DOM
document.addEventListener("DOMContentLoaded", function () {
  cargarProductos();

  // Escuchar el evento de click en miniaturas cuando se cargue el modal
  document.body.addEventListener("click", function (event) {
    if (event.target.classList.contains("miniatura")) {
      const nuevaImagen = event.target.getAttribute("data-imagen");
      const imagenPrincipal = event.target
        .closest(".modal-body")
        .querySelector(".img-fluid");
      imagenPrincipal.setAttribute("src", nuevaImagen);
    }
  });
});

// Función para cargar el formulario de modificación con los datos del producto
function cargarPreviewYListeners(data) {
  for (let i = 1; i <= 6; i++) {
    const key = i === 1 ? "imagen" : `imagen${i}`;
    const preview = document.getElementById(`previewModificar${i}`);
    preview.src = data[key] || "";
  }

  for (let i = 1; i <= 6; i++) {
    document
      .getElementById(`imagenModificar${i}`)
      .addEventListener("change", function () {
        const file = this.files[0];
        const preview = document.getElementById(`previewModificar${i}`);
        if (file) {
          preview.src = URL.createObjectURL(file);
        }
      });
  }

  // Guardar URLs originales para comparar
  const urlsOriginales = {
    imagen: data.imagen || "",
    imagen2: data.imagen2 || "",
    imagen3: data.imagen3 || "",
    imagen4: data.imagen4 || "",
    imagen5: data.imagen5 || "",
    imagen6: data.imagen6 || "",
  };
  document.getElementById("formModificarProducto").dataset.originales =
    JSON.stringify(urlsOriginales);
}

// Sección carga y bajas de Admin

// Escuchar el evento de submit en el formulario

document
  .getElementById("adminACargar")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const mail = document.getElementById("mailAdmin").value;
    const action = e.submitter.value; // Captura qué botón fue presionado

    // Referencia a la colección de usuarios en Firestore
    const usuariosRef = firebase.firestore().collection("usuarios");

    try {
      // Obtener el documento del usuario basado en el email
      const querySnapshot = await usuariosRef.where("email", "==", mail).get();

      if (!querySnapshot.empty) {
        // Asumimos que los emails son únicos y solo hay un documento por email
        const userDoc = querySnapshot.docs[0];

        if (action === "agregarAdmin") {
          // Actualizar el rol a "admin"
          await userDoc.ref.update({ role: "admin" });
          alert("Rol cambiado a Admin");
        } else if (action === "quitarAdmin") {
          // Actualizar el rol a "user"
          await userDoc.ref.update({ role: "user" });
          alert("Rol cambiado a User");
        }
      } else {
        alert("No se encontró un usuario con ese correo.");
      }
    } catch (error) {
      console.error("Error al actualizar el rol: ", error);
    }
  });
