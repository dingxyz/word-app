import {computed, reactive, ref, watch} from 'vue'
import {defineStore} from 'pinia'
import {useAppStore} from "@/stores/useApp";

interface Pagination {
  isPaging: boolean;
  currentPage: number;
  pageSize: number;
  renderOrder: ORDER_TYPE;
}

export enum ORDER_TYPE {
  TIME = 'time',
  LETTER = 'letter',
  RANDOM = 'random',
  BY_TOC = 'by_toc',
}

export const usePaginationStore = defineStore("pagination", () => {
  const pageByWordType = reactive<Record<string, Pagination>>({})
  const isPaging = ref(true)
  const currentPage = ref(1)
  const pageSize = ref(50)
  const renderOrder = ref()

  const isByToc = computed(() => renderOrder.value === ORDER_TYPE.BY_TOC)

  const appStore = useAppStore()

  watch([isPaging, currentPage, pageSize, renderOrder], () => {
    pageByWordType[appStore.bookId] = {
      isPaging: isPaging.value,
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      renderOrder: renderOrder.value,
    }
  })

  const initPagination = () => {
    const storedData = pageByWordType[appStore.bookId] || {
      isPaging: true,
      currentPage: 1,
      pageSize: 50,
      renderOrder: ORDER_TYPE.RANDOM,
    };
    isPaging.value = storedData.isPaging;
    currentPage.value = storedData.currentPage;
    pageSize.value = storedData.pageSize;
    renderOrder.value = storedData.renderOrder;
  }
  initPagination()

  return {isPaging, currentPage, pageSize, renderOrder, isByToc, pageByWordType, initPagination}
})
