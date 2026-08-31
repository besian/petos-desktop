import type { CSSProperties } from 'react';

/**
 * Parses a CSS declaration string ("display:flex;gap:10px") into a React
 * style object. Lets view code carry the original design's inline-style
 * strings almost verbatim instead of hand-transcribing each one into a
 * JS object, which is what makes this file-for-file port of the .dc.html
 * source tractable at this scale.
 */
export function st(css: string | undefined | null): CSSProperties {
  const out: Record<string, string> = {};
  if (!css) return out as CSSProperties;
  for (const rule of css.split(';')) {
    const idx = rule.indexOf(':');
    if (idx === -1) continue;
    const prop = rule.slice(0, idx).trim();
    const val = rule.slice(idx + 1).trim();
    if (!prop || !val) continue;
    const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[camel] = val;
  }
  return out as CSSProperties;
}
