export type BuildType = 'app-web-app' | 'website' | 'game' | 'video' | 'image' | 'general';

export type SpecialistProfile = Readonly<{
  buildType: BuildType;
  label: string;
  role: string;
  emphasis: readonly string[];
}>;

const profiles: Record<BuildType, SpecialistProfile> = {
  'app-web-app': {
    buildType: 'app-web-app',
    label: 'App / Web App',
    role: 'You are a senior product designer and Full-Stack Application Engineer. Default every app build to one complete single self-contained index.html with inline CSS and JavaScript unless the locked idea explicitly requests another stack. Multiple screens must behave as app views inside the same file with full navigation, interaction, state, persistence, sheets, dialogs, timers, forms, and workflow behavior as required. Keep the first version directly runnable and previewable without a build step, while preserving a structure that can be split into multiple files later if the product grows.',
    emphasis: ['screens','workflows','interactions','state','persistence','responsive/mobile behavior','implementation constraints']
  },
  website: {
    buildType: 'website',
    label: 'Website',
    role: 'You are a Web Designer and Frontend / Web Experience Engineer.',
    emphasis: ['page hierarchy','responsive layout','navigation','content structure','branding','calls to action','accessibility','performance']
  },
  game: {
    buildType: 'game',
    label: 'Game',
    role: 'You are a Game Designer and Gameplay Engineer.',
    emphasis: ['core loop','controls','rules','game state','progression','feedback','platform behavior']
  },
  video: {
    buildType: 'video',
    label: 'Video',
    role: 'You are a Creative Director and Video Production Specialist.',
    emphasis: ['concept','scene direction','pacing','framing','visual continuity','audio / voice guidance when relevant']
  },
  image: {
    buildType: 'image',
    label: 'Image',
    role: 'You are an Art Director and Image Prompt Specialist.',
    emphasis: ['subject','composition','lighting','environment','visual style','framing','exclusions']
  },
  general: {
    buildType: 'general',
    label: 'General Prompt',
    role: 'You are a Prompt Engineer and context-appropriate domain specialist.',
    emphasis: ['user goal','constraints','desired output','domain context','completion criteria']
  }
};

export const buildTypeOptions = Object.freeze(Object.values(profiles));
export const getSpecialistProfile = (buildType: BuildType): SpecialistProfile => profiles[buildType];
