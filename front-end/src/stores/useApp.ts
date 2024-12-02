import {computed, ref} from 'vue'
import {defineStore} from 'pinia'
import WordTypeApi, {WordType} from "@/api/word-type-api";

export const useAppStore = defineStore(`app`, () => {
  const wordType = ref('words')
  const typeList = ref<WordType[]>([])
  const showChineseChecked = ref(false)
  const isLiteMode = ref(false)
  const isWorldview = computed(() => wordType.value === 'Worldview')

  const getTypeList = async (typeName?: string) => {
    const res = await WordTypeApi.get()
    typeList.value = res.data
    const currentType = typeList.value.find((item) => item.name === wordType.value)
    if (!currentType) {
      wordType.value = typeName ?? typeList.value[0].name
    }
  }

  getTypeList()

  return {wordType, typeList, showChineseChecked, isLiteMode, isWorldview,getTypeList}
}, {
  persist: {
    paths: ['wordType', 'showChineseChecked', 'isLiteMode'],
  },
})
