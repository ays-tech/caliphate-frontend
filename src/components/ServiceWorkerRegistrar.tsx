'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = window.atob(base64);
  return Uint8Array.from(Array.from(raw).map((c) => c.charCodeAt(0)));
}

async function subscribeToPush(reg: ServiceWorkerRegistration) {
  try {
    const existing = await reg.pushManager.getSubscription();
    if (existing) return;
    const { data } = await api.get('/push/vapid-public-key');
    if (!data?.publicKey) return;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly:      true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    });
    await api.post('/push/subscribe', sub.toJSON());
    console.log('[Push] Subscribed');
  } catch {
    // Permission denied or VAPID not configured — silent
  }
}

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let refreshing = false;

    // When the SW has swapped (new version activated), reload once
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(async (reg) => {
        console.log('[SW] Registered:', reg.scope);

        // ── Update detection ───────────────────────────────────────────
        const checkForUpdate = () => reg.update().catch(() => {});

        // Check for updates every 5 minutes while page is open
        const updateInterval = setInterval(checkForUpdate, 5 * 60 * 1000);

        // Also check when user comes back to the tab
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') checkForUpdate();
        });

        // Listen for a waiting service worker (new version ready)
        const handleUpdateFound = () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            // New SW installed and waiting — there's an old one still running
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Show a toast — user can tap to get new version immediately
              toast(
                (t) => (
                  <div className="flex items-center gap-3">
                    <span className="font-body text-sm">New version available</span>
                    <button
                      onClick={() => {
                        toast.dismiss(t.id);
                        // Tell the waiting SW to skip waiting and take over
                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                      }}
                      className="text-xs bg-gold-500 text-white px-2.5 py-1 rounded-lg font-body hover:bg-gold-600 transition-colors whitespace-nowrap"
                    >
                      Update now
                    </button>
                  </div>
                ),
                {
                  duration:  Infinity, // stays until dismissed or acted on
                  icon:      '🔄',
                  style: {
                    background:   '#251e1a',
                    color:        '#faf6ef',
                    fontFamily:   'Lato, sans-serif',
                    borderRadius: '0.75rem',
                    border:       '1px solid #655444',
                  },
                }
              );
            }
          });
        };

        reg.addEventListener('updatefound', handleUpdateFound);

        // If there's already a waiting SW when the page loads, show the toast
        if (reg.waiting) {
          handleUpdateFound();
        }

        // ── Push notifications — request after 4s delay ───────────────
        setTimeout(async () => {
          if (!('PushManager' in window)) return;
          if (Notification.permission === 'granted') {
            await subscribeToPush(reg);
          } else if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') await subscribeToPush(reg);
          }
        }, 4000);

        return () => clearInterval(updateInterval);
      })
      .catch((err) => console.warn('[SW] Registration failed:', err));
  }, []);

  return null;
}
