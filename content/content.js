(function () {
  "use strict";

  var overlay = null;
  var lastHref = location.href;

  function isBareHomepage() {
    if (location.pathname !== "/") return false;
    return !new URLSearchParams(location.search).has("search_query");
  }

  function isWatchPage() {
    return location.pathname === "/watch";
  }

  function applyPageState() {
    var root = document.documentElement;
    root.classList.add("focusos-active");
    root.classList.toggle("focusos-homepage", isBareHomepage());
    root.classList.toggle("focusos-watch", isWatchPage());
    updateOverlay();
  }

  function createOverlay() {
    if (overlay) return;

    overlay = document.createElement("div");
    overlay.id = "focusos-overlay";
    overlay.innerHTML =
      '<div class="focusos-overlay-inner">' +
      '<div class="focusos-meditation" aria-hidden="true">' +
      '<span class="focusos-breathe-ring"></span>' +
      '<span class="focusos-breathe-ring"></span>' +
      '<span class="focusos-breathe-ring"></span>' +
      '<svg class="focusos-meditation-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="32" cy="17" r="5" stroke="currentColor" stroke-width="1.75"/>' +
      '<path d="M32 22v8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>' +
      '<path d="M18 30c4 4 24 4 28 0" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>' +
      '<path d="M14 38c6-3 30-3 36 0" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>' +
      '<path d="M12 44c8-4 32-4 40 0" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>' +
      '<path d="M32 30c-6 6-6 14 0 14s6-8 0-14z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
      "</svg>" +
      "</div>" +
      '<h1 class="focusos-title">FocusOS</h1>' +
      '<p class="focusos-subtitle">Search for something you want to learn.</p>' +
      "</div>";

    (document.body || document.documentElement).appendChild(overlay);
  }

  function removeOverlay() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
  }

  function updateOverlay() {
    if (isBareHomepage()) {
      createOverlay();
    } else {
      removeOverlay();
    }
  }

  function onNavigate() {
    if (location.href === lastHref) return;
    lastHref = location.href;
    applyPageState();
  }

  var PLAYER_HIDE_CSS =
    ".html5-endscreen,.videowall-endscreen,.ytp-endscreen-content," +
    ".ytp-endscreen-paginate,.ytp-show-tiles,.ytp-pause-overlay," +
    ".ytp-pause-overlay-container,.ytp-scroll-min,.ytp-suggested-action," +
    ".ytp-videowall-still,.ytp-videowall-still-info,.ytp-videowall-still-info-content," +
    ".ytp-autonav-endscreen-countdown-container,.ytp-ce-element,.ytp-ce-video," +
    ".ytp-ce-channel,.ytp-ce-playlist,.ytp-ce-covering-overlay,.ytp-ce-covering-image," +
    ".ytp-ce-element-shadow,.ytp-ce-covering-shadow-top,.ytp-ce-video-title," +
    ".ytp-ce-video-duration{display:none!important;visibility:hidden!important;" +
    "opacity:0!important;pointer-events:none!important}";

  function injectStyleIntoRoot(root) {
    if (!root || root.querySelector("#focusos-player-style")) return;
    var style = document.createElement("style");
    style.id = "focusos-player-style";
    style.textContent = PLAYER_HIDE_CSS;
    root.appendChild(style);
  }

  function hidePlayerDistractions() {
    var player = document.querySelector("#movie_player");
    if (!player) return;

    injectStyleIntoRoot(player);
    if (player.shadowRoot) injectStyleIntoRoot(player.shadowRoot);

    var html5Player = player.querySelector(".html5-video-player");
    if (html5Player && html5Player.shadowRoot) {
      injectStyleIntoRoot(html5Player.shadowRoot);
    }
  }

  function observePlayer() {
    hidePlayerDistractions();

    var playerObserver = new MutationObserver(hidePlayerDistractions);
    playerObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  function observeNavigation() {
    window.addEventListener("yt-navigate-finish", function () {
      applyPageState();
      hidePlayerDistractions();
    });

    var urlObserver = new MutationObserver(onNavigate);
    urlObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    var domObserver = new MutationObserver(function () {
      if (isBareHomepage() && !overlay) {
        updateOverlay();
      }
    });

    function startDomObserver() {
      var target = document.body || document.documentElement;
      domObserver.observe(target, { childList: true, subtree: true });
    }

    if (document.body) {
      startDomObserver();
    } else {
      document.addEventListener("DOMContentLoaded", startDomObserver);
    }
  }

  applyPageState();
  observeNavigation();
  observePlayer();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      applyPageState();
      hidePlayerDistractions();
    });
  }
})();
