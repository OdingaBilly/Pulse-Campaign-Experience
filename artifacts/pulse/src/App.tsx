import { type ReactNode, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, CalendarDays, Check,
  ChevronDown, ChevronRight, CircleAlert, CircleDot, Compass, Filter,
  FolderKanban, Gauge, Globe2, Layers3, LineChart, Menu, MessageSquare,
  Search, ShieldCheck, Sparkles, Target, Users, X, Zap,
} from 'lucide-react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  localRepository,
  type Event,
  type Issue,
  type Poll,
  type Project,
  type PulseStatus,
} from './data/repository';

const queryClient = new QueryClient();
const repo = localRepository;
const campaign = repo.getCampaign();

function Logo({ invert = false }: { invert?: boolean }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2.5 ${invert ? 'text-[#f5f1e9]' : 'text-[#102c2b]'}`} data-testid="link-pulse-home">
      <span className="relative flex h-6 w-7 items-end gap-[3px]" aria-hidden="true">
        <span className="h-3 w-[3px] rounded-full bg-[#6bd49d] transition-transform group-hover:-translate-y-1" />
        <span className="h-5 w-[3px] rounded-full bg-[#6bd49d] transition-transform group-hover:-translate-y-1.5" />
        <span className="h-4 w-[3px] rounded-full bg-[#6bd49d] transition-transform group-hover:-translate-y-1" />
        <span className="h-6 w-[3px] rounded-full bg-[#6bd49d] transition-transform group-hover:-translate-y-2" />
      </span>
      <span className="font-serif text-[28px] leading-none tracking-[-0.04em]">pulse</span>
    </Link>
  );
}

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <div className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] ${light ? 'text-[#9bb3ac]' : 'text-[#59756d]'}`}><span className="h-1.5 w-1.5 rounded-full bg-[#6bd49d]" />{children}</div>;
}

function StatusPill({ status }: { status: PulseStatus }) {
  const label = status === 'on-track' ? 'On track' : status === 'complete' ? 'Complete' : status === 'watch' ? 'Watch' : 'Blocked';
  const tone = status === 'on-track' || status === 'complete' ? 'bg-[#e0f1e6] text-[#1f6b4a]' : status === 'watch' ? 'bg-[#f4e8ce] text-[#8b642d]' : 'bg-[#f4dcda] text-[#a1423c]';
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${tone}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{label}</span>;
}

function ProgressBar({ value, dark = false }: { value: number; dark?: boolean }) {
  return <div className={`h-1.5 overflow-hidden rounded-full ${dark ? 'bg-white/15' : 'bg-[#dbe4de]'}`}><motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full rounded-full bg-[#6bd49d]" /></div>;
}

function Panel({ children, className = '', dark = false, id }: { children: ReactNode; className?: string; dark?: boolean; id?: string }) {
  return <section id={id} className={`border ${dark ? 'border-white/15 bg-[#123431] text-[#f5f1e9]' : 'border-[#c8d4cc] bg-[#f8f6f0] text-[#102c2b]'} ${className}`}>{children}</section>;
}

function PageTransition({ children }: { children: ReactNode }) {
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }}>{children}</motion.div>;
}

function Landing() {
  const [active, setActive] = useState<'control' | 'community' | null>(null);
  return (
    <main className="grain min-h-[100dvh] bg-[#102c2b] text-[#f5f1e9]">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1600px] flex-col px-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/15 py-6">
          <Logo invert />
          <div className="hidden items-center gap-6 font-mono text-[10px] uppercase tracking-[0.16em] text-[#9bb3ac] sm:flex">
            <span>Northstar 2026</span><span className="h-1 w-1 rounded-full bg-[#6bd49d]" /><span>Harbor County</span>
          </div>
          <Link href="/community" className="text-sm text-[#d7e1d8] transition-colors hover:text-[#6bd49d]" data-testid="link-landing-community">Enter community <ArrowUpRight className="ml-1 inline h-4 w-4" /></Link>
        </header>
        <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24 lg:py-24">
          <div className="reveal max-w-3xl">
            <Eyebrow light>Campaign operating system / 01</Eyebrow>
            <h1 className="mt-7 font-serif text-[clamp(4rem,10vw,9.5rem)] leading-[.8] tracking-[-0.06em] text-[#f5f1e9]">The operating<br /><em className="text-[#6bd49d]">system</em> for<br />modern campaigns.</h1>
            <p className="mt-10 max-w-md text-lg leading-7 text-[#b6c9c0]">One core. Every layer aware. Pulse turns the moving parts of a campaign into a shared, legible picture.</p>
            <div className="mt-12 flex flex-wrap items-center gap-5">
              <a href="#choose" className="group inline-flex items-center gap-3 border border-[#6bd49d] bg-[#6bd49d] px-5 py-3 text-sm font-semibold text-[#102c2b] transition-all hover:bg-[#8ce2b3]" data-testid="link-landing-see-pulse">See Pulse in motion <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></a>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#9bb3ac]">Built for the whole room</span>
            </div>
          </div>
          <div className="reveal reveal-2 relative lg:pl-8">
            <div className="absolute -left-5 top-0 hidden h-full w-px bg-white/15 lg:block" />
            <div className="relative mx-auto max-w-md border border-white/20 bg-[#173d38] p-5 sm:p-7">
              <div className="flex items-start justify-between border-b border-white/15 pb-5">
                <div><Eyebrow light>Live campaign pulse</Eyebrow><p className="mt-3 font-serif text-3xl">Northstar</p></div>
                <span className="font-mono text-[10px] text-[#9bb3ac]">08:42 / TODAY</span>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-end gap-6 py-8">
                <div><p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#9bb3ac]">Campaign Pulse Score</p><p className="mt-1 text-7xl font-light tracking-[-0.08em] text-[#f5f1e9]">87<span className="text-2xl text-[#9bb3ac]">/100</span></p></div>
                <div className="mb-2 flex h-16 items-end gap-1.5">{[34, 47, 40, 58, 52, 73, 66, 82, 76, 93].map((h, i) => <span key={i} className="w-2 bg-[#6bd49d]" style={{ height: `${h}%`, opacity: 0.35 + i / 18 }} />)}</div>
              </div>
              <div className="grid grid-cols-3 border-t border-white/15 pt-5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#9bb3ac]"><span>4 projects<br /><b className="font-medium text-[#f5f1e9]">moving</b></span><span>38 signals<br /><b className="font-medium text-[#f5f1e9]">this week</b></span><span>3 regions<br /><b className="font-medium text-[#f5f1e9]">in rhythm</b></span></div>
            </div>
            <div className="drift absolute -bottom-8 -right-2 hidden h-24 w-24 rounded-full border border-[#6bd49d]/40 p-2 sm:block"><div className="flex h-full items-center justify-center rounded-full bg-[#6bd49d] text-center font-mono text-[9px] uppercase leading-3 tracking-[0.1em] text-[#102c2b]">all layers<br />aware</div></div>
          </div>
        </div>
        <div id="choose" className="reveal reveal-3 grid border-t border-white/15 md:grid-cols-2">
          {[
            { id: 'control' as const, href: '/control', number: '01', icon: Gauge, title: 'Mission Control', copy: 'For the people holding the whole picture: what is moving, what needs attention, and why.', cta: 'Open control room' },
            { id: 'community' as const, href: '/community', number: '02', icon: Users, title: 'Community Portal', copy: 'For neighbors who want a clear view of progress and a simple way to shape what happens next.', cta: 'Enter community' },
          ].map((item) => {
            const Icon = item.icon;
            return <Link key={item.id} href={item.href} onMouseEnter={() => setActive(item.id)} onMouseLeave={() => setActive(null)} className={`group flex items-start justify-between border-white/15 py-8 transition-colors md:px-6 md:py-10 ${item.id === 'community' ? 'md:border-l' : ''} ${active === item.id ? 'bg-[#173d38]' : ''}`} data-testid={`link-landing-${item.id}`}>
              <div className="flex gap-5"><span className="font-mono text-[10px] text-[#6e9388]">{item.number}</span><div><Icon className="h-5 w-5 text-[#6bd49d]" /><h2 className="mt-4 font-serif text-3xl">{item.title}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[#9bb3ac]">{item.copy}</p></div></div><ArrowUpRight className="h-5 w-5 text-[#6bd49d] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>;
          })}
        </div>
      </div>
    </main>
  );
}

function AppShell({ children, mode }: { children: ReactNode; mode: 'control' | 'community' }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const controlNav = [{ href: '/control', icon: Gauge, label: 'Overview' }, { href: '/control#reality', icon: Compass, label: 'Current reality' }, { href: '/control#projects', icon: FolderKanban, label: 'Projects' }, { href: '/control#issues', icon: CircleAlert, label: 'Open issues' }, { href: '/control#coverage', icon: Globe2, label: 'Coverage' }];
  const communityNav = [{ href: '/community', icon: Sparkles, label: 'At a glance' }, { href: '/community#projects', icon: FolderKanban, label: 'Projects' }, { href: '/community#listen', icon: MessageSquare, label: 'Have your say' }, { href: '/community#events', icon: CalendarDays, label: 'Events' }];
  const nav = mode === 'control' ? controlNav : communityNav;
  return <div className="grain min-h-[100dvh] bg-[#f1efe8] text-[#102c2b]">
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#102c2b] px-5 py-6 text-[#f5f1e9] transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between"><Logo invert /><button onClick={() => setMobileOpen(false)} className="rounded p-1 text-[#9bb3ac] hover:text-white lg:hidden" aria-label="Close navigation" data-testid="button-close-navigation"><X className="h-5 w-5" /></button></div>
      <div className="mt-12"><Eyebrow light>{mode === 'control' ? 'Mission control' : 'Community portal'}</Eyebrow><p className="mt-3 font-serif text-2xl">{campaign.name}</p><p className="mt-1 text-xs text-[#9bb3ac]">{campaign.location} · {campaign.cycle}</p></div>
      <nav className="mt-12 space-y-1" aria-label="Primary navigation">{nav.map(({ href, icon: Icon, label }) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 border-l-2 px-3 py-3 text-sm transition-colors ${location === href ? 'border-[#6bd49d] bg-white/10 text-white' : 'border-transparent text-[#9bb3ac] hover:bg-white/5 hover:text-white'}`} data-testid={`link-${mode}-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon className="h-4 w-4" />{label}</Link>)}</nav>
      <div className="mt-auto border-t border-white/15 pt-5"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6bd49d] font-mono text-xs text-[#102c2b]">MC</span><div><p className="text-xs text-[#f5f1e9]">{mode === 'control' ? 'Maya Chen' : 'A neighbor'}</p><p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#6e9388]">{mode === 'control' ? 'Campaign team' : 'Private session'}</p></div></div></div>
    </aside>
    {mobileOpen && <button className="fixed inset-0 z-30 bg-[#102c2b]/45 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu overlay" data-testid="button-menu-overlay" />}
    <div className="lg:pl-64">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#c8d4cc] bg-[#f1efe8]/95 px-5 backdrop-blur sm:px-8 lg:px-12">
        <div className="flex items-center gap-4"><button onClick={() => setMobileOpen(true)} className="rounded p-1 text-[#59756d] lg:hidden" aria-label="Open navigation" data-testid="button-open-navigation"><Menu className="h-5 w-5" /></button><div className="hidden sm:block"><span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#59756d]">{mode === 'control' ? 'Operational picture' : 'A clear view of what is moving'}</span></div></div>
        <div className="flex items-center gap-4"><span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-[#7b928a] sm:inline">Last synced {campaign.updatedAt}</span><Link href={mode === 'control' ? '/community' : '/control'} className="inline-flex items-center gap-2 border border-[#a8bdb3] px-3 py-2 text-xs font-semibold hover:border-[#102c2b] hover:bg-[#e3e9e2]" data-testid={`link-switch-${mode}`}>{mode === 'control' ? 'View community' : 'Mission control'}<ArrowUpRight className="h-3.5 w-3.5" /></Link></div>
      </header>
      {children}
    </div>
  </div>;
}

function ScoreCard() {
  const analytics = repo.getAnalytics();
  return <Panel className="overflow-hidden p-6 sm:p-8" dark><div className="flex items-start justify-between"><div><Eyebrow light>Campaign pulse score</Eyebrow><p className="mt-4 text-7xl font-light tracking-[-0.08em]">87<span className="ml-1 text-2xl text-[#9bb3ac]">/100</span></p><p className="mt-2 text-sm text-[#b6c9c0]">Up 4 points from last week</p></div><div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[#6bd49d]/35"><div className="absolute inset-2 rounded-full border border-dashed border-[#6bd49d]/50" /><Zap className="h-5 w-5 text-[#6bd49d]" /></div></div><div className="mt-8 flex h-16 items-end gap-2">{analytics.pulseHistory.map((item) => <div key={item.label} className="flex flex-1 flex-col items-center gap-2"><div className="w-full bg-[#6bd49d]" style={{ height: `${item.score - 60}%`, opacity: item.score > 80 ? 1 : .55 }} /><span className="font-mono text-[9px] text-[#6e9388]">{item.label}</span></div>)}</div></Panel>;
}

function Metric({ label, value, note, icon: Icon, tone = 'green' }: { label: string; value: string; note: string; icon: typeof Gauge; tone?: 'green' | 'amber' }) {
  return <Panel className="p-5 transition-colors hover:bg-[#fbfaf6]"><div className="flex items-start justify-between"><Eyebrow>{label}</Eyebrow><Icon className={tone === 'amber' ? 'h-4 w-4 text-[#a67836]' : 'h-4 w-4 text-[#4caa79]'} /></div><p className="mt-5 text-4xl tracking-[-0.06em]">{value}</p><p className="mt-1 text-xs text-[#59756d]">{note}</p></Panel>;
}

function ActivityStrip() {
  return <Panel className="p-5"><div className="flex items-center justify-between"><Eyebrow>Community activity</Eyebrow><span className="font-mono text-[10px] text-[#59756d]">7 days</span></div><div className="mt-6 flex h-28 items-end gap-2">{repo.getAnalytics().activity.map((item, i) => <div key={item.label} className="flex flex-1 flex-col items-center gap-2"><div className="relative flex w-full flex-1 items-end"><motion.div initial={{ height: 0 }} animate={{ height: `${item.value}%` }} transition={{ delay: i * .04, duration: .7 }} className={`w-full ${i === 5 ? 'bg-[#6bd49d]' : 'bg-[#aac9ba]'}`} /></div><span className="font-mono text-[9px] text-[#7b928a]">{item.label}</span></div>)}</div><div className="mt-4 flex items-center gap-2 border-t border-[#d7e0d8] pt-4 text-xs text-[#59756d]"><span className="h-1.5 w-1.5 rounded-full bg-[#6bd49d]" />184 community actions this week</div></Panel>;
}

function RealityPanel() {
  const [open, setOpen] = useState<string | null>('i-1');
  const issues = repo.getIssues();
  return <Panel id="reality" className="p-6 sm:p-8"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><Eyebrow>Current reality</Eyebrow><h2 className="mt-3 font-serif text-4xl">What needs the room.</h2></div><button className="inline-flex items-center gap-2 self-start text-xs font-semibold text-[#397d5d] hover:text-[#102c2b]" data-testid="button-reality-filter"><Filter className="h-3.5 w-3.5" />Filter signals</button></div><div className="mt-8 divide-y divide-[#d7e0d8] border-y border-[#d7e0d8]">{issues.map((issue) => <div key={issue.id} className="py-5"><button onClick={() => setOpen(open === issue.id ? null : issue.id)} className="flex w-full items-start justify-between gap-4 text-left" data-testid={`button-expand-issue-${issue.id}`}><div className="flex gap-4"><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${issue.severity === 'high' ? 'bg-[#c75a4e]' : issue.severity === 'medium' ? 'bg-[#c69b4b]' : 'bg-[#6bad85]'}`} /><div><div className="flex flex-wrap items-center gap-3"><h3 className="font-semibold">{issue.title}</h3><span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#7b928a]">{issue.area}</span></div><p className="mt-1 text-sm text-[#59756d]">{issue.signalCount} signals · last seen {issue.lastSeen}</p></div></div><ChevronDown className={`h-4 w-4 shrink-0 text-[#59756d] transition-transform ${open === issue.id ? 'rotate-180' : ''}`} /></button><AnimatePresence initial={false}>{open === issue.id && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="ml-6 mt-4 border-l border-[#6bd49d] pl-4 text-sm leading-6 text-[#59756d]"><p>{issue.summary}</p><div className="mt-3 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#397d5d]"><span>{issue.status}</span><span>evidence attached</span><button className="underline" data-testid={`button-view-evidence-${issue.id}`}>View evidence</button></div></div></motion.div>}</AnimatePresence></div>)}</div></Panel>;
}

function CoveragePanel() {
  return <Panel id="coverage" className="p-6 sm:p-8"><div className="flex items-end justify-between"><div><Eyebrow>Regional coverage</Eyebrow><h2 className="mt-3 font-serif text-3xl">Where the signal is coming from.</h2></div><BarChart3 className="h-5 w-5 text-[#4caa79]" /></div><div className="mt-7 space-y-5">{repo.getAnalytics().regions.map((region) => <div key={region.name}><div className="mb-2 flex justify-between text-sm"><span>{region.name}</span><span className="font-mono text-[10px] uppercase text-[#7b928a]">{region.note} / {region.value}</span></div><ProgressBar value={region.value} /></div>)}</div><div className="mt-7 border-t border-[#d7e0d8] pt-5 text-xs leading-5 text-[#59756d]"><ShieldCheck className="mr-2 inline h-4 w-4 text-[#4caa79]" />Coverage shows aggregated participation by region. No individual participant information is included.</div></Panel>;
}

function ProjectPipeline({ onSelect }: { onSelect: (project: Project) => void }) {
  return <Panel id="projects" className="p-6 sm:p-8"><div className="flex items-end justify-between"><div><Eyebrow>Project pipeline</Eyebrow><h2 className="mt-3 font-serif text-3xl">The work, in motion.</h2></div><button className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#397d5d] hover:underline" data-testid="button-view-all-projects">View all</button></div><div className="mt-7 divide-y divide-[#d7e0d8] border-y border-[#d7e0d8]">{repo.getProjects().map((project) => <button key={project.id} onClick={() => onSelect(project)} className="group flex w-full items-center gap-4 py-4 text-left" data-testid={`button-project-${project.id}`}><span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-[#7b928a]">{project.area}</span><span className="min-w-0 flex-1"><span className="block truncate font-semibold">{project.name}</span><span className="mt-1 block truncate text-xs text-[#59756d]">{project.nextStep}</span></span><span className="hidden w-28 sm:block"><ProgressBar value={project.progress} /></span><span className="w-14 text-right font-mono text-[10px] text-[#59756d]">{project.progress}%</span><ChevronRight className="h-4 w-4 text-[#7b928a] transition-transform group-hover:translate-x-1" /></button>)}</div></Panel>;
}

function ProjectDrawer({ project, onClose }: { project: Project | null; onClose: () => void }) {
  return <AnimatePresence>{project && <><motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-30 bg-[#102c2b]/35" aria-label="Close project details" data-testid="button-close-project-overlay" /><motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 240 }} className="fixed inset-y-0 right-0 z-40 w-full max-w-md overflow-y-auto border-l border-[#c8d4cc] bg-[#f8f6f0] p-6 text-[#102c2b] shadow-2xl sm:p-9"><button onClick={onClose} className="float-right text-[#59756d] hover:text-[#102c2b]" aria-label="Close details" data-testid="button-close-project"><X className="h-5 w-5" /></button><Eyebrow>Project detail</Eyebrow><h2 className="mt-5 font-serif text-4xl">{project.name}</h2><div className="mt-4"><StatusPill status={project.status} /></div><p className="mt-7 text-lg leading-7 text-[#59756d]">{project.summary}</p><div className="mt-9 border-y border-[#c8d4cc] py-5"><div className="flex justify-between text-sm"><span>Progress</span><span className="font-mono text-xs">{project.progress}%</span></div><div className="mt-3"><ProgressBar value={project.progress} /></div></div><dl className="mt-7 space-y-5 text-sm"><div><dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#7b928a]">Owner</dt><dd className="mt-1">{project.owner}</dd></div><div><dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#7b928a]">Target</dt><dd className="mt-1">{project.target}</dd></div><div><dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#7b928a]">Next step</dt><dd className="mt-1">{project.nextStep}</dd></div></dl><button onClick={onClose} className="mt-10 w-full border border-[#102c2b] bg-[#102c2b] px-4 py-3 text-sm font-semibold text-[#f5f1e9] hover:bg-[#214a44]" data-testid="button-close-project-drawer">Done</button></motion.aside></>}</AnimatePresence>;
}

function ControlPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const needle = query.toLowerCase();
    return [...repo.getProjects().map((item) => ({ type: 'Project', label: item.name, meta: item.area })), ...repo.getIssues().map((item) => ({ type: 'Issue', label: item.title, meta: item.area }))].filter((item) => `${item.label} ${item.meta}`.toLowerCase().includes(needle));
  }, [query]);
  return <AppShell mode="control"><PageTransition><main className="mx-auto max-w-[1440px] px-5 py-9 sm:px-8 lg:px-12 lg:py-12"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><Eyebrow>Tuesday / 19 August 2025</Eyebrow><h1 className="mt-4 font-serif text-5xl tracking-[-0.04em] sm:text-6xl">Good morning, Maya.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#59756d]">Here is the operational picture for Northstar. The system is healthy; two signals deserve the room today.</p></div><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-3 h-4 w-4 text-[#7b928a]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the whole picture" className="w-full border border-[#b7c9bd] bg-[#f8f6f0] py-2.5 pl-10 pr-3 text-sm placeholder:text-[#7b928a]" data-testid="input-control-search" />{query && <div className="absolute left-0 right-0 top-12 z-10 border border-[#b7c9bd] bg-[#f8f6f0] p-2 shadow-xl">{results.length ? results.map((item) => <button key={`${item.type}-${item.label}`} onClick={() => { setQuery(''); const found = repo.getProjects().find((p) => p.name === item.label); if (found) setProject(found); }} className="flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-[#e9eee8]" data-testid={`button-search-result-${item.label.toLowerCase().replaceAll(' ', '-')}`}><span>{item.label}</span><span className="font-mono text-[9px] uppercase text-[#7b928a]">{item.type}</span></button>) : <p className="px-3 py-2 text-xs text-[#59756d]">No matching signal.</p>}</div>}</div></div><div className="mt-9 grid gap-4 xl:grid-cols-[1.15fr_1fr_1fr]"><ScoreCard /><Metric label="Projects on track" value="3 / 4" note="One project is being watched" icon={FolderKanban} /><Metric label="Open issues" value="03" note="One high attention signal" icon={CircleAlert} tone="amber" /><ActivityStrip /></div><div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]"><RealityPanel /><CoveragePanel /></div><div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]"><ProjectPipeline onSelect={setProject} /><Panel className="p-6 sm:p-8"><div className="flex items-end justify-between"><div><Eyebrow>Recent decisions</Eyebrow><h2 className="mt-3 font-serif text-3xl">What changed.</h2></div><LineChart className="h-5 w-5 text-[#4caa79]" /></div><div className="mt-7 space-y-5">{[{ date: 'Today', copy: 'Keep South Harbor as the next listening stop.', by: 'Route team' }, { date: 'Yesterday', copy: 'Publish the site plan in plain language.', by: 'Housing team' }, { date: 'Aug 15', copy: 'Add a second stewardship partner to the creek plan.', by: 'Climate team' }].map((item) => <div key={item.date} className="border-l border-[#6bd49d] pl-4"><p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#7b928a]">{item.date} · {item.by}</p><p className="mt-1 text-sm leading-5">{item.copy}</p></div>)}</div><button className="mt-8 inline-flex items-center gap-2 text-xs font-semibold text-[#397d5d] hover:underline" data-testid="button-decisions-history">Open decision history <ArrowRight className="h-3 w-3" /></button></Panel></div><div className="mt-4 rounded border border-[#c8d4cc] bg-[#e4eee4] p-5 text-sm text-[#31574d]"><ShieldCheck className="mr-2 inline h-4 w-4 text-[#397d5d]" />Privacy by design: this workspace uses synthetic, aggregated demonstration data. Community participation is never used to infer individual political preferences.</div></main></PageTransition><ProjectDrawer project={project} onClose={() => setProject(null)} /></AppShell>;
}

function PollCard({ poll, voted, onVote }: { poll: Poll; voted: boolean; onVote: (pollId: string, option: string) => void }) {
  const total = poll.options.reduce((sum, option) => sum + option.votes, 0);
  return <Panel className="p-6"><div className="flex items-start justify-between gap-5"><Eyebrow>Community poll</Eyebrow><span className="font-mono text-[10px] text-[#7b928a]">{poll.closes}</span></div><h3 className="mt-5 font-serif text-2xl leading-7">{poll.question}</h3><p className="mt-2 text-xs leading-5 text-[#59756d]">{poll.context}</p><div className="mt-6 space-y-2">{poll.options.map((option) => { const percent = Math.round((option.votes / total) * 100); return <button key={option.label} onClick={() => !voted && onVote(poll.id, option.label)} className={`relative w-full overflow-hidden border px-3 py-3 text-left text-sm ${voted ? 'border-[#b7c9bd]' : 'border-[#c8d4cc] hover:border-[#397d5d]'}`} data-testid={`button-poll-${poll.id}-${option.label.toLowerCase().replaceAll(' ', '-')}`}><span className="absolute inset-y-0 left-0 bg-[#dff0e3]" style={{ width: `${voted ? percent : 0}%` }} /><span className="relative flex justify-between"><span>{option.label}</span>{voted ? <span className="font-mono text-[10px] text-[#397d5d]">{percent}%</span> : <ChevronRight className="h-4 w-4 text-[#7b928a]" />}</span></button>; })}</div><div className="mt-5 flex items-center justify-between border-t border-[#d7e0d8] pt-4 font-mono text-[10px] uppercase tracking-[0.08em] text-[#7b928a]"><span>{poll.responses + (voted ? 1 : 0)} responses</span>{voted ? <span className="inline-flex items-center gap-1.5 text-[#397d5d]"><Check className="h-3 w-3" />Thanks for weighing in</span> : <span>Aggregate results only</span>}</div></Panel>;
}

function EventCard({ event, registered, onRegister }: { event: Event; registered: boolean; onRegister: () => void }) {
  return <div className="group border-b border-[#c8d4cc] py-5 first:border-t"><div className="grid gap-4 sm:grid-cols-[110px_1fr_auto] sm:items-start"><div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#397d5d]"><CalendarDays className="mr-1 inline h-3 w-3" />{event.date}<br /><span className="ml-4 text-[#7b928a]">{event.time}</span></div><div><h3 className="font-semibold">{event.title}</h3><p className="mt-1 text-sm text-[#59756d]">{event.location} · {event.description}</p></div><button onClick={onRegister} className={`justify-self-start border px-3 py-2 text-xs font-semibold transition-colors sm:justify-self-end ${registered ? 'border-[#6bad85] bg-[#e0f1e6] text-[#397d5d]' : 'border-[#102c2b] hover:bg-[#102c2b] hover:text-[#f5f1e9]'}`} data-testid={`button-register-${event.id}`}>{registered ? 'You are on the list' : event.seats === 'Open to all' ? 'Join room' : 'Save a place'}</button></div></div>;
}

function CommunityPage() {
  const [voted, setVoted] = useState<Record<string, string>>({});
  const [registered, setRegistered] = useState<Record<string, boolean>>({});
  const [signalOpen, setSignalOpen] = useState(false);
  const [signalSent, setSignalSent] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [selectedArea, setSelectedArea] = useState('Mobility');
  const vote = (pollId: string, option: string) => setVoted((current) => ({ ...current, [pollId]: option }));
  return <AppShell mode="community"><PageTransition><main><section className="bg-[#102c2b] px-5 py-16 text-[#f5f1e9] sm:px-8 lg:px-12 lg:py-24"><div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-end"><div><Eyebrow light>Northstar 2026 / Harbor County</Eyebrow><h1 className="mt-7 max-w-3xl font-serif text-[clamp(3.5rem,8vw,8rem)] leading-[.85] tracking-[-0.06em]">A county that<br /><em className="text-[#6bd49d]">works in the open.</em></h1><p className="mt-8 max-w-lg text-lg leading-7 text-[#b6c9c0]">Make Harbor County easier to live in, together. Here is what is moving, what we are learning, and where your voice can help shape the next step.</p></div><div className="border-t border-white/15 pt-6 lg:border-l lg:border-t-0 lg:pl-8"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#9bb3ac]">The shared promise</p><p className="mt-4 font-serif text-3xl leading-9">Progress you can follow.<br />Participation you can trust.</p><p className="mt-5 text-xs leading-5 text-[#9bb3ac]">No sign-in required. We share aggregate responses only and never infer individual political preferences.</p></div></div></section><section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-20"><div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]"><Panel className="overflow-hidden bg-[#dcecdf] p-6 sm:p-9"><div className="flex items-start justify-between"><div><Eyebrow>Featured project</Eyebrow><h2 className="mt-4 font-serif text-4xl">{repo.getProjects()[0].name}</h2></div><span className="bg-[#102c2b] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[#6bd49d]">In motion</span></div><p className="mt-5 max-w-xl text-base leading-7 text-[#31574d]">{repo.getProjects()[0].summary}</p><div className="mt-8 flex items-end justify-between"><div><span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#59756d]">Current progress</span><p className="mt-1 text-5xl tracking-[-0.06em]">{repo.getProjects()[0].progress}<span className="text-lg text-[#59756d]">%</span></p></div><button onClick={() => setActiveProject(repo.getProjects()[0])} className="inline-flex items-center gap-2 border border-[#102c2b] px-3 py-2 text-xs font-semibold hover:bg-[#102c2b] hover:text-[#f5f1e9]" data-testid="button-featured-project-details">Follow the work <ArrowUpRight className="h-3.5 w-3.5" /></button></div><div className="mt-6"><ProgressBar value={repo.getProjects()[0].progress} /></div></Panel><Panel className="p-6 sm:p-9" dark><Eyebrow light>Latest update / 08:42</Eyebrow><h2 className="mt-4 font-serif text-3xl">The next stop is South Harbor.</h2><p className="mt-4 text-sm leading-6 text-[#b6c9c0]">The route team has chosen South Harbor for the next working session, where late-shift riders have been asking for a closer look at the final connection home.</p><div className="mt-8 border-t border-white/15 pt-5 text-xs text-[#9bb3ac]"><CircleDot className="mr-2 inline h-4 w-4 text-[#6bd49d]" />38 neighbors raised the connection signal</div></Panel></div><div id="projects" className="mt-20 grid gap-10 lg:grid-cols-[.7fr_1.3fr]"><div><Eyebrow>The work</Eyebrow><h2 className="mt-4 max-w-sm font-serif text-5xl leading-[.9]">See the promise take shape.</h2><p className="mt-5 max-w-sm text-sm leading-6 text-[#59756d]">Every project has a current state, a next step, and a person accountable for moving it forward.</p></div><div className="divide-y divide-[#c8d4cc] border-y border-[#c8d4cc]">{repo.getProjects().map((item) => <button key={item.id} onClick={() => setActiveProject(item)} className="group flex w-full items-center gap-4 py-5 text-left" data-testid={`button-community-project-${item.id}`}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#a8bdb3] font-mono text-[10px] text-[#397d5d]">{String(item.progress).padStart(2, '0')}</span><span className="min-w-0 flex-1"><span className="block font-semibold">{item.name}</span><span className="mt-1 block truncate text-xs text-[#59756d]">{item.area} · {item.nextStep}</span></span><StatusPill status={item.status} /><ChevronRight className="h-4 w-4 text-[#7b928a] transition-transform group-hover:translate-x-1" /></button>)}</div></div><div id="listen" className="mt-20 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]"><Panel className="p-6 sm:p-9"><div className="flex items-start justify-between"><div><Eyebrow>Have your say</Eyebrow><h2 className="mt-4 font-serif text-4xl">Small signals, real direction.</h2></div><MessageSquare className="h-5 w-5 text-[#4caa79]" /></div><p className="mt-4 max-w-lg text-sm leading-6 text-[#59756d]">Choose a question or share a practical signal from your day. Responses are grouped with others before the campaign team sees them.</p><div className="mt-8 space-y-4">{repo.getPolls().map((poll) => <PollCard key={poll.id} poll={poll} voted={Boolean(voted[poll.id])} onVote={vote} />)}</div><button onClick={() => { setSignalOpen(true); setSignalSent(false); }} className="mt-7 inline-flex items-center gap-2 border border-[#102c2b] bg-[#102c2b] px-4 py-3 text-sm font-semibold text-[#f5f1e9] hover:bg-[#214a44]" data-testid="button-share-signal"><MessageSquare className="h-4 w-4 text-[#6bd49d]" />Share a local signal</button></Panel><Panel className="p-6 sm:p-9" dark><Eyebrow light>Why we ask</Eyebrow><h2 className="mt-4 font-serif text-3xl">Participation without the machinery.</h2><div className="mt-8 space-y-6">{repo.getManifesto().map((item) => <div key={item.id} className="flex gap-4 border-t border-white/15 pt-5"><span className="font-mono text-[10px] text-[#6bd49d]">{item.number}</span><div><h3 className="font-semibold">{item.title}</h3><p className="mt-1 text-sm leading-5 text-[#9bb3ac]">{item.body}</p></div></div>)}</div></Panel></div><div id="events" className="mt-20 grid gap-10 lg:grid-cols-[.7fr_1.3fr]"><div><Eyebrow>In the neighborhood</Eyebrow><h2 className="mt-4 font-serif text-5xl leading-[.9]">Make it a room.</h2><p className="mt-5 max-w-sm text-sm leading-6 text-[#59756d]">No stage, no pitch. Just the next useful conversation.</p></div><div>{repo.getEvents().map((event) => <EventCard key={event.id} event={event} registered={Boolean(registered[event.id])} onRegister={() => setRegistered((current) => ({ ...current, [event.id]: true }))} />)}</div></div></section></main></PageTransition><ProjectDrawer project={activeProject} onClose={() => setActiveProject(null)} /><AnimatePresence>{signalOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-[#102c2b]/45 p-0 sm:items-center sm:p-6"><motion.div initial={{ y: 30 }} animate={{ y: 0 }} exit={{ y: 30 }} className="w-full max-w-lg border border-[#c8d4cc] bg-[#f8f6f0] p-6 text-[#102c2b] sm:p-8"><div className="flex items-start justify-between"><div><Eyebrow>Private community signal</Eyebrow><h2 className="mt-4 font-serif text-3xl">{signalSent ? 'Signal received.' : 'What are you noticing?'}</h2></div><button onClick={() => setSignalOpen(false)} aria-label="Close signal form" data-testid="button-close-signal"><X className="h-5 w-5 text-[#59756d]" /></button></div>{signalSent ? <div className="py-10 text-sm leading-6 text-[#59756d]"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#dff0e3] text-[#397d5d]"><Check className="h-5 w-5" /></div>Your signal will be grouped with others before it is shared with the team. Thank you for adding a useful detail.</div> : <><p className="mt-3 text-sm leading-6 text-[#59756d]">Share a practical detail about your neighborhood. We do not ask for your name, contact information, or political preferences.</p><label className="mt-6 block font-mono text-[10px] uppercase tracking-[0.1em] text-[#59756d]">Area<select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} className="mt-2 block w-full border border-[#b7c9bd] bg-[#f8f6f0] px-3 py-3 font-sans text-sm normal-case tracking-normal" data-testid="select-signal-area"><option>Mobility</option><option>Housing</option><option>Climate</option><option>Local economy</option></select></label><label className="mt-5 block font-mono text-[10px] uppercase tracking-[0.1em] text-[#59756d]">Your signal<textarea rows={4} placeholder={`Something about ${selectedArea.toLowerCase()}...`} className="mt-2 block w-full resize-none border border-[#b7c9bd] bg-[#f8f6f0] px-3 py-3 font-sans text-sm normal-case tracking-normal placeholder:text-[#9bad9f]" data-testid="textarea-signal" /></label><button onClick={() => setSignalSent(true)} className="mt-6 w-full bg-[#102c2b] px-4 py-3 text-sm font-semibold text-[#f5f1e9] hover:bg-[#214a44]" data-testid="button-submit-signal">Share signal privately</button></>}</motion.div></motion.div>}</AnimatePresence></AppShell>;
}

function Router() {
  return <Switch><Route path="/" component={Landing} /><Route path="/control" component={ControlPage} /><Route path="/community" component={CommunityPage} /><Route component={NotFound} /></Switch>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedErrorBoundary><Router /></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;