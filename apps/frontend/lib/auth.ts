import type { User } from './api';

const TOKEN_KEY = 'events_access_token';
const USER_KEY = 'events_user';

export const AUTH_CHANGE_EVENT = 'events-auth-change';

function notifyAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setSession(accessToken: string, user: User) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyAuthChange();
}

/** @deprecated use setSession */
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  notifyAuthChange();
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notifyAuthChange();
}

export function isLoggedIn(): boolean {
  return Boolean(getToken());
}
