export type NotifType = 'visit' | 'casting' | 'contact' | 'booking' | 'fashionday';

export async function notifyAdmin(type: NotifType, body: string, url = '/admin') {
  try {
    if (type === 'visit') {
      await fetch('/api/analytics', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'page_view', path: url, metadata: { body } }),
      });
      return;
    }

    await fetch('/api/notifications', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, title: type, body, href: url }),
    });
  } catch {
    // Notifications are best-effort and must not interrupt the caller.
  }
}
