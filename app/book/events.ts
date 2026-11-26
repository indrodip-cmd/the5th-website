/* Tiny event bridge so any interactive block can tell the progress chip a step is done. */
export function mark(k: string) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('bk-step', { detail: k }))
}
