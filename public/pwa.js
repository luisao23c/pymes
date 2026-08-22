(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }

  // Vibración corta (sensación nativa al agregar/confirmar)
  window.haptic = function (ms) {
    try { if (navigator.vibrate) navigator.vibrate(ms || 12); } catch (e) {}
  };

  // Detecta si corre como app instalada (a pantalla completa)
  var standalone = window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator.standalone === true);
  if (standalone) {
    document.documentElement.classList.add('is-standalone');
    window.addEventListener('load', function () {
      document.documentElement.classList.add('is-standalone');
    });
  }
})();
