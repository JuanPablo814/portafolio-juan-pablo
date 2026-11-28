/* ==========================================================================
   Portafolio de Juan Pablo González Martínez
   Menú móvil, luz que sigue al mouse, animación al hacer scroll, tarjetas con
   inclinación, filtros de proyectos, vista detallada y validación del formulario.
   Sin librerías externas.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.querySelector(".jp");
  if (!root) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Menú móvil ---------- */
  var toggle = root.querySelector(".nav-toggle");
  var menu = root.querySelector("#menu");

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
  var navLinks = Array.prototype.slice.call(root.querySelectorAll(".site-nav li a"));
  if ("IntersectionObserver" in window && navLinks.length) {
    var sections = navLinks
      .map(function (link) { return root.querySelector(link.getAttribute("href")); })
      .filter(Boolean);

    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          var active = link.getAttribute("href") === "#" + entry.target.id;
          if (active) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ---------- Luz que sigue al mouse ---------- */
  if (finePointer) {
    var targetX = -600, targetY = -600, currentX = -600, currentY = -600, ticking = false;

    window.addEventListener("pointermove", function (event) {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(follow);
      }
    }, { passive: true });

    document.addEventListener("pointerleave", function () {
      targetX = -600;
      targetY = -600;
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(follow);
      }
    });

    function follow() {
      // Movimiento suave: la luz alcanza al mouse poco a poco.
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      root.style.setProperty("--mx", currentX.toFixed(1) + "px");
      root.style.setProperty("--my", currentY.toFixed(1) + "px");
      if (Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
        window.requestAnimationFrame(follow);
      } else {
        ticking = false;
      }
    }
  }

  /* ---------- Animación al hacer scroll ---------- */
  var revealItems = Array.prototype.slice.call(root.querySelectorAll(".jp-reveal"));

  // Retraso escalonado entre elementos hermanos.
  revealItems.forEach(function (item) {
    var siblings = Array.prototype.filter.call(item.parentElement.children, function (child) {
      return child.classList.contains("jp-reveal");
    });
    item.style.setProperty("--d", siblings.indexOf(item) * 90 + "ms");
  });

  function finishReveal(item) {
    // Las tarjetas con inclinación necesitan transformaciones rápidas: se libera la animación de entrada.
    if (item.hasAttribute("data-tilt")) {
      window.setTimeout(function () {
        item.classList.remove("jp-reveal", "is-visible");
        item.style.removeProperty("--d");
      }, 1100);
    }
  }

  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        finishReveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add("is-visible"); });
  }

  /* ---------- Tarjetas con inclinación y brillo ---------- */
  var tiltCards = root.querySelectorAll("[data-tilt]");
  var MAX_TILT = 4;

  tiltCards.forEach(function (card) {
    card.addEventListener("pointermove", function (event) {
      if (event.pointerType !== "mouse") return;
      var box = card.getBoundingClientRect();
      var x = (event.clientX - box.left) / box.width;
      var y = (event.clientY - box.top) / box.height;
      card.style.setProperty("--px", (x * 100).toFixed(1) + "%");
      card.style.setProperty("--py", (y * 100).toFixed(1) + "%");
      if (reduceMotion) return;
      var rotateY = (x - 0.5) * 2 * MAX_TILT;
      var rotateX = (0.5 - y) * 2 * MAX_TILT;
      card.style.transform =
        "perspective(1000px) rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg) translateY(-4px)";
    });
    card.addEventListener("pointerleave", function () {
      card.style.transform = "";
    });
  });

  /* ---------- Filtros de proyectos ---------- */
  var chips = root.querySelectorAll(".chip[data-filter]");
  var projects = root.querySelectorAll("#lista-proyectos .project");
  var filterStatus = root.querySelector("#filtro-estado");

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var filter = chip.getAttribute("data-filter");
      var visible = 0;

      chips.forEach(function (other) {
        other.setAttribute("aria-pressed", String(other === chip));
      });

      projects.forEach(function (project) {
        var show = filter === "all" || project.getAttribute("data-kind") === filter;
        project.classList.toggle("is-hidden", !show);
        if (show) visible += 1;
      });

      if (filterStatus) {
        filterStatus.textContent = visible === 1 ? "Mostrando 1 proyecto." : "Mostrando " + visible + " proyectos.";
      }
    });
  });

  /* ---------- Vista detallada (modal) ---------- */
  var openers = root.querySelectorAll("[data-open-modal]");

  function closeDialog(dialog) {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function countUp(dialog) {
    var numbers = dialog.querySelectorAll("[data-count]");
    numbers.forEach(function (el) {
      var end = parseInt(el.getAttribute("data-count"), 10);
      if (reduceMotion || isNaN(end)) { el.textContent = end; return; }
      var start = null;
      var duration = 900;
      el.textContent = "0";
      function step(time) {
        if (start === null) start = time;
        var progress = Math.min((time - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = String(Math.round(eased * end));
        if (progress < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
      // Asegura el valor final aunque el navegador pause la animación.
      window.setTimeout(function () { el.textContent = String(end); }, duration + 150);
    });
  }

  openers.forEach(function (button) {
    var dialog = document.getElementById(button.getAttribute("data-open-modal"));
    if (!dialog) return;

    button.addEventListener("click", function () {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      document.documentElement.classList.add("jp-modal-open");
      dialog.scrollTop = 0;
      countUp(dialog);
    });

    dialog.addEventListener("close", function () {
      document.documentElement.classList.remove("jp-modal-open");
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

  /* ---------- Validación del formulario de contacto ---------- */
  var form = root.querySelector("#form-contacto");
  var status = root.querySelector("#form-status");
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
        status.style.color = "#ff9db4";
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
