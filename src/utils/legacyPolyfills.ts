/**
 * Eski Safari (iOS 13–15.3) uchun mayda polyfill'lar.
 * Next'ning ichki kodi `.at()` va `structuredClone` ishlatadi — ular iOS 15.4 dan oldin yo'q.
 * Bu fayl _app.tsx da ENG BIRINCHI import bo'lishi shart.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
function at(this: any, n: number) {
  n = Math.trunc(n) || 0
  if (n < 0) n += this.length
  if (n < 0 || n >= this.length) return undefined
  return this[n]
}

for (const proto of [Array.prototype, String.prototype] as any[]) {
  if (typeof proto.at !== 'function') {
    Object.defineProperty(proto, 'at', { value: at, writable: true, configurable: true })
  }
}

if (typeof globalThis.structuredClone !== 'function') {
  // Oddiy JSON nusxa — Next router ichki obyektlari uchun yetarli
  ;(globalThis as any).structuredClone = (v: any) =>
    v === undefined ? v : JSON.parse(JSON.stringify(v))
}

export {}
