import { createTranslator } from 'next-intl'

import uz from '@/locales/uz.json'

/**
 * Sayt faqat o'zbekcha. Avval bu yerda 20 ta tilning JSON fayllari (~3.2 MB)
 * _app bundle'iga import qilinardi — har bir sahifa yuklanishini sekinlashtirardi.
 */
const translator = createTranslator({ locale: 'uz', messages: uz as any })

export const uzMessages = uz

export function useFallbackMessage() {
  function getFallbackMessage(key: string): string {
    try {
      return translator(key as any)
    } catch {
      return key
    }
  }
  return { getFallbackMessage }
}
