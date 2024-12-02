import {reactive, ref, watch} from 'vue'
import {defineStore} from 'pinia'
import {useAppStore} from "@/stores/useApp";

interface Pagination {
  isPaging: boolean;
  currentPage: number;
  pageSize: number;
}

export const usePaginationStore = defineStore("pagination", () => {
  const pageByWordType = reactive<Record<string, Pagination>>({})
  const isPaging = ref(true)
  const currentPage = ref(1)
  const pageSize = ref(50)
  const sortByTime = ref(false)

  const appStore = useAppStore()

  watch([isPaging, currentPage, pageSize], () => {
    pageByWordType[appStore.wordType] = {
      isPaging: isPaging.value,
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    }
  })

  const initPagination = () => {
    const storedData = pageByWordType[appStore.wordType] || {
      isPaging: true,
      currentPage: 1,
      pageSize: 50,
    };
    isPaging.value = storedData.isPaging;
    currentPage.value = storedData.currentPage;
    pageSize.value = storedData.pageSize;
  }
  initPagination()

  return {isPaging, currentPage, pageSize, sortByTime, pageByWordType, initPagination}
})