/* ============================================================
   Alpine Capital ECM Credentials
   View router + slide deck viewer
   ============================================================ */
(function () {
  "use strict";

  var TOTAL = 31; // number of slides rendered from the deck

  /* ---------- slide path helper ---------- */
  function slidePath(n) {
    var s = n < 10 ? "0" + n : "" + n;
    return "assets/slides/slide-" + s + ".jpg";
  }

  /* ---------- element refs ---------- */
  var views = {
    home: document.getElementById("view-home"),
    deck: document.getElementById("view-deck"),
    account: document.getElementById("view-account")
  };
  var topbar = document.getElementById("topbar");
  var navLinks = document.querySelectorAll("[data-nav]");

  var slideImg = document.getElementById("slideImg");
  var counter = document.getElementById("counter");
  var progFill = document.getElementById("progFill");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var stage = document.getElementById("stage");

  var btnGrid = document.getElementById("btnGrid");
  var btnFull = document.getElementById("btnFull");
  var thumbs = document.getElementById("thumbs");
  var thumbsGrid = document.getElementById("thumbsGrid");
  var closeThumbs = document.getElementById("closeThumbs");

  var current = 1;
  var thumbsBuilt = false;

  /* ---------- ROUTER ---------- */
  function routeFromHash() {
    var h = (location.hash || "#home").replace("#", "");
    if (!views[h]) h = "home";
    showView(h);
  }

  function showView(name) {
    Object.keys(views).forEach(function (k) {
      var active = k === name;
      views[k].classList.toggle("is-active", active);
      views[k].setAttribute("aria-hidden", active ? "false" : "true");
    });
    // nav highlight
    navLinks.forEach(function (a) {
      a.setAttribute("aria-current", a.getAttribute("data-nav") === name ? "true" : "false");
    });
    // topbar visibility: hide on deck (deck has its own bar)
    topbar.style.display = name === "deck" ? "none" : "flex";

    if (name === "deck") {
      goTo(current, true);
    } else {
      closeThumbsPanel();
    }
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", routeFromHash);

  // Intercept nav clicks for instant switching (still updates hash)
  navLinks.forEach(function (a) {
    a.addEventListener("click", function (e) {
      var target = a.getAttribute("data-nav");
      if (target && views[target]) {
        e.preventDefault();
        location.hash = target;
      }
    });
  });

  /* ---------- DECK NAVIGATION ---------- */
  function goTo(n, instant) {
    n = Math.max(1, Math.min(TOTAL, n));
    current = n;

    function swap() {
      slideImg.src = slidePath(n);
      slideImg.alt = "Alpine Capital ECM deck, slide " + n + " of " + TOTAL;
    }

    if (instant) {
      swap();
      slideImg.classList.remove("is-fading");
    } else {
      slideImg.classList.add("is-fading");
      setTimeout(function () {
        swap();
        slideImg.classList.remove("is-fading");
      }, 150);
    }

    counter.textContent = n + " / " + TOTAL;
    progFill.style.width = (n / TOTAL) * 100 + "%";
    prevBtn.disabled = n === 1;
    nextBtn.disabled = n === TOTAL;

    // preload neighbours
    preload(n + 1);
    preload(n - 1);

    // sync thumbnail highlight
    if (thumbsBuilt) {
      var tiles = thumbsGrid.querySelectorAll(".thumb");
      tiles.forEach(function (t, i) {
        t.classList.toggle("is-current", i + 1 === n);
      });
    }
  }

  var preloaded = {};
  function preload(n) {
    if (n < 1 || n > TOTAL || preloaded[n]) return;
    var img = new Image();
    img.src = slidePath(n);
    preloaded[n] = true;
  }

  function next() { if (current < TOTAL) goTo(current + 1); }
  function prev() { if (current > 1) goTo(current - 1); }

  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);

  /* ---------- KEYBOARD ---------- */
  document.addEventListener("keydown", function (e) {
    if (!views.deck.classList.contains("is-active")) return;
    if (thumbs.classList.contains("is-open")) {
      if (e.key === "Escape") closeThumbsPanel();
      return;
    }
    switch (e.key) {
      case "ArrowRight":
      case " ":
      case "PageDown":
        e.preventDefault(); next(); break;
      case "ArrowLeft":
      case "PageUp":
        e.preventDefault(); prev(); break;
      case "Home": e.preventDefault(); goTo(1); break;
      case "End": e.preventDefault(); goTo(TOTAL); break;
      case "Escape": location.hash = "home"; break;
    }
  });

  /* ---------- TOUCH / SWIPE ---------- */
  var touchX = null, touchY = null;
  stage.addEventListener("touchstart", function (e) {
    touchX = e.changedTouches[0].clientX;
    touchY = e.changedTouches[0].clientY;
  }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    var dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next(); else prev();
    }
    touchX = touchY = null;
  }, { passive: true });

  /* ---------- FULLSCREEN ---------- */
  btnFull.addEventListener("click", function () {
    var el = views.deck;
    if (!document.fullscreenElement) {
      (el.requestFullscreen || el.webkitRequestFullscreen || function () {}).call(el);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen || function () {}).call(document);
    }
  });

  /* ---------- THUMBNAILS ---------- */
  function buildThumbs() {
    if (thumbsBuilt) return;
    var frag = document.createDocumentFragment();
    for (var i = 1; i <= TOTAL; i++) {
      (function (n) {
        var tile = document.createElement("button");
        tile.className = "thumb";
        tile.setAttribute("aria-label", "Go to slide " + n);
        var img = document.createElement("img");
        img.loading = "lazy";
        img.src = slidePath(n);
        img.alt = "Slide " + n;
        var no = document.createElement("span");
        no.className = "thumb__no";
        no.textContent = n;
        tile.appendChild(img);
        tile.appendChild(no);
        tile.addEventListener("click", function () {
          goTo(n);
          closeThumbsPanel();
        });
        frag.appendChild(tile);
      })(i);
    }
    thumbsGrid.appendChild(frag);
    thumbsBuilt = true;
  }

  function openThumbsPanel() {
    buildThumbs();
    thumbs.classList.add("is-open");
    thumbs.setAttribute("aria-hidden", "false");
    var tiles = thumbsGrid.querySelectorAll(".thumb");
    tiles.forEach(function (t, i) { t.classList.toggle("is-current", i + 1 === current); });
    var cur = thumbsGrid.querySelector(".is-current");
    if (cur) cur.scrollIntoView({ block: "center" });
  }
  function closeThumbsPanel() {
    thumbs.classList.remove("is-open");
    thumbs.setAttribute("aria-hidden", "true");
  }
  btnGrid.addEventListener("click", openThumbsPanel);
  closeThumbs.addEventListener("click", closeThumbsPanel);

  /* ---------- TOPBAR SOLID ON SCROLL ---------- */
  window.addEventListener("scroll", function () {
    topbar.classList.toggle("is-solid", window.scrollY > 40);
  }, { passive: true });

  /* ---------- INIT ---------- */
  routeFromHash();
  preload(1);
})();
