import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, MapPin, Sunrise, Sunset, UserRound, Video } from 'lucide-react';
import type { AuthUser } from '../services/authService';
import { bookAppointment, listAdvisors, listAppointments, type Advisor, type Appointment, type SchedulePeriod, type ServiceMode } from '../services/platformService';

type ScheduledService = Appointment;

const weekDays = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
const periodDetails: Record<SchedulePeriod, { label: string; time: string; icon: typeof Sunrise }> = {
  morning: { label: 'Turno mañana', time: '09:00 - 12:00', icon: Sunrise },
  afternoon: { label: 'Turno tarde', time: '15:00 - 18:00', icon: Sunset },
};

export function AgendaView({ currentUser }: { currentUser: AuthUser }) {
  const today = new Date();
  const initialDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [visibleMonth, setVisibleMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [appointments, setAppointments] = useState<ScheduledService[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [error, setError] = useState('');
  const isAdmin = currentUser.role === 'admin';
  const isAdvisor = currentUser.role === 'legal_advisor';
  const isClient = currentUser.role === 'client';

  const loadAgenda = useCallback(async () => {
    try {
      const from = toDateKey(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1));
      const to = toDateKey(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0));
      const [loadedAppointments, loadedAdvisors] = await Promise.all([listAppointments(from, to, true), listAdvisors()]);
      setAppointments(loadedAppointments);
      setAdvisors(loadedAdvisors);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la agenda.');
    }
  }, [visibleMonth]);

  useEffect(() => { void loadAgenda(); }, [loadAgenda]);

  const visibleSchedules = useMemo<Record<string, ScheduledService[]>>(() => appointments.reduce<Record<string, ScheduledService[]>>((grouped, appointment) => {
    grouped[appointment.date] = [...(grouped[appointment.date] ?? []), appointment];
    return grouped;
  }, {}), [appointments]);

  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const selectedServices = visibleSchedules[toDateKey(selectedDate)] ?? [];
  const visibleMonthPrefix = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, '0')}`;
  const monthSchedules = Object.entries(visibleSchedules)
    .filter(([date]) => date.startsWith(visibleMonthPrefix))
    .flatMap(([, services]) => services);
  const changeMonth = (offset: number) => {
    const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1);
    setVisibleMonth(nextMonth);
    setSelectedDate(nextMonth);
  };

  return (
    <div className="space-y-6">
      {error && <p className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {isAdvisor && (
        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Citas programadas" value={monthSchedules.length} detail="Durante el mes visible" icon={CalendarDays} />
          <SummaryCard label="Turnos disponibles" value={daysInMonth(visibleMonth) * 2 - monthSchedules.length} detail="Mañana y tarde" icon={CheckCircle2} />
          <SummaryCard label="Atenciones por día" value={2} detail="Un turno por jornada" icon={Clock3} />
        </section>
      )}

      <section className={isAdmin ? 'space-y-6' : 'grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_25rem]'}>
        <article className="overflow-hidden border border-ink-line bg-white shadow-sm">
          <header className="flex items-center justify-between gap-4 border-b border-ink-line px-4 py-4 sm:px-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">{isAdmin ? 'Programación institucional' : isClient ? 'Selecciona una fecha' : 'Mi calendario mensual'}</p>
              <h2 className="font-serif text-xl font-bold capitalize sm:text-2xl">{formatMonth(visibleMonth)}</h2>
            </div>
            <div className="flex items-center gap-2">
              <CalendarButton label="Mes anterior" onClick={() => changeMonth(-1)}><ChevronLeft className="h-4 w-4" /></CalendarButton>
              <button type="button" onClick={() => { setVisibleMonth(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)); setSelectedDate(initialDate); }} className="hidden rounded-md border border-ink-line px-3 py-2 text-xs font-semibold text-ink-muted transition-colors hover:border-brand hover:text-brand sm:block">Hoy</button>
              <CalendarButton label="Mes siguiente" onClick={() => changeMonth(1)}><ChevronRight className="h-4 w-4" /></CalendarButton>
            </div>
          </header>

          <div className="grid grid-cols-7 border-b border-ink-line bg-brand-soft">
            {weekDays.map((day) => <div key={day} className="px-1 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted sm:text-xs">{day}</div>)}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map(({ date, isCurrentMonth }) => {
              const key = toDateKey(date);
              const services = visibleSchedules[key] ?? [];
              const selected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, initialDate);
              const dayAdvisors = new Set(services.map((service) => service.advisorUsername)).size;

              return (
                <button key={key} type="button" onClick={() => { setSelectedDate(date); if (!isCurrentMonth) setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1)); }} className={`min-h-20 border-b border-r border-ink-line p-1.5 text-left transition-colors sm:min-h-32 sm:p-2 ${selected ? 'bg-brand-light ring-2 ring-inset ring-brand' : 'hover:bg-brand-soft'} ${isCurrentMonth ? 'text-ink' : 'bg-brand-soft/50 text-ink-subtle'}`}>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold sm:h-7 sm:w-7 ${isToday ? 'bg-brand text-white' : ''}`}>{date.getDate()}</span>
                  {isAdmin ? (
                    <>
                      <div className="mt-2 flex gap-1 sm:hidden">
                        {services.slice(0, 4).map((_, index) => <span key={index} className="h-1.5 flex-1 rounded-full bg-accent" />)}
                      </div>
                      {services.length > 0 && <div className="mt-2 hidden space-y-1 sm:block"><p className="rounded bg-accent-light px-2 py-1 text-[10px] font-semibold text-accent">{services.length} cita{services.length === 1 ? '' : 's'}</p><p className="truncate px-1 text-[10px] text-ink-muted">{dayAdvisors} asesor{dayAdvisors === 1 ? '' : 'es'}</p></div>}
                    </>
                  ) : isClient ? (
                    <ClientDayAvailability date={date} services={services} today={initialDate} advisors={advisors} />
                  ) : (
                    <AdvisorDaySlots services={services} />
                  )}
                </button>
              );
            })}
          </div>
        </article>

        <aside className={`h-fit border border-ink-line bg-white shadow-sm ${isAdmin ? '' : 'lg:sticky lg:top-24'}`}>
          <div className="border-b border-ink-line bg-ink px-5 py-5 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-light">{isAdmin ? 'Programaciones del día' : isClient ? 'Agendar una cita' : 'Atenciones del día'}</p>
            <h2 className="mt-1 font-serif text-xl font-bold capitalize">{formatLongDate(selectedDate)}</h2>
          </div>
          {isAdmin ? (
            <AdminDayDetails services={selectedServices} />
          ) : isClient ? (
            <ClientBooking date={selectedDate} services={selectedServices} clientName={currentUser.fullName} today={initialDate} advisors={advisors} onBooked={loadAgenda} />
          ) : (
            <AdvisorDayDetails services={selectedServices} />
          )}
        </aside>
      </section>
    </div>
  );
}

function ClientBooking({ date, services, clientName, today, advisors, onBooked }: { date: Date; services: ScheduledService[]; clientName: string; today: Date; advisors: Advisor[]; onBooked: () => Promise<void> }) {
  const [selectedAdvisor, setSelectedAdvisor] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<SchedulePeriod | ''>('');
  const [selectedMode, setSelectedMode] = useState<ServiceMode>('presencial');
  const [confirmation, setConfirmation] = useState('');
  const availablePeriods = getBookablePeriods(date, today);
  const bookingRestriction = getBookingRestriction(date, today);

  const selectedAdvisorData = advisors.find((advisor) => advisor.id === selectedAdvisor);
  const isSlotAvailable = selectedAdvisor && selectedPeriod
    ? availablePeriods.includes(selectedPeriod) && !services.some((service) => service.advisorId === selectedAdvisor && service.period === selectedPeriod)
    : false;

  useEffect(() => {
    setSelectedAdvisor('');
    setSelectedPeriod('');
    setConfirmation('');
  }, [date]);

  const selectAdvisor = (advisorId: string) => {
    setSelectedAdvisor(advisorId);
    setSelectedPeriod('');
    setConfirmation('');
  };

  const handleBooking = async () => {
    if (!selectedAdvisorData || !selectedPeriod || !isSlotAvailable) return;
    const period = periodDetails[selectedPeriod];
    try {
      await bookAppointment({ advisorId: selectedAdvisorData.id, date: toDateKey(date), period: selectedPeriod, mode: selectedMode });
      await onBooked();
      setConfirmation(`Cita registrada con ${selectedAdvisorData.name}, ${period.label.toLowerCase()}, modalidad ${selectedMode}.`);
    } catch (bookingError) {
      setConfirmation(bookingError instanceof Error ? bookingError.message : 'No se pudo registrar la cita.');
    }
  };

  return (
    <div className="space-y-5 p-4 sm:p-5">
      {bookingRestriction && (
        <div className="border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
          <p className="font-semibold">Fecha no disponible para reservas</p>
          <p>{bookingRestriction}</p>
        </div>
      )}

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">1. Elige un asesor</p>
        <div className="space-y-3">
          {advisors.map((advisor) => {
            const occupiedPeriods = services.filter((service) => service.advisorId === advisor.id).map((service) => service.period);
            const availableCount = availablePeriods.filter((period) => !occupiedPeriods.includes(period)).length;
            return (
              <button key={advisor.id} type="button" onClick={() => selectAdvisor(advisor.id)} disabled={availableCount === 0} className={`w-full border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${selectedAdvisor === advisor.id ? 'border-brand bg-brand-light' : 'border-ink-line hover:border-brand/50'}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-semibold"><UserRound className="h-4 w-4 text-brand" />{advisor.name}</span>
                  <span className="text-[10px] font-semibold text-ink-muted">{availableCount} turno{availableCount === 1 ? '' : 's'} libre{availableCount === 1 ? '' : 's'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedAdvisorData && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">2. Elige un turno</p>
          <div className="grid grid-cols-2 gap-3">
            {(['morning', 'afternoon'] as SchedulePeriod[]).map((period) => {
              const details = periodDetails[period];
              const notOffered = !availablePeriods.includes(period);
              const occupied = services.some((service) => service.advisorId === selectedAdvisor && service.period === period);
              return (
                <button key={period} type="button" disabled={notOffered || occupied} onClick={() => { setSelectedPeriod(period); setConfirmation(''); }} className={`border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:bg-brand-soft disabled:text-ink-subtle ${selectedPeriod === period ? 'border-brand bg-brand-light' : 'border-ink-line hover:border-brand/50'}`}>
                  <span className="block text-xs font-semibold">{details.label}</span>
                  <span className="mt-1 block text-[10px]">{notOffered ? 'No se atiende' : occupied ? 'No disponible' : details.time}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedPeriod && isSlotAvailable && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">3. Tipo de asesoría</p>
          <div className="grid grid-cols-2 gap-3">
            <ModeButton selected={selectedMode === 'presencial'} onClick={() => setSelectedMode('presencial')} icon={MapPin} label="Presencial" />
            <ModeButton selected={selectedMode === 'virtual'} onClick={() => setSelectedMode('virtual')} icon={Video} label="Virtual" />
          </div>
        </div>
      )}

      {selectedPeriod && isSlotAvailable && (
        <button type="button" onClick={handleBooking} className="w-full rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink">
          Confirmar cita
        </button>
      )}

      {confirmation && (
        <div className="border border-green-200 bg-green-50 p-4 text-xs leading-5 text-green-800">
          <p className="mb-1 font-semibold">Selección confirmada para {clientName}</p>
          <p>{formatLongDate(date)}. {confirmation}</p>
        </div>
      )}
    </div>
  );
}

function ClientDayAvailability({ date, services, today, advisors }: { date: Date; services: ScheduledService[]; today: Date; advisors: Advisor[] }) {
  const offeredPeriods = getBookablePeriods(date, today);
  const availableAdvisors = advisors.filter((advisor) => offeredPeriods.some((period) => !services.some((service) => service.advisorId === advisor.id && service.period === period))).length;
  const availableSlots = advisors.reduce((total, advisor) => total + offeredPeriods.filter((period) => !services.some((service) => service.advisorId === advisor.id && service.period === period)).length, 0);
  return (
    <>
      <div className="mt-2 flex gap-1 sm:hidden">{Array.from({ length: Math.min(availableSlots, 4) }, (_, index) => <span key={index} className="h-1.5 flex-1 rounded-full bg-success/50" />)}</div>
      <div className="mt-2 hidden space-y-1 sm:block">
        <p className={`rounded px-2 py-1 text-[10px] font-semibold ${availableSlots > 0 ? 'bg-green-50 text-green-700' : 'bg-brand-soft text-ink-subtle'}`}>{availableSlots > 0 ? `${availableSlots} turno${availableSlots === 1 ? '' : 's'} disponible${availableSlots === 1 ? '' : 's'}` : 'No disponible'}</p>
        <p className="truncate px-1 text-[10px] text-ink-muted">{availableAdvisors} asesor{availableAdvisors === 1 ? '' : 'es'} disponible{availableAdvisors === 1 ? '' : 's'}</p>
      </div>
    </>
  );
}

function ModeButton({ selected, onClick, icon: Icon, label }: { selected: boolean; onClick: () => void; icon: typeof MapPin; label: string }) {
  return <button type="button" onClick={onClick} className={`flex items-center justify-center gap-2 border px-3 py-3 text-xs font-semibold transition-colors ${selected ? 'border-brand bg-brand-light text-brand' : 'border-ink-line text-ink-muted hover:border-brand/50'}`}><Icon className="h-4 w-4" />{label}</button>;
}

function AdminDayDetails({ services }: { services: ScheduledService[] }) {
  if (services.length === 0) return <EmptyDay message="No hay programaciones registradas para este día." />;

  return (
    <div className="grid gap-3 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-3">
      {services.map((service, index) => {
        const details = periodDetails[service.period];
        return (
          <article key={`${service.advisorUsername}-${service.period}-${index}`} className="border border-ink-line p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{service.service}</p>
              <span className="shrink-0 rounded-full bg-brand-light px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-brand">{details.label}</span>
            </div>
            <dl className="space-y-2 border-t border-ink-line pt-3 text-xs">
              <DetailRow label="Asesor" value={service.advisor} />
              <DetailRow label="Cliente" value={service.client} />
              <DetailRow label="Turno" value={`${details.label.replace('Turno ', '')} · ${details.time}`} />
            </dl>
          </article>
        );
      })}
    </div>
  );
}

function AdvisorDayDetails({ services }: { services: ScheduledService[] }) {
  return (
    <div className="space-y-4 p-4 sm:p-5">
      {(['morning', 'afternoon'] as SchedulePeriod[]).map((period) => {
        const details = periodDetails[period];
        const service = services.find((item) => item.period === period);
        const Icon = details.icon;
        return (
          <article key={period} className={`border p-4 ${service ? 'border-accent/30 bg-accent-light/40' : 'border-green-200 bg-green-50'}`}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3"><div className={`flex h-9 w-9 items-center justify-center rounded-full ${service ? 'bg-accent-light text-accent' : 'bg-white text-green-700'}`}><Icon className="h-4 w-4" /></div><div><h3 className="text-sm font-semibold">{details.label}</h3><p className="text-xs text-ink-muted">{details.time}</p></div></div>
              <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${service ? 'bg-accent text-white' : 'bg-green-600 text-white'}`}>{service ? 'Agendada' : 'Disponible'}</span>
            </div>
            {service ? <div className="space-y-2 border-t border-ink-line/70 pt-3"><p className="text-sm font-semibold">{service.service}</p><p className="flex items-center gap-2 text-xs text-ink-muted"><UserRound className="h-4 w-4" />{service.client}</p></div> : <p className="border-t border-green-200 pt-3 text-xs leading-5 text-green-800">Este horario está disponible para recibir una cita.</p>}
          </article>
        );
      })}
    </div>
  );
}

function AdvisorDaySlots({ services }: { services: ScheduledService[] }) {
  return (
    <>
      <div className="mt-1 flex gap-1 sm:hidden">{(['morning', 'afternoon'] as SchedulePeriod[]).map((period) => <span key={period} className={`h-1.5 flex-1 rounded-full ${services.some((item) => item.period === period) ? 'bg-accent' : 'bg-success/40'}`} />)}</div>
      <div className="mt-2 hidden space-y-1 sm:block">{(['morning', 'afternoon'] as SchedulePeriod[]).map((period) => { const service = services.find((item) => item.period === period); return <div key={period} className={`truncate rounded px-2 py-1 text-[10px] font-semibold ${service ? 'bg-accent-light text-accent' : 'bg-green-50 text-green-700'}`}>{period === 'morning' ? 'Mañana' : 'Tarde'}: {service?.service ?? 'Disponible'}</div>; })}</div>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[4rem_1fr] gap-2"><dt className="font-semibold text-ink-muted">{label}</dt><dd className="font-medium text-ink">{value}</dd></div>;
}

function EmptyDay({ message }: { message: string }) {
  return <div className="p-8 text-center text-sm text-ink-muted"><CalendarDays className="mx-auto mb-3 h-7 w-7 text-ink-subtle" />{message}</div>;
}

function CalendarButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} aria-label={label} className="rounded-md border border-ink-line p-2.5 text-ink-muted transition-colors hover:border-brand hover:text-brand">{children}</button>;
}

function SummaryCard({ label, value, detail, icon: Icon }: { label: string; value: number; detail: string; icon: typeof CalendarDays }) {
  return <article className="border border-ink-line bg-white p-5 shadow-sm"><div className="mb-4 flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-light text-brand"><Icon className="h-5 w-5" /></div><span className="font-serif text-3xl font-bold">{String(value).padStart(2, '0')}</span></div><p className="text-sm font-semibold">{label}</p><p className="mt-1 text-xs text-ink-muted">{detail}</p></article>;
}

function buildCalendarDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const calendarStart = new Date(month.getFullYear(), month.getMonth(), 1 - mondayOffset);
  const requiredCells = Math.ceil((mondayOffset + daysInMonth(month)) / 7) * 7;
  return Array.from({ length: requiredCells }, (_, index) => { const date = new Date(calendarStart.getFullYear(), calendarStart.getMonth(), calendarStart.getDate() + index); return { date, isCurrentMonth: date.getMonth() === month.getMonth() }; });
}

function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isSameDay(first: Date, second: Date) {
  return toDateKey(first) === toDateKey(second);
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(date);
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: '2-digit', month: 'long' }).format(date);
}

function getBookablePeriods(date: Date, today: Date): SchedulePeriod[] {
  if (date < minimumBookingDate(today) || date.getDay() === 0) return [];
  if (date.getDay() === 6) return ['morning'];
  return ['morning', 'afternoon'];
}

function getBookingRestriction(date: Date, today: Date) {
  if (date < minimumBookingDate(today)) return `Las citas deben reservarse con al menos un día completo de anticipación. La primera fecha disponible es ${formatLongDate(minimumBookingDate(today))}.`;
  if (date.getDay() === 0) return 'Los domingos no se realizan atenciones.';
  return '';
}

function minimumBookingDate(today: Date) {
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
}
