let ultimoProductoDoc = null;
let cargandoProductos = false;
let indexProductoModal = 0;

const LIMITE_PRODUCTOS = 8;
const CANTIDAD_IMAGENES_PRODUCTO = 6;

function renderModuloProductos() {
  const contenedor = document.getElementById("contenedorModulo");

  if (!contenedor) return;

  ultimoProductoDoc = null;
  cargandoProductos = false;
  indexProductoModal = 0;

  contenedor.innerHTML = `
    <div class="row g-4">

      <div class="col-12 col-xl-5">
        <div class="admin-card h-100">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h3 class="admin-section-title mb-1">
                Carga de productos
              </h3>

              <p class="text-muted mb-0">
                Publicá productos, indumentaria o artículos destacados en la web.
              </p>
            </div>

            <div class="productos-icon-box">
              <i class="bi bi-box-seam-fill"></i>
            </div>
          </div>

          <form id="productoACargar" class="mt-4">
            <div class="mb-3">
              <label class="form-label admin-form-label">
                Título
              </label>

              <input
                type="text"
                class="form-control admin-input"
                id="tituloACargarProducto"
                placeholder="Nombre del producto"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label admin-form-label">
                Precio
              </label>

              <input
                type="text"
                class="form-control admin-input"
                id="precioACargarProducto"
                placeholder="Ej: 15000"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label admin-form-label">
                Imagen principal
              </label>

              <input
                type="file"
                class="form-control admin-input"
                id="imagenProducto"
                accept="image/*"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label admin-form-label">
                Descripción
              </label>

              <textarea
                class="form-control admin-input"
                maxlength="200"
                id="descripcionProducto"
                rows="4"
                placeholder="Descripción breve del producto"
                required
              ></textarea>

              <small class="text-muted">
                Máximo 200 caracteres.
              </small>
            </div>

            <div class="admin-info-box mb-3">
              <strong>Imágenes secundarias</strong>

              <p class="mb-0">
                Podés cargar hasta 5 imágenes adicionales. Son opcionales.
              </p>
            </div>

            ${renderInputsImagenesSecundariasProducto()}

            <button
              id="btnGuardarProducto"
              type="submit"
              class="btn-admin-primary w-100"
            >
              Guardar producto
            </button>

            <p id="mensajeDeProducto" class="admin-module-message mt-3 mb-0"></p>
          </form>
        </div>
      </div>

      <div class="col-12 col-xl-7">
        <div class="admin-card h-100">
          <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h3 class="admin-section-title mb-1">
                Vista previa de productos
              </h3>

              <p class="text-muted mb-0">
                Productos cargados actualmente en Firestore.
              </p>
            </div>

            <button
              id="btnRefrescarProductos"
              type="button"
              class="btn-admin-outline"
            >
              <i class="bi bi-arrow-clockwise me-1"></i>
              Refrescar
            </button>
          </div>

          <div
            id="divContenedorProductos"
            class="productos-admin-grid"
          >
            <div class="admin-loading-card">
              <div class="spinner-border" role="status"></div>

              <p class="mt-3 mb-0">
                Cargando productos...
              </p>
            </div>
          </div>

          <div class="text-center mt-4">
            <button
              id="btnCargarMasProductos"
              class="btn-admin-outline"
              type="button"
            >
              Cargar más productos
            </button>
          </div>
        </div>
      </div>

    </div>

    ${renderModalModificarProducto()}
  `;

  inicializarModuloProductos();
}

function renderInputsImagenesSecundariasProducto() {
  let html = "";

  for (let i = 2; i <= CANTIDAD_IMAGENES_PRODUCTO; i++) {
    html += `
      <div class="mb-3">
        <label class="form-label admin-form-label">
          Imagen ${i}
        </label>

        <input
          type="file"
          class="form-control admin-input"
          id="imagenProducto${i}"
          accept="image/*"
        />
      </div>
    `;
  }

  return html;
}

function renderModalModificarProducto() {
  let imagenesHTML = "";

  for (let i = 1; i <= CANTIDAD_IMAGENES_PRODUCTO; i++) {
    imagenesHTML += `
      <div class="producto-edit-image-row">
        <div class="producto-edit-preview-wrap">
          <img
            id="previewModificar${i}"
            src=""
            alt="Vista previa ${i}"
            class="producto-edit-preview"
          />
        </div>

        <div class="producto-edit-inputs">
          <label class="form-label admin-form-label">
            Imagen ${i}
          </label>

          <input
            type="file"
            class="form-control admin-input"
            id="imagenModificar${i}"
            accept="image/*"
          />

          <div class="form-check mt-2">
            <input
              class="form-check-input"
              type="checkbox"
              id="eliminarImagen${i}"
            />

            <label
              class="form-check-label"
              for="eliminarImagen${i}"
            >
              Eliminar imagen actual
            </label>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div
      class="modal fade"
      id="modalModificarProducto"
      tabindex="-1"
      aria-labelledby="modalModificarProductoLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content admin-modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalModificarProductoLabel">
              Modificar producto
            </h5>

            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Cerrar"
            ></button>
          </div>

          <div class="modal-body">
            <form id="formModificarProducto">
              <input type="hidden" id="docIdProducto" />

              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label admin-form-label">
                    Título
                  </label>

                  <input
                    type="text"
                    class="form-control admin-input"
                    id="tituloModificar"
                    required
                  />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label admin-form-label">
                    Precio
                  </label>

                  <input
                    type="text"
                    class="form-control admin-input"
                    id="precioModificar"
                    required
                  />
                </div>

                <div class="col-12">
                  <label class="form-label admin-form-label">
                    Descripción
                  </label>

                  <textarea
                    class="form-control admin-input"
                    id="descripcionModificar"
                    rows="3"
                  ></textarea>
                </div>
              </div>

              <hr class="my-4" />

              <h5 class="admin-section-title mb-3">
                Imágenes del producto
              </h5>

              <div class="producto-edit-images-grid">
                ${imagenesHTML}
              </div>

              <p id="mensajeModificarProducto" class="admin-module-message mt-3 mb-0"></p>
            </form>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cancelar
            </button>

            <button
              id="btnGuardarCambiosProducto"
              type="submit"
              form="formModificarProducto"
              class="btn-admin-primary"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function inicializarModuloProductos() {
  const formProducto = document.getElementById("productoACargar");
  const formModificar = document.getElementById("formModificarProducto");
  const btnCargarMas = document.getElementById("btnCargarMasProductos");
  const btnRefrescar = document.getElementById("btnRefrescarProductos");

  if (formProducto) {
    formProducto.addEventListener("submit", guardarProducto);
  }

  if (formModificar) {
    formModificar.addEventListener("submit", guardarModificacionProducto);
  }

  if (btnCargarMas) {
    btnCargarMas.addEventListener("click", cargarProductos);
  }

  if (btnRefrescar) {
    btnRefrescar.addEventListener("click", reiniciarListadoProductos);
  }

  configurarPreviewImagenesModificar();

  reiniciarListadoProductos();
}

async function guardarProducto(e) {
  e.preventDefault();

  const titulo = document.getElementById("tituloACargarProducto")?.value.trim();
  const precio = document.getElementById("precioACargarProducto")?.value.trim();
  const descripcion = document
    .getElementById("descripcionProducto")
    ?.value.trim();

  const imagenPrincipal = document.getElementById("imagenProducto")?.files[0];

  if (!titulo || !precio || !descripcion || !imagenPrincipal) {
    mostrarMensajeProducto("Completá los campos obligatorios.", "error");
    return;
  }

  try {
    const btnGuardar = document.getElementById("btnGuardarProducto");

    if (btnGuardar) {
      btnGuardar.disabled = true;
      btnGuardar.textContent = "Guardando producto...";
    }

    mostrarMensajeProducto("Subiendo imágenes...", "info");

    const productosRef = db.collection("productos");

    const querySnapshot = await productosRef
      .orderBy("numero", "desc")
      .limit(1)
      .get();

    let nuevoNumero = 1;

    if (!querySnapshot.empty) {
      nuevoNumero = Number(querySnapshot.docs[0].data().numero || 0) + 1;
    }

    const nombreDocumento = `producto ${nuevoNumero}`;

    const imagenes = await subirImagenesProductoNuevo(nuevoNumero);

    mostrarMensajeProducto("Guardando datos...", "info");

    await productosRef.doc(nombreDocumento).set({
      titulo,
      precio,
      descripcion,
      imagen: imagenes[0] || "",
      imagen2: imagenes[1] || "",
      imagen3: imagenes[2] || "",
      imagen4: imagenes[3] || "",
      imagen5: imagenes[4] || "",
      imagen6: imagenes[5] || "",
      numero: nuevoNumero,
      creadoEn: firebase.firestore.FieldValue.serverTimestamp(),
      actualizadoEn: firebase.firestore.FieldValue.serverTimestamp(),
      creadoPor: usuarioActual?.email || "",
    });

    mostrarMensajeProducto(
      `Producto guardado correctamente: ${nombreDocumento}`,
      "ok",
    );

    document.getElementById("productoACargar")?.reset();

    reiniciarListadoProductos();
  } catch (error) {
    console.error("Error al guardar producto:", error);

    mostrarMensajeProducto("Error al guardar el producto.", "error");
  } finally {
    const btnGuardar = document.getElementById("btnGuardarProducto");

    if (btnGuardar) {
      btnGuardar.disabled = false;
      btnGuardar.textContent = "Guardar producto";
    }
  }
}

async function subirImagenesProductoNuevo(numeroProducto) {
  const urls = [];

  for (let i = 1; i <= CANTIDAD_IMAGENES_PRODUCTO; i++) {
    const inputId = i === 1 ? "imagenProducto" : `imagenProducto${i}`;
    const archivo = document.getElementById(inputId)?.files[0];

    if (!archivo) {
      urls.push("");
      continue;
    }

    const url = await subirImagenProductoStorage(
      archivo,
      numeroProducto,
      `imagen-${i}`,
    );

    urls.push(url);
  }

  return urls;
}

async function subirImagenProductoStorage(archivo, numeroProducto, tipo) {
  const extension = obtenerExtensionArchivoProducto(archivo.name);

  const nombreSeguro = normalizarNombreArchivoProducto(
    archivo.name.replace(`.${extension}`, ""),
  );

  const nombreArchivo = `producto-${numeroProducto}-${tipo}-${Date.now()}-${nombreSeguro}.${extension}`;

  const ref = storage.ref().child(`productos/${nombreArchivo}`);

  const snapshot = await ref.put(archivo, {
    contentType: archivo.type || "image/jpeg",
  });

  return await snapshot.ref.getDownloadURL();
}

function reiniciarListadoProductos() {
  ultimoProductoDoc = null;
  indexProductoModal = 0;

  const contenedorProductos = document.getElementById("divContenedorProductos");

  if (contenedorProductos) {
    contenedorProductos.innerHTML = `
      <div class="admin-loading-card">
        <div class="spinner-border" role="status"></div>

        <p class="mt-3 mb-0">
          Cargando productos...
        </p>
      </div>
    `;
  }

  const btnCargarMas = document.getElementById("btnCargarMasProductos");

  if (btnCargarMas) {
    btnCargarMas.style.display = "inline-flex";
  }

  cargarProductos();
}

async function cargarProductos() {
  if (cargandoProductos) return;

  cargandoProductos = true;

  const productosRef = db.collection("productos");
  const contenedorProductos = document.getElementById("divContenedorProductos");
  const btnCargarMas = document.getElementById("btnCargarMasProductos");

  if (!contenedorProductos) return;

  try {
    let query = productosRef.orderBy("numero", "desc").limit(LIMITE_PRODUCTOS);

    if (ultimoProductoDoc) {
      query = query.startAfter(ultimoProductoDoc);
    }

    const snapshot = await query.get();

    if (!ultimoProductoDoc) {
      contenedorProductos.innerHTML = "";
    }

    if (snapshot.empty) {
      if (!ultimoProductoDoc) {
        contenedorProductos.innerHTML = `
          <div class="admin-empty-state">
            <i class="bi bi-box-seam-fill"></i>

            <p>No hay productos cargados todavía.</p>
          </div>
        `;
      }

      if (btnCargarMas) {
        btnCargarMas.style.display = "none";
      }

      return;
    }

    snapshot.forEach((doc) => {
      const producto = doc.data();

      contenedorProductos.insertAdjacentHTML(
        "beforeend",
        renderCardProducto(doc.id, producto, indexProductoModal),
      );

      indexProductoModal++;
    });

    ultimoProductoDoc = snapshot.docs[snapshot.docs.length - 1];

    if (snapshot.docs.length < LIMITE_PRODUCTOS && btnCargarMas) {
      btnCargarMas.style.display = "none";
    }
  } catch (error) {
    console.error("Error al cargar productos:", error);

    contenedorProductos.innerHTML = `
      <div class="admin-empty-state text-danger">
        <i class="bi bi-exclamation-triangle-fill"></i>

        <p>Error al cargar productos.</p>
      </div>
    `;
  } finally {
    cargandoProductos = false;
  }
}

function renderCardProducto(docId, producto, index) {
  const modalId = `modalProductoVista-${index}`;
  const precio = producto.precio || "0";

  return `
    <article class="producto-admin-card">
      <img
        src="${producto.imagen || "./media/placeholder.jpg"}"
        alt="${producto.titulo || "Producto"}"
        class="producto-admin-img"
      />

      <div class="producto-admin-body">
        <h4>
          ${producto.titulo || "Sin título"}
        </h4>

        <p>
          ${producto.descripcion || ""}
        </p>

        <strong class="producto-admin-precio">
          $${precio}
        </strong>

        <div class="producto-admin-actions">
          <button
            class="btn btn-sm btn-admin-primary"
            type="button"
            data-bs-toggle="modal"
            data-bs-target="#${modalId}"
          >
            Ver más
          </button>

          <button
            class="btn btn-sm btn-success fw-bold"
            type="button"
            onclick="modificarProducto('${docId}')"
          >
            Modificar
          </button>

          <button
            class="btn btn-sm btn-danger fw-bold"
            type="button"
            onclick="eliminarProducto('${docId}')"
          >
            Eliminar
          </button>
        </div>
      </div>

      ${renderModalVistaProducto(modalId, producto)}
    </article>
  `;
}

function renderModalVistaProducto(modalId, producto) {
  const imagenes = obtenerImagenesProducto(producto);

  const imagenPrincipal = imagenes[0] || "";

  const miniaturas = imagenes
    .map((url, index) => {
      return `
        <img
          src="${url}"
          class="producto-miniatura ${index === 0 ? "active" : ""}"
          data-imagen="${url}"
          onclick="cambiarImagenPrincipalProducto('${modalId}', '${url}')"
          alt="Miniatura producto"
        />
      `;
    })
    .join("");

  return `
    <div class="modal fade" id="${modalId}" tabindex="-1">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content admin-modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              ${producto.titulo || "Producto"}
            </h5>

            <button
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>

          <div class="modal-body text-center">
            <img
              id="${modalId}-imagenPrincipal"
              src="${imagenPrincipal}"
              class="producto-modal-img"
              alt="Imagen principal producto"
            />

            ${
              imagenes.length > 1
                ? `
                  <div class="producto-miniaturas-row">
                    ${miniaturas}
                  </div>
                `
                : ""
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

function cambiarImagenPrincipalProducto(modalId, url) {
  const img = document.getElementById(`${modalId}-imagenPrincipal`);

  if (img) {
    img.src = url;
  }

  const modal = document.getElementById(modalId);

  if (!modal) return;

  modal.querySelectorAll(".producto-miniatura").forEach((mini) => {
    mini.classList.toggle("active", mini.dataset.imagen === url);
  });
}

function obtenerImagenesProducto(producto) {
  const keys = [
    "imagen",
    "imagen2",
    "imagen3",
    "imagen4",
    "imagen5",
    "imagen6",
  ];

  return keys
    .map((key) => producto[key])
    .filter((url) => typeof url === "string" && url.trim() !== "");
}

async function modificarProducto(docId) {
  try {
    const docRef = db.collection("productos").doc(docId);

    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      mostrarMensajeProducto("El producto ya no existe.", "error");
      return;
    }

    const data = docSnap.data();

    document.getElementById("docIdProducto").value = docId;
    document.getElementById("tituloModificar").value = data.titulo || "";
    document.getElementById("precioModificar").value = data.precio || "";
    document.getElementById("descripcionModificar").value =
      data.descripcion || "";

    const urlsOriginales = obtenerUrlsOriginalesProducto(data);

    document.getElementById("formModificarProducto").dataset.originales =
      JSON.stringify(urlsOriginales);

    for (let i = 1; i <= CANTIDAD_IMAGENES_PRODUCTO; i++) {
      const key = i === 1 ? "imagen" : `imagen${i}`;
      const inputFile = document.getElementById(`imagenModificar${i}`);
      const imgPreview = document.getElementById(`previewModificar${i}`);
      const checkEliminar = document.getElementById(`eliminarImagen${i}`);

      const url = urlsOriginales[key] || "";

      if (inputFile) inputFile.value = "";
      if (checkEliminar) checkEliminar.checked = false;

      if (imgPreview) {
        if (url) {
          imgPreview.src = url;
          imgPreview.classList.remove("d-none");
        } else {
          imgPreview.src = "";
          imgPreview.classList.add("d-none");
        }
      }
    }

    mostrarMensajeModificarProducto("");

    const modal = new bootstrap.Modal(
      document.getElementById("modalModificarProducto"),
    );

    modal.show();
  } catch (error) {
    console.error("Error al modificar producto:", error);

    mostrarMensajeProducto("Error al cargar el producto.", "error");
  }
}

function obtenerUrlsOriginalesProducto(data) {
  return {
    imagen: data.imagen || "",
    imagen2: data.imagen2 || "",
    imagen3: data.imagen3 || "",
    imagen4: data.imagen4 || "",
    imagen5: data.imagen5 || "",
    imagen6: data.imagen6 || "",
  };
}

function configurarPreviewImagenesModificar() {
  for (let i = 1; i <= CANTIDAD_IMAGENES_PRODUCTO; i++) {
    const input = document.getElementById(`imagenModificar${i}`);
    const preview = document.getElementById(`previewModificar${i}`);

    if (!input || !preview) continue;

    input.addEventListener("change", function () {
      if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
          preview.src = e.target.result;
          preview.classList.remove("d-none");
        };

        reader.readAsDataURL(input.files[0]);
      }
    });
  }
}

async function guardarModificacionProducto(e) {
  e.preventDefault();

  const confirmar = confirm("¿Modificar este producto?");

  if (!confirmar) return;

  const docId = document.getElementById("docIdProducto")?.value;

  if (!docId) {
    mostrarMensajeModificarProducto("No se encontró el producto.", "error");
    return;
  }

  const titulo = document.getElementById("tituloModificar")?.value.trim();
  const precio = document.getElementById("precioModificar")?.value.trim();
  const descripcion = document
    .getElementById("descripcionModificar")
    ?.value.trim();

  if (!titulo || !precio) {
    mostrarMensajeModificarProducto("Completá título y precio.", "error");
    return;
  }

  const formModificar = document.getElementById("formModificarProducto");
  const originalesRaw = formModificar?.dataset.originales;
  const urlsOriginales = originalesRaw ? JSON.parse(originalesRaw) : {};

  try {
    const btnGuardar = document.getElementById("btnGuardarCambiosProducto");

    if (btnGuardar) {
      btnGuardar.disabled = true;
      btnGuardar.textContent = "Guardando...";
    }

    mostrarMensajeModificarProducto("Procesando imágenes...", "info");

    const nuevasURLs = [];

    for (let i = 1; i <= CANTIDAD_IMAGENES_PRODUCTO; i++) {
      const key = i === 1 ? "imagen" : `imagen${i}`;
      const file = document.getElementById(`imagenModificar${i}`)?.files[0];
      const eliminarEsta = document.getElementById(
        `eliminarImagen${i}`,
      )?.checked;
      const urlOriginal = urlsOriginales[key] || "";

      if (eliminarEsta && urlOriginal) {
        await eliminarImagenStoragePorUrl(urlOriginal);
        nuevasURLs.push("");
      } else if (file) {
        if (urlOriginal) {
          await eliminarImagenStoragePorUrl(urlOriginal);
        }

        const numeroProducto = docId.replace(/\D/g, "") || Date.now();

        const url = await subirImagenProductoStorage(
          file,
          numeroProducto,
          `imagen-${i}`,
        );

        nuevasURLs.push(url);
      } else {
        nuevasURLs.push(urlOriginal);
      }
    }

    mostrarMensajeModificarProducto("Guardando cambios...", "info");

    await db
      .collection("productos")
      .doc(docId)
      .update({
        titulo,
        precio,
        descripcion,
        imagen: nuevasURLs[0] || "",
        imagen2: nuevasURLs[1] || "",
        imagen3: nuevasURLs[2] || "",
        imagen4: nuevasURLs[3] || "",
        imagen5: nuevasURLs[4] || "",
        imagen6: nuevasURLs[5] || "",
        actualizadoEn: firebase.firestore.FieldValue.serverTimestamp(),
        actualizadoPor: usuarioActual?.email || "",
      });

    mostrarMensajeModificarProducto("Producto modificado correctamente.", "ok");

    bootstrap.Modal.getInstance(
      document.getElementById("modalModificarProducto"),
    )?.hide();

    reiniciarListadoProductos();
  } catch (error) {
    console.error("Error al guardar modificación:", error);

    mostrarMensajeModificarProducto("Error al guardar los cambios.", "error");
  } finally {
    const btnGuardar = document.getElementById("btnGuardarCambiosProducto");

    if (btnGuardar) {
      btnGuardar.disabled = false;
      btnGuardar.textContent = "Guardar cambios";
    }
  }
}

async function eliminarProducto(idDocumento) {
  const confirmar = confirm("¿Eliminar este producto?");

  if (!confirmar) return;

  try {
    const docRef = db.collection("productos").doc(idDocumento);
    const doc = await docRef.get();

    if (doc.exists) {
      const producto = doc.data();
      const imagenes = obtenerImagenesProducto(producto);

      for (const url of imagenes) {
        await eliminarImagenStoragePorUrl(url);
      }
    }

    await docRef.delete();

    mostrarMensajeProducto("Producto eliminado correctamente.", "ok");

    reiniciarListadoProductos();
  } catch (error) {
    console.error("Error al eliminar producto:", error);

    mostrarMensajeProducto("Error al eliminar el producto.", "error");
  }
}

async function eliminarImagenStoragePorUrl(url) {
  if (!url) return;

  try {
    const path = decodeURIComponent(
      new URL(url).pathname.split("/o/")[1].split("?")[0],
    );

    await storage.ref().child(path).delete();
  } catch (error) {
    console.warn("No se pudo eliminar imagen de Storage:", error);
  }
}

function obtenerExtensionArchivoProducto(nombre) {
  const partes = String(nombre || "").split(".");

  if (partes.length <= 1) return "jpg";

  return partes.pop().toLowerCase();
}

function normalizarNombreArchivoProducto(nombre) {
  return String(nombre || "imagen")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function mostrarMensajeProducto(mensaje, tipo) {
  const el = document.getElementById("mensajeDeProducto");

  if (!el) return;

  aplicarEstiloMensajeProducto(el, mensaje, tipo);
}

function mostrarMensajeModificarProducto(mensaje, tipo) {
  const el = document.getElementById("mensajeModificarProducto");

  if (!el) return;

  aplicarEstiloMensajeProducto(el, mensaje, tipo);
}

function aplicarEstiloMensajeProducto(el, mensaje, tipo) {
  el.textContent = mensaje || "";

  el.classList.remove(
    "text-success",
    "text-danger",
    "text-muted",
    "text-primary",
  );

  if (tipo === "ok") {
    el.classList.add("text-success");
  } else if (tipo === "error") {
    el.classList.add("text-danger");
  } else if (tipo === "info") {
    el.classList.add("text-primary");
  } else {
    el.classList.add("text-muted");
  }
}
