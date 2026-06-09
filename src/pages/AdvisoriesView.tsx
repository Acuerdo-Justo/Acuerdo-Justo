import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Camera, CameraOff, LogOut, MessageSquareText, Mic, MicOff, PhoneOff, Send, UserRound, Video } from 'lucide-react';
import type { AuthUser } from '../services/authService';
import { listMeetings } from '../services/platformService';

type MeetingStatus = 'scheduled' | 'active' | 'finished';

interface VirtualMeeting {
  id: string;
  displayId?: string;
  client: string;
  advisor: string;
  date: string;
  period: string;
  status: MeetingStatus;
  startedAt?: string;
  finishedAt?: string;
}

interface Participant {
  id: string;
  fullName: string;
  role: 'client' | 'legal_advisor';
  microphoneOn?: boolean;
  cameraOn?: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
}

const statusLabels: Record<MeetingStatus, string> = { scheduled: 'Programada', active: 'En curso', finished: 'Finalizada' };
const rtcConfiguration: RTCConfiguration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export function AdvisoriesView({ currentUser }: { currentUser: AuthUser }) {
  const [meetings, setMeetings] = useState<VirtualMeeting[]>([]);
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const visibleMeetings = meetings;
  const activeMeeting = meetings.find((meeting) => meeting.id === activeMeetingId);

  const loadMeetings = useCallback(async () => {
    try {
      const items = await listMeetings();
      setMeetings(items.map((meeting) => ({ ...meeting, period: meeting.period === 'morning' ? 'Mañana · 09:00 - 12:00' : 'Tarde · 15:00 - 18:00' })));
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las asesorías.');
    }
  }, []);

  useEffect(() => {
    void loadMeetings();
  }, [loadMeetings]);

  const joinMeeting = (meeting: VirtualMeeting) => {
    if (meeting.status === 'finished' || currentUser.role === 'admin') return;
    setActiveMeetingId(meeting.id);
  };

  const finishMeeting = () => {
    if (!activeMeeting) return;
    setActiveMeetingId(null);
    void loadMeetings();
  };

  const leaveMeeting = () => {
    setActiveMeetingId(null);
    void loadMeetings();
  };

  if (activeMeeting) return <MeetingRoom meeting={activeMeeting} currentUser={currentUser} onLeave={leaveMeeting} onFinish={finishMeeting} />;

  return (
    <section className="overflow-hidden border border-ink-line bg-white shadow-sm">
      <header className="border-b border-ink-line px-4 py-5 sm:px-6">
        <h2 className="font-serif text-xl font-bold">Asesorías virtuales programadas</h2>
        <p className="mt-1 text-xs leading-5 text-ink-muted">Ingresa a la sala desde una cita virtual. Solo se registra el inicio y la finalización de la reunión.</p>
      </header>
      {error && <p className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm text-red-700">{error}</p>}
      <div className="p-4 sm:p-6"><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm">
        <thead className="bg-brand-soft text-[10px] uppercase tracking-[0.14em] text-ink-muted"><tr><th className="px-4 py-3">Asesoría</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Asesor legal</th><th className="px-4 py-3">Fecha y turno</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Acción</th></tr></thead>
        <tbody>{visibleMeetings.map((meeting) => <tr key={meeting.id} className="border-t border-ink-line">
          <td className="px-4 py-4 font-semibold text-brand">{meeting.displayId ?? meeting.id}</td><td className="px-4 py-4 text-ink-muted">{meeting.client}</td><td className="px-4 py-4 text-ink-muted">{meeting.advisor}</td><td className="px-4 py-4 text-ink-muted">{formatDate(meeting.date)} · {meeting.period}</td><td className="px-4 py-4"><MeetingStatus status={meeting.status} /></td>
          <td className="px-4 py-4"><button type="button" disabled={meeting.status === 'finished' || currentUser.role === 'admin'} onClick={() => joinMeeting(meeting)} className="inline-flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-ink-line disabled:text-ink-subtle"><Video className="h-4 w-4" />{meeting.status === 'active' ? 'Volver a unirse' : 'Unirse'}</button></td>
        </tr>)}</tbody>
      </table></div></div>
    </section>
  );
}

function MeetingRoom({ meeting, currentUser, onLeave, onFinish }: { meeting: VirtualMeeting; currentUser: AuthUser; onLeave: () => void; onFinish: () => void }) {
  const [microphoneOn, setMicrophoneOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatText, setChatText] = useState('');
  const [mediaError, setMediaError] = useState('');
  const localStreamRef = useRef(new MediaStream());
  const socketRef = useRef<WebSocket | null>(null);
  const peersRef = useRef(new Map<string, RTCPeerConnection>());
  const isAdvisor = currentUser.role === 'legal_advisor';

  const send = (payload: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) socketRef.current.send(JSON.stringify(payload));
  };

  const createPeer = (userId: string) => {
    const existing = peersRef.current.get(userId);
    if (existing) return existing;
    const peer = new RTCPeerConnection(rtcConfiguration);
    localStreamRef.current.getTracks().forEach((track) => peer.addTrack(track, localStreamRef.current));
    peer.onicecandidate = (event) => event.candidate && send({ type: 'signal', targetUserId: userId, data: { candidate: event.candidate } });
    peer.ontrack = (event) => setRemoteStreams((streams) => ({ ...streams, [userId]: event.streams[0] ?? new MediaStream([event.track]) }));
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'failed' || peer.connectionState === 'closed') setRemoteStreams((streams) => removeKey(streams, userId));
    };
    peersRef.current.set(userId, peer);
    return peer;
  };

  const createOffer = async (userId: string) => {
    const peer = createPeer(userId);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    send({ type: 'signal', targetUserId: userId, data: { description: peer.localDescription } });
  };

  useEffect(() => {
    let active = true;
    const peers = peersRef.current;
    const localStream = localStreamRef.current;
    const websocket = new WebSocket(getWebSocketUrl());
    socketRef.current = websocket;

    const initializeMedia = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMediaError('Este navegador no permite usar cámara o micrófono.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (!active) return stream.getTracks().forEach((track) => track.stop());
        stream.getAudioTracks().forEach((track) => { track.enabled = true; localStreamRef.current.addTrack(track); });
        setMicrophoneOn(true);
        for (const [userId, peer] of peersRef.current) {
          stream.getAudioTracks().forEach((track) => peer.addTrack(track, localStreamRef.current));
          await createOffer(userId);
        }
        send({ type: 'media-state', microphoneOn: true, cameraOn: false });
        const devices = await navigator.mediaDevices.enumerateDevices();
        setCameraAvailable(devices.some((device) => device.kind === 'videoinput'));
      } catch {
        setMediaError('No se pudo acceder al micrófono. Revisa los permisos del navegador.');
      }
    };

    void initializeMedia();
    websocket.onopen = () => websocket.send(JSON.stringify({ type: 'join', meetingId: meeting.id }));
    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data) as { type: string; participants?: Participant[]; participant?: Participant; userId?: string; fromUserId?: string; data?: { description?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit }; microphoneOn?: boolean; cameraOn?: boolean; id?: string; sender?: string; text?: string; message?: string };
      if (message.type === 'participants') {
        setParticipants(message.participants ?? []);
        message.participants?.forEach((participant) => void createOffer(participant.id));
        send({
          type: 'media-state',
          microphoneOn: localStreamRef.current.getAudioTracks().some((track) => track.enabled),
          cameraOn: localStreamRef.current.getVideoTracks().some((track) => track.enabled),
        });
      }
      if (message.type === 'participant-joined' && message.participant) setParticipants((items) => upsertParticipant(items, message.participant!));
      if (message.type === 'participant-left' && message.userId) {
        peersRef.current.get(message.userId)?.close();
        peersRef.current.delete(message.userId);
        setParticipants((items) => items.filter((item) => item.id !== message.userId));
        setRemoteStreams((streams) => removeKey(streams, message.userId!));
      }
      if (message.type === 'media-state' && message.fromUserId) {
        setParticipants((items) => items.map((item) => item.id === message.fromUserId ? { ...item, microphoneOn: message.microphoneOn, cameraOn: message.cameraOn } : item));
      }
      if (message.type === 'signal' && message.fromUserId && message.data) void receiveSignal(message.fromUserId, message.data);
      if (message.type === 'chat' && message.id && message.sender && message.text) setMessages((items) => [...items, { id: message.id!, sender: message.sender!, text: message.text! }]);
      if (message.type === 'meeting-finished') onFinish();
      if (message.type === 'error' && message.message) setMediaError(message.message);
    };
    websocket.onerror = () => setMediaError('No se pudo conectar con la sala virtual.');

    return () => {
      active = false;
      websocket.close();
      peers.forEach((peer) => peer.close());
      peers.clear();
      localStream.getTracks().forEach((track) => track.stop());
    };
    // The room is intentionally recreated only when the selected meeting changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meeting.id]);

  const receiveSignal = async (fromUserId: string, data: { description?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit }) => {
    const peer = createPeer(fromUserId);
    if (data.description) {
      await peer.setRemoteDescription(data.description);
      if (data.description.type === 'offer') {
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        send({ type: 'signal', targetUserId: fromUserId, data: { description: peer.localDescription } });
      }
    }
    if (data.candidate) {
      try { await peer.addIceCandidate(data.candidate); } catch { /* Candidates can arrive before a remote description. */ }
    }
  };

  const toggleMicrophone = () => {
    const nextValue = !microphoneOn;
    localStreamRef.current.getAudioTracks().forEach((track) => { track.enabled = nextValue; });
    setMicrophoneOn(nextValue);
    send({ type: 'media-state', microphoneOn: nextValue, cameraOn });
  };

  const toggleCamera = async () => {
    if (cameraOn) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        localStreamRef.current.removeTrack(videoTrack);
        videoTrack.stop();
        await Promise.all([...peersRef.current.values()].map((peer) => peer.getSenders().find((sender) => sender.track?.kind === 'video')?.replaceTrack(null)));
      }
      setCameraOn(false);
      send({ type: 'media-state', microphoneOn, cameraOn: false });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      if (!track) return setCameraAvailable(false);
      localStreamRef.current.addTrack(track);
      for (const [userId, peer] of peersRef.current) {
        const sender = peer.getSenders().find((item) => item.track?.kind === 'video');
        if (sender) await sender.replaceTrack(track); else peer.addTrack(track, localStreamRef.current);
        await createOffer(userId);
      }
      setCameraOn(true);
      send({ type: 'media-state', microphoneOn, cameraOn: true });
    } catch {
      setCameraAvailable(false);
      setMediaError('No se detectó una cámara disponible o no se concedió permiso.');
    }
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!chatText.trim()) return;
    send({ type: 'chat', text: chatText.trim() });
    setChatText('');
  };

  const finish = () => {
    send({ type: 'finish' });
  };

  return (
    <div className="space-y-5">
      <button type="button" onClick={onLeave} className="inline-flex items-center gap-2 rounded-md border border-ink-line bg-white px-4 py-2.5 text-sm font-semibold text-ink-muted"><ArrowLeft className="h-4 w-4" />Volver a asesorías</button>
      <section className="overflow-hidden border border-ink-line bg-ink shadow-professional">
        <header className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-light">Reunión virtual · {meeting.displayId ?? meeting.id}</p><h2 className="font-serif text-xl font-bold">{meeting.client} y {meeting.advisor}</h2></div><div className="flex items-center gap-2 text-xs text-white/60"><span className="h-2 w-2 rounded-full bg-green-400" />{participants.length + 1} participante(s) conectados</div></header>
        <div className="grid min-h-[34rem] lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="flex flex-col p-4 sm:p-6">
            {mediaError && <p className="mb-4 rounded-md bg-red-500/15 px-4 py-3 text-xs text-red-200">{mediaError}</p>}
            <div className="grid flex-1 gap-4 md:grid-cols-2">
              <ParticipantTile name={currentUser.fullName} label="Tú" stream={localStreamRef.current} muted cameraOn={cameraOn} microphoneOn={microphoneOn} />
              {participants.map((participant) => <ParticipantTile key={participant.id} name={participant.fullName} label={participant.role === 'client' ? 'Cliente' : 'Asesor legal'} stream={remoteStreams[participant.id]} cameraOn={Boolean(participant.cameraOn)} microphoneOn={participant.microphoneOn !== false} />)}
              {participants.length === 0 && <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-white/15 px-5 text-center text-xs text-white/40">Esperando a que el otro participante se una.</div>}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <ControlButton active={microphoneOn} onClick={toggleMicrophone} activeIcon={Mic} inactiveIcon={MicOff} label={microphoneOn ? 'Silenciar' : 'Activar micrófono'} />
              <ControlButton active={cameraOn} disabled={!cameraAvailable} onClick={() => void toggleCamera()} activeIcon={Camera} inactiveIcon={CameraOff} label={cameraOn ? 'Apagar cámara' : cameraAvailable ? 'Encender cámara' : 'Cámara no disponible'} />
              <button type="button" onClick={onLeave} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-3 text-xs font-semibold text-white hover:bg-white/20"><LogOut className="h-4 w-4" />Salir</button>
              {isAdvisor && <button type="button" onClick={finish} className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-3 text-xs font-semibold text-white hover:bg-red-700"><PhoneOff className="h-4 w-4" />Finalizar reunión</button>}
            </div>
            <p className="mt-4 text-center text-[10px] uppercase tracking-[0.12em] text-white/35">El uso de cámara, micrófono y chat no se registra</p>
          </div>
          <aside className="flex min-h-96 flex-col border-t border-white/10 bg-white lg:border-l lg:border-t-0">
            <div className="border-b border-ink-line px-4 py-4"><p className="flex items-center gap-2 text-sm font-semibold"><MessageSquareText className="h-4 w-4 text-brand" />Chat de la reunión</p><p className="mt-1 text-[10px] text-ink-muted">Los mensajes desaparecen al salir.</p></div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">{messages.length === 0 ? <p className="py-10 text-center text-xs text-ink-subtle">No hay mensajes todavía.</p> : messages.map((message) => <div key={message.id} className="rounded-md bg-brand-soft p-3"><p className="mb-1 text-[10px] font-semibold text-brand">{message.sender}</p><p className="text-xs leading-5">{message.text}</p></div>)}</div>
            <form onSubmit={sendMessage} className="flex gap-2 border-t border-ink-line p-3"><input value={chatText} onChange={(event) => setChatText(event.target.value)} placeholder="Escribe un mensaje..." className="min-w-0 flex-1 rounded-md border border-ink-line px-3 py-2 text-xs outline-none focus:border-brand" /><button type="submit" aria-label="Enviar mensaje" className="rounded-md bg-brand p-2.5 text-white"><Send className="h-4 w-4" /></button></form>
          </aside>
        </div>
      </section>
    </div>
  );
}

function ParticipantTile({ name, label, stream, muted = false, cameraOn, microphoneOn }: { name: string; label: string; stream?: MediaStream; muted?: boolean; cameraOn: boolean; microphoneOn: boolean }) {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = remoteVideoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    void video.play().catch(() => {
      // Some browsers wait for the next user interaction before allowing remote audio.
    });
  }, [stream]);
  return <article className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5"><video ref={remoteVideoRef} autoPlay muted={muted} playsInline className={cameraOn ? 'h-full w-full object-cover' : 'pointer-events-none absolute h-px w-px opacity-0'} />{!cameraOn && <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand text-white"><UserRound className="h-9 w-9" /></div>}<div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-4 py-3 text-white"><div><p className="text-sm font-semibold">{name}</p><p className="text-[10px] text-white/60">{label}</p></div>{microphoneOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4 text-red-300" />}</div></article>;
}

function ControlButton({ active, disabled, onClick, activeIcon: ActiveIcon, inactiveIcon: InactiveIcon, label }: { active: boolean; disabled?: boolean; onClick: () => void; activeIcon: typeof Mic; inactiveIcon: typeof MicOff; label: string }) {
  const Icon = active ? ActiveIcon : InactiveIcon;
  return <button type="button" disabled={disabled} onClick={onClick} className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'bg-white/10 hover:bg-white/20' : 'bg-red-600 hover:bg-red-700'}`}><Icon className="h-4 w-4" />{label}</button>;
}

function MeetingStatus({ status }: { status: MeetingStatus }) {
  const styles: Record<MeetingStatus, string> = { scheduled: 'bg-brand-light text-brand', active: 'bg-green-100 text-green-700', finished: 'bg-ink text-white' };
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${styles[status]}`}>{statusLabels[status]}</span>;
}

function upsertParticipant(participants: Participant[], participant: Participant) {
  return [...participants.filter((item) => item.id !== participant.id), participant];
}

function removeKey<T>(record: Record<string, T>, key: string) {
  const next = { ...record };
  delete next[key];
  return next;
}

function getWebSocketUrl() {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  return import.meta.env.VITE_API_URL?.replace(/^http/, 'ws').replace(/\/api\/?$/, '/ws') ?? 'ws://localhost:3000/ws';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
}
