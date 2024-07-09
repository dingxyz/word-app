import {ref, watchEffect} from 'vue'
import {defineStore} from 'pinia'
import {getWordType, setWordType} from "@/utils/local-storage";

export enum WORD_TYPE {
  WORDS = 'words',
  PHRASE = 'phrase',
  SENTENCE = 'sentence',
  ANSWER = 'answer',
  LEARNED = 'learned',
  NOTEBOOK = 'notebook'
}

export const useAppStore = defineStore('app', () => {
  const wordType = ref(getWordType())
  const showChineseChecked = ref(false)

  watchEffect(() => {
    setWordType(wordType.value)
  })

  return {wordType, showChineseChecked}
})
