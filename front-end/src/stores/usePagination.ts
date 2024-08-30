import {ref} from 'vue'
import {defineStore} from 'pinia'
import {PERSIST_CONFIG} from "@/utils/local-storage";
import {SYSTEM_NAME} from "@/utils/cache-key";

export const usePaginationStore = defineStore(`${SYSTEM_NAME}-pagination`, () => {
  const isPaging = ref(true)
  const currentPage = ref(1)
  const pageSize = ref(30)

  const resetCurrentPage = () => {
    currentPage.value = 1;
  }

  return {isPaging, currentPage, pageSize, resetCurrentPage}
}, {
  // @ts-ignore
  persist: PERSIST_CONFIG,
})
