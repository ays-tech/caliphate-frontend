'use client';

import { useEffect, useState } from 'react';
import { X, Share, PlusSquare, Smartphone } from 'lucide-react';

type Platform = 'ios' | 'android' | 'desktop' | null;

function detectPlatform(): Platform {
  if (typeof window === 'undefined') return null;
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua))          return 'android';
  return 'desktop';
}

function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

export default function PWAInstallBanner() {
  const [show,    setShow]    = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isInStandaloneMode()) return;

    // Don't show if user dismissed in this session
    const dismissed = sessionStorage.getItem('pwa-banner-dismissed');
    if (dismissed) return;

    const p = detectPlatform();
    setPlatform(p);

    // Android / Chrome: catch the native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (p === 'android' || p === 'desktop') setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS: show our custom guide (no native prompt available)
    if (p === 'ios') {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => { clearTimeout(timer); window.removeEventListener('beforeinstallprompt', handler); };
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem('pwa-banner-dismissed', '1');
  };

  const handleInstall = async () => {
    if (platform === 'ios') {
      setShowIOSGuide(true);
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShow(false);
      setDeferredPrompt(null);
    }
  };

  if (!show) return null;

  // ── iOS step-by-step guide ────────────────────────────────────────
  if (showIOSGuide) {
    return (
      <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-up">
          <div className="h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-arabic text-gold-600 text-lg leading-none mb-0.5">تثبيت التطبيق</p>
                <h2 className="font-display text-ink-900 text-sm tracking-wide">Install on iPhone</h2>
              </div>
              <button onClick={dismiss} className="text-ink-400 hover:text-ink-600 p-1.5 rounded-lg hover:bg-ink-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { icon: Share,     step: '1', label: 'Tap the Share button', sub: 'The box with an arrow pointing up at the bottom of Safari' },
                { icon: PlusSquare,step: '2', label: 'Tap "Add to Home Screen"', sub: 'Scroll down in the share sheet if you don\'t see it' },
                { icon: Smartphone,step: '3', label: 'Tap "Add"', sub: 'The app will appear on your home screen like a native app' },
              ].map(({ icon: Icon, step, label, sub }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-display text-ink-900 text-xs tracking-wide">{step}. {label}</p>
                    <p className="text-ink-500 font-body text-xs mt-0.5 leading-relaxed">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={dismiss} className="btn-gold w-full mt-5 py-2.5 text-xs">Got it</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Bottom install banner (Android / desktop) ─────────────────────
  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 z-[90] max-w-sm mx-auto animate-fade-up">
      <div className="bg-ink-950 border border-gold-700/40 rounded-2xl shadow-2xl overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        <div className="px-4 py-3.5 flex items-center gap-3">
          {/* App icon */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-ink-900 flex items-center justify-center flex-shrink-0 border border-gold-700/30">
            <span className="font-arabic text-gold-400 text-lg leading-none">م</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ivory font-display text-xs tracking-wide">Install Makhtaba</p>
            <p className="text-ink-400 font-body text-[11px] truncate">Add to home screen for offline access</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstall}
              className="btn-gold text-[11px] py-1.5 px-3"
            >
              Install
            </button>
            <button
              onClick={dismiss}
              className="text-ink-500 hover:text-ink-300 p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
