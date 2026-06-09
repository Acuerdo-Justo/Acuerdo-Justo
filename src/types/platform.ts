export type RequestStatus = 'pending' | 'contacted' | 'closed';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface AdvisorProfile {
  id: string;
  fullName: string;
  role: string;
  biography: string | null;
  credentials: string[];
  imageUrl: string | null;
  isActive: boolean;
}

export interface AdvisoryRequestInput {
  fullName: string;
  email: string;
  phone: string;
  message: string;
  preferredChannel: 'whatsapp' | 'phone' | 'email';
}

export interface AdvisoryRequest extends AdvisoryRequestInput {
  id: string;
  status: RequestStatus;
  createdAt: string;
}

export interface AppointmentInput {
  fullName: string;
  email: string;
  phone: string;
  scheduledFor: string;
  notes?: string;
  advisorId?: string;
}

export interface Appointment extends AppointmentInput {
  id: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface PensionEstimateInput {
  childrenCount: number;
  monthlyFood: number;
  monthlyEducation: number;
  monthlyHealth: number;
  monthlyHousing: number;
  otherMonthlyExpenses: number;
}

export interface PensionEstimate extends PensionEstimateInput {
  id: string;
  estimatedTotal: number;
  createdAt: string;
}
