import { type ReactNode, useEffect, useState } from 'react';
import { Check, CirclePlus, Megaphone, RefreshCw, ShieldCheck, Users } from 'lucide-react';

type WorkspaceMode = 'control' | 'community';
type Tab = 'people' | 'teams' | 'groups' | 'projects' | 'channels' | 'tasks';
type Team = { id: string; name: string; lead: string; focus: string; members: number; status: string };
type Group = { id: string; name: string; area: string; members: number; activity: string; visible: boolean };
type Channel = { id: string; name: string; handle: string; status: 'connected' | 'review'; reach: string; lastSync: string };
type LocalState = { teams: Team[]; groups: Group[]; channels: Channel[] };
type CrmOverview = {
  contacts: Array<{ id: number; name: string; role: string; area: string; status: string; engagementScore: number; nextAction: string }>;
  tasks: Array<{ id: number; title: string; status: string; priority: string; dueDate: string | null; owner: string }>;
  summary: { totalContacts: number; openTasks: number; newSignals: number; averageEngagement: number };
};

const storageKey = 'pulse-homabay-operations';
const apiBase = import.meta.env.VITE_API_URL ?? '';
const defaults: LocalState = {
  teams: [
    { id: 'field', name: 'Field listening', lead: 'Maya Chen', focus: 'Ward-level listening and signal quality', members: 8, status: 'Active' },
    { id: 'delivery', name: 'Delivery room', lead: 'Ravi Singh', focus: 'Projects, owners, and next steps', members: 5, status: 'Active' },
    { id: 'comms', name: 'Public communications', lead: 'Akinyi Ouma', focus: 'Plain-language updates across channels', members: 4, status: 'Forming' },
  ],
  groups: [
    { id: 'mbita', name: 'Mbita riders', area: 'Mobility', members: 184, activity: '38 signals this week', visible: true },
    { id: 'rusinga', name: 'Rusinga shoreline stewards', area: 'Climate', members: 67, activity: '12 updates this month', visible: true },
    { id: 'market', name: 'Homa Bay market traders', area: 'Local economy', members: 92, activity: 'Planning session queued', visible: true },
  ],
  channels: [
    { id: 'facebook', name: 'Facebook', handle: 'Homabay 2026', status: 'connected', reach: '12.4k', lastSync: '8 min ago' },
    { id: 'whatsapp', name: 'WhatsApp', handle: 'Community broadcast', status: 'connected', reach: '4.8k', lastSync: '22 min ago' },
    { id: 'x', name: 'X / Twitter', handle: '@homabay26', status: 'review', reach: '2.1k', lastSync: 'Connect account' },
  ],
};

function readState(): LocalState {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  } catch {
    return defaults;
  }
}

function Title({ children, action }: { children: string; action?: ReactNode }) {
  return <div className="flex items-center justify-between gap-4"><h3 className="font-serif text-3xl">{children}</h3>{action}</div>;
}

export default function OperationsWorkspace({ mode = 'control' }: { mode?: WorkspaceMode }) {
  const [tab, setTab] = useState<Tab>(mode === 'community' ? 'groups' : 'people');
  const [state, setState] = useState<LocalState>(defaults);
  const [crm, setCrm] = useState<CrmOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [form, setForm] = useState<'team' | 'group' | null>(null);

  const refresh = async () => {
    try {
      const response = await fetch(`${apiBase}/api/crm/overview`);
      if (!response.ok) throw new Error('CRM unavailable');
      setCrm(await response.json() as CrmOverview);
    } catch {
      setCrm(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setState(readState());
    void refresh();
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey) setState(readState());
    };
    window.addEventListener('storage', onStorage);
    let stream: EventSource | null = null;
    try {
      stream = new EventSource(`${apiBase}/api/crm/stream`);
      stream.onmessage = () => void refresh();
      stream.onerror = () => stream?.close();
    } catch {
      stream = null;
    }
    return () => {
      window.removeEventListener('storage', onStorage);
      stream?.close();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  const summary = crm?.summary ?? { totalContacts: 24, openTasks: 9, newSignals: 7, averageEngagement: 76 };
  const tabs: Array<{ id: Tab; label: string; community: boolean }> = [
    { id: 'people', label: 'People & CRM', community: false },
    { id: 'teams', label: 'Teams', community: false },
    { id: 'groups', label: 'Community groups', community: true },
    { id: 'projects', label: 'Project management', community: true },
    { id: 'channels', label: 'Social channels', community: true },
    { id: 'tasks', label: 'Tasks & follow-up', community: false },
  ];
  const visibleTabs = tabs.filter((item) => mode === 'control' || item.community);
  const createItem = () => {
    if (!newName.trim()) return;
    if (form === 'team') {
      setState((current) => ({ ...current, teams: [...current.teams, { id: String(Date.now()), name: newName.trim(), lead: 'Assign a lead', focus: 'Define the team brief', members: 0, status: 'Forming' }] }));
    }
    if (form === 'group') {
      setState((current) => ({ ...current, groups: [...current.groups, { id: String(Date.now()), name: newName.trim(), area: 'Unassigned', members: 0, activity: 'New group', visible: false }] }));
    }
    setNewName('');
    setForm(null);
  };

  return <section className="mt-10 border border-[#c8d4cc] bg-[#f8f6f0] p-5 sm:p-7">
    <div className="flex flex-col justify-between gap-5 border-b border-[#d7e0d8] pb-6 lg:flex-row lg:items-start"><div><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#59756d]"><span className="h-1.5 w-1.5 rounded-full bg-[#6bd49d]" />{mode === 'control' ? 'Connected operations room' : 'Shared community workspace'}</div><h2 className="mt-3 font-serif text-4xl">The whole room, in one place.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#59756d]">Teams, people, projects, groups, tasks, and communications stay aligned as the campaign moves.</p></div><div className="flex items-center gap-2 text-xs text-[#59756d]"><span className={`h-2 w-2 rounded-full ${loading ? 'bg-[#c69b4b]' : crm ? 'bg-[#6bd49d]' : 'bg-[#a8bdb3]'}`} />{crm ? 'CRM synced' : 'Local workspace'}<button onClick={() => void refresh()} className="ml-2 p-1" title="Refresh CRM"><RefreshCw className="h-4 w-4" /></button></div></div>
    <div className="mt-6 grid gap-3 sm:grid-cols-4">{[['People', summary.totalContacts, 'in CRM'], ['Open tasks', summary.openTasks, 'need follow-up'], ['New signals', summary.newSignals, 'awaiting triage'], ['Engagement', `${summary.averageEngagement}%`, 'average health']].map(([label, value, note]) => <div key={String(label)} className="border border-[#d7e0d8] p-4"><span className="font-mono text-[10px] uppercase text-[#7b928a]">{label}</span><p className="mt-2 text-3xl">{value}</p><p className="text-xs text-[#59756d]">{note}</p></div>)}</div>
    <div className="mt-7 flex gap-1 overflow-x-auto border-b border-[#d7e0d8]">{visibleTabs.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`shrink-0 border-b-2 px-3 py-3 text-xs font-semibold ${tab === item.id ? 'border-[#397d5d] text-[#102c2b]' : 'border-transparent text-[#7b928a]'}`}>{item.label}</button>)}</div>
    <div className="pt-7">
      {tab === 'people' && <div><Title action={<button className="inline-flex items-center gap-2 border border-[#102c2b] px-3 py-2 text-xs font-semibold"><CirclePlus className="h-3.5 w-3.5" />Add contact</button>}>People & CRM</Title><div className="mt-5 divide-y divide-[#d7e0d8] border-y border-[#d7e0d8]">{(crm?.contacts ?? [{ id: 1, name: 'Mara Chen', role: 'Route team lead', area: 'Mobility', status: 'active', engagementScore: 92, nextAction: 'Confirm Mbita listening stop' }]).map((person) => <div key={person.id} className="grid gap-2 py-4 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-center"><div><p className="font-semibold">{person.name}</p><p className="text-xs text-[#59756d]">{person.role} · {person.area}</p></div><span className="text-xs capitalize text-[#59756d]">{person.status}</span><span className="text-xs text-[#59756d]">{person.nextAction}</span><span className="font-mono text-xs text-[#397d5d]">{person.engagementScore}%</span></div>)}</div></div>}
      {tab === 'teams' && <div><Title action={<button onClick={() => setForm(form === 'team' ? null : 'team')} className="inline-flex items-center gap-2 border border-[#102c2b] px-3 py-2 text-xs font-semibold"><Users className="h-3.5 w-3.5" />Manage teams</button>}>Teams & management</Title>{form === 'team' && <Form value={newName} onChange={setNewName} onSubmit={createItem} placeholder="New team name" />}<div className="mt-5 grid gap-3 md:grid-cols-3">{state.teams.map((team) => <div key={team.id} className="border border-[#d7e0d8] p-5"><div className="flex justify-between"><Users className="h-4 w-4 text-[#397d5d]" /><span className="font-mono text-[10px] uppercase text-[#7b928a]">{team.status}</span></div><h4 className="mt-5 font-serif text-2xl">{team.name}</h4><p className="mt-2 text-xs leading-5 text-[#59756d]">{team.focus}</p><div className="mt-5 flex justify-between border-t border-[#d7e0d8] pt-4 text-xs"><span>{team.lead}</span><span>{team.members} members</span></div></div>)}</div></div>}
      {tab === 'groups' && <div><Title action={<button onClick={() => setForm(form === 'group' ? null : 'group')} className="inline-flex items-center gap-2 border border-[#102c2b] px-3 py-2 text-xs font-semibold"><CirclePlus className="h-3.5 w-3.5" />Create group</button>}>Community groups</Title>{form === 'group' && <Form value={newName} onChange={setNewName} onSubmit={createItem} placeholder="New community group" />}<div className="mt-5 divide-y divide-[#d7e0d8] border-y border-[#d7e0d8]">{state.groups.map((group) => <div key={group.id} className="grid gap-3 py-4 sm:grid-cols-[1.5fr_1fr_1fr_auto] sm:items-center"><div><p className="font-semibold">{group.name}</p><p className="text-xs text-[#59756d]">{group.area}</p></div><span className="text-xs text-[#59756d]">{group.members} members</span><span className="text-xs text-[#59756d]">{group.activity}</span><span className={`text-xs ${group.visible ? 'text-[#397d5d]' : 'text-[#a67836]'}`}>{group.visible ? 'Public view' : 'Private'}</span></div>)}</div></div>}
      {tab === 'projects' && <div><Title>Project management</Title><div className="mt-5 divide-y divide-[#d7e0d8] border-y border-[#d7e0d8]">{[{ name: 'Homa Bay Connector', owner: 'Mara Chen', progress: 72, status: 'On track', next: 'Publish stop-level access study' }, { name: 'Lake Victoria Shoreline', owner: 'Jo Bell', progress: 61, status: 'On track', next: 'Confirm stewardship partners' }, { name: 'Homes Near Work', owner: 'Ravi Singh', progress: 48, status: 'Watch', next: 'Review first site plan' }].map((project) => <div key={project.name} className="grid gap-3 py-5 sm:grid-cols-[1.4fr_1fr_1fr] sm:items-center"><div><p className="font-semibold">{project.name}</p><p className="text-xs text-[#59756d]">{project.owner} · {project.next}</p></div><div><div className="mb-2 flex justify-between text-xs"><span>{project.status}</span><span>{project.progress}%</span></div><div className="h-1.5 bg-[#dbe4de]"><div className="h-full bg-[#6bd49d]" style={{ width: `${project.progress}%` }} /></div></div><button className="justify-self-start text-xs font-semibold text-[#397d5d] hover:underline sm:justify-self-end">Open project room</button></div>)}</div></div>}
      {tab === 'channels' && <div><Title action={<button className="inline-flex items-center gap-2 border border-[#102c2b] px-3 py-2 text-xs font-semibold"><Megaphone className="h-3.5 w-3.5" />Compose update</button>}>Social channels</Title><div className="mt-5 grid gap-3 md:grid-cols-3">{state.channels.map((channel) => <div key={channel.id} className="border border-[#d7e0d8] p-5"><div className="flex items-center justify-between"><Megaphone className="h-4 w-4 text-[#397d5d]" /><span className={`font-mono text-[10px] uppercase ${channel.status === 'connected' ? 'text-[#397d5d]' : 'text-[#a67836]'}`}>{channel.status}</span></div><h4 className="mt-5 font-serif text-2xl">{channel.name}</h4><p className="mt-1 text-xs text-[#59756d]">{channel.handle}</p><div className="mt-5 border-t border-[#d7e0d8] pt-4 text-xs"><div className="flex justify-between"><span>Reach</span><b>{channel.reach}</b></div><div className="mt-2 flex justify-between text-[#59756d]"><span>Last sync</span><span>{channel.lastSync}</span></div></div><button className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#397d5d]">{channel.status === 'connected' ? <><Check className="h-3.5 w-3.5" />Manage channel</> : 'Connect channel'}</button></div>)}</div><div className="mt-5 flex items-start gap-2 border border-[#d7e0d8] bg-[#e4eee4] p-4 text-xs leading-5 text-[#31574d]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#397d5d]" />Channels are represented as managed connections. Add provider credentials and webhooks before publishing externally.</div></div>}
      {tab === 'tasks' && <div><Title>Tasks & follow-up</Title><div className="mt-5 divide-y divide-[#d7e0d8] border-y border-[#d7e0d8]">{(crm?.tasks ?? [{ id: 1, title: 'Confirm Mbita listening stop', status: 'in-progress', priority: 'high', dueDate: '2026-09-20', owner: 'Maya Chen' }]).map((task) => <div key={task.id} className="grid gap-2 py-4 sm:grid-cols-[1.5fr_1fr_1fr_auto] sm:items-center"><div><p className="font-semibold">{task.title}</p><p className="text-xs text-[#59756d]">{task.owner}</p></div><span className="text-xs capitalize text-[#59756d]">{task.status}</span><span className="text-xs text-[#59756d]">Due {task.dueDate ?? 'No date'}</span><span className="font-mono text-[10px] uppercase text-[#a67836]">{task.priority}</span></div>)}</div></div>}
    </div>
  </section>;
}

function Form({ value, onChange, onSubmit, placeholder }: { value: string; onChange: (value: string) => void; onSubmit: () => void; placeholder: string }) {
  return <div className="mt-4 flex gap-2"><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-w-0 flex-1 border border-[#b7c9bd] bg-transparent px-3 py-2 text-sm" /><button onClick={onSubmit} className="bg-[#102c2b] px-4 py-2 text-xs font-semibold text-[#f5f1e9]">Create</button></div>;
}
