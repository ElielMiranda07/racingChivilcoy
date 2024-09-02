document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("formActualizarPartidoUno")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      let unoActualizarFyH = document.getElementById("unoActualizarFyH").value;
      let unoActualizarRival =
        document.getElementById("unoActualizarRival").value;
      let unoActualizarUbi = document.getElementById("unoActualizarUbi").value;

      document.getElementById("unoGuardarFyH").textContent = unoActualizarFyH;
      document.getElementById("unoGuardarRival").textContent =
        unoActualizarRival;
      document.getElementById("unoGuardarUbi").textContent = unoActualizarUbi;
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

      document.getElementById("dosGuardarFyH").textContent = dosActualizarFyH;
      document.getElementById("dosGuardarRival").textContent =
        dosActualizarRival;
      document.getElementById("dosGuardarUbi").textContent = dosActualizarUbi;
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

      document.getElementById("tresGuardarFyH").textContent = tresActualizarFyH;
      document.getElementById("tresGuardarRival").textContent =
        tresActualizarRival;
      document.getElementById("tresGuardarUbi").textContent = tresActualizarUbi;
    });
});

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("formGuardarPartidos")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      let partidoUnoFyH = document.getElementById("unoGuardarFyH").textContent;
      let partidoUnoRival =
        document.getElementById("unoGuardarRival").textContent;
      let partidoUnoUbi = document.getElementById("unoGuardarUbi").textContent;
      let partidoDosFyH = document.getElementById("dosGuardarFyH").textContent;
      let partidoDosRival =
        document.getElementById("dosGuardarRival").textContent;
      let partidoDosUbi = document.getElementById("dosGuardarUbi").textContent;
      let partidoTresFyH =
        document.getElementById("tresGuardarFyH").textContent;
      let partidoTresRival =
        document.getElementById("tresGuardarRival").textContent;
      let partidoTresUbi =
        document.getElementById("tresGuardarUbi").textContent;

      console.log(partidoUnoFyH, partidoUnoRival, partidoUnoUbi);
      console.log(partidoDosFyH, partidoDosRival, partidoDosUbi);
      console.log(partidoTresFyH, partidoTresRival, partidoTresUbi);
    });
});

/*document.getElementById("partidoUnoFyH").textContent = partidoUnoFyH;
document.getElementById("partidoUnoRival").textContent = partidoUnoRival;
document.getElementById("partidoUnoUbi").textContent = partidoUnoUbi;*/
