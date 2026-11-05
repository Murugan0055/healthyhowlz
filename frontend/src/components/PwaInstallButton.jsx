import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, Smartphone, Monitor, Share, PlusSquare, X } from 'lucide-react';
import { promptPwaInstall, isPwaInstalled } from '../pwa';

export default function PwaInstallButton({ compact = false, variant = 'navbar' }) {
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);

  useEffect(() => {
    // Check if already in standalone / installed mode
    if (isPwaInstalled()) {
      setInstalled(true);
    }

    // Detect iOS
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIosDevice(isIos);

    // Listen for install availability
    const handleInstallAvailable = () => {
      setCanInstall(true);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener('healthyhowlz:install-available', handleInstallAvailable);
    window.addEventListener('healthyhowlz:installed', handleInstalled);

    return () => {
      window.removeEventListener('healthyhowlz:install-available', handleInstallAvailable);
      window.removeEventListener('healthyhowlz:installed', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIosDevice) {
      setShowIosGuide(true);
      return;
    }

    const res = await promptPwaInstall();
    if (res.success) {
      setInstalled(true);
      setCanInstall(false);
    } else if (res.message) {
      // If prompt not available, show helpful modal
      setShowIosGuide(true);
    }
  };

  // If already running in standalone mode, display a verified PWA pill
  if (installed) {
    if (compact) return null;
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-400 font-medium">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline">Installed App Mode</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        type="button"
        className={`flex items-center gap-2 rounded-xl font-semibold transition-all shadow-sm ${
          variant === 'navbar'
            ? 'px-3 py-1.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 hover:scale-[1.02] active:scale-95'
            : variant === 'drawer'
            ? 'w-full px-4 py-2.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
        }`}
        title="Install HealthyHowlz on Desktop, Tablet, or Mobile (PWA)"
      >
        <Download className="w-3.5 h-3.5 animate-bounce" />
        <span>{compact ? 'Install' : 'Install App'}</span>
      </button>

      {/* iOS & Desktop Manual Installation Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Install HealthyHowlz</h3>
                <p className="text-xs text-slate-400">Mobile, Tablet & Desktop PWA</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <p className="font-semibold text-slate-200">On iOS / Safari:</p>
                  <p className="text-slate-400 mt-0.5 flex items-center gap-1">
                    Tap the Share button <Share className="w-3 h-3 text-emerald-400 inline" /> in Safari's bottom toolbar.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <p className="font-semibold text-slate-200">Add to Home Screen:</p>
                  <p className="text-slate-400 mt-0.5 flex items-center gap-1">
                    Scroll down and tap <PlusSquare className="w-3 h-3 text-emerald-400 inline" /> <span className="font-medium text-slate-200">"Add to Home Screen"</span>.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <p className="font-semibold text-slate-200">On Desktop Chrome / Edge:</p>
                  <p className="text-slate-400 mt-0.5 flex items-center gap-1">
                    Click the <Monitor className="w-3 h-3 text-emerald-400 inline" /> install icon in the URL search bar.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}

