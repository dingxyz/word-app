export const SYSTEM_NAME = "app-v1"

/** 缓存数据时用到的 Key */
class CacheKey {
  static readonly TOKEN = `${SYSTEM_NAME}-token-key`
  static readonly WORD_TYPE = `${SYSTEM_NAME}-word-type-key`
  static readonly PAGE_SIZE = `${SYSTEM_NAME}-page-size-key`
  static readonly CURRENT_PAGE = `${SYSTEM_NAME}-current-page-key`
  static readonly IS_PAGING = `${SYSTEM_NAME}-is-paging-key`
}

export default CacheKey
