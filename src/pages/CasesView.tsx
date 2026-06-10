import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Eye, FilePlus2, FileText, FolderOpen, Link2, Plus, Upload, X } from 'lucide-react';
import type { AuthUser } from '../services/authService';
import { createCase as createCaseRequest, getCase, getDocumentBlob, linkAppointment as linkAppointmentRequest, listAppointments, listCases, updateCaseStatus, uploadCaseDocuments } from '../services/platformService';

type CaseStatus = 'open' | 'review' | 'closed';

interface CaseDocument {
  id: string;
  name: string;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
}

interface LegalCase {
  id: string;
  caseNumber?: string;
  client: string;
  advisor: string;
  service: string;
  description: string;
  status: CaseStatus;
  createdAt: string;
  documents: CaseDocument[];
}

interface ScheduledAppointment {
  id: string;
  backendId?: string;
  client: string;
  advisor: string;
  service: string;
  date: string;
  period: string;
  linkedCaseId?: string;
}

const statusLabels: Record<CaseStatus, string> = {
  open: 'Abierto',
  review: 'En revisión',
  closed: 'Cerrado',
};

export function CasesView({ currentUser }: { currentUser: AuthUser }) {
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [appointments, setAppointments] = useState<ScheduledAppointment[]>([]);
  const [error, setError] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [appointmentToClassify, setAppointmentToClassify] = useState<ScheduledAppointment | null>(null);
  const [isLinkingAppointment, setIsLinkingAppointment] = useState(false);
  const [caseNumber, setCaseNumber] = useState('');
  const [caseToLink, setCaseToLink] = useState('');
  const [client, setClient] = useState('');
  const [service, setService] = useState('');
  const [description, setDescription] = useState('');
  const isAdvisor = currentUser.role === 'legal_advisor';
  const isClient = currentUser.role === 'client';

  const loadData = async () => {
    try {
      const [loadedCases, loadedAppointments] = await Promise.all([listCases(), listAppointments()]);
      setCases(loadedCases.map((legalCase) => ({
        id: legalCase.id,
        caseNumber: legalCase.caseNumber,
        client: legalCase.client,
        advisor: legalCase.advisor,
        service: legalCase.service,
        description: legalCase.description,
        status: legalCase.status,
        createdAt: legalCase.createdAt,
        documents: Array.from({ length: legalCase.documentCount ?? 0 }, (_, index) => ({ id: `placeholder-${index}`, name: '', uploadedBy: '', uploadedAt: '', size: '' })),
      })));
      setAppointments(loadedAppointments.map((appointment) => ({
        id: appointment.displayId,
        backendId: appointment.id,
        client: appointment.client,
        advisor: appointment.advisor,
        service: appointment.service,
        date: appointment.date,
        period: appointment.period === 'morning' ? 'Mañana' : 'Tarde',
        linkedCaseId: appointment.linkedCaseId,
      })));
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los expedientes.');
    }
  };

  useEffect(() => { void loadData(); }, []);

  const visibleCases = useMemo(
    () => cases.filter((legalCase) => currentUser.role === 'admin' || (isAdvisor ? legalCase.advisor === currentUser.fullName : legalCase.client === currentUser.fullName)),
    [cases, currentUser.fullName, currentUser.role, isAdvisor],
  );
  const visibleAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.advisor === currentUser.fullName && !appointment.linkedCaseId),
    [appointments, currentUser.fullName],
  );

  const selectedCase = visibleCases.find((legalCase) => legalCase.id === selectedCaseId);

  const selectCase = async (caseId: string) => {
    try {
      const detail = await getCase(caseId);
      setCases((items) => items.map((item) => item.id === caseId ? {
        ...item,
        description: detail.description,
        documents: (detail.documents ?? []).map((document) => ({
          id: document.id,
          name: document.name,
          uploadedBy: document.uploadedBy,
          uploadedAt: document.uploadedAt,
          size: formatFileSize(document.sizeBytes),
        })),
      } : item));
      setAppointments((items) => [
        ...items.filter((item) => !detail.appointments?.some((appointment) => appointment.id === item.backendId)),
        ...(detail.appointments ?? []).map((appointment) => ({
          id: appointment.displayId,
          backendId: appointment.id,
          client: detail.client,
          advisor: detail.advisor,
          service: appointment.service,
          date: appointment.date,
          period: appointment.period === 'morning' ? 'Mañana' : 'Tarde',
          linkedCaseId: detail.id,
        })),
      ]);
      setSelectedCaseId(caseId);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo abrir el expediente.');
    }
  };

  const startCase = (appointment?: ScheduledAppointment) => {
    setAppointmentToClassify(appointment ?? null);
    setCaseNumber('');
    setClient(appointment?.client ?? '');
    setService(appointment?.service ?? '');
    setDescription('');
    setIsCreatingCase(true);
  };

  const createCase = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!appointmentToClassify) return;
    try {
      await createCaseRequest({ appointmentId: appointmentToClassify.backendId!, caseNumber, description });
      setIsCreatingCase(false);
      setAppointmentToClassify(null);
      await loadData();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'No se pudo crear el expediente.');
    }
  };

  const startLinking = (appointment: ScheduledAppointment) => {
    setAppointmentToClassify(appointment);
    setCaseToLink('');
    setIsLinkingAppointment(true);
  };

  const linkAppointment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!appointmentToClassify || !caseToLink) return;
    try {
      await linkAppointmentRequest(caseToLink, appointmentToClassify.backendId!);
      setIsLinkingAppointment(false);
      setAppointmentToClassify(null);
      await loadData();
    } catch (linkError) {
      setError(linkError instanceof Error ? linkError.message : 'No se pudo anexar la cita.');
    }
  };

  const addDocuments = async (files: FileList | null) => {
    if (!files || !selectedCase) return;
    try {
      await uploadCaseDocuments(selectedCase.id, files);
      await selectCase(selectedCase.id);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'No se pudieron subir los documentos.');
    }
  };

  const changeCaseStatus = async (status: CaseStatus) => {
    if (!selectedCase) return;
    try {
      await updateCaseStatus(selectedCase.id, status);
      setCases((items) => items.map((item) => item.id === selectedCase.id ? { ...item, status } : item));
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'No se pudo actualizar el estado.');
    }
  };

  return (
    <div className="space-y-6">
      {error && <p className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {selectedCase && (
        <CaseDetailView legalCase={selectedCase} linkedAppointments={appointments.filter((appointment) => appointment.linkedCaseId === selectedCase.id)} canUpload={isAdvisor || isClient} canChangeStatus={isAdvisor} onBack={() => setSelectedCaseId(null)} onAddDocuments={addDocuments} onStatusChange={changeCaseStatus} />
      )}

      {!selectedCase && (
        <>
          {isAdvisor && (
            <DataSection title="Citas por clasificar" subtitle="Después de atender, crea un expediente nuevo o anexa la cita a un proceso existente del cliente.">
              <AppointmentsTable appointments={visibleAppointments} onCreateCase={startCase} onLinkCase={startLinking} />
            </DataSection>
          )}

          <DataSection title={isClient ? 'Mis expedientes' : 'Expedientes'} subtitle={isClient ? 'Consulta el avance y los documentos asociados a tus procesos.' : 'Gestiona el seguimiento documental de cada proceso.'}>
            <CasesTable cases={visibleCases} onSelectCase={(id) => void selectCase(id)} />
          </DataSection>
        </>
      )}

      {isCreatingCase && <CreateCaseDialog advisor={currentUser.fullName} caseNumber={caseNumber} client={client} service={service} description={description} fromAppointment={Boolean(appointmentToClassify)} onCaseNumberChange={setCaseNumber} onClientChange={setClient} onServiceChange={setService} onDescriptionChange={setDescription} onClose={() => { setIsCreatingCase(false); setAppointmentToClassify(null); }} onSubmit={createCase} />}
      {isLinkingAppointment && appointmentToClassify && <LinkAppointmentDialog appointment={appointmentToClassify} cases={cases.filter((legalCase) => legalCase.client === appointmentToClassify.client && legalCase.advisor === currentUser.fullName)} selectedCaseId={caseToLink} onSelectedCaseChange={setCaseToLink} onClose={() => { setIsLinkingAppointment(false); setAppointmentToClassify(null); }} onSubmit={linkAppointment} />}
    </div>
  );
}

function AppointmentsTable({ appointments, onCreateCase, onLinkCase }: { appointments: ScheduledAppointment[]; onCreateCase: (appointment: ScheduledAppointment) => void; onLinkCase: (appointment: ScheduledAppointment) => void }) {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(appointments.length / perPage));
  const pageAppointments = appointments.slice((currentPage - 1) * perPage, currentPage * perPage);
  if (appointments.length === 0) return <EmptyState icon={CalendarDays} text="No tienes citas para clasificar." />;
  return (
    <>
      <ResponsiveTable headers={['Cita', 'Cliente', 'Servicio', 'Fecha y turno', 'Expediente', 'Acciones']}>
        {pageAppointments.map((appointment) => (
          <tr key={appointment.id} className="border-t border-ink-line">
            <Cell strong>{appointment.id}</Cell><Cell>{appointment.client}</Cell><Cell>{appointment.service}</Cell><Cell>{formatDate(appointment.date)} · {appointment.period}</Cell>
            <Cell>{appointment.linkedCaseId ? <span className="font-semibold text-brand">{appointment.linkedCaseId}</span> : <span className="rounded-full bg-accent-light px-3 py-1 text-[10px] font-bold uppercase text-accent">Sin clasificar</span>}</Cell>
            <Cell><div className="flex gap-2"><button type="button" disabled={Boolean(appointment.linkedCaseId)} onClick={() => onCreateCase(appointment)} className="inline-flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-ink-line disabled:text-ink-subtle"><FilePlus2 className="h-4 w-4" />Crear</button><button type="button" disabled={Boolean(appointment.linkedCaseId)} onClick={() => onLinkCase(appointment)} className="inline-flex items-center gap-2 rounded-md border border-brand px-3 py-2 text-xs font-semibold text-brand disabled:cursor-not-allowed disabled:border-ink-line disabled:text-ink-subtle"><Link2 className="h-4 w-4" />Anexar</button></div></Cell>
          </tr>
        ))}
      </ResponsiveTable>
      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={appointments.length} perPage={perPage} onPageChange={setCurrentPage} />
    </>
  );
}

function CasesTable({ cases, onSelectCase }: { cases: LegalCase[]; onSelectCase: (id: string) => void }) {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(cases.length / perPage));
  const pageCases = cases.slice((currentPage - 1) * perPage, currentPage * perPage);
  if (cases.length === 0) return <EmptyState icon={FolderOpen} text="Todavía no hay expedientes disponibles para este usuario." />;
  return (
    <>
      <ResponsiveTable headers={['Expediente', 'Servicio', 'Cliente', 'Asesor legal', 'Estado', 'Documentos', 'Acción']}>
        {pageCases.map((legalCase) => (
          <tr key={legalCase.id} className="border-t border-ink-line transition-colors hover:bg-brand-soft">
            <Cell strong>{legalCase.caseNumber ?? legalCase.id}</Cell><Cell>{legalCase.service}</Cell><Cell>{legalCase.client}</Cell><Cell>{legalCase.advisor}</Cell>
            <Cell><StatusBadge status={legalCase.status} /></Cell><Cell><span className="inline-flex items-center gap-2"><FileText className="h-4 w-4 text-brand" />{legalCase.documents.length}</span></Cell>
            <Cell><button type="button" onClick={() => onSelectCase(legalCase.id)} aria-label={`Ver expediente ${legalCase.caseNumber ?? legalCase.id}`} className="inline-flex items-center gap-2 rounded-md border border-brand px-3 py-2 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white"><Eye className="h-4 w-4" />Ver</button></Cell>
          </tr>
        ))}
      </ResponsiveTable>
      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={cases.length} perPage={perPage} onPageChange={setCurrentPage} />
    </>
  );
}

function CaseDetailView({ legalCase, linkedAppointments, canUpload, canChangeStatus, onBack, onAddDocuments, onStatusChange }: { legalCase: LegalCase; linkedAppointments: ScheduledAppointment[]; canUpload: boolean; canChangeStatus: boolean; onBack: () => void; onAddDocuments: (files: FileList | null) => void; onStatusChange: (status: CaseStatus) => void }) {
  return (
    <div className="space-y-6">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-md border border-ink-line bg-white px-4 py-2.5 text-sm font-semibold text-ink-muted transition-colors hover:border-brand hover:text-brand">
        <ArrowLeft className="h-4 w-4" />Volver a casos y solicitudes
      </button>
      <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <article className="h-fit border border-ink-line bg-white shadow-sm">
          <div className="border-b border-ink-line bg-ink px-5 py-5 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-light">Detalle del expediente</p>
            <h2 className="mt-1 font-serif text-2xl font-bold">{legalCase.caseNumber ?? legalCase.id}</h2>
          </div>
          <dl className="space-y-4 p-5 text-sm">
            <CaseDetail label="Servicio" value={legalCase.service} />
            <CaseDetail label="Cliente" value={legalCase.client} />
            <CaseDetail label="Asesor legal" value={legalCase.advisor} />
            <CaseDetail label="Descripción" value={legalCase.description} />
            <div>
              <dt className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">Estado</dt>
              {canChangeStatus ? (
                <select value={legalCase.status} onChange={(event) => onStatusChange(event.target.value as CaseStatus)} className="w-full border border-ink-line bg-brand-soft px-3 py-2.5 text-sm font-semibold outline-none focus:border-brand">
                  <option value="open">Abierto</option><option value="review">En revisión</option><option value="closed">Cerrado</option>
                </select>
              ) : <StatusBadge status={legalCase.status} />}
            </div>
          </dl>
        </article>
        <DataSection title="Documentos del expediente" subtitle="Cliente y asesor pueden incorporar documentos durante todo el proceso.">
          {canUpload && (
            <label className="mb-5 flex cursor-pointer items-center justify-center gap-3 rounded-md border border-dashed border-brand/40 bg-brand-light/50 px-4 py-4 text-sm font-semibold text-brand transition-colors hover:border-brand hover:bg-brand-light">
              <Upload className="h-5 w-5" />Agregar documento o documentos
              <input type="file" multiple className="hidden" onChange={(event) => { onAddDocuments(event.target.files); event.currentTarget.value = ''; }} />
            </label>
          )}
          <DocumentsTable documents={legalCase.documents} />
        </DataSection>
      </section>
      <DataSection title="Citas vinculadas al expediente" subtitle="Historial de atenciones clasificadas dentro de este proceso.">
        {linkedAppointments.length > 0 ? (
          <LinkedAppointmentsTable appointments={linkedAppointments} />
        ) : (
          <EmptyState icon={CalendarDays} text="Este expediente todavía no tiene citas vinculadas." />
        )}
      </DataSection>
    </div>
  );
}

function LinkedAppointmentsTable({ appointments }: { appointments: ScheduledAppointment[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(appointments.length / perPage));
  const pageAppointments = appointments.slice((currentPage - 1) * perPage, currentPage * perPage);
  return (
    <>
      <ResponsiveTable headers={['Cita', 'Servicio', 'Fecha', 'Turno', 'Asesor legal']}>
        {pageAppointments.map((appointment) => <tr key={appointment.id} className="border-t border-ink-line"><Cell strong>{appointment.id}</Cell><Cell>{appointment.service}</Cell><Cell>{formatDate(appointment.date)}</Cell><Cell>{appointment.period}</Cell><Cell>{appointment.advisor}</Cell></tr>)}
      </ResponsiveTable>
      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={appointments.length} perPage={perPage} onPageChange={setCurrentPage} />
    </>
  );
}

function Pagination({ currentPage, totalPages, totalItems, perPage, onPageChange }: { currentPage: number; totalPages: number; totalItems: number; perPage: number; onPageChange: (page: number) => void }) {
  const firstItem = (currentPage - 1) * perPage + 1;
  const lastItem = Math.min(currentPage * perPage, totalItems);
  return (
    <div className="flex flex-col gap-3 border-t border-ink-line pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-ink-muted">Mostrando {firstItem}-{lastItem} de {totalItems}</p>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <button type="button" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} className="inline-flex items-center gap-2 rounded-md border border-ink-line px-3 py-2 text-xs font-semibold text-ink-muted disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Anterior</button>
        <span className="text-xs font-semibold">Página {currentPage} de {totalPages}</span>
        <button type="button" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} className="inline-flex items-center gap-2 rounded-md border border-ink-line px-3 py-2 text-xs font-semibold text-ink-muted disabled:cursor-not-allowed disabled:opacity-40">Siguiente<ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

function DocumentsTable({ documents }: { documents: CaseDocument[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [documentToView, setDocumentToView] = useState<CaseDocument | null>(null);
  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(documents.length / perPage));
  const pageDocuments = documents.slice((currentPage - 1) * perPage, currentPage * perPage);
  if (documents.length === 0) return <EmptyState icon={FolderOpen} text="Este expediente todavía no tiene documentos." />;
  return (
    <>
      <ResponsiveTable headers={['Documento', 'Agregado por', 'Fecha', 'Tamaño', 'Acción']}>
        {pageDocuments.map((document) => <tr key={document.id} className="border-t border-ink-line"><Cell strong>{document.name}</Cell><Cell>{document.uploadedBy}</Cell><Cell>{formatDate(document.uploadedAt)}</Cell><Cell>{document.size}</Cell><Cell><button type="button" onClick={() => setDocumentToView(document)} className="inline-flex items-center gap-2 rounded-md border border-brand px-3 py-2 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white"><Eye className="h-4 w-4" />Ver</button></Cell></tr>)}
      </ResponsiveTable>
      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={documents.length} perPage={perPage} onPageChange={setCurrentPage} />
      {documentToView && <DocumentViewer document={documentToView} onClose={() => setDocumentToView(null)} />}
    </>
  );
}

function DocumentViewer({ document, onClose }: { document: CaseDocument; onClose: () => void }) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewError, setPreviewError] = useState('');

  useEffect(() => {
    let isActive = true;
    let objectUrl = '';
    getDocumentBlob(document.id)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (isActive) setPreviewUrl(objectUrl);
        else URL.revokeObjectURL(objectUrl);
      })
      .catch((loadError) => {
        if (isActive) setPreviewError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el documento.');
      });

    return () => {
      isActive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [document.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
      <div className="w-full max-w-3xl border border-ink-line bg-white shadow-professional">
        <header className="flex items-start justify-between border-b border-ink-line px-5 py-5"><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Documento del expediente</p><h2 className="truncate font-serif text-xl font-bold">{document.name}</h2></div><button type="button" onClick={onClose} aria-label="Cerrar visor" className="p-2 text-ink-muted"><X className="h-5 w-5" /></button></header>
        <div className="p-5 sm:p-6">
          {previewUrl ? (
            <iframe src={previewUrl} title={document.name} className="h-[65vh] w-full border border-ink-line bg-brand-soft" />
          ) : previewError ? (
            <div className="flex min-h-72 items-center justify-center border border-dashed border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">{previewError}</div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center border border-dashed border-ink-line bg-brand-soft p-8 text-center">
              <FileText className="mb-4 h-10 w-10 text-brand" />
              <p className="font-semibold">{document.name}</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">Cargando documento...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DataSection({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="overflow-hidden border border-ink-line bg-white shadow-sm"><header className="border-b border-ink-line px-4 py-5 sm:px-6"><h2 className="font-serif text-xl font-bold">{title}</h2><p className="mt-1 text-xs leading-5 text-ink-muted">{subtitle}</p></header><div className="p-4 sm:p-6">{children}</div></section>;
}

function ResponsiveTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-brand-soft text-[10px] uppercase tracking-[0.14em] text-ink-muted"><tr>{headers.map((header) => <th key={header} className="px-4 py-3">{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function Cell({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return <td className={`px-4 py-4 ${strong ? 'font-semibold text-brand' : 'text-ink-muted'}`}>{children}</td>;
}

function StatusBadge({ status }: { status: CaseStatus }) {
  const styles: Record<CaseStatus, string> = { open: 'bg-green-100 text-green-700', review: 'bg-accent-light text-accent', closed: 'bg-ink text-white' };
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${styles[status]}`}>{statusLabels[status]}</span>;
}

function CaseDetail({ label, value }: { label: string; value: string }) {
  return <div><dt className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">{label}</dt><dd className="leading-6 text-ink">{value}</dd></div>;
}

function EmptyState({ icon: Icon, text }: { icon: typeof FolderOpen; text: string }) {
  return <div className="py-10 text-center text-sm text-ink-muted"><Icon className="mx-auto mb-3 h-7 w-7 text-ink-subtle" />{text}</div>;
}

function CreateCaseDialog({ advisor, caseNumber, client, service, description, fromAppointment, onCaseNumberChange, onClientChange, onServiceChange, onDescriptionChange, onClose, onSubmit }: { advisor: string; caseNumber: string; client: string; service: string; description: string; fromAppointment: boolean; onCaseNumberChange: (value: string) => void; onClientChange: (value: string) => void; onServiceChange: (value: string) => void; onDescriptionChange: (value: string) => void; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-xl border border-ink-line bg-white shadow-professional">
        <header className="flex items-start justify-between border-b border-ink-line px-5 py-5 sm:px-6"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Nuevo expediente</p><h2 className="font-serif text-2xl font-bold">Registrar proceso legal</h2></div><button type="button" onClick={onClose} aria-label="Cerrar" className="p-2 text-ink-muted"><X className="h-5 w-5" /></button></header>
        <div className="space-y-5 p-5 sm:p-6">
          <div className="border border-ink-line bg-brand-soft p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">Asesor responsable</p><p className="mt-2 text-sm font-semibold">{advisor}</p></div>
          <label className="block"><span className="mb-2 block text-sm font-semibold">Número de expediente</span><input value={caseNumber} onChange={(event) => onCaseNumberChange(event.target.value)} required minLength={4} placeholder="Ejemplo: AJ-2026-019" className="w-full border border-ink-line bg-brand-soft px-4 py-3 text-sm uppercase outline-none focus:border-brand" /><span className="mt-2 block text-xs text-ink-muted">El asesor asigna manualmente el número y debe ser único.</span></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="mb-2 block text-sm font-semibold">Cliente</span><input value={client} onChange={(event) => onClientChange(event.target.value)} disabled={fromAppointment} required minLength={3} placeholder="Nombre completo del cliente" className="w-full border border-ink-line bg-brand-soft px-4 py-3 text-sm outline-none focus:border-brand disabled:text-ink-muted" /></label>
            <label className="block"><span className="mb-2 block text-sm font-semibold">Servicio</span><select value={service} onChange={(event) => onServiceChange(event.target.value)} disabled={fromAppointment} required className="w-full border border-ink-line bg-brand-soft px-4 py-3 text-sm outline-none focus:border-brand disabled:text-ink-muted"><option value="">Seleccionar servicio</option><option value="Asesoria presencial">Asesoría presencial</option><option value="Asesoria virtual">Asesoría virtual</option><option value="Mediacion familiar">Mediación familiar</option><option value="Revision de acuerdo">Revisión de acuerdo</option></select></label>
          </div>
          <label className="block"><span className="mb-2 block text-sm font-semibold">Descripción del expediente</span><textarea value={description} onChange={(event) => onDescriptionChange(event.target.value)} required minLength={10} rows={5} placeholder="Describe el objetivo y contexto inicial del proceso..." className="w-full resize-none border border-ink-line bg-brand-soft px-4 py-3 text-sm outline-none focus:border-brand" /></label>
        </div>
        <footer className="flex justify-end gap-3 border-t border-ink-line px-5 py-4 sm:px-6"><button type="button" onClick={onClose} className="rounded-md border border-ink-line px-4 py-2.5 text-sm font-semibold text-ink-muted">Cancelar</button><button type="submit" className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Crear expediente</button></footer>
      </form>
    </div>
  );
}

function LinkAppointmentDialog({ appointment, cases, selectedCaseId, onSelectedCaseChange, onClose, onSubmit }: { appointment: ScheduledAppointment; cases: LegalCase[]; selectedCaseId: string; onSelectedCaseChange: (value: string) => void; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-lg border border-ink-line bg-white shadow-professional">
        <header className="flex items-start justify-between border-b border-ink-line px-5 py-5"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Anexar cita</p><h2 className="font-serif text-2xl font-bold">{appointment.client}</h2></div><button type="button" onClick={onClose} className="p-2 text-ink-muted"><X className="h-5 w-5" /></button></header>
        <div className="space-y-4 p-5">
          <p className="text-sm leading-6 text-ink-muted">Selecciona un expediente existente de este cliente. La cita quedará registrada como parte de ese proceso.</p>
          <label className="block"><span className="mb-2 block text-sm font-semibold">Expediente existente</span><select value={selectedCaseId} onChange={(event) => onSelectedCaseChange(event.target.value)} required className="w-full border border-ink-line bg-brand-soft px-4 py-3 text-sm outline-none focus:border-brand"><option value="">Seleccionar expediente</option>{cases.map((legalCase) => <option key={legalCase.id} value={legalCase.id}>{legalCase.caseNumber ?? legalCase.id} · {legalCase.service}</option>)}</select></label>
          {cases.length === 0 && <p className="border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Este cliente todavía no tiene expedientes existentes con el asesor.</p>}
        </div>
        <footer className="flex justify-end gap-3 border-t border-ink-line px-5 py-4"><button type="button" onClick={onClose} className="rounded-md border border-ink-line px-4 py-2.5 text-sm font-semibold text-ink-muted">Cancelar</button><button type="submit" disabled={cases.length === 0} className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:bg-ink-line disabled:text-ink-subtle"><Link2 className="h-4 w-4" />Anexar cita</button></footer>
      </form>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return 'Fecha no disponible';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
