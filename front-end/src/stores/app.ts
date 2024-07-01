import {ref, watch} from 'vue'
import {defineStore} from 'pinia'

export enum WORD_TYPE {
  WORDS = 'words',
  PHRASE = 'phrase',
  SENTENCE = 'sentence',
  ANSWER = 'answer',
  NOTEBOOK = 'notebook'
}

const STORAGE_WORD_TYPE_KEY = 'storageWordType';

const initWordType = () => {
  const storedWordType = localStorage.getItem(STORAGE_WORD_TYPE_KEY);
  const wordType = storedWordType ? (storedWordType as WORD_TYPE) : WORD_TYPE.WORDS;
  localStorage.setItem(STORAGE_WORD_TYPE_KEY, wordType);
  return wordType;
}

export const useAppStore = defineStore('app', () => {
  const wordType = ref(initWordType())
  const showChineseChecked = ref(false)

  watch(wordType, (newType) => {
    localStorage.setItem(STORAGE_WORD_TYPE_KEY, newType);
  });

  return {wordType, showChineseChecked}
})
