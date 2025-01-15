import {reactive, ref, watch} from 'vue'
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
}

export const usePaginationStore = defineStore("pagination", () => {
  const pageByWordType = reactive<Record<string, Pagination>>({})
  const isPaging = ref(true)
  const currentPage = ref(1)
  const pageSize = ref(50)
  const renderOrder = ref(ORDER_TYPE.TIME)

  const appStore = useAppStore()

  watch([isPaging, currentPage, pageSize, renderOrder], () => {
    pageByWordType[appStore.wordType] = {
      isPaging: isPaging.value,
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      renderOrder: renderOrder.value,
    }
  })

  const initPagination = () => {
    const storedData = pageByWordType[appStore.wordType] || {
      isPaging: true,
      currentPage: 1,
      pageSize: 50,
      renderOrder: ORDER_TYPE.TIME,
    };
    isPaging.value = storedData.isPaging;
    currentPage.value = storedData.currentPage;
    pageSize.value = storedData.pageSize;
    renderOrder.value = storedData.renderOrder;
  }
  initPagination()

  return {isPaging, currentPage, pageSize, renderOrder, pageByWordType, initPagination}
})