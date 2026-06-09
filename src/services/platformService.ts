import { apiRequest, apiResourceUrl } from './authService';

export type SchedulePeriod = 'morning' | 'afternoon';
export type ServiceMode = 'presencial' | 'virtual';
export type CaseStatus = 'open' | 'review' | 'closed';

export interface Advisor {
  id: string;
  name: string;
  username: string;
}

export interface Appointment {
  id: string;
  displayId: string;
  clientId: string;
  client: string;
  advisorId: string;
  advisor: string;
  advisorUsername: string;
  date: string;
  period: SchedulePeriod;
  mode: ServiceMode;
  service: string;
  linkedCaseId?: string;
  linkedCaseNumber?: string;
}

export interface CaseDocument {
  id: string;
  name: string;
  uploadedBy: string;
  uploadedAt: string;
  mimeType: string;
  sizeBytes: number;
}

export interface LegalCase {
  id: string;
  caseNumber: string;
  clientId: string;
  client: string;
  advisor: string;
  service: string;
  description: string;
  status: CaseStatus;
  createdAt: string;
  documentCount?: number;
  documents?: CaseDocument[];
  appointments?: Pick<Appointment, 'id' | 'displayId' | 'date' | 'period' | 'service'>[];
}

export interface VirtualMeeting {
  id: string;
  displayId: string;
  client: string;
  advisor: string;
  date: string;
  period: SchedulePeriod;
  status: 'scheduled' | 'active' | 'finished';
  startedAt?: string;
  finishedAt?: string;
}

export async function listAdvisors() {
  return (await apiRequest<{ advisors: Advisor[] }>('/appointments/advisors')).advisors;
}

export async function listAppointments(from?: string, to?: string, calendar = false) {
  const parameters = new URLSearchParams();
  if (from && to) { parameters.set('from', from); parameters.set('to', to); }
  if (calendar) parameters.set('calendar', '1');
  const query = parameters.size ? `?${parameters}` : '';
  return (await apiRequest<{ appointments: Appointment[] }>(`/appointments${query}`)).appointments;
}

export async function bookAppointment(input: { advisorId: string; date: string; period: SchedulePeriod; mode: ServiceMode }) {
  return apiRequest('/appointments', { method: 'POST', body: JSON.stringify(input) });
}

export async function listCases() {
  return (await apiRequest<{ cases: LegalCase[] }>('/cases')).cases;
}

export async function getCase(caseId: string) {
  return (await apiRequest<{ case: LegalCase }>(`/cases/${caseId}`)).case;
}

export async function createCase(input: { appointmentId: string; caseNumber: string; description: string }) {
  return apiRequest('/cases', { method: 'POST', body: JSON.stringify(input) });
}

export async function linkAppointment(caseId: string, appointmentId: string) {
  return apiRequest<void>(`/cases/${caseId}/appointments`, { method: 'POST', body: JSON.stringify({ appointmentId }) });
}

export async function uploadCaseDocuments(caseId: string, files: FileList) {
  const body = new FormData();
  Array.from(files).forEach((file) => body.append('documents', file));
  return apiRequest(`/cases/${caseId}/documents`, { method: 'POST', body });
}

export async function updateCaseStatus(caseId: string, status: CaseStatus) {
  return apiRequest<{ status: CaseStatus }>(`/cases/${caseId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function documentUrl(documentId: string) {
  return apiResourceUrl(`/cases/documents/${documentId}/download`);
}

export async function listMeetings() {
  return (await apiRequest<{ meetings: VirtualMeeting[] }>('/meetings')).meetings;
}

export interface DashboardData {
  metrics: { users: number; openCases: number; weekAppointments: number; closedCases: number };
  recentCases: { id: string; client: string; service: string; status: CaseStatus; date: string }[];
}

export async function getDashboard() {
  return apiRequest<DashboardData>('/dashboard');
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  kind: string;
  targetId?: string;
  action?: 'agenda' | 'cases' | 'advisories';
  isRead: boolean;
  createdAt: string;
}

export async function listNotifications() {
  return apiRequest<{ notifications: Notification[]; unread: number }>('/notifications');
}

export async function markNotificationRead(notificationId: string) {
  return apiRequest<void>(`/notifications/${notificationId}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsRead() {
  return apiRequest<void>('/notifications/read-all', { method: 'POST' });
}
