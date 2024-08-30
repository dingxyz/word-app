import {ref} from 'vue'
import {defineStore} from 'pinia'
import {PERSIST_CONFIG} from "@/utils/local-storage";
import {SYSTEM_NAME} from "@/utils/cache-key";

export enum WORD_TYPE {
  WORDS = 'words',
  PHRASE = 'phrase',
  SENTENCE = 'sentence',
  ANSWER = 'answer',
  LEARNED = 'learned',
  NOTEBOOK = 'notebook'
}

export const useAppStore = defineStore(`${SYSTEM_NAME}-app`, () => {
  const wordType = ref(WORD_TYPE.WORDS)
  const showChineseChecked = ref(false)

  return {wordType, showChineseChecked}
}, {
  // @ts-ignore
  persist: PERSIST_CONFIG,
})
