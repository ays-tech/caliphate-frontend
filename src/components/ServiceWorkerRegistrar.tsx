'use client';

import { useEffect } from 'react';
import { api } from '@/lib/api';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = window.atob(base64);
  return Uint8Array.from(Array.from(raw).map((c) => c.charCodeAt(0)));
}

async function subscribeToPush(reg: ServiceWorkerRegistration) {
  try {
    // Check if already subscribed
    const existing = await reg.pushManager.getSubscription();
    if (existing) return;

    // Fetch VAPID public key from backend
    const { data } = await api.get('/push/vapid-public-key');
    if (!data?.publicKey) return;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly:      true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    });

    // Send subscription to backend
    await api.post('/push/subscribe', sub.toJSON());
    console.log('[Push] Subscribed successfully');
  } catch (err) {
    // Permission denied or VAPID not configured — silent fail
    console.log('[Push] Subscription skipped:', err);
  }
}

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(async (reg) => {
        console.log('[SW] Registered:', reg.scope);

        // Request push permission after a short delay (don't ask immediately on load)
        setTimeout(async () => {
          if (!('PushManager' in window)) return;
          if (Notification.permission === 'granted') {
            await subscribeToPush(reg);
          } else if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              await subscribeToPush(reg);
            }
          }
        }, 4000); // 4 second delay so it doesn't interrupt first load
      })
      .catch((err) => console.warn('[SW] Registration failed:', err));
  }, []);

  return null;
}
