/* ==========================================================================
   CSC500 — shared deck runtime
   - Boots reveal.js with the course's standard configuration
   - Wires up accordions (<details class="acc">) so they don't fight reveal
   - Wires up concept modals (<template class="csc-modal-tpl">)
   Every week deck loads this same file.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- modal */
  var overlay, modalEl, titleEl, kickerEl, bodyEl, lastTrigger = null;

  function buildOverlay() {
    overlay = document.createElement("div");
    overlay.className = "csc-modal-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML =
      '<div class="csc-modal">' +
        '<header>' +
          '<div><span class="kicker"></span><h3></h3></div>' +
          '<button class="close" type="button" aria-label="Close">&#10005;</button>' +
        '</header>' +
        '<div class="csc-modal-body"></div>' +
      '</div>';
    document.body.appendChild(overlay);

    modalEl  = overlay.querySelector(".csc-modal");
    titleEl  = overlay.querySelector("h3");
    kickerEl = overlay.querySelector(".kicker");
    bodyEl   = overlay.querySelector(".csc-modal-body");

    overlay.querySelector(".close").addEventListener("click", closeModal);
    overlay.addEventListener("mousedown", function (e) {
      if (e.target === overlay) closeModal();
    });
  }

  function highlightWithin(root) {
    var hl = null;
    try {
      if (window.Reveal && Reveal.getPlugin) {
        var p = Reveal.getPlugin("highlight");
        if (p && p.hljs) hl = p.hljs;
      }
    } catch (err) { /* ignore */ }
    if (!hl && window.hljs) hl = window.hljs;
    if (!hl) return;
    root.querySelectorAll("pre code").forEach(function (block) {
      if (block.dataset.hlDone) return;
      try { hl.highlightElement(block); } catch (err) { /* ignore */ }
      block.dataset.hlDone = "1";
    });
  }

  function openModal(id, trigger) {
    var tpl = document.getElementById(id);
    if (!tpl) { console.warn("[csc500] no modal template with id", id); return; }

    lastTrigger = trigger || null;
    kickerEl.textContent = tpl.dataset.kicker || "Concept";
    titleEl.textContent  = tpl.dataset.title || (trigger ? trigger.textContent.trim() : "Detail");

    bodyEl.innerHTML = "";
    bodyEl.appendChild(tpl.content.cloneNode(true));
    highlightWithin(bodyEl);

    bodyEl.scrollTop = 0;
    overlay.classList.add("open");
    document.body.classList.add("modal-open");

    // Stop reveal from stealing arrow keys / space while the modal is up.
    if (window.Reveal && Reveal.configure) Reveal.configure({ keyboard: false });
    setTimeout(function () { overlay.querySelector(".close").focus(); }, 30);
  }

  function closeModal() {
    if (!overlay || !overlay.classList.contains("open")) return;
    overlay.classList.remove("open");
    document.body.classList.remove("modal-open");
    bodyEl.innerHTML = "";
    if (window.Reveal && Reveal.configure) Reveal.configure({ keyboard: true });
    if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
    lastTrigger = null;
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay && overlay.classList.contains("open")) {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
    }
  }, true);

  // Delegated trigger: anything with [data-modal]
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-modal]");
    if (!t) return;
    e.preventDefault();
    e.stopPropagation();
    openModal(t.getAttribute("data-modal"), t);
  });

  // Keyboard-accessible triggers
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var t = document.activeElement && document.activeElement.closest
      ? document.activeElement.closest("[data-modal]") : null;
    if (!t) return;
    e.preventDefault();
    openModal(t.getAttribute("data-modal"), t);
  });

  /* ------------------------------------------------------------ accordion */
  function wireAccordions() {
    document.querySelectorAll("details.acc > summary").forEach(function (s) {
      if (s.dataset.wired) return;
      s.dataset.wired = "1";
      // Keep space/enter on a summary from also paging the deck.
      s.addEventListener("keydown", function (e) {
        if (e.key === " " || e.key === "Enter") e.stopPropagation();
      });
      s.addEventListener("click", function (e) { e.stopPropagation(); });
    });
    // Highlight code that lives inside accordions (reveal handles slide-level
    // <pre><code> itself, but nested ones inside <details> are handled too —
    // this is a safety net for any that were missed).
    document.querySelectorAll("details.acc").forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (d.open) highlightWithin(d);
      });
    });
  }

  /* ----------------------------------------------------------- code chips */
  function tagCodeLanguages() {
    document.querySelectorAll(".reveal pre > code[class*='language-']").forEach(function (code) {
      var m = /language-([\w-]+)/.exec(code.className);
      if (!m) return;
      var lang = m[1];
      var pre = code.parentElement;
      if (lang === "text" || lang === "plaintext") {
        // Terminal styling, but no language chip — these blocks are program
        // output, shell commands and ASCII diagrams, so a label would mislead.
        pre.classList.add("output");
      } else {
        pre.setAttribute("data-lang", lang);
      }
    });
  }

  /* ------------------------------------------------------- auto-fit slides */
  /* A handful of slides (vocabulary tables, long summaries) are taller than
     the 1280x800 stage. Rather than let them scroll during a lecture, shrink
     them just enough to fit. Measured with accordions closed; opening one
     scrolls inside the accordion, which has its own max-height. */
  var STAGE_H = 796, MIN_ZOOM = 0.58;

  function fitAllSlides() {
    var sections = document.querySelectorAll(".reveal .slides > section");
    var restore = [];
    sections.forEach(function (s) {
      restore.push([s, s.style.display, s.style.zoom]);
      s.style.zoom = "";
      s.style.display = "block";
    });
    // Force one layout pass, then measure everything.
    void document.body.offsetHeight;
    var zooms = [];
    sections.forEach(function (s) {
      var h = s.scrollHeight;
      zooms.push(h > STAGE_H ? Math.max(MIN_ZOOM, STAGE_H / h) : 0);
    });
    restore.forEach(function (r, i) {
      r[0].style.display = r[1];
      if (zooms[i]) {
        r[0].style.zoom = zooms[i];
        // max-height is measured in the zoomed coordinate space, so lift the
        // stylesheet's 800px cap — the content now fits the stage on its own.
        r[0].style.maxHeight = "none";
        r[0].dataset.autofit = zooms[i].toFixed(3);
      } else {
        r[0].style.zoom = "";
        r[0].style.maxHeight = "";
        delete r[0].dataset.autofit;
      }
    });
  }

  /* ----------------------------------------------------------------- boot */
  function boot(userOptions) {
    buildOverlay();

    var deck = document.querySelector(".reveal");
    var opts = Object.assign({
      hash: true,
      history: false,
      center: false,
      width: 1280,
      height: 800,
      margin: 0.055,
      minScale: 0.2,
      maxScale: 1.8,
      transition: "slide",
      transitionSpeed: "fast",
      backgroundTransition: "fade",
      slideNumber: "c/t",
      showSlideNumber: "speaker",
      controls: true,
      controlsTutorial: false,
      progress: true,
      overview: true,
      pdfSeparateFragments: false,
      plugins: [RevealHighlight, RevealNotes, RevealZoom, RevealSearch]
    }, userOptions || {});

    Reveal.initialize(opts).then(function () {
      tagCodeLanguages();
      wireAccordions();
      fitAllSlides();

      function syncTitleState() {
        var idx = Reveal.getIndices();
        deck.classList.toggle("title-active", idx.h === 0 && !idx.v);
      }
      syncTitleState();
      Reveal.on("slidechanged", function () {
        syncTitleState();
        wireAccordions();
        closeModal();
      });
    });

    // '?' toggles reveal's help overlay already; add 'f' for fullscreen hint only.
  }

  window.CSC500 = { boot: boot, openModal: openModal, closeModal: closeModal };
})();
