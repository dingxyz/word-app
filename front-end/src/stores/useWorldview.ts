import {ref} from 'vue'
import {defineStore} from 'pinia'


export const useWorldStore = defineStore("world", () => {
  const isPlayContext = ref(true)


  return {isPlayContext}
})