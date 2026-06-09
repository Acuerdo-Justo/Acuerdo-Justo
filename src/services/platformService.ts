import { supabase } from '../lib/supabase';
import type {
  AdvisorProfile,
  AdvisoryRequest,
  AdvisoryRequestInput,
  Appointment,
  AppointmentInput,
  PensionEstimateInput,
} from '../types/platform';

function getClient() {
  if (!supabase) {
    throw new Error('Supabase no está configurado. Agrega las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
  }

  return supabase;
}

export async function createAdvisoryRequest(input: AdvisoryRequestInput) {
  const { data, error } = await getClient()
    .from('advisory_requests')
    .insert({
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      message: input.message,
      preferred_channel: input.preferredChannel,
    })
    .select()
    .single();

  if (error) throw error;
  return data as AdvisoryRequest;
}

export async function createAppointment(input: AppointmentInput) {
  const { data, error } = await getClient()
    .from('appointments')
    .insert({
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      scheduled_for: input.scheduledFor,
      notes: input.notes,
      advisor_id: input.advisorId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Appointment;
}

export async function listActiveAdvisors() {
  const { data, error } = await getClient()
    .from('advisor_profiles')
    .select('*')
    .eq('is_active', true)
    .order('full_name');

  if (error) throw error;
  return data as AdvisorProfile[];
}

export function calculatePensionEstimate(input: PensionEstimateInput) {
  const monthlyTotal =
    input.monthlyFood +
    input.monthlyEducation +
    input.monthlyHealth +
    input.monthlyHousing +
    input.otherMonthlyExpenses;

  return {
    monthlyTotal,
    perChild: input.childrenCount > 0 ? monthlyTotal / input.childrenCount : 0,
  };
}
