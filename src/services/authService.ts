const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const tabSessionKey = 'acuerdo_justo_tab_session';

export type UserRole = 'client' | 'legal_advisor' | 'admin';

export interface AuthUser {
  id: string;
  fullName: string;
  username: string;
  role: UserRole;
}

export interface AdminUser extends AuthUser {
  isActive: boolean;
  createdAt: string;
}

interface AuthResponse {
  user: AuthUser;
}

interface UsersResponse {
  users: AdminUser[];
}

interface UserResponse {
  user: AdminUser;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}) {
  const headers = options.body instanceof FormData ? options.headers : { 'Content-Type': 'application/json', ...options.headers };
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) clearTabSession();
    const error = await response.json().catch(() => ({ message: 'No se pudo completar la solicitud.' }));
    throw new Error(error.message ?? 'No se pudo completar la solicitud.');
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function apiBlobRequest(path: string) {
  const response = await fetch(`${apiUrl}${path}`, { credentials: 'include' });

  if (!response.ok) {
    if (response.status === 401) clearTabSession();
    const error = await response.json().catch(() => ({ message: 'No se pudo descargar el documento.' }));
    throw new Error(error.message ?? 'No se pudo descargar el documento.');
  }

  return response.blob();
}

export async function login(username: string, password: string) {
  const response = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  markTabSession();
  return response.user;
}

export async function register(fullName: string, username: string, password: string) {
  const response = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, username, password }),
  });
  markTabSession();
  return response.user;
}

export async function getCurrentUser() {
  const response = await apiRequest<AuthResponse>('/auth/me');
  return response.user;
}

export async function logout() {
  try {
    await apiRequest<void>('/auth/logout', { method: 'POST' });
  } finally {
    clearTabSession();
  }
}

export async function reportActivity() {
  await apiRequest<void>('/auth/activity', { method: 'POST' });
}

export function hasTabSession() {
  return sessionStorage.getItem(tabSessionKey) === 'active';
}

export function clearTabSession() {
  sessionStorage.removeItem(tabSessionKey);
}

function markTabSession() {
  sessionStorage.setItem(tabSessionKey, 'active');
}

export async function listUsers() {
  const response = await apiRequest<UsersResponse>('/admin/users');
  return response.users;
}

export async function updateUserRole(userId: string, role: UserRole) {
  const response = await apiRequest<UserResponse>(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
  return response.user;
}
