export type CreationFormat =
  | 'android-app'
  | 'ios-app'
  | 'responsive-web-app'
  | 'desktop-app'
  | 'dashboard'
  | 'mobile-utility'
  | 'multi-screen-app'
  | 'single-purpose-tool'
  | 'website-landing'
  | 'idea-decides';

export type CreationFormatProfile = Readonly<{
  creationFormat: CreationFormat;
  label: string;
  medium: string | null;
  guidance: readonly string[];
}>;

export const creationFormatOptions: readonly CreationFormatProfile[] = [
  {
    creationFormat: 'android-app',
    label: 'Android App',
    medium: 'Android',
    guidance: [
      'Use Android/mobile interaction conventions with thumb-friendly controls.',
      'Prefer platform-appropriate app bars, bottom sheets, dialogs, and portrait-first responsive layouts.',
      'Keep navigation native-feeling and avoid desktop dashboard patterns unless explicitly requested.'
    ]
  },
  {
    creationFormat: 'ios-app',
    label: 'iOS App',
    medium: 'iOS',
    guidance: [
      'Use iOS/mobile interaction conventions with touch-friendly controls and clear navigation hierarchy.',
      'Prefer native-feeling sheets, navigation bars, safe-area spacing, and portrait-first layouts.',
      'Avoid desktop dashboard patterns unless explicitly requested.'
    ]
  },
  {
    creationFormat: 'responsive-web-app',
    label: 'Responsive Web App',
    medium: 'Responsive web',
    guidance: [
      'Use responsive web-app structure that adapts cleanly from mobile through desktop widths.',
      'Keep navigation and controls appropriate to a browser-based application rather than a marketing site.',
      'Use progressive layout expansion instead of simply stretching mobile cards across wide screens.'
    ]
  },
  {
    creationFormat: 'desktop-app',
    label: 'Desktop App',
    medium: 'Desktop',
    guidance: [
      'Use desktop application conventions with efficient pointer and keyboard interaction.',
      'Use the wider canvas deliberately while keeping hierarchy focused and readable.',
      'Do not force mobile navigation patterns into the desktop experience.'
    ]
  },
  {
    creationFormat: 'dashboard',
    label: 'Dashboard',
    medium: 'Dashboard',
    guidance: [
      'Use a dashboard layout only because this format was explicitly selected.',
      'Prioritize scannable information hierarchy, clear grouping, and high-value controls over decorative card density.',
      'Keep the dashboard focused on the locked job and avoid unrelated analytics or admin modules.'
    ]
  },
  {
    creationFormat: 'mobile-utility',
    label: 'Mobile Utility',
    medium: 'Mobile utility',
    guidance: [
      'Use a compact mobile utility structure optimized for fast repeat use and one-hand interaction.',
      'Keep the primary action immediately reachable and minimize navigation depth.',
      'Avoid dashboard density and unnecessary secondary destinations.'
    ]
  },
  {
    creationFormat: 'multi-screen-app',
    label: 'Multi-Screen App',
    medium: 'Multi-screen app',
    guidance: [
      'Use a coherent multi-screen application structure only around screens justified by the locked requirements.',
      'Make transitions, back behavior, and state continuity predictable across screens.',
      'Do not invent extra screens merely to make the app feel larger.'
    ]
  },
  {
    creationFormat: 'single-purpose-tool',
    label: 'Single-Purpose Tool',
    medium: 'Single-purpose tool',
    guidance: [
      'Keep the experience centered on one primary job with the shortest practical path to completion.',
      'Prefer one dominant action and only the supporting states necessary to complete the locked task.',
      'Reject dashboard expansion, feature sprawl, and unrelated navigation.'
    ]
  },
  {
    creationFormat: 'website-landing',
    label: 'Website / Landing Page',
    medium: 'Website / landing page',
    guidance: [
      'Use website or landing-page information hierarchy with clear section flow and responsive composition.',
      'Prioritize message clarity, visual storytelling, and intentional calls to action where the locked idea supports them.',
      'Do not introduce application dashboards or account flows unless explicitly requested.'
    ]
  },
  {
    creationFormat: 'idea-decides',
    label: 'Let the idea decide',
    medium: null,
    guidance: []
  }
] as const;

export function getCreationFormatProfile(creationFormat: CreationFormat): CreationFormatProfile {
  return creationFormatOptions.find(option => option.creationFormat === creationFormat)!;
}
