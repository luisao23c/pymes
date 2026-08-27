const API_BASE = '/api';

async function request(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: any = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/admin/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    profile: () => request('/auth/profile'),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },
  events: {
    list: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/events${query}`);
    },
    getBySlug: (slug: string) => request(`/events/${slug}`),
    getFeatured: () => request('/events/featured'),
    getPhotos: (slug: string) => request(`/events/${slug}/photos`),
    create: (data: FormData) =>
      request('/events', { method: 'POST', body: data }),
    update: (id: string, data: FormData) =>
      request(`/events/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) =>
      request(`/events/${id}`, { method: 'DELETE' }),
  },
  photos: {
    getByEvent: (eventId: string) => request(`/photos/event/${eventId}`),
    update: (id: string, data: { caption?: string; order?: number }) =>
      request(`/photos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request(`/photos/${id}`, { method: 'DELETE' }),
    reorder: (photoIds: string[]) =>
      request('/photos/reorder/all', { method: 'PUT', body: JSON.stringify({ photoIds }) }),
  },
  upload: {
    photos: (eventId: string, files: File[]) => {
      const formData = new FormData();
      formData.append('eventId', eventId);
      files.forEach((file) => formData.append('photos', file));
      return request('/upload/photos', { method: 'POST', body: formData });
    },
  },
  messages: {
    send: (data: { name: string; email: string; phone?: string; message: string; eventSlug?: string }) =>
      request('/messages', { method: 'POST', body: JSON.stringify(data) }),
    list: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/messages${query}`);
    },
    stats: () => request('/messages/stats'),
    updateStatus: (id: string, status: string) =>
      request(`/messages/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    delete: (id: string) =>
      request(`/messages/${id}`, { method: 'DELETE' }),
  },
  dashboard: {
    stats: async () => {
      const [events, msgStats] = await Promise.all([
        request('/events?limit=100'),
        request('/messages/stats'),
      ]);
      return {
        totalEvents: events.total,
        totalPhotos: events.events?.reduce((acc: number, e: any) => acc + (e.photosCount || 0), 0) || 0,
        unreadMessages: msgStats.unread,
        messageStats: msgStats,
      };
    },
  },
};
