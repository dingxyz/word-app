import {ref, watchEffect} from 'vue'
import {defineStore} from 'pinia'
import {getCurrentPage, getIsPaging, getPageSize, setCurrentPage, setIsPaging, setPageSize} from "@/utils/local-storage";

export const usePaginationStore = defineStore('pagination', () => {
  const isPaging = ref(getIsPaging())
  const currentPage = ref(getCurrentPage())
  const pageSize = ref(getPageSize())

  watchEffect(() => {
    setIsPaging(isPaging.value)
    setPageSize(pageSize.value)
    setCurrentPage(currentPage.value)
  })

  const resetCurrentPage = () => {
    currentPage.value = 1;
  }

  return {isPaging, currentPage, pageSize, resetCurrentPage}
})
