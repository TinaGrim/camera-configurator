import { create } from 'zustand'
import { CAMERAS, qtyMinFor } from '../utils/pricing'

export const STEPS = ['landing', 'choose', 'customize', 'review', 'handoff']

const ACC_IDS = ['leather-keychain', 'lens-cap', 'shoulder-strap']

const MAX_QUANTITY = 12

export const useConfiguratorStore = create((set, get) => ({
  step: 'landing',
  direction: 0,
  selectedCameraId: 'aurora-x7',
  selectedAccessoryIds: [],
  quantities: {},
  completedOrder: null,
  handoffMode: null,

  goto: (step) => {
    const cur = STEPS.indexOf(get().step)
    const next = STEPS.indexOf(step)
    set({ step, direction: next >= cur ? 1 : -1 })
  },
  next: () => {
    const { step } = get()
    const idx = STEPS.indexOf(step)
    if (idx >= 0 && idx < STEPS.length - 1) set({ step: STEPS[idx + 1], direction: 1 })
  },
  back: () => {
    const { step } = get()
    const idx = STEPS.indexOf(step)
    if (idx > 0) set({ step: STEPS[idx - 1], direction: -1 })
  },

  selectCamera: (id) => set({ selectedCameraId: id }),
  cycleCamera: (dir) => {
    const { selectedCameraId } = get()
    const ids = CAMERAS.map((c) => c.id)
    const idx = ids.indexOf(selectedCameraId)
    const next = ids[(idx + dir + ids.length) % ids.length]
    set({ selectedCameraId: next })
  },

  selectAccessory: (id) =>
    set((s) => ({ selectedAccessoryIds: [...s.selectedAccessoryIds, id] })),
  focusAccessory: (id) =>
    set((s) => ({
      selectedAccessoryIds: [...s.selectedAccessoryIds.filter((x) => x !== id), id],
    })),
  skipAccessory: () => set({ selectedAccessoryIds: [] }),
  cycleAccessory: (dir) => {
    const { selectedAccessoryIds } = get()
    if (dir > 0) {
      const next = ACC_IDS.find((id) => !selectedAccessoryIds.includes(id))
      if (next) set({ selectedAccessoryIds: [...selectedAccessoryIds, next] })
    } else if (selectedAccessoryIds.length > 0) {
      set({ selectedAccessoryIds: selectedAccessoryIds.slice(0, -1) })
    }
  },

  setItemQuantity: (id, n) =>
    set((s) => ({
      quantities: {
        ...s.quantities,
        [id]: Math.min(MAX_QUANTITY, Math.max(qtyMinFor(id), Math.round(n))),
      },
    })),

  completeOrder: (order) => set({ completedOrder: order, handoffMode: null }),
  setHandoffMode: (mode) => set({ handoffMode: mode }),

  restart: () =>
    set({
      step: 'landing',
      direction: 0,
      selectedAccessoryIds: [],
      quantities: {},
      completedOrder: null,
      handoffMode: null,
    }),
}))