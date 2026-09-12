(function () {
  'use strict';

  var mobileQuery = window.matchMedia('(max-width: 767px)');
  var standaloneQuery = window.matchMedia('(display-mode: standalone)');
  var baseViewportHeight = window.innerHeight;
  var keyboardTimer = 0;

  function syncEnvironment() {
    if (!document.body) return;
    document.body.classList.toggle('admin-mobile-shell', mobileQuery.matches);
    document.body.classList.toggle('admin-standalone', standaloneQuery.matches || window.navigator.standalone === true);
  }

  function syncKeyboard() {
    if (!document.body || !mobileQuery.matches || !window.visualViewport) return;
    clearTimeout(keyboardTimer);
    keyboardTimer = window.setTimeout(function () {
      var viewport = window.visualViewport;
      var keyboardOpen = viewport.height < baseViewportHeight * 0.74;
      document.body.classList.toggle('mobile-keyboard-open', keyboardOpen);
      document.documentElement.style.setProperty('--mobile-viewport-height', viewport.height + 'px');
    }, 40);
  }

  function markInteractiveState() {
    document.querySelectorAll('.m-bottomnav .m-active').forEach(function (item) {
      item.setAttribute('aria-current', 'page');
    });

    document.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('focus', function () {
        if (!mobileQuery.matches) return;
        window.setTimeout(function () {
          field.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 260);
      });
    });
  }

  function closeOpenSheet() {
    var menu = document.getElementById('mas-menu');
    if (!menu || menu.classList.contains('hidden')) return false;
    if (typeof window.cerrarMasMenu === 'function') window.cerrarMasMenu();
    else menu.classList.add('hidden');
    return true;
  }

  function boot() {
    syncEnvironment();
    markInteractiveState();

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeOpenSheet();
    });

    document.addEventListener('click', function (event) {
      if (!mobileQuery.matches) return;
      var control = event.target.closest('button, a, [role="button"]');
      if (!control || control.hasAttribute('disabled')) return;
      control.classList.add('mobile-pressed');
      window.setTimeout(function () { control.classList.remove('mobile-pressed'); }, 120);
    }, { passive: true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', syncKeyboard);
      window.visualViewport.addEventListener('scroll', syncKeyboard);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', syncEnvironment);
  if (standaloneQuery.addEventListener) standaloneQuery.addEventListener('change', syncEnvironment);
  window.addEventListener('orientationchange', function () {
    baseViewportHeight = window.innerHeight;
    syncEnvironment();
  });
})();
