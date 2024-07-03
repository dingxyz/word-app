import {ref, watch} from 'vue'
import {defineStore} from 'pinia'

const PAGE_SIZE = 50
const STORAGE_CURRENT_PAGE_KEY = 'storageCurrentPage';

const initCurrentPage = () => {
  const storedPage = localStorage.getItem(STORAGE_CURRENT_PAGE_KEY);
  if (storedPage) {
    return parseInt(storedPage);
  }
  return 1;
}

export const usePaginationStore = defineStore('pagination', () => {
  const currentPage = ref(initCurrentPage())

  watch(currentPage, (newVal) => {
    localStorage.setItem(STORAGE_CURRENT_PAGE_KEY, String(newVal));
  });

  const resetCurrentPage = () => {
    currentPage.value = 1;
  }

  return {currentPage, PAGE_SIZE, resetCurrentPage}
})
