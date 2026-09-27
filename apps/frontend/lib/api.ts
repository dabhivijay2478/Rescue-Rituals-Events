import { clearToken, getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  capacity: number | null;
  goingCount: number;
  createdById: string;
  createdBy?: { id: string; name: string; email: string };
};

export type Rsvp = {
  id: string;
  eventId: string;
  userId: string;
  status: 'GOING' | 'WAITLISTED' | 'CANCELLED';
  createdAt: string;
  user: { id: string; name: string; email: string };
};

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.auth) {
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    clearToken();
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  register: (body: { email: string; password: string; name: string }) =>
    request<{ accessToken: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  listEvents: (when: 'upcoming' | 'past' | 'all' = 'upcoming') =>
    request<{ data: Event[]; total: number }>(`/events?when=${when}&limit=50`),
  getEvent: (id: string) => request<Event>(`/events/${id}`),
  createEvent: (body: Record<string, unknown>) =>
    request<Event>('/events', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(body),
    }),
  rsvp: (eventId: string) =>
    request<Rsvp>(`/events/${eventId}/rsvp`, { method: 'POST', auth: true }),
  cancelRsvp: (eventId: string) =>
    request<Rsvp>(`/events/${eventId}/rsvp`, {
      method: 'DELETE',
      auth: true,
    }),
  deleteEvent: (eventId: string) =>
    request<{ deleted: boolean }>(`/events/${eventId}`, {
      method: 'DELETE',
      auth: true,
    }),
  attendees: (eventId: string) =>
    request<{ data: Rsvp[] }>(`/events/${eventId}/attendees?limit=50`),
};
