/** Shared spring presets. Kept in one place so every step feels the same. */

/** Snappy press for hover/tap on buttons, switcher cards and list rows. */
export const press = { type: 'spring', stiffness: 520, damping: 24 }

/** Main step entrance — calm but confident. */
export const stepSpring = { type: 'spring', stiffness: 420, damping: 26 }

/** Step exit — a touch softer than the entrance. */
export const stepSpringBack = { type: 'spring', stiffness: 240, damping: 25 }

/** Small popups (badges, dots). */
export const popupSpring = { type: 'spring', stiffness: 220, damping: 24 }

/** Slow, relaxed spring used by the price roll. */
export const comfortSpring = { type: 'spring', stiffness: 120, damping: 22 }