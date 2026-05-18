/*
 * Alpine Map Training — Companion manual nav-bar behaviour.
 *
 * Wires up the two action buttons added to every static HTML page in
 * /public/companion-manual/.
 *
 *   - "Back to app": navigate THIS tab to the app home. Always works,
 *     always visible — we used to try window.opener.focus() but that
 *     silently no-ops on mobile browsers and some desktop browsers,
 *     leaving the user wondering why the button did nothing.
 *
 *   - "Close this tab": try to close this tab. window.close() only
 *     works when the tab was opened by script (the landing-page link
 *     uses rel="opener" specifically to permit this). If close is
 *     blocked, focus the opener if available and navigate this tab
 *     to / as a final fallback so something visible happens.
 *
 * The script runs after the page loads and is idempotent.
 */
(function () {
  function hasOpener() {
    try {
      return !!(window.opener && !window.opener.closed);
    } catch (e) {
      // Cross-origin opener access can throw. Treat as not-reachable.
      return false;
    }
  }

  function focusOpener() {
    try {
      window.opener.focus();
      return true;
    } catch (e) {
      return false;
    }
  }

  function navigateHome() {
    // Use absolute path so it works whether we are at /index.html or
    // /pages/D5.1.html.
    window.location.href = "/";
  }

  function onBackClick(e) {
    e.preventDefault();
    // Always navigate this tab to / so the click has a visible effect
    // on every device. Predictable beats clever for a primary action.
    navigateHome();
  }

  function onCloseClick(e) {
    e.preventDefault();
    if (hasOpener()) {
      focusOpener();
    }
    // Try to close this tab. Browsers may refuse if the tab was not
    // opened via script, in which case we fall back to navigating to /.
    window.close();
    window.setTimeout(function () {
      navigateHome();
    }, 200);
  }

  function init() {
    var back = document.querySelector("[data-amt-nav-back]");
    var close = document.querySelector("[data-amt-nav-close]");
    if (back) back.addEventListener("click", onBackClick);
    if (close) close.addEventListener("click", onCloseClick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
