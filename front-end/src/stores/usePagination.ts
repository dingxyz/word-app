import {ref, watch} from 'vue'
import {defineStore} from 'pinia'

const PAGE_SIZE = 50
const STORAGE_CURRENT_PAGE_KEY = 'storageCurrentPage';

const initCurrentPage = () => {
  const storedPage = localStorage.getItem(STORAGE_CURRENT_PAGE_KEY);
  console.log('initCurrentPage', storedPage)
  if (storedPage) {
    console.log('initCurrentPage5555', storedPage)
    return parseInt(storedPage);
  }
  return 1;
}

export const usePaginationStore = defineStore('pagination', () => {
  const currentPage = ref(initCurrentPage())

  watch(currentPage, (newVal) => {
    console.log('555555555555555', newVal)
    localStorage.setItem(STORAGE_CURRENT_PAGE_KEY, String(newVal));
  });

  return {currentPage, PAGE_SIZE}
})
