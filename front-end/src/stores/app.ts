import {computed, ref} from 'vue'
import {defineStore} from 'pinia'

export enum WORD_TYPE {
  WORDS = 'words',
  PHRASE = 'phrase',
  ANSWER = 'answer'
}

export const useAppStore = defineStore('app', () => {
  const wordType = ref(WORD_TYPE.WORDS)
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  return {wordType, count, doubleCount, increment}
})
