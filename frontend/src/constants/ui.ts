// UI constants
export const COLORS = {
  PRIMARY: 'hsl(var(--primary))',
  SECONDARY: 'hsl(var(--secondary))',
  ACCENT: 'hsl(var(--accent))',
  MUTED: 'hsl(var(--muted))',
  DESTRUCTIVE: 'hsl(var(--destructive))',
  SUCCESS: 'hsl(var(--success))',
  WARNING: 'hsl(var(--warning))',
} as const;

export const SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
} as const;

export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;

export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;

export const ANIMATION_DURATION = {
  FAST: '150ms',
  NORMAL: '300ms',
  SLOW: '500ms',
} as const;

export const TOAST_DURATION = {
  SHORT: 3000,
  NORMAL: 5000,
  LONG: 8000,
} as const;
