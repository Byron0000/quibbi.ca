// Service worker for Live Chat push notifications.
// Minimal scope: only handles push events and notification clicks.

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || 'Live Chat';
    const options = {
      body: payload.body || 'A visitor is waiting for live chat.',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: payload.tag || 'live-chat',
      // Renotify even if there's a notification with the same tag,
      // since each new chat should alert the admin.
      renotify: true,
      data: {
        url: payload.url || '/'
      }
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    // If payload isn't JSON, show a generic notification.
    event.waitUntil(
      self.registration.showNotification('Live Chat', {
        body: 'A visitor is waiting for live chat.',
        icon: '/favicon.svg'
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open.
      for (const client of clientList) {
        if (client.url.includes('/live-chat') && 'focus' in client) {
          return client.focus();
        }
      }
      // Open a new window.
      return self.clients.openWindow(url);
    })
  );
});
