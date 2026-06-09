import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Briefcase,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Scale,
  Search,
  ShieldCheck,
  UserCog,
  UserRound,
  Users,
  Video,
  X,
} from 'lucide-react';
import logoImage from '../assets/logo.jpeg';
import { AdvisoriesView } from './AdvisoriesView';
import { AgendaView } from './AgendaView';
import { CasesView } from './CasesView';
import {
  type AdminUser,
  type AuthUser,
  listUsers,
  logout,
  updateUserRole,
  type UserRole,
  reportActivity,
} from '../services/authService';
import { getDashboard, listNotifications, markAllNotificationsRead, markNotificationRead, type DashboardData, type Notification } from '../services/platformService';

const roleLabels: Record<UserRole, string> = {
  client: 'Cliente',
  legal_advisor: 'Asesor legal',
  admin: 'Administrador',
};

const navigation = [
  { label: 'Resumen', icon: LayoutDashboard },
  { label: 'Usuarios y roles', icon: UserCog, adminOnly: true },
  { label: 'Casos y solicitudes', icon: Briefcase },
  { label: 'Agenda', icon: CalendarDays },
  { label: 'Asesorías', icon: Video },
  { label: 'Calculadora', icon: Calculator },
];

function RoleBadge({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    client: 'bg-brand-light text-brand',
    legal_advisor: 'bg-accent-light text-accent',
    admin: 'bg-ink text-white',
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${styles[role]}`}>{roleLabels[role]}</span>;
}

export function DashboardPage({ currentUser }: { currentUser: AuthUser }) {
  const [activeItem, setActiveItem] = useState('Resumen');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [usersError, setUsersError] = useState('');
  const [dashboard, setDashboard] = useState<DashboardData>({ metrics: { users: 0, openCases: 0, weekAppointments: 0, closedCases: 0 }, recentCases: [] });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    if (currentUser.role !== 'admin') return;

    listUsers()
      .then(setUsers)
      .catch((error) => setUsersError(error instanceof Error ? error.message : 'No se pudieron cargar los usuarios.'));
  }, [currentUser.role]);

  useEffect(() => {
    getDashboard().then(setDashboard).catch(() => undefined);
  }, []);

  useEffect(() => {
    const idleLimit = 5 * 60 * 1000;
    let lastActivity = Date.now();
    let idleTimer = window.setTimeout(handleIdle, idleLimit);

    function handleIdle() {
      void handleSignOut();
    }

    function registerActivity() {
      lastActivity = Date.now();
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(handleIdle, idleLimit);
    }

    const activityEvents: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, registerActivity, { passive: true }));
    const heartbeat = window.setInterval(() => {
      if (Date.now() - lastActivity < idleLimit) reportActivity().catch(() => void handleIdle());
    }, 60_000);

    return () => {
      window.clearTimeout(idleTimer);
      window.clearInterval(heartbeat);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, registerActivity));
    };
  }, []);

  useEffect(() => {
    const loadNotifications = () => listNotifications().then(({ notifications: items }) => setNotifications(items)).catch(() => undefined);
    void loadNotifications();
    const interval = window.setInterval(loadNotifications, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const visibleUsers = useMemo(
    () => users.filter((user) => `${user.fullName} ${user.username}`.toLowerCase().includes(search.toLowerCase())),
    [search, users],
  );

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      const updatedUser = await updateUserRole(userId, role);
      setUsers((currentUsers) => currentUsers.map((user) => (user.id === userId ? updatedUser : user)));
      setUsersError('');
    } catch (error) {
      setUsersError(error instanceof Error ? error.message : 'No se pudo actualizar el rol.');
    }
  };

  const handleSignOut = async () => {
    await logout().catch(() => undefined);
    window.location.replace('/login');
  };

  const selectItem = (label: string) => {
    setActiveItem(label);
    setIsMenuOpen(false);
  };

  const openNotification = async (notification: Notification) => {
    if (!notification.isRead) {
      await markNotificationRead(notification.id).catch(() => undefined);
      setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, isRead: true } : item));
    }
    const sections = { agenda: 'Agenda', cases: 'Casos y solicitudes', advisories: 'Asesorías' };
    if (notification.action) selectItem(sections[notification.action]);
    setIsNotificationsOpen(false);
  };

  const readAllNotifications = async () => {
    await markAllNotificationsRead().catch(() => undefined);
    setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
  };

  return (
    <div className="min-h-screen bg-brand-soft text-ink">
      {isMenuOpen && <button aria-label="Cerrar menú" onClick={() => setIsMenuOpen(false)} className="fixed inset-0 z-30 bg-ink/50 lg:hidden" />}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-ink text-white transition-transform duration-300 lg:translate-x-0 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-24 items-center justify-between border-b border-white/10 px-7">
          <a href="/" className="flex items-center gap-3">
            <img src={logoImage} alt="Acuerdo Justo" className="h-11 w-11 rounded-full border border-white/20 object-cover" />
            <div>
              <span className="block font-serif text-lg font-bold">Acuerdo Justo</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">Gestión jurídica</span>
            </div>
          </a>
          <button onClick={() => setIsMenuOpen(false)} className="text-white/60 lg:hidden" aria-label="Cerrar menú"><X className="h-5 w-5" /></button>
        </div>

        <div className="mx-4 mt-6 border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white"><UserRound className="h-5 w-5" /></div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{currentUser.fullName}</p>
              <p className="text-xs text-white/45">@{currentUser.username}</p>
            </div>
          </div>
          <RoleBadge role={currentUser.role} />
        </div>

        <nav className="flex-1 space-y-1 px-4 py-7">
          <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">Administración</p>
          {navigation.filter((item) => !item.adminOnly || currentUser.role === 'admin').map(({ label, icon: Icon }) => (
            <button key={label} onClick={() => selectItem(label)} className={`flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-medium transition-colors ${activeItem === label ? 'bg-brand text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white">
            <LogOut className="h-5 w-5" /> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-ink-line bg-white/95 px-5 backdrop-blur sm:px-8 lg:px-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(true)} className="rounded-md border border-ink-line p-2 lg:hidden" aria-label="Abrir menú"><Menu className="h-5 w-5" /></button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Panel administrativo</p>
              <h1 className="font-serif text-xl font-bold sm:text-2xl">{activeItem}</h1>
            </div>
          </div>
          <div className="relative flex items-center gap-3">
            <button onClick={() => setIsNotificationsOpen((value) => !value)} className="relative rounded-full border border-ink-line p-2.5 text-ink-muted hover:text-brand" aria-label="Notificaciones" aria-expanded={isNotificationsOpen}>
              <Bell className="h-5 w-5" />{notifications.some((notification) => !notification.isRead) && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[8px] font-bold text-white">{Math.min(99, notifications.filter((notification) => !notification.isRead).length)}</span>}
            </button>
            {isNotificationsOpen && <NotificationsPanel notifications={notifications} onClose={() => setIsNotificationsOpen(false)} onOpen={openNotification} onReadAll={readAllNotifications} />}
            <span className="hidden sm:block"><RoleBadge role={currentUser.role} /></span>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {activeItem === 'Usuarios y roles' && currentUser.role === 'admin' ? (
            <UsersView users={visibleUsers} search={search} error={usersError} currentUserId={currentUser.id} onSearch={setSearch} onRoleChange={handleRoleChange} />
          ) : activeItem === 'Agenda' ? (
            <AgendaView currentUser={currentUser} />
          ) : activeItem === 'Casos y solicitudes' ? (
            <CasesView currentUser={currentUser} />
          ) : activeItem === 'Asesorías' ? (
            <AdvisoriesView currentUser={currentUser} />
          ) : (
            <Overview data={dashboard} canManageUsers={currentUser.role === 'admin'} onManageUsers={() => selectItem('Usuarios y roles')} />
          )}
        </main>
      </div>
    </div>
  );
}

function Overview({ data, canManageUsers, onManageUsers }: { data: DashboardData; canManageUsers: boolean; onManageUsers: () => void }) {
  const metrics = [
    { label: 'Usuarios registrados', value: data.metrics.users, detail: 'Usuarios activos', icon: Users },
    { label: 'Expedientes abiertos', value: data.metrics.openCases, detail: 'Procesos activos', icon: FileText },
    { label: 'Citas esta semana', value: data.metrics.weekAppointments, detail: 'Próximos siete días', icon: CalendarDays },
    { label: 'Expedientes cerrados', value: data.metrics.closedCases, detail: 'Procesos completados', icon: CheckCircle2 },
  ];
  const recentCases = data.recentCases.map((legalCase) => ({
    ...legalCase,
    status: legalCase.status === 'open' ? 'Abierto' : legalCase.status === 'review' ? 'En revisión' : 'Cerrado',
    date: formatDate(legalCase.date),
  }));
  return (
    <>
      <section className="relative mb-8 overflow-hidden bg-brand px-7 py-8 text-white shadow-professional sm:px-10 sm:py-10">
        <div className="absolute -right-20 -top-32 h-72 w-72 rounded-full border border-white/15" />
        <div className="absolute -right-4 -top-16 h-48 w-48 rounded-full border border-white/10" />
        <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-accent-light">Resumen institucional</p>
            <h2 className="mb-4 font-serif text-3xl font-bold sm:text-4xl">Gestión ordenada para una atención cercana</h2>
            <p className="max-w-xl leading-7 text-white/70">Supervisa usuarios, solicitudes y citas desde un espacio diseñado para acompañar cada caso con claridad.</p>
          </div>
          {canManageUsers && (
            <button onClick={onManageUsers} className="flex shrink-0 items-center gap-3 rounded-md bg-white px-5 py-3 text-sm font-semibold text-brand transition-colors hover:bg-accent-light">
              <UserCog className="h-4 w-4" /> Gestionar roles
            </button>
          )}
        </div>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon }) => (
          <article key={label} className="border border-ink-line bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-light text-brand"><Icon className="h-5 w-5" /></div>
              <span className="font-serif text-3xl font-bold text-ink">{value}</span>
            </div>
            <h3 className="mb-1 text-sm font-semibold">{label}</h3>
            <p className="text-xs text-ink-muted">{detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="border border-ink-line bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-ink-line px-6 py-5">
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Seguimiento</p><h2 className="font-serif text-xl font-bold">Casos recientes</h2></div>
            <button className="text-sm font-semibold text-brand">Ver todos</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-brand-soft text-[10px] uppercase tracking-[0.15em] text-ink-muted">
                <tr><th className="px-6 py-3">Expediente</th><th className="px-6 py-3">Cliente</th><th className="px-6 py-3">Servicio</th><th className="px-6 py-3">Estado</th><th className="px-6 py-3">Fecha</th></tr>
              </thead>
              <tbody>{recentCases.map((item) => <tr key={item.id} className="border-t border-ink-line"><td className="px-6 py-4 font-semibold text-brand">{item.id}</td><td className="px-6 py-4 font-medium">{item.client}</td><td className="px-6 py-4 text-ink-muted">{item.service}</td><td className="px-6 py-4"><span className="rounded-full bg-accent-light px-3 py-1 text-xs font-semibold text-accent">{item.status}</span></td><td className="px-6 py-4 text-ink-muted">{item.date}</td></tr>)}</tbody>
            </table>
          </div>
        </article>

        <article className="bg-ink p-6 text-white shadow-sm sm:p-8">
          <Scale className="mb-8 h-8 w-8 text-accent-light" />
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-light">Modelo de acceso</p>
          <h2 className="mb-4 font-serif text-2xl font-bold">Tres roles, responsabilidades claras</h2>
          <p className="mb-7 text-sm leading-6 text-white/55">Cada nuevo registro inicia como cliente. El administrador es el único autorizado para asignar permisos profesionales.</p>
          <div className="space-y-4 border-t border-white/10 pt-6 text-sm">
            <p className="flex items-center gap-3"><UserRound className="h-4 w-4 text-brand-light" /> Cliente: gestiona su proceso</p>
            <p className="flex items-center gap-3"><Briefcase className="h-4 w-4 text-accent-light" /> Asesor: atiende casos asignados</p>
            <p className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-white" /> Administrador: controla usuarios y roles</p>
          </div>
        </article>
      </section>
    </>
  );
}

interface UsersViewProps {
  users: AdminUser[];
  search: string;
  error: string;
  currentUserId: string;
  onSearch: (value: string) => void;
  onRoleChange: (userId: string, role: UserRole) => Promise<void>;
}

function NotificationsPanel({ notifications, onClose, onOpen, onReadAll }: { notifications: Notification[]; onClose: () => void; onOpen: (notification: Notification) => void; onReadAll: () => void }) {
  const groups = notifications.reduce<Record<string, Notification[]>>((result, notification) => {
    const key = notificationDay(notification.createdAt);
    result[key] = [...(result[key] ?? []), notification];
    return result;
  }, {});
  return (
    <section className="fixed inset-x-4 top-20 z-50 max-h-[75vh] overflow-hidden border border-ink-line bg-white shadow-professional sm:absolute sm:inset-x-auto sm:right-0 sm:top-14 sm:w-[26rem]">
      <header className="flex items-center justify-between border-b border-ink-line px-4 py-4">
        <div><h2 className="font-serif text-lg font-bold">Notificaciones</h2><p className="text-xs text-ink-muted">{notifications.filter((item) => !item.isRead).length} sin leer</p></div>
        <div className="flex items-center gap-2"><button type="button" onClick={onReadAll} className="text-xs font-semibold text-brand">Marcar leídas</button><button type="button" onClick={onClose} aria-label="Cerrar notificaciones" className="p-2 text-ink-muted"><X className="h-4 w-4" /></button></div>
      </header>
      <div className="max-h-[calc(75vh-5rem)] overflow-y-auto">
        {notifications.length === 0 && <div className="p-8 text-center text-sm text-ink-muted"><Bell className="mx-auto mb-3 h-6 w-6 text-ink-subtle" />No tienes notificaciones.</div>}
        {Object.entries(groups).map(([day, items]) => <div key={day}>
          <p className="sticky top-0 border-y border-ink-line bg-brand-soft px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">{day}</p>
          {items.map((notification) => <button key={notification.id} type="button" onClick={() => void onOpen(notification)} className={`block w-full border-b border-ink-line px-4 py-4 text-left transition-colors hover:bg-brand-soft ${notification.isRead ? 'bg-white' : 'bg-brand-light/50'}`}>
            <div className="flex items-start gap-3"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notification.isRead ? 'bg-ink-line' : 'bg-accent'}`} /><div><p className="text-sm font-semibold">{notification.title}</p><p className="mt-1 text-xs leading-5 text-ink-muted">{notification.message}</p><p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">{formatNotificationTime(notification.createdAt)}</p></div></div>
          </button>)}
        </div>)}
      </div>
    </section>
  );
}

function notificationDay(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Hoy';
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
  return new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: '2-digit', month: 'long' }).format(date);
}

function formatNotificationTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' }).format(date);
}

function UsersView({ users, search, error, currentUserId, onSearch, onRoleChange }: UsersViewProps) {
  const usersPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(users.length / usersPerPage));
  const pageUsers = users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  return (
    <>
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        {(['client', 'legal_advisor', 'admin'] as UserRole[]).map((role) => (
          <article key={role} className="border border-ink-line bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between"><RoleBadge role={role} /><span className="font-serif text-3xl font-bold">{users.filter((user) => user.role === role).length}</span></div>
            <p className="text-xs leading-5 text-ink-muted">{role === 'client' ? 'Accede a sus solicitudes, citas y herramientas.' : role === 'legal_advisor' ? 'Atiende y brinda seguimiento a casos asignados.' : 'Gestiona toda la plataforma y sus permisos.'}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden border border-ink-line bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-ink-line px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold">Directorio de usuarios</h2>
            <p className="mt-1 text-xs text-ink-muted">{users.length} usuario{users.length === 1 ? '' : 's'} encontrado{users.length === 1 ? '' : 's'}</p>
          </div>
          <label className="flex w-full items-center gap-3 border border-ink-line bg-brand-soft px-4 md:w-64">
            <Search className="h-4 w-4 shrink-0 text-ink-subtle" />
            <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Buscar usuario..." className="min-w-0 w-full bg-transparent py-3 text-sm outline-none" />
          </label>
        </div>
        {error && <p className="border-b border-ink-line bg-accent-light px-6 py-3 text-sm font-medium text-accent">{error}</p>}

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-brand-soft text-[10px] uppercase tracking-[0.15em] text-ink-muted">
              <tr><th className="px-6 py-3">Usuario</th><th className="px-6 py-3">Rol actual</th><th className="px-6 py-3">Estado</th><th className="px-6 py-3">Registro</th><th className="px-6 py-3">Asignar rol</th></tr>
            </thead>
            <tbody>
              {pageUsers.map((user) => (
                <tr key={user.id} className="border-t border-ink-line">
                  <td className="px-6 py-4"><p className="font-semibold">{user.fullName}</p><p className="text-xs text-ink-muted">@{user.username}</p></td>
                  <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                  <td className="px-6 py-4"><span className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted"><span className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-amber-400'}`} />{user.isActive ? 'Activo' : 'Inactivo'}</span></td>
                  <td className="px-6 py-4 text-ink-muted"><span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" />{formatDate(user.createdAt)}</span></td>
                  <td className="px-6 py-4">
                    <RoleSelect user={user} currentUserId={currentUserId} onRoleChange={onRoleChange} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-ink-line md:hidden">
          {pageUsers.map((user) => (
            <article key={user.id} className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{user.fullName}</p>
                  <p className="truncate text-xs text-ink-muted">@{user.username}</p>
                </div>
                <RoleBadge role={user.role} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-ink-muted">
                <span className="inline-flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-amber-400'}`} />{user.isActive ? 'Activo' : 'Inactivo'}</span>
                <span className="inline-flex items-center justify-end gap-2"><Clock3 className="h-4 w-4" />{formatDate(user.createdAt)}</span>
              </div>
              <RoleSelect user={user} currentUserId={currentUserId} onRoleChange={onRoleChange} fullWidth />
            </article>
          ))}
        </div>

        {users.length === 0 && <div className="p-10 text-center text-sm text-ink-muted"><MessageSquareText className="mx-auto mb-3 h-6 w-6" />No se encontraron usuarios.</div>}

        {users.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-ink-line px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-ink-muted">Mostrando {(currentPage - 1) * usersPerPage + 1}-{Math.min(currentPage * usersPerPage, users.length)} de {users.length}</p>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)} className="inline-flex items-center gap-2 rounded-md border border-ink-line px-3 py-2 text-xs font-semibold text-ink-muted transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" /> Anterior
              </button>
              <span className="text-xs font-semibold text-ink">Pagina {currentPage} de {totalPages}</span>
              <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)} className="inline-flex items-center gap-2 rounded-md border border-ink-line px-3 py-2 text-xs font-semibold text-ink-muted transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40">
                Siguiente <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function RoleSelect({ user, currentUserId, onRoleChange, fullWidth = false }: { user: AdminUser; currentUserId: string; onRoleChange: (userId: string, role: UserRole) => Promise<void>; fullWidth?: boolean }) {
  return (
    <select value={user.role} disabled={user.id === currentUserId} onChange={(event) => void onRoleChange(user.id, event.target.value as UserRole)} className={`${fullWidth ? 'w-full py-3' : 'py-2'} rounded-md border border-ink-line bg-white px-3 text-xs font-semibold outline-none focus:border-brand disabled:cursor-not-allowed disabled:bg-brand-soft disabled:text-ink-subtle`}>
      <option value="client">Cliente</option><option value="legal_advisor">Asesor legal</option><option value="admin">Administrador</option>
    </select>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}
