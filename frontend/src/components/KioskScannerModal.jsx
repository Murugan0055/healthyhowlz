import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, AlertCircle, RefreshCw, Smartphone, Zap, QrCode } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function KioskScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [timeLeft, setTimeLeft] = useState(15);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const scannerRef = useRef(null);
  const timerRef = useRef(null);
  const isStoppingRef = useRef(false);

  // Initialize and stop camera cleanly
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    setTimeLeft(15);
    setCameraError(null);
    startCamera();

    // 15-second auto-shutdown timer to protect tablet battery and thermals
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      stopCamera();
    };
  }, [isOpen]);

  const handleTimeout = () => {
    stopCamera();
    setCameraError('Camera shut down automatically after 15s of inactivity to conserve battery.');
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      // Small delay to ensure DOM element #kiosk-qr-reader exists
      await new Promise((r) => setTimeout(r, 150));
      const html5QrCode = new Html5Qrcode('kiosk-qr-reader');
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 260, height: 260 },
        aspectRatio: 1.0
      };

      await html5QrCode.start(
        { facingMode: 'user' }, // front desk tablet camera
        config,
        (decodedText) => {
          // Success! Immediately shut down camera and trigger HUD
          stopCamera();
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // parse error per frame - normal while searching
        }
      );

      setCameraActive(true);
    } catch (err) {
      console.warn('Camera initiation notice:', err);
      setCameraError('Camera access unavailable or blocked in this browser environment. Use the quick simulated pass tokens below.');
      setCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (e) {
        // ignore clean up error
      }
      scannerRef.current = null;
    }
    setCameraActive(false);
    isStoppingRef.current = false;
  };

  if (!isOpen) return null;

  // Test Member Presets for instant verification testing
  const testPresets = [
    { label: 'Active Member (EG-1001)', code: 'EG-1001', type: 'Valid +20 Pts' },
    { label: 'Expiring in 3d (EG-1005)', code: 'EG-1005', type: 'Due Soon' },
    { label: 'Grace Period (EG-1007)', code: 'EG-1007', type: 'Grace Permitted' },
    { label: 'Expired (EG-1008)', code: 'EG-1008', type: 'Blocked Red' },
    { label: 'Frozen (EG-1009)', code: 'EG-1009', type: 'Frozen Blocked' }
  ];

  return (
    <div className="modal-overlay">
      <div className="relative w-full max-w-lg bg-[#111827] border-2 border-emerald-500/50 rounded-2xl shadow-2xl p-6 overflow-hidden">
        
        {/* Header with 15s Countdown */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <QrCode className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold brand-font text-white flex items-center gap-2">
                Scan Member QR Pass
              </h3>
              <p className="text-xs text-slate-400">On-demand camera active • auto-shuts in {timeLeft}s</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Countdown Badge */}
            <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-emerald-400">
              {timeLeft}s
            </div>
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Box */}
        <div className="relative my-4 aspect-square max-h-[300px] w-full mx-auto bg-slate-950 rounded-xl border-2 border-slate-800 overflow-hidden flex items-center justify-center">
          
          <div id="kiosk-qr-reader" className="w-full h-full"></div>

          {/* Laser Scan Animation */}
          {cameraActive && <div className="animate-scan-line"></div>}

          {/* Fallback info when camera is idle or permission denied */}
          {cameraError && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
              <p className="text-sm font-semibold text-slate-200">{cameraError}</p>
              <button
                onClick={startCamera}
                className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Camera Activation
              </button>
            </div>
          )}

          {/* Corner Guides */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400 pointer-events-none"></div>
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400 pointer-events-none"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-400 pointer-events-none"></div>
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-400 pointer-events-none"></div>
        </div>

        {/* Rapid Simulated QR Pass Tokens (Simulates Member Smart Phone Scan) */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Quick Demo / Member Pass Simulators:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {testPresets.map((preset) => (
              <button
                key={preset.code}
                onClick={() => {
                  stopCamera();
                  onScanSuccess(preset.code);
                }}
                className="text-left px-2.5 py-2 rounded-lg bg-slate-800/70 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/40 transition-all text-xs"
              >
                <p className="font-bold text-slate-200 leading-tight">{preset.code}</p>
                <p className="text-[10px] text-emerald-400">{preset.type}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-500 mt-4">
          Hardware safe: Camera terminates instantly on QR decode or 15s inactivity.
        </p>

      </div>
    </div>
  );
}

