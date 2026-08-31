import type { CSSProperties } from 'react';
import type { Theme } from './ui/store';

export const ACCENT = '#127A63';

// Ported from Component.themeVars() in the source .dc.html.
export function themeVars(theme: Theme, accent: string): CSSProperties {
  if (theme === 'dark') {
    return {
      '--brand-primary': `color-mix(in srgb, ${accent} 74%, #fff)`,
      '--brand-on-primary': '#06120E',
      '--fg-brand': `color-mix(in srgb, ${accent} 56%, #fff)`,
      '--bg-brand-subtle': `color-mix(in srgb, ${accent} 22%, #0C100F)`,
      '--border-brand': `color-mix(in srgb, ${accent} 46%, #1a2220)`,
      '--shadow-ring-primary': 'inset 0 0 0 1px rgba(255,255,255,.08)',
      '--bg-app': '#0B0F0E',
      '--bg-primary': '#141A18',
      '--bg-secondary': '#1A211F',
      '--bg-tertiary': '#222A28',
      '--fg-primary': '#EDF2F0',
      '--fg-secondary': '#B4BEBB',
      '--fg-tertiary': '#7C8784',
      '--fg-quaternary': '#5C6764',
      '--border-subtle': '#222A28',
      '--border-default': '#303A37',
      '--card-shadow': '0 1px 2px rgba(0,0,0,.4)',
      '--stage-bg': '#070C0A',
      '--ease-out': 'cubic-bezier(0.16,1,0.3,1)',
    } as CSSProperties;
  }
  return {
    '--brand-primary': accent,
    '--brand-on-primary': '#fff',
    '--fg-brand': `color-mix(in srgb, ${accent} 84%, #000)`,
    '--bg-brand-subtle': `color-mix(in srgb, ${accent} 9%, #fff)`,
    '--border-brand': `color-mix(in srgb, ${accent} 26%, #fff)`,
    '--shadow-ring-primary': 'inset 0 0 0 1px rgba(0,0,0,.10), 0 1px 2px rgba(16,24,40,.08)',
    '--bg-app': '#F5F7F5',
    '--bg-primary': '#FFFFFF',
    '--bg-secondary': '#F6F8F7',
    '--bg-tertiary': '#ECEFED',
    '--fg-primary': '#101715',
    '--fg-secondary': '#3E4A47',
    '--fg-tertiary': '#6E7A77',
    '--fg-quaternary': '#9AA5A2',
    '--border-subtle': '#EAEEEC',
    '--border-default': '#D8DEDB',
    '--card-shadow': '0 1px 2px rgba(16,24,40,.05)',
    '--stage-bg': '#E6EBE8',
    '--ease-out': 'cubic-bezier(0.16,1,0.3,1)',
  } as CSSProperties;
}
