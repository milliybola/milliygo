import { useMemo } from 'react'
import { useStorageValue, writeStorage } from './session'

const KEY = 'go_fav_partners'

/** Sevimli maskanlar (superapp FavoritesController): login talab qilinmaydi, brauzerda saqlanadi */
export function useFavoriteIds() {
  const raw = useStorageValue(KEY)
  const ids = useMemo<string[]>(() => {
    try {
      const v = JSON.parse(raw || '[]')
      return Array.isArray(v) ? v : []
    } catch {
      return []
    }
  }, [raw])
  const toggle = (uuid: string) =>
    writeStorage(
      KEY,
      JSON.stringify(ids.includes(uuid) ? ids.filter((x) => x !== uuid) : [...ids, uuid])
    )
  return { ids, has: (uuid?: string) => !!uuid && ids.includes(uuid), toggle }
}

export function useFavorite(uuid?: string) {
  const { has, toggle } = useFavoriteIds()
  return { fav: has(uuid), toggle: () => uuid && toggle(uuid) }
}
