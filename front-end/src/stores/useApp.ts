import {ref} from 'vue'
import {defineStore} from 'pinia'
import WordTypeApi, {WordType} from "@/api/word-type-api";

export const useAppStore = defineStore(`app`, () => {
  const wordType = ref('words')
  const typeList = ref<WordType[]>([])
  const showChineseChecked = ref(false)

  const getTypeList = async () => {
    const res = await WordTypeApi.get()
    typeList.value = res.data
    const currentType = typeList.value.find((item) => item.name === wordType.value)
    if (!currentType) {
      wordType.value = typeList.value[0].name
    }
  }

  getTypeList()

  return {wordType, typeList, showChineseChecked, getTypeList}
}, {
  persist: {
    paths: ['wordType', 'showChineseChecked'],
  },
})
