// Pulled from the app's own tokens in src/index.css so the promo and the
// product it advertises stay the same colour story.
export const color = {
  bg: '#0a0a0c',
  bgWarm: '#12110f',
  panel: '#16161a',
  panelSoft: '#1d1d23',
  hairline: 'rgba(255,255,255,0.08)',
  ink: '#f4f1ea',
  inkMuted: '#9d968a',
  inkFaint: '#6b665e',
  accent: '#e2b877',
  accentSoft: 'rgba(226,184,119,0.13)',
  accentDeep: '#b98a45',
} as const

// 1080x1920 delivery: keep type and UI clear of the platform's own chrome.
export const safe = {
  x: 80,
  top: 100,
  bottom: 100,
} as const

export const fps = 30
export const width = 1080
export const height = 1920
