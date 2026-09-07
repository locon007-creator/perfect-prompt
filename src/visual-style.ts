export type VisualStyle = 'premium-modern' | 'apple-minimal' | 'figma-product' | 'bold-cinematic' | 'clean-utility' | 'custom';

export type VisualStyleProfile = Readonly<{
  visualStyle: VisualStyle;
  label: string;
  role: string;
  emphasis: readonly string[];
  quality: readonly string[];
}>;

const profiles: Record<VisualStyle, VisualStyleProfile> = {
  'premium-modern': {
    visualStyle: 'premium-modern',
    label: 'Premium Modern',
    role: 'Also act as a Senior Product UI/UX Designer and Design Systems Specialist.',
    emphasis: ['premium hierarchy','refined typography','balanced spacing','modern surfaces','subtle motion','production polish'],
    quality: [
      'Create a distinct visual identity appropriate to the product, including a simple branded mark or wordmark when it improves recognition.',
      'Make the first screen feel intentionally composed and immediately communicate the product purpose; treat weak first-screen presentation as a failed design.',
      'Use polished micro-interactions, animated feedback, and smooth transitions for primary actions without adding decorative motion that slows the task.',
      'Design empty, loading, success, and error states with the same production polish as the main flow.',
      'Avoid a generic template look, default dashboard composition, arbitrary cards, and stock component styling; every surface should feel product-specific.'
    ]
  },
  'apple-minimal': {
    visualStyle: 'apple-minimal',
    label: 'Apple-Level Minimal',
    role: 'Also act as a Senior Mobile UI/UX Designer and Interaction Design Specialist.',
    emphasis: ['restraint','clarity','precise spacing','native-feeling interactions','calm surfaces','high legibility'],
    quality: [
      'Create a quiet, recognizable visual identity with a restrained app mark or wordmark when appropriate; branding must never compete with the task.',
      'Make the first screen immediately legible, balanced, and purposeful with disciplined hierarchy and generous negative space.',
      'Use subtle native-feeling motion, direct manipulation feedback, and refined state transitions instead of flashy animation.',
      'Keep typography, iconography, spacing, and controls exceptionally consistent across every state.',
      'Avoid a generic template look, ornamental dashboard clutter, oversized gradients, and decorative UI that does not improve clarity.'
    ]
  },
  'figma-product': {
    visualStyle: 'figma-product',
    label: 'Figma-Level Product Design',
    role: 'Also act as a Product Design Lead and Design Systems Specialist.',
    emphasis: ['systematic hierarchy','component consistency','layout rhythm','responsive product UI','design tokens','handoff-ready polish'],
    quality: [
      'Create a coherent visual identity and product-specific brand language that can be expressed through a simple mark, wordmark, icon system, and reusable design tokens.',
      'Make the first screen a polished design-system showcase that communicates the primary job without unnecessary dashboard density.',
      'Use component consistency, deliberate interaction states, and polished micro-interactions across controls, sheets, dialogs, and navigation.',
      'Define clear typography, spacing, radius, elevation, and icon rules so the interface feels designed as one system rather than assembled from defaults.',
      'Reject generic template patterns and placeholder styling; every reusable component should look production-ready and product-specific.'
    ]
  },
  'bold-cinematic': {
    visualStyle: 'bold-cinematic',
    label: 'Bold / Cinematic',
    role: 'Also act as a Creative UI Director and Motion / Visual Experience Designer.',
    emphasis: ['dramatic hierarchy','depth','controlled contrast','cinematic composition','purposeful motion','strong visual moments'],
    quality: [
      'Create a memorable visual identity with a strong branded mark or wordmark when appropriate to the product.',
      'Make the first screen a cinematic visual moment with dramatic hierarchy, depth, and a clear focal action while keeping the product purpose obvious.',
      'Use purposeful motion, scene-like transitions, layered feedback, and expressive micro-interactions that support orientation and momentum.',
      'Carry the cinematic language into loading, success, empty, and transition states instead of limiting it to a hero screen.',
      'Avoid generic template composition and random visual effects; every dramatic choice must support the product story and primary task.'
    ]
  },
  'clean-utility': {
    visualStyle: 'clean-utility',
    label: 'Clean Utility',
    role: 'Also act as a Utility UX Designer and Information Hierarchy Specialist.',
    emphasis: ['speed','clarity','dense-but-readable information','thumb-friendly controls','low friction','minimal decoration'],
    quality: [
      'Create a simple visual identity that makes the utility recognizable without adding decorative branding that slows use.',
      'Make the first screen instantly actionable with one obvious primary task and no unnecessary dashboard clutter.',
      'Use restrained motion and fast micro-feedback only where it confirms actions, state changes, or navigation.',
      'Keep controls, typography, spacing, icons, and information density consistent and highly legible.',
      'Avoid a generic template look, decorative cards, unnecessary gradients, and dead static states; utility should still feel deliberate and finished.'
    ]
  },
  custom: {
    visualStyle: 'custom',
    label: 'Custom / Let the idea decide',
    role: 'Also act as a design specialist who follows only the explicit visual direction in the user idea.',
    emphasis: ['explicit user visual requirements only','no invented visual style','preserve stated design constraints'],
    quality: []
  }
};

export const visualStyleOptions: readonly VisualStyleProfile[] = Object.freeze([
  profiles['premium-modern'],
  profiles['apple-minimal'],
  profiles['figma-product'],
  profiles['bold-cinematic'],
  profiles['clean-utility'],
  profiles.custom
]);

export const getVisualStyleProfile = (visualStyle: VisualStyle): VisualStyleProfile => profiles[visualStyle];