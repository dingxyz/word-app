/** Unified localStorage handling */
import CacheKey from "@/utils/cache-key"
import {WORD_TYPE} from "@/stores/useApp";

export const getWordType = () => {
  const val = localStorage.getItem(CacheKey.WORD_TYPE)
  return val || WORD_TYPE.WORDS
}
export const setWordType = (val: string) => {
  localStorage.setItem(CacheKey.WORD_TYPE, val)
}

export const getIsPaging = () => {
  const val = localStorage.getItem(CacheKey.IS_PAGING)
  return val === "true"
}
export const setIsPaging = (val: boolean) => {
  localStorage.setItem(CacheKey.IS_PAGING, JSON.stringify(val))
}


export const getPageSize = () => {
  const val = localStorage.getItem(CacheKey.PAGE_SIZE)
  return +(val ?? 30)
}
export const setPageSize = (val: number) => {
  localStorage.setItem(CacheKey.PAGE_SIZE, JSON.stringify(val))
}


export const getCurrentPage = () => {
  const val = localStorage.getItem(CacheKey.CURRENT_PAGE)
  return +(val ?? 1)
}
export const setCurrentPage = (val: number) => {
  localStorage.setItem(CacheKey.CURRENT_PAGE, JSON.stringify(val))
}


