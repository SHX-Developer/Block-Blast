/**
 * Theme system for Block Blast.
 *
 * Each theme provides:
 *   - a name + id
 *   - a colorMap: original shape hex → themed hex (so shape "identity" is preserved
 *     across themes — same shape always uses the equivalent themed color)
 *   - cssVars: a flat record of CSS variable values applied to <body>
 */

export type ThemeId = 'classic' | 'aesthetic';

export interface Theme {
  id: ThemeId;
  name: string;
  tagline: string;
  /** Sample colors used as palette preview swatches on the menu */
  swatches: string[];
  /** Maps original shape hex (lowercase) → themed hex */
  colorMap: Record<string, string>;
  /** Applied as `style="--var: value; ..."` on root */
  cssVars: Record<string, string>;
}

const CLASSIC: Theme = {
  id: 'classic',
  name: 'Classic',
  tagline: 'Neon cosmic',
  swatches: ['#FF6B81', '#FFC312', '#2ECC71', '#17C0EB', '#6C5CE7', '#FD79A8'],
  colorMap: {
    '#ff6b81': '#FF6B81',
    '#ff9f43': '#FF9F43',
    '#ffc312': '#FFC312',
    '#2ecc71': '#2ECC71',
    '#17c0eb': '#17C0EB',
    '#f8b500': '#F8B500',
    '#e55039': '#E55039',
    '#a29bfe': '#A29BFE',
    '#6c5ce7': '#6C5CE7',
    '#00d2d3': '#00D2D3',
    '#fd79a8': '#FD79A8',
    '#55efc4': '#55EFC4',
  },
  cssVars: {
    '--bg-base': '#0D0D1A',
    '--bg-gradient':
      'radial-gradient(ellipse at 50% 0%, rgba(100, 80, 255, 0.12) 0%, transparent 65%), linear-gradient(160deg, #0D0D1A 0%, #131328 50%, #0A1525 100%)',
    '--text-primary': '#FFFFFF',
    '--text-secondary': 'rgba(224, 224, 255, 0.45)',
    '--text-muted': 'rgba(224, 224, 255, 0.4)',

    '--board-bg': '#0A1020',
    '--board-shadow':
      '0 0 0 1px rgba(255, 255, 255, 0.05), 0 24px 64px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(0, 0, 0, 0.4)',
    '--cell-empty-bg': '#192038',
    '--cell-empty-shadow': 'inset 0 1px 3px rgba(0, 0, 0, 0.45)',

    '--card-bg': 'rgba(255, 255, 255, 0.04)',
    '--card-border': 'rgba(255, 255, 255, 0.08)',
    '--card-hover-border': 'rgba(255, 255, 255, 0.14)',
    '--card-shadow': '0 4px 16px rgba(0, 0, 0, 0.3)',
    '--card-shadow-hover': '0 8px 28px rgba(0, 0, 0, 0.4)',

    '--accent-primary': '#7C5CFC',
    '--accent-secondary': '#5C3FDE',
    '--accent-glow': 'rgba(100, 80, 255, 0.45)',
    '--accent-glow-strong': 'rgba(100, 80, 255, 0.55)',
    '--score-glow': 'rgba(150, 130, 255, 0.5)',

    '--best-color': '#FFD700',
    '--best-glow': 'rgba(255, 215, 0, 0.4)',
    '--combo-color': '#FFD650',
    '--combo-glow': 'rgba(255, 214, 80, 0.7)',
    '--combo-text': 'rgba(255, 215, 80, 0.7)',

    '--modal-bg': 'linear-gradient(160deg, #1A1A38 0%, #141430 100%)',
    '--modal-border': 'rgba(255, 255, 255, 0.1)',
    '--modal-scores-bg': 'rgba(0, 0, 0, 0.25)',
    '--modal-divider': 'rgba(255, 255, 255, 0.07)',
    '--modal-overlay': 'rgba(5, 5, 18, 0.82)',

    '--preview-glow': 'rgba(255, 255, 180, 0.35)',
    '--cell-highlight': 'rgba(255, 255, 255, 0.28)',
    '--cell-lowlight': 'rgba(0, 0, 0, 0.2)',
  },
};

const AESTHETIC: Theme = {
  id: 'aesthetic',
  name: 'Aesthetic',
  tagline: 'Pastel dream',
  swatches: ['#F4A5B8', '#FBC59F', '#A9D6E5', '#B8E6D2', '#C9C2F1', '#F5B3CB'],
  colorMap: {
    '#ff6b81': '#F4A5B8', // rose → soft rose
    '#ff9f43': '#FBC59F', // orange → peach
    '#ffc312': '#F5D689', // yellow → buttercream
    '#2ecc71': '#B8E0BC', // green → mint
    '#17c0eb': '#A9D6E5', // cyan → sky
    '#f8b500': '#F0C77E', // amber → sand
    '#e55039': '#E9A89A', // red → terracotta
    '#a29bfe': '#D0C9F0', // lavender → soft lavender
    '#6c5ce7': '#B5A8E0', // purple → dusty purple
    '#00d2d3': '#A3DDD9', // teal → sage
    '#fd79a8': '#F5B3CB', // pink → blush
    '#55efc4': '#B8E6D2', // mint → light mint
  },
  cssVars: {
    '--bg-base': '#FCEEF1',
    '--bg-gradient':
      'radial-gradient(ellipse at 20% 0%, rgba(245, 195, 215, 0.55) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(190, 215, 240, 0.55) 0%, transparent 60%), linear-gradient(160deg, #FCEEF1 0%, #F2E6F5 45%, #E8EEF8 100%)',
    '--text-primary': '#3A3450',
    '--text-secondary': 'rgba(80, 70, 110, 0.6)',
    '--text-muted': 'rgba(80, 70, 110, 0.55)',

    '--board-bg': '#FFFFFF',
    '--board-shadow':
      '0 0 0 1px rgba(180, 160, 210, 0.18), 0 24px 60px rgba(180, 140, 210, 0.18), 0 4px 16px rgba(160, 130, 200, 0.12)',
    '--cell-empty-bg': '#F2E8EE',
    '--cell-empty-shadow': 'inset 0 1px 2px rgba(180, 160, 200, 0.18)',

    '--card-bg': 'rgba(255, 255, 255, 0.7)',
    '--card-border': 'rgba(200, 180, 220, 0.5)',
    '--card-hover-border': 'rgba(180, 150, 210, 0.8)',
    '--card-shadow': '0 4px 18px rgba(190, 160, 220, 0.18)',
    '--card-shadow-hover': '0 10px 30px rgba(190, 160, 220, 0.28)',

    '--accent-primary': '#E5A8C4',
    '--accent-secondary': '#C997D9',
    '--accent-glow': 'rgba(220, 170, 210, 0.45)',
    '--accent-glow-strong': 'rgba(220, 170, 210, 0.6)',
    '--score-glow': 'rgba(220, 180, 230, 0.5)',

    '--best-color': '#E89B6E',
    '--best-glow': 'rgba(232, 155, 110, 0.35)',
    '--combo-color': '#D27FA8',
    '--combo-glow': 'rgba(210, 127, 168, 0.6)',
    '--combo-text': 'rgba(180, 110, 150, 0.75)',

    '--modal-bg': 'linear-gradient(160deg, #FFF6F8 0%, #F4EBF3 100%)',
    '--modal-border': 'rgba(200, 180, 220, 0.4)',
    '--modal-scores-bg': 'rgba(255, 255, 255, 0.7)',
    '--modal-divider': 'rgba(200, 180, 220, 0.25)',
    '--modal-overlay': 'rgba(220, 200, 230, 0.55)',

    '--preview-glow': 'rgba(255, 215, 235, 0.6)',
    '--cell-highlight': 'rgba(255, 255, 255, 0.55)',
    '--cell-lowlight': 'rgba(80, 60, 100, 0.08)',
  },
};

export const THEMES: Record<ThemeId, Theme> = {
  classic: CLASSIC,
  aesthetic: AESTHETIC,
};

export const THEME_ORDER: ThemeId[] = ['classic', 'aesthetic'];

/** Map an original shape color to the themed equivalent. */
export function mapShapeColor(color: string, themeId: ThemeId): string {
  if (!color) return color;
  const theme = THEMES[themeId] ?? CLASSIC;
  const key = color.toLowerCase();
  return theme.colorMap[key] ?? color;
}

/** Apply theme CSS vars to <html> root element. */
export function applyTheme(themeId: ThemeId): void {
  const theme = THEMES[themeId] ?? CLASSIC;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.cssVars)) {
    root.style.setProperty(key, value);
  }
  root.setAttribute('data-theme', themeId);
}
