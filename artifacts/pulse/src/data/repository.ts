export type PulseStatus = 'on-track' | 'watch' | 'blocked' | 'complete';
export type Visibility = 'internal' | 'community';

export type Campaign = {
  id: string; name: string; shortName: string; location: string; cycle: string;
  pulseScore: number; tagline: string; vision: string; updatedAt: string;
};
export type Project = {
  id: string; name: string; area: string; owner: string; status: PulseStatus;
  progress: number; target: string; summary: string; nextStep: string;
  communityVisible: boolean; updatedAt: string;
};
export type Issue = {
  id: string; title: string; area: string; severity: 'low' | 'medium' | 'high';
  status: 'open' | 'monitoring' | 'resolved'; signalCount: number; summary: string;
  lastSeen: string; communityVisible: boolean;
};
export type Poll = {
  id: string; question: string; closes: string; responses: number;
  options: { label: string; votes: number }[]; context: string;
};
export type Event = {
  id: string; title: string; date: string; time: string; location: string;
  kind: 'listening' | 'workshop' | 'milestone'; seats: string; description: string;
};
export type ManifestoItem = { id: string; number: string; title: string; body: string; };
export type Analytics = {
  activity: { label: string; value: number }[];
  regions: { name: string; value: number; note: string }[];
  pulseHistory: { label: string; score: number }[];
};

export type PulseRepository = {
  getCampaign(): Campaign;
  getProjects(): Project[];
  getIssues(): Issue[];
  getPolls(): Poll[];
  getEvents(): Event[];
  getManifesto(): ManifestoItem[];
  getAnalytics(): Analytics;
};

const campaign: Campaign = {
  id: 'homabay-26', name: 'Homabay 2026', shortName: 'Homabay',
  location: 'Homabay County', cycle: '2026 civic cycle', pulseScore: 87,
  tagline: 'A county that works in the open.', vision: 'Make Homabay County easier to live in, together.',
  updatedAt: 'Today, 08:42',
};
const projects: Project[] = [
  { id: 'transit', name: 'Homa Bay Connector', area: 'Mobility', owner: 'Mara Chen', status: 'on-track', progress: 72, target: 'Spring 2026', summary: 'A reliable connection between Homa Bay Town, Mbita, and the markets shaped by riders who use it every day.', nextStep: 'Publish stop-level access study', communityVisible: true, updatedAt: '2h ago' },
  { id: 'homes', name: 'Homes Near Work', area: 'Housing', owner: 'Ravi Singh', status: 'watch', progress: 48, target: 'Summer 2026', summary: 'Making it possible to stay close to the people and places that make Homabay County home.', nextStep: 'Review the first 120-unit site plan', communityVisible: true, updatedAt: 'Yesterday' },
  { id: 'shoreline', name: 'Lake Victoria Shoreline', area: 'Climate', owner: 'Jo Bell', status: 'on-track', progress: 61, target: 'Fall 2026', summary: 'Restoring shoreline around the lake while protecting the fishing and farming communities behind it.', nextStep: 'Confirm community stewardship partners', communityVisible: true, updatedAt: '3h ago' },
  { id: 'small-business', name: 'Open Market Doors', area: 'Local economy', owner: 'Theo Brooks', status: 'complete', progress: 100, target: 'Complete', summary: 'A simpler path for small businesses to open, hire, and grow in Homabay.', nextStep: 'Measure first-year retention', communityVisible: true, updatedAt: 'Monday' },
];
const issues: Issue[] = [
  { id: 'i-1', title: 'Late evening connection', area: 'Mobility', severity: 'high', status: 'open', signalCount: 38, summary: 'Riders between Mbita and Homa Bay Town report the final connection leaves before late shifts end.', lastSeen: 'Today, 07:18', communityVisible: true },
  { id: 'i-2', title: 'Construction cost drift', area: 'Housing', severity: 'medium', status: 'monitoring', signalCount: 12, summary: 'Materials estimates for the first Homes Near Work site are above the working range.', lastSeen: 'Yesterday', communityVisible: false },
  { id: 'i-3', title: 'Shoreline access after rain', area: 'Climate', severity: 'low', status: 'open', signalCount: 17, summary: 'The temporary path near Rusinga needs a safer surface before the next wet season.', lastSeen: '2d ago', communityVisible: true },
];
const polls: Poll[] = [
  { id: 'p-1', question: 'Where should the next Homa Bay Connector listening stop be?', closes: 'Closes Friday', responses: 184, context: 'Your answer helps the team plan the next public working session.', options: [{ label: 'Mbita', votes: 92 }, { label: 'Ndhiwa', votes: 55 }, { label: 'Kendu Bay', votes: 37 }] },
  { id: 'p-2', question: 'What would make the lakeshore path feel more welcoming?', closes: 'Closes in 9 days', responses: 126, context: 'We are collecting practical details before the design review.', options: [{ label: 'More shade', votes: 49 }, { label: 'Clearer signs', votes: 43 }, { label: 'Places to sit', votes: 34 }] },
];
const events: Event[] = [
  { id: 'e-1', title: 'Homa Bay Connector: route by route', date: 'Aug 22', time: '18:00–19:30', location: 'Mbita Social Hall', kind: 'listening', seats: '14 places left', description: 'Bring the trip you make most often. We will map what works and what does not.' },
  { id: 'e-2', title: 'Homes Near Work workshop', date: 'Aug 28', time: '12:00–13:30', location: 'Online / open room', kind: 'workshop', seats: 'Open to all', description: 'A plain-language walk through the first site plan and the choices still open.' },
  { id: 'e-3', title: 'Rusinga shoreline field day', date: 'Sep 06', time: '09:00–11:00', location: 'Rusinga lakeshore entrance', kind: 'milestone', seats: 'Bring a neighbor', description: 'See the first section of restored shoreline and help mark the next one.' },
];
const manifesto: ManifestoItem[] = [
  { id: 'm-1', number: '01', title: 'Start with the real day.', body: 'Good plans begin with the routes, costs, and small frictions people already know.' },
  { id: 'm-2', number: '02', title: 'Make progress visible.', body: 'A promise is more useful when you can see its next step, its owner, and its evidence.' },
  { id: 'm-3', number: '03', title: 'Leave room for correction.', body: 'Listening is not a launch event. It is the operating rhythm.' },
];
const analytics: Analytics = {
  activity: [{ label: 'Mon', value: 41 }, { label: 'Tue', value: 58 }, { label: 'Wed', value: 47 }, { label: 'Thu', value: 72 }, { label: 'Fri', value: 64 }, { label: 'Sat', value: 83 }, { label: 'Sun', value: 69 }],
  regions: [{ name: 'Homa Bay Town', value: 82, note: 'steady' }, { name: 'Mbita', value: 67, note: 'growing' }, { name: 'Ndhiwa', value: 54, note: 'watch' }, { name: 'Rangwe', value: 39, note: 'quiet' }],
  pulseHistory: [{ label: 'W1', score: 72 }, { label: 'W2', score: 75 }, { label: 'W3', score: 79 }, { label: 'W4', score: 76 }, { label: 'W5', score: 83 }, { label: 'W6', score: 87 }],
};

export const localRepository: PulseRepository = {
  getCampaign: () => campaign, getProjects: () => projects, getIssues: () => issues,
  getPolls: () => polls, getEvents: () => events, getManifesto: () => manifesto,
  getAnalytics: () => analytics,
};