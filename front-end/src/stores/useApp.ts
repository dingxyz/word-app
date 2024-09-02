import {ref} from 'vue'
import {defineStore} from 'pinia'
import {SYSTEM_NAME} from "@/utils/cache-key";

export enum WORD_TYPE {
  WORDS = 'words',
  PHRASE = 'phrase',
  SENTENCE = 'sentence',
  ANSWER = 'answer',
  LEARNED = 'learned',
  NOTEBOOK = 'notebook'
}

export const useAppStore = defineStore(`app`, () => {
  const wordType = ref(WORD_TYPE.WORDS)
  const showChineseChecked = ref(false)

  return {wordType, showChineseChecked}
})
