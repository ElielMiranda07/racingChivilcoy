let ultimoDocNoticias = null;
let cargandoNoticias = false;

const LIMITE_NOTICIAS = 6;

function renderModuloNoticias() {
  const contenedor = document.getElementById("contenedorModulo");

  if (!contenedor) return;

  ultimoDocNoticias = null;
  cargandoNoticias = false;

  contenedor.innerHTML = `
    <div class="row g-4">

      <div class="col-12 col-xl-5">
        <div class="admin-card h-100">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h3 class="admin-section-title mb-1">
                Carga de noticias
              </h3>

              <p class="text-muted mb-0">
                Publicá novedades, imágenes y comunicados en la web institucional.
              </p>
            </div>

            <div class="noticias-icon-box">
              <i class="bi bi-newspaper"></i>
            </div>
          </div>

          <div class="admin-info-box mb-4">
            <strong>Tener en cuenta</strong>

            <p class="mb-0">
              El copete debe ser breve. Si la noticia es extensa o usa dos imágenes,
              dividí el texto entre cuerpo principal y segunda parte.
            </p>
          </div>

          <form id="noticiaACargar">
            <div class="mb-3">
              <label class="form-label admin-form-label">
                Título
              </label>

              <input
                type="text"
                class="form-control admin-input"
                id="tituloACargar"
                placeholder="Título de la noticia"
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
                id="urlImagenPrincipalACargar"
                accept="image/*"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label admin-form-label">
                Copete
              </label>

              <textarea
                class="form-control admin-input"
                maxlength="300"
                id="copeteACargar"
                rows="3"
                placeholder="Resumen breve de la noticia"
                required
              ></textarea>

              <small class="text-muted">
                Máximo 300 caracteres.
              </small>
            </div>

            <div class="mb-3">
              <label class="form-label admin-form-label">
                Cuerpo de noticia
              </label>

              <textarea
                class="form-control admin-input"
                maxlength="1300"
                id="cuerpoNoticiaACargar"
                rows="5"
                placeholder="Texto principal de la noticia"
                required
              ></textarea>

              <small class="text-muted">
                Máximo 1300 caracteres.
              </small>
            </div>

            <div class="mb-3">
              <label class="form-label admin-form-label">
                Cuerpo de noticia - Segunda parte
              </label>

              <textarea
                class="form-control admin-input"
                maxlength="1300"
                id="cuerpoNoticiaACargar2"
                rows="5"
                placeholder="Texto secundario, opcional"
              ></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label admin-form-label">
                Imagen secundaria
              </label>

              <input
                type="file"
                class="form-control admin-input"
                id="urlImagenSecundariaACargar"
                accept="image/*"
              />
            </div>

            <div class="mb-4">
              <label class="form-label admin-form-label">
                Categoría
              </label>

              <div class="admin-category-grid">
                ${renderRadioCategoria("categoriaI", "Inferiores", true)}
                ${renderRadioCategoria("categoriau19", "U 19")}
                ${renderRadioCategoria("categoriau21", "U 21")}
                ${renderRadioCategoria("categoriaP", "Primera Local")}
                ${renderRadioCategoria("categoriaLA", "Liga Argentina")}
                ${renderRadioCategoria("categoriaLN", "Liga Nacional")}
                ${renderRadioCategoria("categoriaLP", "Liga Próximo")}
              </div>
            </div>

            <button
              id="btnGuardarNoticia"
              type="submit"
              class="btn-admin-primary w-100"
            >
              Guardar noticia
            </button>

            <p id="mensajeDeNoticia" class="admin-module-message mt-3 mb-0"></p>
          </form>
        </div>
      </div>

      <div class="col-12 col-xl-7">
        <div class="admin-card h-100">
          <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h3 class="admin-section-title mb-1">
                Vista previa de noticias
              </h3>

              <p class="text-muted mb-0">
                Últimas noticias cargadas en la web.
              </p>
            </div>

            <button
              id="btnRefrescarNoticias"
              type="button"
              class="btn-admin-outline"
            >
              <i class="bi bi-arrow-clockwise me-1"></i>
              Refrescar
            </button>
          </div>

          <div
            id="divContenedorNoticias"
            class="noticias-admin-grid"
          >
            <div class="admin-loading-card">
              <div class="spinner-border" role="status"></div>

              <p class="mt-3 mb-0">
                Cargando noticias...
              </p>
            </div>
          </div>

          <div class="text-center mt-4">
            <button
              id="btnCargarMas"
              class="btn-admin-outline"
              type="button"
            >
              Cargar más noticias
            </button>
          </div>
        </div>
      </div>

    </div>

    <div class="modal fade" id="modalNoticia" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content admin-modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalTitulo"></h5>

            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>

          <div class="modal-body">
            <img
              id="modalImgPrincipal"
              class="img-fluid rounded-4 mb-3 w-100"
              alt="Imagen principal"
            />

            <p id="modalCopete" class="fw-bold text-muted"></p>

            <p id="modalCuerpo1"></p>

            <img
              id="modalImgSecundaria"
              class="img-fluid rounded-4 my-3 w-100 d-none"
              alt="Imagen secundaria"
            />

            <p id="modalCuerpo2"></p>
          </div>
        </div>
      </div>
    </div>
  `;

  inicializarModuloNoticias();
}

function renderRadioCategoria(id, label, checked = false) {
  return `
    <input
      type="radio"
      class="btn-check"
      name="categoriaNoticia"
      id="${id}"
      autocomplete="off"
      ${checked ? "checked" : ""}
    />

    <label class="btn admin-category-btn" for="${id}">
      ${label}
    </label>
  `;
}

function inicializarModuloNoticias() {
  const form = document.getElementById("noticiaACargar");
  const btnCargarMas = document.getElementById("btnCargarMas");
  const btnRefrescar = document.getElementById("btnRefrescarNoticias");

  if (form) {
    form.addEventListener("submit", guardarNoticia);
  }

  if (btnCargarMas) {
    btnCargarMas.addEventListener("click", cargarNoticias);
  }

  if (btnRefrescar) {
    btnRefrescar.addEventListener("click", reiniciarListadoNoticias);
  }

  reiniciarListadoNoticias();
}

async function guardarNoticia(e) {
  e.preventDefault();

  const titulo = document.getElementById("tituloACargar")?.value.trim();
  const copete = document.getElementById("copeteACargar")?.value.trim();
  const cuerpoNoticia = document
    .getElementById("cuerpoNoticiaACargar")
    ?.value.trim();

  const cuerpoNoticia2 = document
    .getElementById("cuerpoNoticiaACargar2")
    ?.value.trim();

  const imagenPrincipal = document.getElementById("urlImagenPrincipalACargar")
    ?.files[0];

  const imagenSecundaria = document.getElementById("urlImagenSecundariaACargar")
    ?.files[0];

  const categoria = document.querySelector(
    'input[name="categoriaNoticia"]:checked',
  )?.id;

  if (!titulo || !copete || !cuerpoNoticia || !imagenPrincipal || !categoria) {
    mostrarMensajeNoticia("Completá los campos obligatorios.", "error");
    return;
  }

  try {
    const btnGuardar = document.getElementById("btnGuardarNoticia");

    if (btnGuardar) {
      btnGuardar.disabled = true;
      btnGuardar.textContent = "Guardando noticia...";
    }

    mostrarMensajeNoticia("Subiendo imágenes...", "info");

    const noticiasRef = db.collection("noticias");

    const snapshot = await noticiasRef.orderBy("numero", "desc").limit(1).get();

    let siguienteNumero = 1;

    if (!snapshot.empty) {
      siguienteNumero = Number(snapshot.docs[0].data().numero || 0) + 1;
    }

    const nombreDocumento = `noticia ${siguienteNumero}`;

    const imagenPrincipalUrl = await subirImagenNoticia(
      imagenPrincipal,
      siguienteNumero,
      "principal",
    );

    let imagenSecundariaUrl = "";

    if (imagenSecundaria) {
      imagenSecundariaUrl = await subirImagenNoticia(
        imagenSecundaria,
        siguienteNumero,
        "secundaria",
      );
    }

    mostrarMensajeNoticia("Guardando datos...", "info");

    await noticiasRef.doc(nombreDocumento).set({
      titulo,
      copete,
      cuerpoNoticia,
      cuerpoNoticia2: cuerpoNoticia2 || "",
      imagenPrincipal: imagenPrincipalUrl,
      imagenSecundaria: imagenSecundariaUrl,
      fechaDeCarga: firebase.firestore.FieldValue.serverTimestamp(),
      categoria,
      numero: siguienteNumero,
      creadoPor: usuarioActual?.email || "",
    });

    mostrarMensajeNoticia(
      `Noticia guardada correctamente: ${nombreDocumento}`,
      "ok",
    );

    document.getElementById("noticiaACargar")?.reset();

    reiniciarListadoNoticias();
  } catch (error) {
    console.error("Error al guardar noticia:", error);

    mostrarMensajeNoticia("Error al guardar la noticia.", "error");
  } finally {
    const btnGuardar = document.getElementById("btnGuardarNoticia");

    if (btnGuardar) {
      btnGuardar.disabled = false;
      btnGuardar.textContent = "Guardar noticia";
    }
  }
}

async function subirImagenNoticia(archivo, numero, tipo) {
  const extension = obtenerExtensionArchivo(archivo.name);

  const nombreSeguro = normalizarNombreArchivo(
    archivo.name.replace(`.${extension}`, ""),
  );

  const nombreArchivo = `noticia-${numero}-${tipo}-${Date.now()}-${nombreSeguro}.${extension}`;

  const ref = storage.ref().child(`noticias/${nombreArchivo}`);

  const snapshot = await ref.put(archivo, {
    contentType: archivo.type || "image/jpeg",
  });

  return await snapshot.ref.getDownloadURL();
}

function obtenerExtensionArchivo(nombre) {
  const partes = String(nombre || "").split(".");

  if (partes.length <= 1) return "jpg";

  return partes.pop().toLowerCase();
}

function normalizarNombreArchivo(nombre) {
  return String(nombre || "imagen")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function reiniciarListadoNoticias() {
  ultimoDocNoticias = null;

  const contenedorNoticias = document.getElementById("divContenedorNoticias");

  if (contenedorNoticias) {
    contenedorNoticias.innerHTML = `
      <div class="admin-loading-card">
        <div class="spinner-border" role="status"></div>

        <p class="mt-3 mb-0">
          Cargando noticias...
        </p>
      </div>
    `;
  }

  const btnCargarMas = document.getElementById("btnCargarMas");

  if (btnCargarMas) {
    btnCargarMas.style.display = "inline-flex";
  }

  cargarNoticias();
}

async function cargarNoticias() {
  if (cargandoNoticias) return;

  cargandoNoticias = true;

  const noticiasRef = db.collection("noticias");
  const contenedorNoticias = document.getElementById("divContenedorNoticias");
  const btnCargarMas = document.getElementById("btnCargarMas");

  if (!contenedorNoticias) return;

  try {
    let query = noticiasRef
      .orderBy("fechaDeCarga", "desc")
      .limit(LIMITE_NOTICIAS);

    if (ultimoDocNoticias) {
      query = query.startAfter(ultimoDocNoticias);
    }

    const snapshot = await query.get();

    if (!ultimoDocNoticias) {
      contenedorNoticias.innerHTML = "";
    }

    if (snapshot.empty) {
      if (!ultimoDocNoticias) {
        contenedorNoticias.innerHTML = `
          <div class="admin-empty-state">
            <i class="bi bi-newspaper"></i>

            <p>No hay noticias cargadas todavía.</p>
          </div>
        `;
      }

      if (btnCargarMas) {
        btnCargarMas.style.display = "none";
      }

      return;
    }

    ultimoDocNoticias = snapshot.docs[snapshot.docs.length - 1];

    snapshot.forEach((doc) => {
      const noticia = doc.data();

      contenedorNoticias.insertAdjacentHTML(
        "beforeend",
        renderCardNoticia(doc.id, noticia),
      );
    });

    if (snapshot.docs.length < LIMITE_NOTICIAS && btnCargarMas) {
      btnCargarMas.style.display = "none";
    }
  } catch (error) {
    console.error("Error al cargar noticias:", error);

    contenedorNoticias.innerHTML = `
      <div class="admin-empty-state text-danger">
        <i class="bi bi-exclamation-triangle-fill"></i>

        <p>Error al cargar noticias.</p>
      </div>
    `;
  } finally {
    cargandoNoticias = false;
  }
}

function renderCardNoticia(docId, noticia) {
  const fecha = noticia.fechaDeCarga?.toDate
    ? noticia.fechaDeCarga.toDate().toLocaleDateString("es-AR")
    : "-";

  return `
    <article class="noticia-admin-card">
      <img
        src="${noticia.imagenPrincipal || "./media/placeholder.jpg"}"
        alt="${noticia.titulo || "Noticia"}"
        class="noticia-admin-img"
      />

      <div class="noticia-admin-body">
        <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
          <span class="noticia-admin-category">
            ${obtenerNombreCategoriaNoticia(noticia.categoria)}
          </span>

          <small class="text-muted">
            ${fecha}
          </small>
        </div>

        <h4>
          ${noticia.titulo || "Sin título"}
        </h4>

        <p>
          ${noticia.copete || ""}
        </p>

        <div class="noticia-admin-actions">
          <button
            class="btn btn-sm btn-admin-primary"
            type="button"
            onclick="abrirModalNoticia('${docId}')"
          >
            Ver más
          </button>

          <button
            class="btn btn-sm btn-outline-info fw-bold"
            type="button"
            onclick="compartirNoticia('${docId}')"
          >
            Compartir
          </button>

          <button
            class="btn btn-sm btn-danger fw-bold"
            type="button"
            onclick="eliminarNoticia('${docId}')"
          >
            Eliminar
          </button>
        </div>
      </div>
    </article>
  `;
}

async function abrirModalNoticia(idNoticia) {
  try {
    const doc = await db.collection("noticias").doc(idNoticia).get();

    if (!doc.exists) return;

    const noticia = doc.data();

    const imgSecundaria = document.getElementById("modalImgSecundaria");

    document.getElementById("modalTitulo").textContent =
      noticia.titulo || "Noticia";

    document.getElementById("modalImgPrincipal").src =
      noticia.imagenPrincipal || "";

    document.getElementById("modalCopete").textContent = noticia.copete || "";

    document.getElementById("modalCuerpo1").textContent =
      noticia.cuerpoNoticia || "";

    document.getElementById("modalCuerpo2").textContent =
      noticia.cuerpoNoticia2 || "";

    if (imgSecundaria) {
      if (noticia.imagenSecundaria) {
        imgSecundaria.src = noticia.imagenSecundaria;
        imgSecundaria.classList.remove("d-none");
      } else {
        imgSecundaria.src = "";
        imgSecundaria.classList.add("d-none");
      }
    }

    const modal = new bootstrap.Modal(document.getElementById("modalNoticia"));

    modal.show();
  } catch (error) {
    console.error("Error al abrir noticia:", error);
  }
}

async function eliminarNoticia(idDocumento) {
  const confirmar = confirm("¿Eliminar esta noticia?");

  if (!confirmar) return;

  try {
    await db.collection("noticias").doc(idDocumento).delete();

    mostrarMensajeNoticia("Noticia eliminada correctamente.", "ok");

    reiniciarListadoNoticias();
  } catch (error) {
    console.error("Error al eliminar noticia:", error);

    mostrarMensajeNoticia("Error al eliminar la noticia.", "error");
  }
}

function compartirNoticia(docId) {
  const modalId = docId.replace(/\s+/g, "");

  const baseUrl = "https://www.racingclubchivilcoy.com.ar/pages/noticias.html";

  const urlCompleta = `${baseUrl}?noticia=${modalId}`;

  navigator.clipboard
    .writeText(urlCompleta)
    .then(() => {
      mostrarMensajeNoticia("Enlace copiado al portapapeles.", "ok");
    })
    .catch((error) => {
      console.error("Error al copiar enlace:", error);

      mostrarMensajeNoticia("No se pudo copiar el enlace.", "error");
    });
}

function obtenerNombreCategoriaNoticia(categoria) {
  const categorias = {
    categoriaI: "Inferiores",
    categoriau19: "U 19",
    categoriau21: "U 21",
    categoriaP: "Primera Local",
    categoriaLA: "Liga Argentina",
    categoriaLN: "Liga Nacional",
    categoriaLP: "Liga Próximo",
  };

  return categorias[categoria] || categoria || "Sin categoría";
}

function mostrarMensajeNoticia(mensaje, tipo) {
  const el = document.getElementById("mensajeDeNoticia");

  if (!el) return;

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
