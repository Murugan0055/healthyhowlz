// PWA Service Worker Registration & Installation Manager

let deferredPrompt = null;

export function registerPwa() {
  if (typeof window === 'undefined') return;

  // 1. Capture PWA beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default mini-infobar from appearing automatically
    e.preventDefault();
    deferredPrompt = e;
    console.log('[HealthyHowlz PWA] Captured beforeinstallprompt event');
    
    // Notify any listening components (e.g. install banner/button)
    window.dispatchEvent(new CustomEvent('healthyhowlz:install-available', { detail: { prompt: e } }));
  });

  // 2. Track when successfully installed
  window.addEventListener('appinstalled', () => {
    console.log('[HealthyHowlz PWA] App was successfully installed!');
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('healthyhowlz:installed'));
  });

  // 3. Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[HealthyHowlz SW] Registered successfully, scope:', reg.scope);
        })
        .catch((err) => {
          console.log('[HealthyHowlz SW] Registration failed:', err);
        });
    });
  }
}

export async function promptPwaInstall() {
  if (!deferredPrompt) {
    return {
      success: false,
      message: 'App is already installed or your browser does not support automatic PWA install. You can install via your browser menu (Add to Home Screen / Install App).'
    };
  }

  deferredPrompt.prompt();
  const choiceResult = await deferredPrompt.userChoice;
  deferredPrompt = null;

  return {
    success: choiceResult.outcome === 'accepted',
    outcome: choiceResult.outcome
  };
}

export function isPwaInstalled() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

