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

  // ============================================================
  // BOTÓN "INSTALAR APP" — sin esto, el navegador nunca ofrece
  // instalar por su cuenta de forma confiable; hay que capturar el
  // evento y ofrecer nosotros mismos un botón visible.
  // ============================================================
  var deferredPrompt = null;

  function markInstallable(can) {
    document.documentElement.classList.toggle('pwa-installable', !!can);
    document.dispatchEvent(new CustomEvent('pwa-installable-change', { detail: { installable: !!can } }));
  }

  // Chrome/Android/Edge: el navegador avisa que SÍ puede ofrecer instalar.
  // Se cancela su propio mini-banner para mostrar nuestro botón en su lugar.
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (!standalone) markInstallable(true);
  });

  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    markInstallable(false);
    try { localStorage.setItem('pwa_installed', '1'); } catch (e) {}
  });

  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  var isSafari = isIOS && /safari/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);

  // iOS no dispara beforeinstallprompt: si no está instalada, mostramos el
  // botón igual, pero con instrucciones manuales (Safari no automatiza esto).
  if (isIOS && isSafari && !standalone) {
    markInstallable(true);
  }

  // Llamar desde un botón: window.installPWA()
  window.installPWA = function () {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function () {
        deferredPrompt = null;
        markInstallable(false);
      });
      return;
    }
    if (isIOS) {
      if (window.mostrarToast) {
        mostrarToast('Toca el ícono Compartir ⬆️ y elige "Agregar a inicio"', 'info');
      } else {
        alert('En Safari: toca el ícono de Compartir y elige "Agregar a inicio".');
      }
      return;
    }
    if (window.mostrarToast) {
      mostrarToast('Tu navegador todavía no permite instalar esta app', 'info');
    }
  };
})();
