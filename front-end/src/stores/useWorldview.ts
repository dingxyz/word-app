import {ref} from 'vue'
import {defineStore} from 'pinia'


export const useWorldStore = defineStore("world", () => {
  const isPlayContext = ref(true)
  const showStar = ref(false)
  const onlyCollect = ref(false)

  return {isPlayContext, showStar, onlyCollect}
})