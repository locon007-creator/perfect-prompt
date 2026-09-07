export type VisualStyle = 'premium-modern' | 'apple-minimal' | 'figma-product' | 'bold-cinematic' | 'clean-utility' | 'custom';

export type VisualStyleProfile = Readonly<{
  visualStyle: VisualStyle;
  label: string;
  role: string;
  emphasis: readonly string[];
}>;

const profiles: Record<VisualStyle, VisualStyleProfile> = {
  'premium-modern': {
    visualStyle: 'premium-modern',
    label: 'Premium Modern',
    role: 'You are a Senior Product UI/UX Designer and Design Systems Specialist.',
    emphasis: ['premium hierarchy','refined typography','balanced spacing','modern surfaces','subtle motion','production polish']
  },
  'apple-minimal': {
    visualStyle: 'apple-minimal',
    label: 'Apple-Level Minimal',
    role: 'You are a Senior Mobile UI/UX Designer and Interaction Design Specialist.',
    emphasis: ['restraint','clarity','precise spacing','native-feeling interactions','calm surfaces','high legibility']
  },
  'figma-product': {
    visualStyle: 'figma-product',
    label: 'Figma-Level Product Design',
    role: 'You are a Product Design Lead and Design Systems Specialist.',
    emphasis: ['systematic hierarchy','component consistency','layout rhythm','responsive product UI','design tokens','handoff-ready polish']
  },
  'bold-cinematic': {
    visualStyle: 'bold-cinematic',
    label: 'Bold / Cinematic',
    role: 'You are a Creative UI Director and Motion / Visual Experience Designer.',
    emphasis: ['dramatic hierarchy','depth','controlled contrast','cinematic composition','purposeful motion','strong visual moments']
  },
  'clean-utility': {
    visualStyle: 'clean-utility',
    label: 'Clean Utility',
    role: 'You are a Utility UX Designer and Information Hierarchy Specialist.',
    emphasis: ['speed','clarity','dense-but-readable information','thumb-friendly controls','low friction','minimal decoration']
  },
  custom: {
    visualStyle: 'custom',
    label: 'Custom / Let the idea decide',
    role: 'You are a design specialist who follows only the explicit visual direction in the user idea.',
    emphasis: ['explicit user visual requirements only','no invented visual style','preserve stated design constraints']
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