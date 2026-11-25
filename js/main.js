/* ==========================================================================
   Portafolio de Juan Pablo González Martínez
   Menú móvil, vista detallada (modal), sección activa y validación del formulario.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- Menú móvil ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("menu");

  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".visually-hidden").textContent = open ? "Cerrar menú" : "Abrir menú";
    menu.classList.toggle("is-open", open);
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  /* ---------- Sección activa en el menú ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".site-nav a"));
  if ("IntersectionObserver" in window && links.length) {
    var sections = links
      .map(function (link) { return document.querySelector(link.getAttribute("href")); })
      .filter(Boolean);

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          var active = link.getAttribute("href") === "#" + entry.target.id;
          if (active) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ---------- Vista detallada (modal) ---------- */
  var openers = document.querySelectorAll("[data-open-modal]");

  openers.forEach(function (button) {
    var dialog = document.getElementById(button.getAttribute("data-open-modal"));
    if (!dialog) return;

    button.addEventListener("click", function () {
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
      document.body.classList.add("modal-open");
      dialog.scrollTop = 0;
    });

    dialog.addEventListener("close", function () {
      document.body.classList.remove("modal-open");
      button.focus();
    });

    dialog.addEventListener("click", function (event) {
      // Cierra al hacer clic en el fondo oscuro, fuera del contenido.
      if (event.target === dialog) closeDialog(dialog);
    });

    dialog.querySelectorAll("[data-close-modal]").forEach(function (closeButton) {
      closeButton.addEventListener("click", function () { closeDialog(dialog); });
    });
  });

  function closeDialog(dialog) {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  /* ---------- Validación del formulario de contacto ---------- */
  var form = document.getElementById("form-contacto");
  var status = document.getElementById("form-status");
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var rules = {
    nombre: function (value) {
      if (value.length < 2) return "Escribe tu nombre, de al menos 2 letras.";
      return "";
    },
    correo: function (value) {
      if (!value) return "Escribe tu correo para poder responderte.";
      if (!EMAIL_RE.test(value)) return "Revisa el correo. Debe verse como nombre@dominio.com.";
      return "";
    },
    mensaje: function (value) {
      if (value.length < 20) return "Cuéntame un poco más. El mensaje necesita al menos 20 caracteres.";
      return "";
    }
  };

  function validateField(field) {
    var rule = rules[field.name];
    var message = rule ? rule(field.value.trim()) : "";
    var errorBox = document.getElementById(field.id + "-error");
    if (errorBox) errorBox.textContent = message;
    field.setAttribute("aria-invalid", message ? "true" : "false");
    return !message;
  }

  if (form) {
    var fields = Array.prototype.slice.call(form.querySelectorAll("input, textarea"));

    fields.forEach(function (field) {
      field.addEventListener("blur", function () { validateField(field); });
      field.addEventListener("input", function () {
        if (field.getAttribute("aria-invalid") === "true") validateField(field);
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      status.textContent = "";

      var firstInvalid = null;
      fields.forEach(function (field) {
        if (!validateField(field) && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        status.style.color = "#ffb3b3";
        status.textContent = "Corrige los campos marcados para enviar el mensaje.";
        return;
      }

      // Sitio estático: el mensaje se envía abriendo el cliente de correo del visitante.
      var nombre = form.nombre.value.trim();
      var correo = form.correo.value.trim();
      var mensaje = form.mensaje.value.trim();
      var asunto = "Contacto desde tu portafolio: " + nombre;
      var cuerpo = mensaje + "\n\n" + nombre + "\n" + correo;

      status.style.color = "";
      status.textContent = "Listo. Se abrió tu aplicación de correo con el mensaje. Si no se abrió, escribe a juanpgonzalez116@gmail.com.";
      window.location.href =
        "mailto:juanpgonzalez116@gmail.com?subject=" + encodeURIComponent(asunto) +
        "&body=" + encodeURIComponent(cuerpo);
      form.reset();
      fields.forEach(function (field) { field.removeAttribute("aria-invalid"); });
    });
  }
})();
