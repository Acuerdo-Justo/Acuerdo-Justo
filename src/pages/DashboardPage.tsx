import { useMemo, useState } from 'react';
import {
  Bell,
  Briefcase,
  Calculator,
  CalendarDays,
  CheckCircle2,
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
import {
  DemoUser,
  getCurrentDemoUser,
  getDemoUsers,
  signOutDemo,
  updateDemoUserRole,
  UserRole,
} from '../services/authService';

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

const metrics = [
  { label: 'Usuarios registrados', value: '05', detail: '3 clientes activos', icon: Users },
  { label: 'Solicitudes abiertas', value: '08', detail: '2 requieren revisión', icon: FileText },
  { label: 'Citas esta semana', value: '04', detail: 'Próxima: mañana 10:00', icon: CalendarDays },
  { label: 'Acuerdos completados', value: '12', detail: 'Durante este mes', icon: CheckCircle2 },
];

const recentCases = [
  { id: 'AJ-2026-018', client: 'María Torres', service: 'Asesoría virtual', status: 'En revisión', date: '08 jun. 2026' },
  { id: 'AJ-2026-017', client: 'Carlos Mendoza', service: 'Cálculo de pensión', status: 'Pendiente', date: '07 jun. 2026' },
  { id: 'AJ-2026-016', client: 'José Ramírez', service: 'Mediación', status: 'Programada', date: '06 jun. 2026' },
];

function RoleBadge({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    client: 'bg-brand-light text-brand',
    legal_advisor: 'bg-accent-light text-accent',
    admin: 'bg-ink text-white',
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${styles[role]}`}>{roleLabels[role]}</span>;
}

export function DashboardPage() {
  const currentUser = getCurrentDemoUser();
  const [activeItem, setActiveItem] = useState('Resumen');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [users, setUsers] = useState<DemoUser[]>(getDemoUsers);
  const [search, setSearch] = useState('');

  const visibleUsers = useMemo(
    () => users.filter((user) => `${user.name} ${user.username}`.toLowerCase().includes(search.toLowerCase())),
    [search, users],
  );

  const handleRoleChange = (userId: string, role: UserRole) => {
    setUsers(updateDemoUserRole(userId, role));
  };

  const handleSignOut = () => {
    signOutDemo();
    window.location.href = '/login';
  };

  const selectItem = (label: string) => {
    setActiveItem(label);
    setIsMenuOpen(false);
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
              <p className="truncate text-sm font-semibold">{currentUser.name}</p>
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
          <div className="flex items-center gap-3">
            <button className="relative rounded-full border border-ink-line p-2.5 text-ink-muted hover:text-brand" aria-label="Notificaciones">
              <Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
            </button>
            <span className="hidden sm:block"><RoleBadge role={currentUser.role} /></span>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {activeItem === 'Usuarios y roles' ? (
            <UsersView users={visibleUsers} search={search} onSearch={setSearch} onRoleChange={handleRoleChange} />
          ) : (
            <Overview onManageUsers={() => selectItem('Usuarios y roles')} />
          )}
        </main>
      </div>
    </div>
  );
}

function Overview({ onManageUsers }: { onManageUsers: () => void }) {
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
          <button onClick={onManageUsers} className="flex shrink-0 items-center gap-3 rounded-md bg-white px-5 py-3 text-sm font-semibold text-brand transition-colors hover:bg-accent-light">
            <UserCog className="h-4 w-4" /> Gestionar roles
          </button>
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
  users: DemoUser[];
  search: string;
  onSearch: (value: string) => void;
  onRoleChange: (userId: string, role: UserRole) => void;
}

function UsersView({ users, search, onSearch, onRoleChange }: UsersViewProps) {
  return (
    <>
      <section className="mb-8 flex flex-col justify-between gap-5 border-b border-ink-line pb-7 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Administración de accesos</p>
          <h2 className="mb-2 font-serif text-3xl font-bold sm:text-4xl">Usuarios y roles</h2>
          <p className="max-w-2xl text-sm leading-6 text-ink-muted">Los usuarios nuevos se registran automáticamente como clientes. Desde aquí puedes habilitar asesores legales o administradores.</p>
        </div>
        <div className="flex items-center gap-3 border border-ink-line bg-white px-4">
          <Search className="h-4 w-4 text-ink-subtle" />
          <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Buscar usuario..." className="w-56 bg-transparent py-3 text-sm outline-none" />
        </div>
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        {(['client', 'legal_advisor', 'admin'] as UserRole[]).map((role) => (
          <article key={role} className="border border-ink-line bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between"><RoleBadge role={role} /><span className="font-serif text-3xl font-bold">{users.filter((user) => user.role === role).length}</span></div>
            <p className="text-xs leading-5 text-ink-muted">{role === 'client' ? 'Accede a sus solicitudes, citas y herramientas.' : role === 'legal_advisor' ? 'Atiende y brinda seguimiento a casos asignados.' : 'Gestiona toda la plataforma y sus permisos.'}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden border border-ink-line bg-white shadow-sm">
        <div className="border-b border-ink-line px-6 py-5"><h3 className="font-serif text-xl font-bold">Directorio de usuarios</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-brand-soft text-[10px] uppercase tracking-[0.15em] text-ink-muted">
              <tr><th className="px-6 py-3">Usuario</th><th className="px-6 py-3">Rol actual</th><th className="px-6 py-3">Estado</th><th className="px-6 py-3">Registro</th><th className="px-6 py-3">Asignar rol</th></tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-ink-line">
                  <td className="px-6 py-4"><p className="font-semibold">{user.name}</p><p className="text-xs text-ink-muted">@{user.username}</p></td>
                  <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                  <td className="px-6 py-4"><span className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted"><span className={`h-2 w-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-amber-400'}`} />{user.status === 'active' ? 'Activo' : 'Pendiente'}</span></td>
                  <td className="px-6 py-4 text-ink-muted"><span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" />{user.createdAt}</span></td>
                  <td className="px-6 py-4">
                    <select value={user.role} disabled={user.username === 'admin'} onChange={(event) => onRoleChange(user.id, event.target.value as UserRole)} className="rounded-md border border-ink-line bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-brand disabled:cursor-not-allowed disabled:bg-brand-soft disabled:text-ink-subtle">
                      <option value="client">Cliente</option><option value="legal_advisor">Asesor legal</option><option value="admin">Administrador</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && <div className="p-10 text-center text-sm text-ink-muted"><MessageSquareText className="mx-auto mb-3 h-6 w-6" />No se encontraron usuarios.</div>}
      </section>
    </>
  );
}
