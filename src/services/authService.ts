import { supabase } from '../lib/supabase';

const demoSessionKey = 'acuerdo-justo-demo-session';
const demoUsersKey = 'acuerdo-justo-demo-users';

export type UserRole = 'client' | 'legal_advisor' | 'admin';

export interface DemoUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  status: 'active' | 'pending';
  createdAt: string;
}

const initialDemoUsers: DemoUser[] = [
  { id: 'usr-001', name: 'Administrador general', username: 'admin', role: 'admin', status: 'active', createdAt: '2026-06-01' },
  { id: 'usr-002', name: 'María Torres', username: 'maria.torres', role: 'client', status: 'active', createdAt: '2026-06-04' },
  { id: 'usr-003', name: 'Carlos Mendoza', username: 'carlos.mendoza', role: 'client', status: 'active', createdAt: '2026-06-05' },
  { id: 'usr-004', name: 'Lucía Vargas', username: 'lucia.vargas', role: 'legal_advisor', status: 'active', createdAt: '2026-06-06' },
  { id: 'usr-005', name: 'José Ramírez', username: 'jose.ramirez', role: 'client', status: 'pending', createdAt: '2026-06-08' },
];

function getClient() {
  if (!supabase) {
    throw new Error('El acceso estará disponible cuando Supabase sea configurado.');
  }

  return supabase;
}

export function signInDemo(username: string, password: string) {
  const isValid = username === 'admin' && password === 'admin';

  if (isValid) {
    sessionStorage.setItem(demoSessionKey, 'true');
  }

  return isValid;
}

export function getCurrentDemoUser() {
  return getDemoUsers().find((user) => user.username === 'admin') ?? initialDemoUsers[0];
}

export function getDemoUsers(): DemoUser[] {
  const savedUsers = localStorage.getItem(demoUsersKey);

  if (!savedUsers) {
    localStorage.setItem(demoUsersKey, JSON.stringify(initialDemoUsers));
    return initialDemoUsers;
  }

  try {
    return JSON.parse(savedUsers) as DemoUser[];
  } catch {
    localStorage.setItem(demoUsersKey, JSON.stringify(initialDemoUsers));
    return initialDemoUsers;
  }
}

export function registerDemoClient(name: string, username: string): DemoUser {
  const users = getDemoUsers();
  const newUser: DemoUser = {
    id: `usr-${Date.now()}`,
    name,
    username,
    role: 'client',
    status: 'active',
    createdAt: new Date().toISOString().slice(0, 10),
  };

  localStorage.setItem(demoUsersKey, JSON.stringify([...users, newUser]));
  return newUser;
}

export function updateDemoUserRole(userId: string, role: UserRole) {
  const users = getDemoUsers().map((user) => (user.id === userId ? { ...user, role } : user));
  localStorage.setItem(demoUsersKey, JSON.stringify(users));
  return users;
}

export function hasDemoSession() {
  return sessionStorage.getItem(demoSessionKey) === 'true';
}

export function signOutDemo() {
  sessionStorage.removeItem(demoSessionKey);
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await getClient().auth.signInWithPassword({ email, password });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await getClient().auth.signOut();

  if (error) throw error;
}
